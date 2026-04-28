import express from 'express';
const router = express.Router();
import * as challengeController from '../controllers/challengeController.js';

// Route to create a challenge (returns challengeId)
router.get('/test', (req, res) => res.send('CHALLENGE OK'));
router.post('/create', challengeController.createChallenge);

// Route for User 2 to join using the challengeId
router.post('/:id/join', challengeController.joinChallenge);

// Route to submit code to Judge0 for evaluation
router.post('/:id/submit', challengeController.submitCode);

// Route to pass/skip a question and get 0 points
router.post('/:id/pass', challengeController.passQuestion);

// Route to get current scores and status (polling)
router.get('/:id/status', challengeController.getChallengeStatus);

export default router;
