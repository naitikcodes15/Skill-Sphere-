import mongoose from "mongoose";

const collections = {
  ChallengeSession: new Map(),
  Challenge: new Map(),
  DsaQuestion: new Map(),
  Question: new Map()
};

const setupInMemoryMock = () => {
  console.warn("⚠️ SkillSphere: MongoDB Connection failed or MONGO_URI missing. Falling back to In-Memory Database Mode.");

  // Stub mongoose.connect to resolve immediately
  mongoose.connect = async () => {
    console.log("Mocked MongoDB Connected");
    return mongoose;
  };

  // Override Model.prototype.save
  mongoose.Model.prototype.save = async function() {
    const modelName = this.constructor.modelName;
    if (!this._id) {
      this._id = new mongoose.Types.ObjectId();
    }
    
    if (!collections[modelName]) {
      collections[modelName] = new Map();
    }
    
    // Mongoose maps need to be serialized correctly
    const obj = this.toObject ? this.toObject() : { ...this };
    collections[modelName].set(String(this._id), obj);
    
    return this;
  };

  // Helper query wrap class
  class MockQuery {
    constructor(modelConstructor, result) {
      this.modelConstructor = modelConstructor;
      this.result = result;
    }
    
    populate(path, select) {
      const data = this.result;
      if (!data) return this;
      
      const populateSingle = (docObj) => {
        if (!docObj) return;
        if (path === 'questions') {
          if (Array.isArray(docObj.questions)) {
            docObj.questions = docObj.questions.map(qId => {
              const qStr = String(qId._id || qId);
              const qObj = collections['DsaQuestion']?.get(qStr);
              if (qObj) {
                if (select === '-testCases') {
                  const copy = { ...qObj };
                  delete copy.testCases;
                  return copy;
                }
                return qObj;
              }
              return qId;
            });
          }
        }
      };

      if (Array.isArray(data)) {
        data.forEach(populateSingle);
      } else {
        populateSingle(data);
      }
      return this;
    }
    
    sort(sortObj) {
      if (Array.isArray(this.result)) {
        const keys = Object.keys(sortObj);
        if (keys.length > 0) {
          const key = keys[0];
          const dir = sortObj[key];
          this.result.sort((a, b) => {
            const valA = a[key] || 0;
            const valB = b[key] || 0;
            if (valA < valB) return dir;
            if (valA > valB) return -dir;
            return 0;
          });
        }
      }
      return this;
    }
    
    async then(onfulfilled, onrejected) {
      try {
        let finalResult = null;
        if (Array.isArray(this.result)) {
          finalResult = this.result.map(item => wrapDoc(this.modelConstructor, item));
        } else if (this.result) {
          finalResult = wrapDoc(this.modelConstructor, this.result);
        }
        return Promise.resolve(finalResult).then(onfulfilled);
      } catch (err) {
        if (onrejected) return onrejected(err);
        throw err;
      }
    }
  }

  const wrapDoc = (modelConstructor, plainObj) => {
    if (!plainObj) return null;
    if (plainObj instanceof mongoose.Model) return plainObj;
    const doc = new modelConstructor(plainObj);
    doc.isNew = false;
    return doc;
  };

  // Monkey-patch static find
  mongoose.Model.find = function(query = {}) {
    const modelName = this.modelName;
    const docs = Array.from(collections[modelName]?.values() || []);
    const filtered = docs.filter(doc => {
      for (const key in query) {
        if (key.includes('.')) {
          const parts = key.split('.');
          let val = doc;
          for (const part of parts) {
            val = val ? val[part] : undefined;
          }
          if (String(val) !== String(query[key])) return false;
        } else {
          if (String(doc[key]) !== String(query[key])) return false;
        }
      }
      return true;
    });
    return new MockQuery(this, filtered);
  };

  // Monkey-patch static findOne
  mongoose.Model.findOne = function(query = {}) {
    const modelName = this.modelName;
    const docs = Array.from(collections[modelName]?.values() || []);
    const found = docs.find(doc => {
      for (const key in query) {
        if (key.includes('.')) {
          const parts = key.split('.');
          let val = doc;
          for (const part of parts) {
            val = val ? val[part] : undefined;
          }
          if (String(val) !== String(query[key])) return false;
        } else {
          if (String(doc[key]) !== String(query[key])) return false;
        }
      }
      return true;
    });
    return new MockQuery(this, found || null);
  };

  // Monkey-patch static findById
  mongoose.Model.findById = function(id) {
    const modelName = this.modelName;
    const doc = collections[modelName]?.get(String(id));
    return new MockQuery(this, doc || null);
  };

  // Monkey-patch static deleteOne
  mongoose.Model.deleteOne = async function(query = {}) {
    const modelName = this.modelName;
    const docs = Array.from(collections[modelName]?.values() || []);
    const found = docs.find(doc => {
      for (const key in query) {
        if (String(doc[key]) !== String(query[key])) return false;
      }
      return true;
    });
    if (found) {
      collections[modelName].delete(String(found._id));
    }
    return { deletedCount: found ? 1 : 0 };
  };

  // Monkey-patch static deleteMany
  mongoose.Model.deleteMany = async function(query = {}) {
    const modelName = this.modelName;
    if (collections[modelName]) {
      collections[modelName].clear();
    }
    return { deletedCount: 0 };
  };

  // Monkey-patch static insertMany
  mongoose.Model.insertMany = async function(arr) {
    const modelName = this.modelName;
    if (!collections[modelName]) {
      collections[modelName] = new Map();
    }
    return arr.map(item => {
      const inst = new this(item);
      const obj = inst.toObject ? inst.toObject() : { ...inst };
      collections[modelName].set(String(inst._id || item._id), obj);
      return inst;
    });
  };

  // Monkey-patch static aggregate
  mongoose.Model.aggregate = async function(pipeline) {
    const modelName = this.modelName;
    const docs = Array.from(collections[modelName]?.values() || []);
    
    let size = 10;
    const sampleStage = pipeline.find(stage => stage.$sample);
    if (sampleStage) {
      size = sampleStage.$sample.size || size;
    }
    
    const shuffled = [...docs].sort(() => 0.5 - Math.random());
    const sampled = shuffled.slice(0, size);
    return sampled;
  };

  // Seed local DSA questions list
  seedDsaInMemory();
};

