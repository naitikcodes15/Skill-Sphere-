import Sidebar from "../Components/Sidebar";
import SessionDetails from "../Components/SessionDetails";
import Practice from "./Practice";
import QuestArena from "../Components/QuestArena";
import Challenge from "../Components/Challenge";


import { useState } from "react";
export default function Quizzes() {
	const [mode, setMode] = useState('main');
	const [selectedSessionId, setSelectedSessionId] = useState(null);
	const [quizConfig, setQuizConfig] = useState({
		difficulty: 'Medium',
		limit: '10',
		category: 'DevOps'
	});

	return (
		<div className="w-screen h-full bg-[#121212] flex justify-center items-center p-0">
			{mode === "main" && <div className="flex-1 h-full bg-[#121212] text-white p-8 box-border flex flex-col gap-6 font-sans overflow-y-auto">Hello this is Battleground u must fight enough </div>}

			{mode === "practice" && <Practice setMode={setMode} quizConfig={quizConfig} />}
			{mode === "quest" && <QuestArena />}
			{mode === "challenge" && <Challenge setMode={setMode} />}

			{mode === "session" && selectedSessionId && (<SessionDetails sessionId={selectedSessionId} />)}
			<Sidebar setMode={setMode} setSelectedSessionId={setSelectedSessionId} quizConfig={quizConfig} setQuizConfig={setQuizConfig} />
		</div>
	)
}

		