import dotenv from 'dotenv';
import mongoose from 'mongoose';
import DsaQuestion from './src/models/DsaQuestion.js';

dotenv.config();

const dummyQuestions = [
  {
    title: "Sum of Two Numbers",
    description: "Return sum of two numbers given as 'a b'.",
    difficulty: "EASY",
    points: 10,
    initialCode: { javascript: "function solve(input) {\n}" },
    testCases: [{ input: "2 3", expectedOutput: "5" }]
  },
  {
    title: "Even or Odd",
    description: "Return 'even' or 'odd' for a number.",
    difficulty: "EASY",
    points: 10,
    initialCode: { javascript: "function solve(input) {\n}" },
    testCases: [{ input: "4", expectedOutput: "even" }]
  },
  {
    title: "Reverse String",
    description: "Reverse the input string.",
    difficulty: "EASY",
    points: 10,
    initialCode: { javascript: "function solve(input) {\n}" },
    testCases: [{ input: "abc", expectedOutput: "cba" }]
  },
  {
    title: "Palindrome Check",
    description: "Return true if string is palindrome.",
    difficulty: "EASY",
    points: 10,
    initialCode: { javascript: "function solve(input) {\n}" },
    testCases: [{ input: "madam", expectedOutput: "true" }]
  },
  {
    title: "Max of Array",
    description: "Return max element from space-separated numbers.",
    difficulty: "EASY",
    points: 10,
    initialCode: { javascript: "function solve(input) {\n}" },
    testCases: [{ input: "1 5 3", expectedOutput: "5" }]
  },
  {
    title: "Min of Array",
    description: "Return minimum element.",
    difficulty: "EASY",
    points: 10,
    initialCode: { javascript: "function solve(input) {\n}" },
    testCases: [{ input: "2 8 1", expectedOutput: "1" }]
  },
  {
    title: "Count Vowels",
    description: "Count vowels in string.",
    difficulty: "EASY",
    points: 10,
    initialCode: { javascript: "function solve(input) {\n}" },
    testCases: [{ input: "hello", expectedOutput: "2" }]
  },
  {
    title: "Factorial",
    description: "Return factorial of a number.",
    difficulty: "EASY",
    points: 10,
    initialCode: { javascript: "function solve(input) {\n}" },
    testCases: [{ input: "5", expectedOutput: "120" }]
  },
  {
    title: "Sum of Digits",
    description: "Return sum of digits.",
    difficulty: "EASY",
    points: 10,
    initialCode: { javascript: "function solve(input) {\n}" },
    testCases: [{ input: "123", expectedOutput: "6" }]
  },
  {
    title: "Binary Conversion",
    description: "Convert number to binary.",
    difficulty: "EASY",
    points: 10,
    initialCode: { javascript: "function solve(input) {\n}" },
    testCases: [{ input: "5", expectedOutput: "101" }]
  },


  {
    title: "Count Even Numbers",
    description: "Count evens in array.",
    difficulty: "EASY",
    points: 10,
    initialCode: { javascript: "function solve(input) {\n}" },
    testCases: [{ input: "1 2 3 4", expectedOutput: "2" }]
  },
  {
    title: "Second Largest",
    description: "Return second largest number.",
    difficulty: "MEDIUM",
    points: 20,
    initialCode: { javascript: "function solve(input) {\n}" },
    testCases: [{ input: "1 5 3 4", expectedOutput: "4" }]
  },
  {
    title: "Remove Spaces",
    description: "Remove spaces from string.",
    difficulty: "EASY",
    points: 10,
    initialCode: { javascript: "function solve(input) {\n}" },
    testCases: [{ input: "a b c", expectedOutput: "abc" }]
  },
  {
    title: "Uppercase",
    description: "Convert string to uppercase.",
    difficulty: "EASY",
    points: 10,
    initialCode: { javascript: "function solve(input) {\n}" },
    testCases: [{ input: "abc", expectedOutput: "ABC" }]
  },
  {
    title: "Count Words",
    description: "Count words in string.",
    difficulty: "EASY",
    points: 10,
    initialCode: { javascript: "function solve(input) {\n}" },
    testCases: [{ input: "hello world", expectedOutput: "2" }]
  },
  {
    title: "First Character",
    description: "Return first character.",
    difficulty: "EASY",
    points: 10,
    initialCode: { javascript: "function solve(input) {\n}" },
    testCases: [{ input: "abc", expectedOutput: "a" }]
  },
  {
    title: "Last Character",
    description: "Return last character.",
    difficulty: "EASY",
    points: 10,
    initialCode: { javascript: "function solve(input) {\n}" },
    testCases: [{ input: "abc", expectedOutput: "c" }]
  },
  {
    title: "Multiply All",
    description: "Multiply all numbers.",
    difficulty: "EASY",
    points: 10,
    initialCode: { javascript: "function solve(input) {\n}" },
    testCases: [{ input: "2 3 4", expectedOutput: "24" }]
  },
  {
    title: "Check Prime",
    description: "Return true if prime.",
    difficulty: "MEDIUM",
    points: 20,
    initialCode: { javascript: "function solve(input) {\n}" },
    testCases: [{ input: "7", expectedOutput: "true" }]
  },
  {
    title: "Sum Array",
    description: "Sum all elements.",
    difficulty: "EASY",
    points: 10,
    initialCode: { javascript: "function solve(input) {\n}" },
    testCases: [{ input: "1 2 3", expectedOutput: "6" }]
  },

  // Continue similarly...

  ...Array.from({ length: 60 }).map((_, i) => ({
    title: `Rapid Question ${i + 21}`,
    description: "Return length of input string.",
    difficulty: "EASY",
    points: 10,
    initialCode: { javascript: "function solve(input) {\n}" },
    testCases: [{ input: "hello", expectedOutput: "5" }]
  }))
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    await DsaQuestion.deleteMany({}); // Clear old questions
    console.log('Cleared old DSA questions');

    await DsaQuestion.insertMany(dummyQuestions);
    console.log('Inserted dummy questions successfully!');
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
