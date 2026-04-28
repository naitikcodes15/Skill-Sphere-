import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
	id: { type: String, required: true },
	text: { type: String, required: true },
	type: { type: String },
	difficulty: { type: String },
	explanation: { type: String },
	category: { type: String },
	answers: [{
		id: String,
		text: String,
		isCorrect: Boolean
	}]
}, { _id: false }); // _id false so it doesn't create a new mongo id for each question, we use QuizAPI's id

const sessionSchema = new mongoose.Schema({
	userId: {
		type: String,
		default: "guest"
	},
	sessionType: {
		type: String,
		enum: ['practice', 'challenge', 'tournament'],
		default: 'practice'
	},
	status: {
		type: String,
		enum: ['in-progress', 'completed'],
		default: 'in-progress'
	},
	questions: [questionSchema],
	userAnswers: {
		// Map of question ID to answer ID
		type: Map,
		of: String,
		default: {}
	},
	score: {
		type: Number,
		default: 0
	},
	createdAt: {
		type: Date,
		default: Date.now
	}
});

export default mongoose.model('Session', sessionSchema);
