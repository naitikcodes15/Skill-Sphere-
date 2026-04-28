import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import CodeEditor from "./CodeEditor";

const socket = io("http://localhost:5000", { withCredentials: true });

export default function Challenge() {
	const [language, setLanguage] = useState("cpp");
	const [code, setCode] = useState("");
	const [output, setOutput] = useState("");
	
	const [challengeState, setChallengeState] = useState(null);
	const [isReady, setIsReady] = useState(false);
	const [isStarted, setIsStarted] = useState(false);
	const [winner, setWinner] = useState(null);
	
	const [roomCode, setRoomCode] = useState("");
	const [joinCodeInput, setJoinCodeInput] = useState("");
	const [inRoom, setInRoom] = useState(false);
	const [isHost, setIsHost] = useState(false);

	useEffect(() => {
		socket.on("challenge_state", (state) => {
			setChallengeState(state);
		});

		socket.on("challenge_ready", () => {
			setIsReady(true);
		});
		
		socket.on("challenge_started", () => {
			setIsStarted(true);
		});

		socket.on("challenge_end", ({ winner }) => {
			setWinner(winner);
		});

		return () => {
			socket.off("challenge_state");
			socket.off("challenge_ready");
			socket.off("challenge_started");
			socket.off("challenge_end");
		};
	}, []);

	const createRoom = () => {
		const code = Math.random().toString(36).substring(2, 8).toUpperCase();
		setRoomCode(code);
		socket.emit("join_challenge", { challengeId: code, userDetails: { name: "Player 1" } });
		setIsHost(true);
		setInRoom(true);
	};

	const joinRoom = () => {
		if (joinCodeInput) {
			setRoomCode(joinCodeInput);
			socket.emit("join_challenge", { challengeId: joinCodeInput, userDetails: { name: "Player 2" } });
			setIsHost(false);
			setInRoom(true);
		}
	};
	
	const startChallenge = () => {
		if (isReady && isHost) {
			socket.emit("start_challenge", { challengeId: roomCode });
		}
	};

	const runCode = async () => {
		setOutput("Running...");
		setTimeout(() => {
			socket.emit("code_submitted", { challengeId: roomCode });
		}, 800);
	};

	const p1Score = challengeState?.players?.[0]?.score || 0;
	const p2Score = challengeState?.players?.[1]?.score || 0;
	
	// Phase 1: Setup
	if (!inRoom) {
		return (
			<div className="h-full w-full bg-[#0a0a0a] text-white flex flex-col items-center justify-center font-sans relative overflow-hidden">
				{/* Background glow */}
				<div className="absolute w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
				
				<div className="relative z-10 bg-white/5 backdrop-blur-xl p-10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/10 w-[420px] text-center">
					<h2 className="text-3xl font-extrabold mb-2 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Battle Arena</h2>
					<p className="text-gray-400 text-sm mb-8">Create or join a 1v1 challenge room</p>
					
					<button onClick={createRoom} className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3.5 rounded-xl font-bold mb-6 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all transform hover:-translate-y-1">
						CREATE A ROOM
					</button>

					<div className="flex items-center gap-3 mb-6">
						<div className="h-px bg-white/10 flex-1"></div>
						<span className="text-gray-500 text-xs font-semibold tracking-wider">OR</span>
						<div className="h-px bg-white/10 flex-1"></div>
					</div>

					<input 
						type="text" 
						placeholder="Enter Room Code" 
						value={joinCodeInput}
						onChange={(e) => setJoinCodeInput(e.target.value)}
						className="w-full bg-black/40 border border-white/10 text-white px-4 py-3.5 rounded-xl mb-4 text-center text-lg uppercase tracking-widest focus:outline-none focus:border-blue-500 transition-colors placeholder:text-gray-600 placeholder:normal-case placeholder:tracking-normal"
					/>
					<button onClick={joinRoom} className="w-full bg-white/10 text-white py-3.5 rounded-xl font-bold hover:bg-white/20 transition-all border border-white/5">
						JOIN ROOM
					</button>
				</div>
			</div>
		)
	}

	// Phase 2: Waiting Room
	if (!isStarted) {
		return (
			<div className="h-full w-full bg-[#0a0a0a] text-white flex flex-col items-center justify-center font-sans relative overflow-hidden">
				<div className="absolute w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
				
				<div className="relative z-10 w-[800px] flex flex-col items-center">
					<h1 className="text-4xl font-extrabold mb-2 tracking-tight">Waiting Room</h1>
					
					<div className="bg-black/40 border border-white/10 rounded-2xl p-6 mb-12 flex items-center gap-6">
						<span className="text-gray-400">Room Code:</span>
						<span className="text-3xl font-mono tracking-widest font-bold text-white">{roomCode}</span>
						<a 
							href={`https://api.whatsapp.com/send?text=Join my SkillSphere 1v1 challenge! Room Code: ${roomCode}`} 
							target="_blank" 
							rel="noreferrer"
							className="bg-green-500/20 text-green-400 border border-green-500/30 px-4 py-2 rounded-lg font-bold hover:bg-green-500/30 transition-colors no-underline text-sm"
						>
							Share to WhatsApp
						</a>
					</div>
					
					<div className="flex justify-center items-center w-full gap-16 mb-16">
						{/* Player 1 */}
						<div className="flex flex-col items-center gap-4">
							<div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-1 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
								<div className="w-full h-full rounded-full bg-[#121212] flex items-center justify-center text-4xl font-bold">P1</div>
							</div>
							<span className="text-xl font-semibold">You</span>
						</div>
						
						<div className="text-3xl font-black text-gray-600 italic">VS</div>
						
						{/* Player 2 */}
						<div className="flex flex-col items-center gap-4">
							<div className={`w-32 h-32 rounded-full p-1 transition-all duration-500 ${isReady ? 'bg-gradient-to-br from-red-500 to-orange-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]' : 'border-2 border-dashed border-gray-600'}`}>
								<div className="w-full h-full rounded-full bg-[#121212] flex items-center justify-center text-4xl font-bold text-gray-600">
									{isReady ? <span className="text-white">P2</span> : "?"}
								</div>
							</div>
							<span className={`text-xl font-semibold ${isReady ? 'text-white' : 'text-gray-500 animate-pulse'}`}>
								{isReady ? "Opponent Joined" : "Waiting..."}
							</span>
						</div>
					</div>
					
					{isHost ? (
						<button 
							onClick={startChallenge} 
							disabled={!isReady}
							className={`px-12 py-4 rounded-xl font-extrabold tracking-widest text-lg transition-all duration-300 ${isReady ? 'bg-white text-black hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.4)] cursor-pointer' : 'bg-white/10 text-gray-500 cursor-not-allowed border border-white/5'}`}
						>
							{isReady ? 'START CHALLENGE' : 'WAITING FOR OPPONENT'}
						</button>
					) : (
						<div className="px-12 py-4 rounded-xl font-extrabold tracking-widest text-lg bg-white/10 text-gray-400 border border-white/5 text-center">
							{isReady ? 'WAITING FOR HOST TO START' : 'WAITING FOR OPPONENT...'}
						</div>
					)}
				</div>
			</div>
		)
	}

	// Phase 3: Active Challenge
	return (
		<div className="h-full w-full bg-[#0a0a0a] text-white flex flex-col font-sans">
			
			{/* Top Bar Redesigned */}
			<div className="px-8 py-5 flex items-center justify-between border-b border-white/10 bg-black/40 backdrop-blur-md z-10 relative">
				
				{/* PLAYER 1 */}
				<div className="flex items-center gap-6 w-[40%]">
					<div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center font-bold text-xl shadow-[0_0_15px_rgba(37,99,235,0.5)]">P1</div>
					<div className="flex-1">
						<div className="flex justify-between items-end mb-2">
							<span className="font-bold tracking-wide">You</span>
							<span className="text-sm text-blue-400 font-bold">{p1Score}/10</span>
						</div>
						<div className="flex gap-1.5">
							{[...Array(10)].map((_, i) => (
								<div key={i} className={`h-2 flex-1 rounded-sm transition-all duration-300 ${i < p1Score ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" : "bg-white/10"}`}></div>
							))}
						</div>
					</div>
				</div>

				<div className="text-2xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-gray-300 to-gray-600">VS</div>

				{/* PLAYER 2 */}
				<div className="flex items-center gap-6 w-[40%] flex-row-reverse">
					<div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center font-bold text-xl shadow-[0_0_15px_rgba(220,38,38,0.5)]">P2</div>
					<div className="flex-1">
						<div className="flex justify-between items-end mb-2 flex-row-reverse">
							<span className="font-bold tracking-wide">Opponent</span>
							<span className="text-sm text-red-400 font-bold">{p2Score}/10</span>
						</div>
						<div className="flex gap-1.5 flex-row-reverse">
							{[...Array(10)].map((_, i) => (
								<div key={i} className={`h-2 flex-1 rounded-sm transition-all duration-300 ${i < p2Score ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" : "bg-white/10"}`}></div>
							))}
						</div>
					</div>
				</div>

			</div>

			{/* Main App */}
			<div className="flex flex-1 overflow-hidden relative">
				{winner && (
					<div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center">
						<h1 className="text-6xl font-black mb-6 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">CHALLENGE OVER</h1>
						<p className="text-2xl text-gray-300 mb-8">Winner: {winner.userDetails?.name || `Player ${winner.socketId}`}</p>
						<button onClick={() => window.location.reload()} className="px-8 py-3 bg-white text-black rounded-lg font-bold hover:scale-105 transition-transform">PLAY AGAIN</button>
					</div>
				)}

				{/* Question Panel */}
				<div className="w-[45%] p-8 overflow-y-auto border-r border-white/5 bg-[#0d0d0d] relative">
					<div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px]"></div>
					
					<div className="inline-block px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-bold tracking-widest mb-6">QUESTION {p1Score + 1}</div>
					<h1 className="text-3xl font-extrabold mb-6 tracking-tight">Array Summation</h1>
					
					<div className="prose prose-invert max-w-none text-gray-300 leading-relaxed space-y-4">
						<p>Given an array of integers, return the sum of all elements.</p>
						<div className="bg-[#151515] p-5 rounded-xl border border-white/5 font-mono text-sm shadow-inner mt-6">
							<span className="text-gray-500 block mb-1">// Example</span>
							<span className="text-purple-400">Input:</span> <span className="text-green-300">[1, 2, 3, 4]</span><br/>
							<span className="text-purple-400">Output:</span> <span className="text-yellow-300">10</span>
						</div>
					</div>
					
					<div className="absolute bottom-8 left-8 right-8 flex gap-4">
						<button
							className="flex-1 bg-[#1a1a1a] border border-[#333] text-white py-4 rounded-xl text-sm font-bold hover:bg-[#222] transition-colors cursor-pointer"
						>
							SKIP QUESTION
						</button>
						<button
							className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 rounded-xl text-sm font-bold hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all transform hover:-translate-y-1 cursor-pointer"
							onClick={runCode}
						>
							SUBMIT SOLUTION
						</button>
					</div>
				</div>

				{/* Code Area */}
				<div className="w-[55%] flex flex-col h-full bg-[#1e1e1e]">          
					<CodeEditor />
				</div>

			</div>
		</div>
	);
}