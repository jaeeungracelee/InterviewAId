import React from 'react';
import { Mic, MicOff, CallEnd } from '@mui/icons-material';

const Controls = ({ recording, onStart, onStop, onEnd }) => {
  return (
    <div className="controls flex justify-center gap-4 mt-4">
      <button
        onClick={recording ? onStop : onStart}
        className={`p-3 rounded-full text-white flex items-center justify-center ${
          recording
            ? "bg-black hover:bg-[var(--secondary-color)]"
            : "bg-black hover:bg-[var(--secondary-color)]"
        }`}
      >
        {recording ? <MicOff /> : <Mic />}
      </button>
      <button
        onClick={onEnd}
        className="p-3 rounded-full bg-black hover:bg-[var(--secondary-color)] text-white flex items-center justify-center"
      >
        <CallEnd />
      </button>
    </div>
  );
};

export default Controls;
