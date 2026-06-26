import express from 'express';
import * as questionController from '../controllers/questionController.js';

const router = express.Router();

// Route to fetch raw questions directly from the API based on query params (e.g. ?difficulty=EASY&category=Programming)
router.get('/questions', questionController.getQuestionsFromAPI as any);

// Route to start a practice session (creates a Session in DB and returns it)
// Expects optional body params like { category, difficulty, tags, limit }
router.post('/session', questionController.startPracticeSession as any);

// Route to get an existing session by ID
router.get('/session/:id', questionController.getSession as any);

// Route to submit answers to a practice session and get a score
// Expects body: { userAnswers: { "question_id_1": "answer_id_1" } }
router.post('/session/:id/submit', questionController.submitSessionAnswers as any);

export default router;
