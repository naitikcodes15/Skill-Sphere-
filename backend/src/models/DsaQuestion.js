import mongoose from 'mongoose';

const testCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  isHidden: { type: Boolean, default: false } // Hidden test cases for final grading
}, { _id: false });

const dsaQuestionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD'], default: 'EASY' },
  points: { type: Number, default: 10 },
  initialCode: {
    // A map of language to starter code
    type: Map,
    of: String,
    default: {
      "javascript": "function solve(input) {\n  // Write your code here\n}\n"
    }
  },
  testCases: [testCaseSchema],
  createdAt: { type: Date, default: Date.now }
});


export default mongoose.model('DsaQuestion', dsaQuestionSchema);

