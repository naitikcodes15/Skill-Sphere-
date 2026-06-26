import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IParticipant {
	userId: string;
	score: number;
	currentQuestionIndex: number;
	finishedAt?: Date | null;
}

export interface IChallenge extends Document {
	joinCode: string;
	status: 'waiting' | 'in-progress' | 'completed';
	questions: Types.ObjectId[];
	participants: IParticipant[];
	startTime?: Date | null;
	endTime?: Date | null;
	createdAt: Date;
}

const participantSchema = new Schema<IParticipant>({
	userId: { type: String, required: true },
	score: { type: Number, default: 0 },
	currentQuestionIndex: { type: Number, default: 0 },
	finishedAt: { type: Date, default: null }
}, { _id: false });

const challengeSchema = new Schema<IChallenge>({
	joinCode: { type: String, required: true, unique: true },
	status: {
		type: String,
		enum: ['waiting', 'in-progress', 'completed'],
		default: 'waiting'
	},
	questions: [{
		type: Schema.Types.ObjectId,
		ref: 'DsaQuestion'
	}],
	participants: [participantSchema],
	startTime: { type: Date, default: null },
	endTime: { type: Date, default: null },
	createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IChallenge>('Challenge', challengeSchema);
