import axios from 'axios';

const quizApi = axios.create({
	baseURL: process.env.QUIZ_API_BASE_URL || 'https://quizapi.io/api/v1'
});

quizApi.interceptors.request.use(config => {
	config.headers.Authorization = `Bearer ${process.env.QUIZ_API_KEY}`;
	return config;
});


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
		// 1. Fetch questions from QuizAPI based on filters provided in the request body OR query parameters
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
		const questionsData = response.data.data; // Note API response format: { success: true, data: [...] }

		if (!questionsData || questionsData.length === 0) {
			return res.status(404).json({ success: false, message: 'No questions found for the given criteria.' });
		}

		// 2. Create a new Session in MongoDB
		const newSession = new Session({
			sessionType: 'practice',
			status: 'in-progress',
			questions: questionsData,
			userAnswers: {},
			score: 0
		});


		const savedSession = await newSession.save();

		// 3. Return the session to the client, but omit correct answers so user can't cheat initially
		// Since this is for testing via Postman, we can choose to return the raw data or a sanitized version.
		// For now, let's sanitize the correct answers to mimic real production behavior.
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

		// If session is still in-progress, we probably shouldn't show correct answers yet
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

		// Completed session, return everything so user can review their performance
		res.status(200).json({ success: true, session });
	} catch (error) {
		console.error("Error fetching session:", error);
		res.status(500).json({ success: false, message: 'Failed to fetch session' });
	}
};
export const submitSessionAnswers = async (req, res) => {
	try {
		const { id } = req.params;
		const { userAnswers } = req.body || {}; // Expected format: { "ques_id1": "ans_id1", "ques_id2": "ans_id2" }

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

		// Calculate the score
		session.questions.forEach(question => {
			const submittedAnswerId = userAnswers[question.id];
			if (submittedAnswerId) {
				// Save the answer in the session
				session.userAnswers.set(question.id, submittedAnswerId);

				// Find if this answer is correct
				const correctAnswer = question.answers.find(a => a.isCorrect);
				if (correctAnswer && correctAnswer.id === submittedAnswerId) {
					score += 1; // Assuming 1 point per correct answer, this can be weighted by difficulty
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
			session: updatedSession // Returns the full object with correct answers for review
		});

	} catch (error) {
		console.error("Error submitting session:", error);
		res.status(500).json({ success: false, message: 'Failed to submit session' });
	}
};
