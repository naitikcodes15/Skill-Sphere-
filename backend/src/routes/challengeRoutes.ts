import express from 'express';
import * as challengeController from '../controllers/challengeController.js';

const router = express.Router();

// Route to create a challenge (returns challengeId)
router.get('/test', (req, res) => {
  res.send('CHALLENGE OK');
});
router.post('/create', challengeController.createChallenge as any);

// Route for User 2 to join using the challengeId
router.post('/:id/join', challengeController.joinChallenge as any);

// Route to submit code to Judge0 for evaluation
router.post('/:id/submit', challengeController.submitCode as any);

// Route to pass/skip a question and get 0 points
router.post('/:id/pass', challengeController.passQuestion as any);

// Route to get current scores and status (polling)
router.get('/:id/status', challengeController.getChallengeStatus as any);

export default router;
