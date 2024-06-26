import React, { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
// import { javascript } from '@codemirror/lang-javascript';

const CodeEditor = ({ onSubmit, code, setCode }) => {
  const [loading, setLoading] = useState(false);

  return (
    <div className="code-editor flex flex-col w-full h-full bg-black rounded-lg shadow-lg p-4">
      <CodeMirror
        value={code}
        theme="dark"
        height="98%"
        onChange={(value) => setCode(value)}
        className="flex-1 rounded-lg"
      />
      <button
        onClick={() => {
          setLoading(true);
          onSubmit();
          setTimeout(() => setLoading(false), 1200);
        }}
        className="mt-2 bg-[var(--primary-color)] text-black py-2 px-4 rounded-lg"
      >
        {loading ? "Loading..." : "Submit Code"}
      </button>
    </div>
  );
};

export default CodeEditor;
