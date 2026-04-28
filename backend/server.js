import "dotenv/config";
import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import http from "http";
import { Server } from "socket.io";
import ChallengeSession from "./src/models/ChallengeSession.js";

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

// Removed in-memory state

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
          status: 'waiting'
        });
      } else {
        if (challenge.players.length < 2 && !challenge.players.find(p => p.socketId === socket.id)) {
          challenge.players.push({ socketId: socket.id, userDetails, score: 0 });
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
        challenge.status = 'started';
        await challenge.save();
        io.to(challengeId).emit("challenge_started", challenge);
      }
    } catch(err) { console.error(err); }
  });

  socket.on("code_submitted", async ({ challengeId }) => {
    try {
      const challenge = await ChallengeSession.findOne({ challengeId });
      if (challenge) {
        const playerIndex = challenge.players.findIndex(p => p.socketId === socket.id);
        if (playerIndex !== -1) {
          challenge.players[playerIndex].score += 1;
          
          if (challenge.players[playerIndex].score >= 10) {
            challenge.status = 'completed';
            challenge.winner = challenge.players[playerIndex];
          }
          
          await challenge.save();
          
          io.to(challengeId).emit("challenge_state", challenge);
          if (challenge.status === 'completed') {
            io.to(challengeId).emit("challenge_end", { winner: challenge.winner });
          }
        }
      }
    } catch(err) { console.error(err); }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));