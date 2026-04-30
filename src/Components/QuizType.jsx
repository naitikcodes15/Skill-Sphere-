import React from 'react';

const QuizType = ({ quizConfig, setQuizConfig }) => {
  const updateConfig = (key, value) => setQuizConfig({ ...quizConfig, [key]: value });

  const renderSection = (title, options, selected, setterKey) => (
    <div className="mb-5">
      <h3 className="text-[12px] text-[#94a3b8] mb-2.5 uppercase tracking-[0.5px] font-bold">{title}</h3>
      <div className="grid grid-cols-3 gap-2.5">
        {options.map((opt) => (
          <button
            key={opt}
            className={`bg-[#1e293b] py-[12px] rounded text-[14px] font-bold cursor-pointer border-2 transition-all duration-200 hover:bg-[#334155] ${selected === opt ? 'text-white border-blue-500' : 'text-[#cbd5e1] border-transparent'}`}
            onClick={() => updateConfig(setterKey, opt)}
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

      {renderSection('Difficulty', ['Easy', 'Medium', 'Hard'], quizConfig?.difficulty || 'Easy', 'difficulty')}
      {renderSection('No. Questions', ['5', '10', '20'], quizConfig?.limit || '10', 'limit')}
      {renderSection('Category', ['Linux', 'Programming', 'DevOps'], quizConfig?.category || 'Linux', 'category')}
    </div>
  );
};

export default QuizType;