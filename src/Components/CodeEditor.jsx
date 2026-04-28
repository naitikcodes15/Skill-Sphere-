import React, { useState } from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = () => {
	const [code, setCode] = useState(
		'function solve(input) {\n  // Write your code here\n  return false;\n}'
	);

	const [language, setLanguage] = useState('python');

	const handleEditorChange = (value) => {
		setCode(value);
	};

	const handleRunCode = () => {
		console.log("Sending this code to the backend:", code);
	};

	return (
		<div className="flex flex-col h-full w-full bg-gray-900 p-4 rounded-xl border border-gray-800">

			{/* Header */}
			<div className="flex justify-between items-center mb-3">
				<h2 className="text-white font-semibold text-lg">Code Editor</h2>
				<div className="text-gray-400 text-xs bg-gray-800 px-3 py-1 rounded">
					{language}
				</div>
			</div>

			{/* Editor */}
			<div className="h-[680px]  overflow-hidden border border-gray-700">
				<Editor
					height="100%"
					language={language}
					theme="vs-dark"
					value={code}
					onChange={handleEditorChange}
					options={{
						minimap: { enabled: false },
						fontSize: 14,
						wordWrap: 'on',
						scrollBeyondLastLine: false,
					}}
				/>
			</div>

			{/* Button */}
			<div className="mt-3 flex justify-end">
				<button
					onClick={handleRunCode}
					className="bg-green-600 hover:bg-green-500 text-white px-5 py-2  text-sm font-semibold"
				>
					Run Code
				</button>
			</div>

		</div>
	);
};

export default CodeEditor;