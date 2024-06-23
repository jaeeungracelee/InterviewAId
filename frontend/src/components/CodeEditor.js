import React, { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
// import { javascript } from '@codemirror/lang-javascript';

const CodeEditor = ({ onSubmit }) => {
  const [code, setCode] = useState('');

  const handleSubmit = () => {
    onSubmit(code);
    setCode('');
  };

  return (
    <div className="code-editor flex flex-col w-full h-full bg-black rounded-lg shadow-lg p-4">
      <CodeMirror
        value={code}
        theme="dark"
        height="650px"
        onChange={(value) => setCode(value)}
        className="flex-1 rounded-lg"
      />
      <button
        onClick={handleSubmit}
        className="mt-2 bg-[var(--primary-color)] text-black py-2 px-4 rounded-lg"
      >
        Submit Code
      </button>
    </div>
  );
};

export default CodeEditor;
