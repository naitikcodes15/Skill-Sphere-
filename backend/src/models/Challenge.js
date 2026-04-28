import mongoose, { mongo } from 'mongoose';

const participantSchema = new mongoose.Schema({
	userId: { type: String, required: true },
	score: { type: Number, default: 0 },
	currentQuestionIndex: { type: Number, default: 0 },
	finishedAt: { type: Date, default: null }
}, { _id: false });

const challengeSchema = new mongoose.Schema({
	joinCode: { type: String, required: true, unique: true },
	status: {
		type: String,
		enum: ['waiting', 'in-progress', 'completed'],
		default: 'waiting'
	},
	questions: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'DsaQuestion'
	}],
	participants: [participantSchema],
	startTime: { type: Date, default: null },
	endTime: { type: Date, default: null },
	createdAt: { type: Date, default: Date.now }
});


export default mongoose.model('Challenge', challengeSchema);