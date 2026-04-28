import { useEffect, useState } from "react";

const Practice = ({ setMode }) => {
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [timeLeft, setTimeLeft] = useState(600);

    const fetchQuestions = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/questions/practice?userId=Naitik_Yadav");
            const data = await res.json();
            setQuestions(data);
        } catch (err) {
            console.error("Failed to load questions", err);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, []);

    const handleFinish = async (finalAnswers) => {
        setShowResult(true);
        const questionsSnapshot = questions.map((q) => {
            const userAnswer = finalAnswers.find(a => a.questionId === q._id);
            const correctText = q.data.answers.find(a => a.isCorrect)?.text;

            return {
                questionId: q._id,
                title: q.title,
                description: q.description,
                selected: userAnswer?.selected || "Skipped",
                correctAnswer: correctText,
                isCorrect: userAnswer ? userAnswer.selected === correctText : false,
                options: q.data.answers.map(a => a.text)
            };
        });

        const finalScore = questionsSnapshot.filter(q => q.isCorrect).length;

        await fetch("http://localhost:5000/api/session/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: "Naitik_Yadav",
                questions: questionsSnapshot,
                score: finalScore,
                total: questions.length
            })
        });
    };

    useEffect(() => {
        if (timeLeft <= 0) {
            handleFinish(answers);
            return;
        }
        const timer = setInterval(() => setTimeLeft(p => p - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const handleAnswer = (selectedOption) => {
        const currentQ = questions[currentIndex];
        const correctText = currentQ.data.answers.find(a => a.isCorrect)?.text;
        const isCorrect = selectedOption === correctText;

        const newAnswer = {
            questionId: currentQ._id,
            selected: selectedOption,
        };

        setAnswers(prev => {
            const updated = [...prev.filter(a => a.questionId !== currentQ._id), newAnswer];
            if (currentIndex + 1 === questions.length) {
                handleFinish(updated);
            }
            return updated;
        });

        if (isCorrect) setScore(p => p + 1);
        if (currentIndex + 1 < questions.length) {
            setCurrentIndex(p => p + 1);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    if (questions.length === 0) {
        return <div className="flex-1 h-full bg-[#121212] text-white p-8 flex flex-col items-center justify-center gap-6">LOADING ARENA...</div>;
    }

    if (showResult) {
        return (
            <div className="flex-1 h-full bg-[#121212] text-white p-8 flex flex-col items-center justify-center gap-6">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-blue-400 mb-2">QUIZ OVER</h1>
                    <p className="text-xl text-gray-400">Final Score: <span className="text-white">{score} / {questions.length}</span></p>
                </div>
                <button 
                    onClick={() => setMode("main")} 
                    className="h-[50px] px-10 bg-blue-600 hover:bg-blue-700 font-bold transition-all shadow-lg shadow-blue-600/20"
                >
                    GO BACK TO ARENA
                </button>
            </div>
        );
    }

    const currentQ = questions[currentIndex];

    return (
        <div className="flex-1 h-full bg-[#121212] text-white p-8 box-border flex flex-col font-sans overflow-y-auto relative">
            <div className="flex justify-between items-center h-[90px] mb-6 flex-shrink-0">
                <div className="max-w-[60%]">
                    <h2 className="text-blue-400 font-bold uppercase text-3xl leading-none tracking-tighter">Question {currentIndex + 1}</h2>
                    <h1 className="text-lg text-gray-500 truncate mt-2 font-medium">{currentQ.title}</h1>
                </div>
                <div className={`w-[110px] h-[55px] flex items-center justify-center rounded border font-mono text-2xl font-bold flex-shrink-0 transition-colors ${timeLeft < 60 ? "bg-red-500/10 border-red-500/50 text-red-500 animate-pulse" : "bg-blue-500/10 border-blue-500/30 text-blue-400"}`}>
                    {formatTime(timeLeft)}
                </div>
            </div>

            <div className="bg-[#1f2937] p-5 rounded mb-6 border border-gray-800 overflow-y-auto leading-relaxed text-gray-200 flex-shrink-0 shadow-inner">
                <p className="text-base mb-3">{currentQ.description}</p>
                {currentQ.data.text && (
                    <div className="font-mono text-blue-300 bg-black/30 p-3 rounded border border-blue-500/20">
                        {currentQ.data.text}
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-3 mb-8">
                {currentQ.data.answers.map((opt) => (
                    <button
                        key={opt.id}
                        onClick={() => handleAnswer(opt.text)}
                        className="w-full p-4 bg-[#1a1a1a] border border-gray-800 text-left hover:border-blue-500 hover:bg-[#252525] transition-all rounded group flex justify-between items-center"
                    >
                        <span>{opt.text}</span>
                        <span className="opacity-0 group-hover:opacity-100 text-blue-500 text-xs font-bold tracking-widest transition-opacity">SELECT</span>
                    </button>
                ))}
            </div>

            <div className="flex justify-between items-center mt-auto pt-6 border-t border-gray-800">
                <button
                    className="h-[45px] px-8 border border-gray-700 text-gray-400 font-bold hover:text-white hover:bg-gray-800 transition-all"
                    onClick={() => currentIndex + 1 < questions.length ? setCurrentIndex(p => p + 1) : handleFinish(answers)}
                >
                    SKIP
                </button>
                <div className="flex gap-3">
                    <button
                        disabled={currentIndex === 0}
                        className="h-[45px] px-8 bg-gray-800 hover:bg-gray-700 disabled:opacity-10 font-bold transition-all"
                        onClick={() => setCurrentIndex(prev => prev - 1)}
                    >
                        PREV
                    </button>
                    <button
                        disabled={currentIndex === questions.length - 1}
                        className="h-[45px] px-8 bg-gray-800 hover:bg-gray-700 disabled:opacity-10 font-bold transition-all"
                        onClick={() => setCurrentIndex(prev => prev + 1)}
                    >
                        NEXT
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Practice;