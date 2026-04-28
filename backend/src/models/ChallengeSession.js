import mongoose from 'mongoose';

const challengeSessionSchema = new mongoose.Schema({
  challengeId: {
    type: String,
    required: true,
    unique: true,
  },
  players: [{
    socketId: { type: String, required: true },
    userDetails: { type: Object },
    score: { type: Number, default: 0 },
  }],
  status: {
    type: String,
    enum: ['waiting', 'ready', 'started', 'completed'],
    default: 'waiting',
  },
  winner: {
    type: Object,
    default: null,
  },
}, { timestamps: true });

const ChallengeSession = mongoose.model('ChallengeSession', challengeSessionSchema);

export default ChallengeSession;
