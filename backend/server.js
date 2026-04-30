import "dotenv/config";
import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import http from "http";
import { Server } from "socket.io";
import axios from "axios";
import { exec } from "child_process";
import util from "util";
import fs from "fs/promises";
import path from "path";
const execPromise = util.promisify(exec);
import ChallengeSession from "./src/models/ChallengeSession.js";
import DsaQuestion from "./src/models/DsaQuestion.js";

import { connectDB } from "./src/config/db.js";
import questionRoutes from "./src/routes/questionRoutes.js";
import challengeRoutes from './src/routes/challengeRoutes.js';

import serviceAccount from './serviceAccountKey.json' with { type: 'json' };

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  }
});

connectDB();

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

app.use(express.json());

app.use('/api/quiz', questionRoutes);
app.use('/api/challenge',challengeRoutes);

app.get("/", (req, res) => res.send("Server working"));

app.get("/api/sessions", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ success: false, message: "Missing userId" });
    
    // Find challenge sessions where this user was a participant
    // Since userDetails.name is stored, we might match by name or email. Assuming userId passed is the name.
    const sessions = await ChallengeSession.find({
      status: "completed",
      "players.userDetails.name": userId
    }).sort({ updatedAt: -1 });
    
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
io.on("connection", (socket) => {
  console.log("New client connected", socket.id);

  socket.on("join_challenge", async ({ challengeId, userDetails }) => {
    socket.join(challengeId);
    console.log(`User joined challenge ${challengeId}`);
    
    try {
      let challenge = await ChallengeSession.findOne({ challengeId });
      if (!challenge) {
        challenge = new ChallengeSession({
          challengeId,
          players: [{ socketId: socket.id, userDetails, score: 0 }],
          status: 'waiting',
          questions: []
        });
      } else {
        if (challenge.players.length < 2 && !challenge.players.find(p => p.socketId === socket.id)) {
          challenge.players.push({ socketId: socket.id, userDetails, score: 0, currentIndex: 0 });
          if (challenge.players.length === 2) {
            challenge.status = 'ready';
          }
        }
      }
      await challenge.save();

      io.to(challengeId).emit("challenge_state", challenge);

      if (challenge.status === 'ready') {
        io.to(challengeId).emit("challenge_ready");
      }
    } catch(err) { console.error(err); }
  });

  socket.on("start_challenge", async ({ challengeId }) => {
    try {
      const challenge = await ChallengeSession.findOne({ challengeId });
      if (challenge && challenge.status === 'ready') {
        // Fetch 10 random DSA questions
        const questions = await DsaQuestion.aggregate([{ $sample: { size: 10 } }]);
        challenge.questions = questions;
        challenge.status = 'started';
        await challenge.save();
        io.to(challengeId).emit("challenge_state", challenge);
        io.to(challengeId).emit("challenge_started", challenge);
      }
    } catch(err) { console.error(err); }
  });

  socket.on("typing", ({ challengeId }) => {
    socket.to(challengeId).emit("opponent_typing");
  });

  socket.on("skip_question", async ({ challengeId }) => {
    try {
      const challenge = await ChallengeSession.findOne({ challengeId });
      if (!challenge || challenge.status !== 'started') return;

      const playerIndex = challenge.players.findIndex(p => p.socketId === socket.id);
      if (playerIndex === -1) return;

      challenge.players[playerIndex].currentIndex = (challenge.players[playerIndex].currentIndex || 0) + 1;
      
      if (challenge.players[playerIndex].currentIndex >= 10) {
        challenge.status = 'completed';
        challenge.winner = challenge.players[playerIndex];
      }
      
      await challenge.save();
      io.to(challengeId).emit("challenge_state", challenge);
      if (challenge.status === 'completed') {
        io.to(challengeId).emit("challenge_end", { winner: challenge.winner });
      }
    } catch(err) { console.error(err); }
  });

  socket.on("code_submitted", async ({ challengeId, code, language, isSubmit }) => {
    try {
      socket.to(challengeId).emit("opponent_running");

      const challenge = await ChallengeSession.findOne({ challengeId });
      if (!challenge || challenge.status !== 'started') return;

      const playerIndex = challenge.players.findIndex(p => p.socketId === socket.id);
      if (playerIndex === -1) return;

      const currentIndex = challenge.players[playerIndex].currentIndex || 0;
      if (currentIndex >= 10) return;

      const question = challenge.questions[currentIndex];
      if (!question) return;

      let allPassed = true;
      let pistonLang = language;
      if (language === 'javascript') pistonLang = 'js';
      else if (language === 'python') pistonLang = 'python';
      else if (language === 'cpp') pistonLang = 'cpp';
      else if (language === 'java') pistonLang = 'java';
      else if (language === 'c') pistonLang = 'c';

      // Evaluate code against test cases
      // If NOT isSubmit, just run the first test case
      const testCasesToRun = isSubmit ? question.testCases : [question.testCases[0]];

      for (let i = 0; i < testCasesToRun.length; i++) {
        const testCase = testCasesToRun[i];
        
        let executableCode = code;
        let funcName = 'solve';
        
        if (pistonLang === 'js') {
            const jsMatch = code.match(/function\s+([a-zA-Z0-9_]+)\s*\(/);
            if (jsMatch) funcName = jsMatch[1];
            executableCode = `${code}\nconsole.log(${funcName}(${JSON.stringify(testCase.input)}));`;
        } else if (pistonLang === 'python') {
            const pyMatchClass = code.match(/class\s+([a-zA-Z0-9_]+)[\s\S]*?def\s+([a-zA-Z0-9_]+)\s*\(/);
            const pyMatchFunc = code.match(/def\s+([a-zA-Z0-9_]+)\s*\(/);
            if (pyMatchClass) {
                executableCode = `${code}\nprint(${pyMatchClass[1]}().${pyMatchClass[2]}(${JSON.stringify(testCase.input)}))`;
            } else {
                if (pyMatchFunc) funcName = pyMatchFunc[1];
                executableCode = `${code}\nprint(${funcName}(${JSON.stringify(testCase.input)}))`;
            }
        } else if (pistonLang === 'cpp' || pistonLang === 'c') {
            const cppMatch = code.match(/(?:int|string|char\*|bool|float|double|void|long|short|auto)\s+([a-zA-Z0-9_]+)\s*\(/);
            if (cppMatch && cppMatch[1] !== 'main') funcName = cppMatch[1];
        } else if (pistonLang === 'java') {
            const javaMatch = code.match(/public\s+(?:static\s+)?[a-zA-Z0-9_<>\[\]]+\s+([a-zA-Z0-9_]+)\s*\(/);
            if (javaMatch && javaMatch[1] !== 'main') funcName = javaMatch[1];
        }

        try {
          // Local Execution Engine since Piston Public API is shut down
          const tmpId = Math.random().toString(36).substring(7);
          let stdoutStr = "";
          let stderrStr = "";
          
          if (pistonLang === 'js') {
            const fileName = `temp_${tmpId}.js`;
            await fs.writeFile(fileName, executableCode);
            try {
              const { stdout, stderr } = await execPromise(`node ${fileName}`, { timeout: 3000 });
              stdoutStr = stdout;
              stderrStr = stderr;
            } catch(e) {
              stderrStr = e.stderr || e.message;
            }
            await fs.unlink(fileName).catch(()=>{});
          } else if (pistonLang === 'python') {
            const fileName = `temp_${tmpId}.py`;
            await fs.writeFile(fileName, executableCode);
            try {
              const { stdout, stderr } = await execPromise(`python3 ${fileName}`, { timeout: 3000 });
              stdoutStr = stdout;
              stderrStr = stderr;
            } catch(e) {
              stderrStr = e.stderr || e.message;
            }
            await fs.unlink(fileName).catch(()=>{});
          } else if (pistonLang === 'cpp') {
            const fileName = `temp_${tmpId}.cpp`;
            const outName = `temp_${tmpId}.out`;
            const cppWrapper = `
#include <iostream>
#include <string>
using namespace std;

${executableCode}

int main() {
    cout << ${funcName}(${JSON.stringify(testCase.input)}) << endl;
    return 0;
}
`;
            await fs.writeFile(fileName, cppWrapper);
            try {
              const { stdout, stderr } = await execPromise(`g++ ${fileName} -o ${outName} && ./${outName}`, { timeout: 5000 });
              stdoutStr = stdout;
              stderrStr = stderr;
            } catch(e) {
              stderrStr = e.stderr || e.message;
            }
            await fs.unlink(fileName).catch(()=>{});
            await fs.unlink(outName).catch(()=>{});
          } else if (pistonLang === 'java') {
            const className = `Main_${tmpId}`;
            const fileName = `${className}.java`;
            const javaWrapper = `
import java.util.*;
public class ${className} {
${executableCode}
    public static void main(String[] args) {
        System.out.println(${funcName}(${JSON.stringify(testCase.input)}));
    }
}
`;
            await fs.writeFile(fileName, javaWrapper);
            try {
              const { stdout, stderr } = await execPromise(`javac ${fileName} && java ${className}`, { timeout: 5000 });
              stdoutStr = stdout;
              stderrStr = stderr;
            } catch(e) {
              stderrStr = e.stderr || e.message;
            }
            await fs.unlink(fileName).catch(()=>{});
            await fs.unlink(`${className}.class`).catch(()=>{});
          } else if (pistonLang === 'c') {
            const fileName = `temp_${tmpId}.c`;
            const outName = `temp_${tmpId}.out`;
            const cWrapper = `
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

${executableCode}

int main() {
    printf("%s\\n", ${funcName}((char*)${JSON.stringify(testCase.input)}));
    return 0;
}
`;
            await fs.writeFile(fileName, cWrapper);
            try {
              const { stdout, stderr } = await execPromise(`gcc ${fileName} -o ${outName} && ./${outName}`, { timeout: 5000 });
              stdoutStr = stdout;
              stderrStr = stderr;
            } catch(e) {
              stderrStr = e.stderr || e.message;
            }
            await fs.unlink(fileName).catch(()=>{});
            await fs.unlink(outName).catch(()=>{});
          } else {
            // Fallback for unsupported local langs
            socket.emit("code_result", { success: false, message: `Local execution for ${language} is not supported right now.`, isSubmit });
            return;
          }
          
          const output = (stdoutStr || "").trim();
          const stderr = (stderrStr || "").trim();
          
          if (stderr) {
            allPassed = false;
            socket.emit("code_result", { success: false, message: `Error in Test Case ${i+1}:\n${stderr}`, isSubmit });
            break;
          }

          if (output !== String(testCase.expectedOutput)) {
            allPassed = false;
            socket.emit("code_result", { 
              success: false, 
              message: `Failed Test Case ${i+1}\nInput: ${testCase.input}\nExpected: ${testCase.expectedOutput}\nGot: ${output}`,
              isSubmit
            });
            break;
          }
        } catch (e) {
          allPassed = false;
          socket.emit("code_result", { success: false, message: "Execution error. Please try again.", isSubmit });
          break;
        }
      }

      if (allPassed) {
        if (!isSubmit) {
            socket.emit("code_result", { success: true, message: "Sample test case passed! Click SUBMIT SOLUTION to evaluate all test cases.", isSubmit });
            return;
        }

        socket.emit("code_result", { success: true, message: "Correct! All test cases passed.", isSubmit });
        challenge.players[playerIndex].score += 1;
        challenge.players[playerIndex].currentIndex = (challenge.players[playerIndex].currentIndex || 0) + 1;
        
        if (challenge.players[playerIndex].currentIndex >= 10) {
          challenge.status = 'completed';
          challenge.winner = challenge.players[playerIndex];
        }
        
        await challenge.save();
        
        io.to(challengeId).emit("challenge_state", challenge);
        if (challenge.status === 'completed') {
          io.to(challengeId).emit("challenge_end", { winner: challenge.winner });
        }
      }
    } catch(err) { console.error(err); }
  });

  socket.on("leave_challenge", async ({ challengeId }) => {
    try {
      const challenge = await ChallengeSession.findOne({ challengeId });
      if (challenge) {
        if (challenge.status === 'waiting') {
          await ChallengeSession.deleteOne({ challengeId });
        } else if (challenge.status !== 'completed') {
          const opponent = challenge.players.find(p => p.socketId !== socket.id);
          challenge.status = 'completed';
          challenge.winner = opponent || challenge.players[0];
          await challenge.save();
          io.to(challengeId).emit("challenge_state", challenge);
          io.to(challengeId).emit("challenge_end", { winner: challenge.winner });
        }
      }
      socket.leave(challengeId);
    } catch(err) { console.error(err); }
  });

  socket.on("surrender", async ({ challengeId }) => {
    try {
      const challenge = await ChallengeSession.findOne({ challengeId });
      if (challenge && challenge.status !== 'completed') {
        const opponent = challenge.players.find(p => p.socketId !== socket.id);
        challenge.status = 'completed';
        challenge.winner = opponent || challenge.players[0];
        await challenge.save();
        io.to(challengeId).emit("challenge_state", challenge);
        io.to(challengeId).emit("challenge_end", { winner: challenge.winner });
      }
    } catch(err) { console.error(err); }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));