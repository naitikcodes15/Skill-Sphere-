import React from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({ code, language, onChange, onLanguageChange }) => {
	const handleEditorChange = (value) => {
		if (onChange) onChange(value);
	};

	return (
		<div className="flex flex-col h-full w-full bg-[#1e1e1e] p-4 rounded-xl border border-gray-800">

			{/* Header */}
			<div className="flex justify-between items-center mb-3">
				<h2 className="text-white font-semibold text-lg">Code Editor</h2>
				<select 
					value={language}
					onChange={(e) => onLanguageChange && onLanguageChange(e.target.value)}
					className="bg-gray-800 text-gray-300 border border-gray-700 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block p-2 cursor-pointer outline-none"
				>
					<option value="c">C</option>
					<option value="cpp">C++</option>
					<option value="java">Java</option>
					<option value="python">Python</option>
					<option value="javascript">JavaScript</option>
				</select>
			</div>

			{/* Editor */}
			<div className="h-[680px] overflow-hidden border border-gray-700">
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
		</div>
	);
};

export default CodeEditor;