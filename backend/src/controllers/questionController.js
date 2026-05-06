import axios from 'axios';
import Session from '../models/Question.js';

const quizApi = axios.create({
	baseURL: process.env.QUIZ_API_BASE_URL || 'https://quizapi.io/api/v1'
});

quizApi.interceptors.request.use(config => {
	config.headers.Authorization = `Bearer ${process.env.QUIZ_API_KEY}`;
	return config;
});

const transformAnswers = (answers, correct_answers) => {
    if (!answers) return [];
    if (Array.isArray(answers)) return answers;
    const result = [];
    Object.keys(answers).forEach(key => {
        if (answers[key]) {
            result.push({
                id: key,
                text: answers[key],
                isCorrect: correct_answers ? (correct_answers[`${key}_correct`] === 'true' || correct_answers[`${key}_correct`] === true) : false
            });
        }
    });
    return result;
};

export const getQuestionsFromAPI = async (req, res) => {
	try {
		const response = await quizApi.get('/questions', { params: req.query });
		res.status(200).json(response.data);
	} catch (error) {
		console.error("Error fetching questions from QuizAPI:", error.response ? error.response.data : error.message);
		res.status(500).json({ success: false, message: 'Failed to fetch questions from API' });
	}
};

export const startPracticeSession = async (req, res) => {
	try {
		const category = req.body?.category || req.query?.category;
		const difficulty = req.body?.difficulty || req.query?.difficulty;
		const tags = req.body?.tags || req.query?.tags;
		const limit = req.body?.limit || req.query?.limit || 10;

		const params = {};
		if (category) params.category = category;
		if (difficulty) params.difficulty = difficulty;
		if (tags) params.tags = tags;
		if (limit) params.limit = limit;

		const response = await quizApi.get('/questions', { params });
		const rawQuestions = Array.isArray(response.data) ? response.data : (response.data.data || []);

		if (!rawQuestions || rawQuestions.length === 0) {
			return res.status(200).json({ success: false, message: 'No questions found for the given criteria. Try a different category or difficulty.' });
		}

		// Transform format to internal Session model format
		const questionsData = rawQuestions.map(q => {
			return {
				id: String(q.id || q._id),
				text: q.question || q.text,
				type: q.type,
				difficulty: q.difficulty,
				explanation: q.explanation,
				category: q.category,
				answers: transformAnswers(q.answers, q.correct_answers)
			};
		});

		const newSession = new Session({
			sessionType: 'practice',
			status: 'in-progress',
			questions: questionsData,
			userAnswers: {},
			score: 0
		});

		const savedSession = await newSession.save();

		const sanitizedQuestions = savedSession.questions.map(q => {
			const qObj = q.toObject();
			if (qObj.answers) {
				qObj.answers.forEach(a => delete a.isCorrect);
			}
			return qObj;
		});

		res.status(201).json({
			success: true,
			message: 'Practice session started successfully',
			sessionId: savedSession._id,
			questions: sanitizedQuestions
		});

	} catch (error) {
		console.error("Error starting practice session:", error.response ? error.response.data : error.message);
		res.status(500).json({ success: false, message: 'Failed to start practice session' });
	}
};

export const getSession = async (req, res) => {
	try {
		const session = await Session.findById(req.params.id);
		if (!session) {
			return res.status(404).json({ success: false, message: 'Session not found' });
		}

		if (session.status === 'in-progress') {
			const sanitizedQuestions = session.questions.map(q => {
				const qObj = q.toObject();
				if (qObj.answers) {
					qObj.answers.forEach(a => delete a.isCorrect);
				}
				return qObj;
			});
			return res.status(200).json({
				success: true,
				session: { ...session.toObject(), questions: sanitizedQuestions }
			});
		}

		res.status(200).json({ success: true, session });
	} catch (error) {
		console.error("Error fetching session:", error);
		res.status(500).json({ success: false, message: 'Failed to fetch session' });
	}
};

export const submitSessionAnswers = async (req, res) => {
	try {
		const { id } = req.params;
		const { userAnswers } = req.body || {}; 

		if (!userAnswers || typeof userAnswers !== 'object') {
			return res.status(400).json({ success: false, message: 'Invalid userAnswers provided. Expected a key-value map.' });
		}

		const session = await Session.findById(id);
		if (!session) {
			return res.status(404).json({ success: false, message: 'Session not found' });
		}

		if (session.status === 'completed') {
			return res.status(400).json({ success: false, message: 'Session has already been completed.' });
		}

		let score = 0;

		session.questions.forEach(question => {
			const submittedAnswerId = userAnswers[question.id];
			if (submittedAnswerId) {
				session.userAnswers.set(question.id, submittedAnswerId);

				const correctAnswer = question.answers.find(a => a.isCorrect);
				if (correctAnswer && correctAnswer.id === submittedAnswerId) {
					score += 1;
				}
			}
		});

		session.score = score;
		session.status = 'completed';

		const updatedSession = await session.save();

		res.status(200).json({
			success: true,
			message: 'Session submitted successfully',
			score: updatedSession.score,
			totalQuestions: updatedSession.questions.length,
			session: updatedSession 
		});

	} catch (error) {
		console.error("Error submitting session:", error);
		res.status(500).json({ success: false, message: 'Failed to submit session' });
	}
};
