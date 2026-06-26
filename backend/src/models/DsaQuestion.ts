import mongoose, { Schema, Document } from 'mongoose';

export interface ITestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface IDsaQuestion extends Document {
  title: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  points: number;
  initialCode: Map<string, string>;
  testCases: ITestCase[];
  createdAt: Date;
}

const testCaseSchema = new Schema<ITestCase>({
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  isHidden: { type: Boolean, default: false }
}, { _id: false });

const dsaQuestionSchema = new Schema<IDsaQuestion>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD'], default: 'EASY' },
  points: { type: Number, default: 10 },
  initialCode: {
    type: Map,
    of: String,
    default: {
      "javascript": "function solve(input) {\n  // Write your code here\n}\n"
    }
  },
  testCases: [testCaseSchema],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IDsaQuestion>('DsaQuestion', dsaQuestionSchema);
