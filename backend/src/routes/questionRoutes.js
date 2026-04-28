import express from 'express';
const router = express.Router();
import * as questionController from '../controllers/questionController.js';

// Route to fetch raw questions directly from the API based on query params (e.g. ?difficulty=EASY&category=Programming)
router.get('/questions', questionController.getQuestionsFromAPI);

// Route to start a practice session (creates a Session in DB and returns it)
// Expects optional body params like { category, difficulty, tags, limit }
router.post('/session', questionController.startPracticeSession);

// Route to get an existing session by ID
router.get('/session/:id', questionController.getSession);

// Route to submit answers to a practice session and get a score
// Expects body: { userAnswers: { "question_id_1": "answer_id_1" } }
router.post('/session/:id/submit', questionController.submitSessionAnswers);

export default router;
