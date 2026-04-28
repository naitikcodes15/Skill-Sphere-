import React, { useState } from 'react';

const QuizType = () => {
  const [difficulty, setDifficulty] = useState('Medium');
  const [time, setTime] = useState('15 Min');
  const [questions, setQuestions] = useState('15');
  const [langauge , setLanguage] = useState('');
  const [ type , setType] = useState('MCQ');

  const renderSection = (title, options, selected, setter) => (
    <div className="mb-5">
      <h3 className="text-[12px] text-[#94a3b8] mb-2.5 uppercase tracking-[0.5px] font-bold">{title}</h3>
      <div className="grid grid-cols-3 gap-2.5">
        {options.map((opt) => (
          <button
            key={opt}
            className={`bg-[#1e293b] py-[12px] rounded text-[14px] font-bold cursor-pointer border-2 transition-all duration-200 hover:bg-[#334155] ${selected === opt ? 'text-white border-blue-500' : 'text-[#cbd5e1] border-transparent'}`}
            onClick={() => setter(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-[#0f172a] text-[#f8fafc] p-5 rounded-lg w-full font-sans box-border">
      <div className="flex items-center justify-center bg-[#1e293b] p-[15px] rounded-md mb-5 font-bold">
        <span className="text-blue-400 mr-2">⚡</span>
        <h2 className="m-0 text-[18px]">Quiz Settings</h2>
      </div>

      {renderSection('Difficulty', ['Easy', 'Medium', 'Hard'], difficulty, setDifficulty)}
      {renderSection('Time', ['10 Min', '15 Min', '30 Min'], time, setTime)}
      {renderSection('No. Questions', ['10', '15', '30'], questions, setQuestions)}
      {renderSection('LANG', ['PYTHON', 'C++', 'JAVA SCRIPT' , 'JAVA'], langauge, setLanguage)}
      {renderSection( 'TYPE' , [ 'MCQ' , 'CODE BOX'], type , setType)}
    </div>
  );
};

export default QuizType;