const seedDsaInMemory = () => {
  const DsaQuestion = mongoose.model("DsaQuestion");
  const questionsList = [
    {
      title: "1. Palindrome Number",
      description: "Check if an integer is a palindrome. Return 'true' or 'false'.\n\n**Time Complexity:** O(log10 n)\n**Space Complexity:** O(1)",
      difficulty: "EASY",
      category: "Math",
      points: 10,
      testCases: [
        { input: "121", expectedOutput: "true" },
        { input: "-121", expectedOutput: "false" },
        { input: "10", expectedOutput: "false" }
      ],
      initialCode: {
        javascript: "function solve(n) {\n  // return 'true' or 'false'\n}",
        python: "def solve(n):\n    # return 'true' or 'false'\n    pass",
        cpp: "string solve(string n) {\n  // return \"true\" or \"false\"\n}",
        java: "public static String solve(String n) {\n  // return \"true\" or \"false\"\n}",
        c: "char* solve(char* n) {\n  // return \"true\" or \"false\"\n}"
      }
    },
    {
      title: "2. Armstrong Number",
      description: "Check if the sum of the cubes of the digits equals the number itself.\n\n**Time Complexity:** O(log10 n)\n**Space Complexity:** O(1)",
      difficulty: "EASY",
      category: "Math",
      points: 10,
      testCases: [
        { input: "153", expectedOutput: "true" },
        { input: "370", expectedOutput: "true" },
        { input: "123", expectedOutput: "false" }
      ],
      initialCode: {
        javascript: "function solve(n) {\n  // return 'true' or 'false'\n}",
        python: "def solve(n):\n    # return 'true' or 'false'\n    pass",
        cpp: "string solve(string n) {\n  // return \"true\" or \"false\"\n}",
        java: "public static String solve(String n) {\n  // return \"true\" or \"false\"\n}",
        c: "char* solve(char* n) {\n  // return \"true\" or \"false\"\n}"
      }
    },
    {
      title: "3. Prime Number Check",
      description: "Determine if a number is prime. Return 'true' or 'false'.\n\n**Time Complexity:** O(√n)\n**Space Complexity:** O(1)",
      difficulty: "EASY",
      category: "Math",
      points: 10,
      testCases: [
        { input: "17", expectedOutput: "true" },
        { input: "4", expectedOutput: "false" },
        { input: "2", expectedOutput: "true" }
      ],
      initialCode: {
        javascript: "function solve(n) {\n  // return 'true' or 'false'\n}",
        python: "def solve(n):\n    # return 'true' or 'false'\n    pass",
        cpp: "string solve(string n) {\n  // return \"true\" or \"false\"\n}",
        java: "public static String solve(String n) {\n  // return \"true\" or \"false\"\n}",
        c: "char* solve(char* n) {\n  // return \"true\" or \"false\"\n}"
      }
    },
    {
      title: "4. Factorial of a Number",
      description: "Calculate the factorial of n (n!). Return the result as a string.\n\n**Time Complexity:** O(n)\n**Space Complexity:** O(1)",
      difficulty: "EASY",
      category: "Math",
      points: 10,
      testCases: [
        { input: "5", expectedOutput: "120" },
        { input: "0", expectedOutput: "1" },
        { input: "6", expectedOutput: "720" }
      ],
      initialCode: {
        javascript: "function solve(n) {\n  // return the factorial as a string\n}",
        python: "def solve(n):\n    # return the factorial as a string\n    pass",
        cpp: "string solve(string n) {\n  // return the factorial as a string\n}",
        java: "public static String solve(String n) {\n  // return the factorial as a string\n}",
        c: "char* solve(char* n) {\n  // return the factorial as a string\n}"
      }
    },
    {
      title: "5. Fibonacci Series",
      description: "Return the n-th number in the Fibonacci sequence. (Assume 0-th is 0, 1-st is 1)\n\n**Time Complexity:** O(n)\n**Space Complexity:** O(1)",
      difficulty: "EASY",
      category: "Math",
      points: 10,
      testCases: [
        { input: "6", expectedOutput: "8" },
        { input: "0", expectedOutput: "0" },
        { input: "10", expectedOutput: "55" }
      ],
      initialCode: {
        javascript: "function solve(n) {\n  // return the n-th Fibonacci number as a string\n}",
        python: "def solve(n):\n    # return the n-th Fibonacci number as a string\n    pass",
        cpp: "string solve(string n) {\n  // return as string\n}",
        java: "public static String solve(String n) {\n  // return as string\n}",
        c: "char* solve(char* n) {\n  // return as string\n}"
      }
    },
    {
      title: "6. Return Length of String",
      description: "Return the total character count of the given string as a string.\n\n**Time Complexity:** O(1)\n**Space Complexity:** O(1)",
      difficulty: "EASY",
      category: "Strings",
      points: 10,
      testCases: [
        { input: "Hello", expectedOutput: "5" },
        { input: "SkillSphere", expectedOutput: "11" },
        { input: "AI", expectedOutput: "2" }
      ],
      initialCode: {
        javascript: "function solve(s) {\n  // return length as a string\n}",
        python: "def solve(s):\n    # return length as a string\n    pass",
        cpp: "string solve(string s) {\n  // return length as a string\n}",
        java: "public static String solve(String s) {\n  // return length as a string\n}",
        c: "char* solve(char* s) {\n  // return length as a string\n}"
      }
    },
    {
      title: "7. Reverse a String",
      description: "Reverse the characters in the string in place.\n\n**Time Complexity:** O(n)\n**Space Complexity:** O(n)",
      difficulty: "EASY",
      category: "Strings",
      points: 10,
      testCases: [
        { input: "code", expectedOutput: "edoc" },
        { input: "hello", expectedOutput: "olleh" },
        { input: "a", expectedOutput: "a" }
      ],
      initialCode: {
        javascript: "function solve(s) {\n  // return reversed string\n}",
        python: "def solve(s):\n    # return reversed string\n    pass",
        cpp: "string solve(string s) {\n  // return reversed string\n}",
        java: "public static String solve(String s) {\n  // return reversed string\n}",
        c: "char* solve(char* s) {\n  // return reversed string\n}"
      }
    },
    {
      title: "8. Sentence Palindrome",
      description: "Check palindrome status ignoring case and non-alphanumeric characters. Return 'true' or 'false'.\n\n**Time Complexity:** O(n)\n**Space Complexity:** O(n)",
      difficulty: "MEDIUM",
      category: "Strings",
      points: 20,
      testCases: [
        { input: "Race Car", expectedOutput: "true" },
        { input: "A man, a plan, a canal: Panama", expectedOutput: "true" },
        { input: "hello", expectedOutput: "false" }
      ],
      initialCode: {
        javascript: "function solve(s) {\n  // return 'true' or 'false'\n}",
        python: "def solve(s):\n    # return 'true' or 'false'\n    pass",
        cpp: "string solve(string s) {\n  // return \"true\" or \"false\"\n}",
        java: "public static String solve(String s) {\n  // return \"true\" or \"false\"\n}",
        c: "char* solve(char* s) {\n  // return \"true\" or \"false\"\n}"
      }
    },
    {
      title: "9. Longest Substring Without Repeating",
      description: "Find the length of the longest substring with unique characters. Return as string.\n\n**Time Complexity:** O(n)\n**Space Complexity:** O(min(n, m))",
      difficulty: "MEDIUM",
      category: "Strings",
      points: 20,
      testCases: [
        { input: "abcabcbb", expectedOutput: "3" },
        { input: "bbbbb", expectedOutput: "1" },
        { input: "pwwkew", expectedOutput: "3" }
      ],
      initialCode: {
        javascript: "function solve(s) {\n  // return length as string\n}",
        python: "def solve(s):\n    # return length as string\n    pass",
        cpp: "string solve(string s) {\n  // return length as string\n}",
        java: "public static String solve(String s) {\n  // return length as string\n}",
        c: "char* solve(char* s) {\n  // return length as string\n}"
      }
    },
    {
      title: "10. Valid Anagram",
      description: "Check if two strings contain the same characters. Inputs are separated by a comma (e.g. rat,car). Return 'true' or 'false'.\n\n**Time Complexity:** O(n)\n**Space Complexity:** O(1)",
      difficulty: "EASY",
      category: "Strings",
      points: 10,
      testCases: [
        { input: "rat,car", expectedOutput: "false" },
        { input: "listen,silent", expectedOutput: "true" },
        { input: "a,a", expectedOutput: "true" }
      ],
      initialCode: {
        javascript: "function solve(input) {\n  const [s, t] = input.split(',');\n  // return 'true' or 'false'\n}",
        python: "def solve(input):\n    s, t = input.split(',')\n    # return 'true' or 'false'\n    pass",
        cpp: "string solve(string input) {\n  // split by comma and compare\n}",
        java: "public static String solve(String input) {\n  // split by comma and compare\n}",
        c: "char* solve(char* input) {\n  // split by comma and compare\n}"
      }
    }
  ];

  // Generate remaining 40 questions
  for (let i = 11; i <= 50; i++) {
    questionsList.push({
      _id: new mongoose.Types.ObjectId(),
      title: `${i}. DSA Challenge ${i}`,
      description: `Determine the optimal solution for this algorithmic challenge.\n\n**Time Complexity:** O(n)\n**Space Complexity:** O(n)`,
      difficulty: i % 3 === 0 ? "HARD" : i % 2 === 0 ? "MEDIUM" : "EASY",
      category: "Arrays & Sorting",
      points: i % 3 === 0 ? 30 : i % 2 === 0 ? 20 : 10,
      testCases: [
        { input: "1,2,3", expectedOutput: "3" },
        { input: "4,5,6", expectedOutput: "6" }
      ],
      initialCode: {
        javascript: "function solve(input) {\n  // return the correct answer as a string\n  return input.split(',').pop();\n}",
        python: "def solve(input):\n    # return the correct answer as a string\n    return input.split(',')[-1]",
        cpp: "string solve(string input) {\n  // return answer\n  return string(1, input.back());\n}",
        java: "public static String solve(String input) {\n  // return answer\n  String[] parts = input.split(\",\");\n  return parts[parts.length - 1];\n}",
        c: "char* solve(char* input) {\n  // dummy C code\n  return \"3\"; \n}"
      }
    });
  }

  // Insert into memory map
  for (const q of questionsList) {
    if (!q._id) q._id = new mongoose.Types.ObjectId();
    collections.DsaQuestion.set(String(q._id), q);
  }
  console.log(`Seeded ${collections.DsaQuestion.size} DSA questions in-memory.`);
};

export const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI environment variable is not defined");
    }
    // Set a short connection timeout so it doesn't hang in offline sandbox
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 2000
    });
    console.log("MongoDB Connected");
  } catch (err) {
    setupInMemoryMock();
  }
};