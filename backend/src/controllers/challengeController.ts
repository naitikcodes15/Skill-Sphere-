import { Request, Response } from 'express';
import axios from 'axios';
import crypto from 'node:crypto';
import Challenge from '../models/Challenge.js';
import DsaQuestion from '../models/DsaQuestion.js';

// Helper function to call Piston API (Free, no keys required)
const evaluateCode = async (sourceCode: string, languageId: number, expectedOutput: string) => {
  try {
    const languageMap: Record<number, string> = {
      63: 'javascript',
      71: 'python',
      54: 'cpp',
      62: 'java'
    };
    
    const language = languageMap[languageId] || 'javascript';

    const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
      language: language,
      version: '*',
      files: [
        {
          content: sourceCode
        }
      ]
    });

    const output = response.data.run.stdout.trim();
    const stderr = response.data.run.stderr;

    if (stderr) {
       return { status: 'Runtime Error', passed: false, output: stderr };
    }

    const passed = output === expectedOutput.trim();

    return {
      status: passed ? 'Accepted' : 'Wrong Answer',
      passed,
      output
    };

  } catch (error: any) {
    console.error("Piston API Error:", error.message);
    return { status: 'Error', passed: false };
  }
};

export const createChallenge = async (req: Request, res: Response): Promise<any> => {
	try {
		const { userId } = req.body;

		// Fetch 10 random DSA questions
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

		return res.status(201).json({
			success: true,
			message: 'Challenge created! Share the ID with your friend.',
			challengeId: savedChallenge._id,
			joinCode: savedChallenge.joinCode
		});
	} catch (error: any) {
		return res.status(500).json({ success: false, message: error.message });
	}
};

export const joinChallenge = async (req: Request, res: Response): Promise<any> => {
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

		return res.status(200).json({ success: true, message: "Joined successfully!", challenge });
	}
	catch (error: any) {
		return res.status(500).json({ success: false, message: error.message });
	}
};

export const submitCode = async (req: Request, res: Response): Promise<any> => {
	try {
		const { id } = req.params;
		const { userId, sourceCode, languageId = 63, attempts } = req.body;

		const challenge = await Challenge.findById(id).populate('questions');
		if (!challenge || challenge.status !== 'in-progress') {
			return res.status(400).json({ success: false, message: "Challenge is not active" });
		}

		// Check time limit
		if (challenge.endTime && new Date() > challenge.endTime) {
			challenge.status = 'completed';
			await challenge.save();
			return res.status(400).json({ success: false, message: "Time limit exceeded!" });
		}

		const participant = challenge.participants.find(p => p.userId === userId);
		if (!participant) return res.status(404).json({ success: false, message: "Participant not found" });

		if (participant.currentQuestionIndex >= challenge.questions.length) {
			return res.status(400).json({ success: false, message: "You have finished all questions" });
		}

		const currentQuestion = challenge.questions[participant.currentQuestionIndex] as any;

		// Evaluate against the first test case
		const testCase = currentQuestion.testCases[0];
		const expectedOutput = testCase ? testCase.expectedOutput : "";

		const result = await evaluateCode(sourceCode, languageId, expectedOutput);

		if (result.passed) {
			// Calculate score: 5 free runs. Penalty applies from 6th attempt onwards.
			const penalty = Math.max(0, attempts - 5);
			let earnedPoints = currentQuestion.points - penalty;
			if (earnedPoints < 1) earnedPoints = 1;

			participant.score += earnedPoints;
			participant.currentQuestionIndex += 1;

			// Check if finished
			if (participant.currentQuestionIndex >= challenge.questions.length) {
				participant.finishedAt = new Date();
			}

			await challenge.save();
			return res.status(200).json({ success: true, message: "Correct!", result, newScore: participant.score });
		} else {
			return res.status(200).json({ success: false, message: "Incorrect output", result });
		}
	} catch (error: any) {
		return res.status(500).json({ success: false, message: error.message });
	}
};

export const passQuestion = async (req: Request, res: Response): Promise<any> => {
	try {
		const { id } = req.params;
		const { userId } = req.body;

		const challenge = await Challenge.findById(id);
		if (!challenge) return res.status(404).json({ success: false, message: "Challenge not found" });

		const participant = challenge.participants.find(p => p.userId === userId);

		if (participant && participant.currentQuestionIndex < challenge.questions.length) {
			participant.currentQuestionIndex += 1;

			if (participant.currentQuestionIndex >= challenge.questions.length) {
				participant.finishedAt = new Date();
			}

			await challenge.save();
			return res.status(200).json({ success: true, message: "Passed question. 0 points awarded." });
		}

		return res.status(400).json({ success: false, message: "Cannot pass question" });
	}
	catch (error: any) {
		return res.status(500).json({ success: false, message: error.message });
	}
};

export const getChallengeStatus = async (req: Request, res: Response): Promise<any> => {
	try {
		const challenge = await Challenge.findById(req.params.id).populate('questions', '-testCases');
		if (!challenge) return res.status(404).json({ success: false, message: "Challenge not found" });

		// Check if time expired and auto-complete
		if (challenge.status === 'in-progress' && challenge.endTime && new Date() > challenge.endTime) {
			challenge.status = 'completed';
			await challenge.save();
		}

		return res.status(200).json({ success: true, challenge });
	} catch (error: any) {
		return res.status(500).json({ success: false, message: error.message });
	}
};
