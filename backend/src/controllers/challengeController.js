import axios from 'axios';
import crypto from 'crypto';
import Challenge from '../models/Challenge.js';
import DsaQuestion from '../models/DsaQuestion.js';

// Helper function to call Piston API (Free, no keys required)
const evaluateCode = async (sourceCode, languageId, expectedOutput) => {
  try {
    // 1. Map common Judge0 IDs to Piston language names
    const languageMap = {
      63: 'javascript',
      71: 'python',
      54: 'cpp',
      62: 'java'
    };
    
    // Default to javascript if we don't recognize the ID
    const language = languageMap[languageId] || 'javascript';

    // 2. Make the single synchronous POST request to Piston
    const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
      language: language,
      version: '*', // '*' automatically uses the latest version Piston has installed
      files: [
        {
          content: sourceCode
        }
      ]
    });

    // 3. Extract the terminal output and any errors
    const output = response.data.run.stdout.trim();
    const stderr = response.data.run.stderr;

    // 4. If the user's code crashed (syntax error, infinite loop, etc.)
    if (stderr) {
       return { status: 'Runtime Error', passed: false, output: stderr };
    }

    // 5. Manually grade the output by comparing it to expectedOutput
    const passed = output === expectedOutput.trim();

    // 6. Return the result in the exact same format the rest of the app expects
    return {
      status: passed ? 'Accepted' : 'Wrong Answer',
      passed,
      output
    };

  } catch (error) {
    console.error("Piston API Error:", error.message);
    return { status: 'Error', passed: false };
  }
};


export const createChallenge = async (req, res) => {
	try {
		const { userId } = req.body;

		// Fetch 10 random DSA questions (or limit to what we have)
		const questions = await DsaQuestion.aggregate([{ $sample: { size: 10 } }]);

		if (questions.length === 0) {
			return res.status(400).json({ success: false, message: "No DSA questions available in database." });
		}

		const joinCode = crypto.randomBytes(3).toString('hex').toUpperCase();

		const newChallenge = new Challenge({
			joinCode,
			status: 'waiting',
			questions: questions.map(q => q._id),
			participants: [{ userId, score: 0, currentQuestionIndex: 0 }]
		});

		const savedChallenge = await newChallenge.save();

		res.status(201).json({
			success: true,
			message: 'Challenge created! Share the ID with your friend.',
			challengeId: savedChallenge._id,
			joinCode: savedChallenge.joinCode
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

export const joinChallenge = async (req, res) => {
	try {
		const { id } = req.params; // We will treat 'id' as the 6-digit joinCode
		const { userId } = req.body;

		const challenge = await Challenge.findOne({ joinCode: id });
		if (!challenge) return res.status(404).json({ success: false, message: "Challenge not found" });

		if (challenge.participants.length >= 2) {
			return res.status(400).json({ success: false, message: "Challenge is already full" });
		}

		challenge.participants.push({ userId, score: 0, currentQuestionIndex: 0 });
		challenge.status = 'in-progress';
		challenge.startTime = new Date();

		// 10 minute time limit
		challenge.endTime = new Date(challenge.startTime.getTime() + 10 * 60000);

		await challenge.save();

		res.status(200).json({ success: true, message: "Joined successfully!", challenge });
	}
	catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

export const submitCode = async (req, res) => {
	try {
		const { id } = req.params;
		const { userId, sourceCode, languageId = 63, attempts } = req.body; // Default 63 = JS

		const challenge = await Challenge.findById(id).populate('questions');
		if (!challenge || challenge.status !== 'in-progress') {
			return res.status(400).json({ success: false, message: "Challenge is not active" });
		}

		// Check time limit
		if (new Date() > challenge.endTime) {
			challenge.status = 'completed';
			await challenge.save();
			return res.status(400).json({ success: false, message: "Time limit exceeded!" });
		}

		const participant = challenge.participants.find(p => p.userId === userId);
		if (!participant) return res.status(404).json({ success: false, message: "Participant not found" });

		if (participant.currentQuestionIndex >= challenge.questions.length) {
			return res.status(400).json({ success: false, message: "You have finished all questions" });
		}

		const currentQuestion = challenge.questions[participant.currentQuestionIndex];

		// Evaluate against the first test case (simplified for tutorial)
		const testCase = currentQuestion.testCases[0];
		const expectedOutput = testCase ? testCase.expectedOutput : "";

		const result = await evaluateCode(sourceCode, languageId, expectedOutput);


		if (result.passed) {
			// Calculate score: 5 free runs. Penalty applies from 6th attempt onwards.
			const penalty = Math.max(0, attempts - 5);
			let earnedPoints = currentQuestion.points - penalty;
			if (earnedPoints < 1) earnedPoints = 1; // Minimum 1 point if passed

			participant.score += earnedPoints;
			participant.currentQuestionIndex += 1; // Move to next question

			// Check if finished
			if (participant.currentQuestionIndex >= challenge.questions.length) {
				participant.finishedAt = new Date();
			}

			await challenge.save();
			return res.status(200).json({ success: true, message: "Correct!", result, newScore: participant.score });
		} else {
			// Failed. Frontend handles attempt counter. If attempts >= 5, frontend should call passQuestion.
			return res.status(200).json({ success: false, message: "Incorrect output", result });
		}
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

export const passQuestion = async (req, res) => {
	try {
		const { id } = req.params;
		const { userId } = req.body;

		const challenge = await Challenge.findById(id);
		const participant = challenge.participants.find(p => p.userId === userId);

		if (participant && participant.currentQuestionIndex < challenge.questions.length) {
			participant.currentQuestionIndex += 1; // Skip with 0 points

			if (participant.currentQuestionIndex >= challenge.questions.length) {
				participant.finishedAt = new Date();
			}

			await challenge.save();
			return res.status(200).json({ success: true, message: "Passed question. 0 points awarded." });
		}

		res.status(400).json({ success: false, message: "Cannot pass question" });
	}
	catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

export const getChallengeStatus = async (req, res) => {
	try {
		const challenge = await Challenge.findById(req.params.id).populate('questions', '-testCases'); // Hide test cases
		if (!challenge) return res.status(404).json({ success: false, message: "Challenge not found" });

		// Check if time expired and auto-complete
		if (challenge.status === 'in-progress' && new Date() > challenge.endTime) {
			challenge.status = 'completed';
			await challenge.save();
		}

		res.status(200).json({ success: true, challenge });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};
