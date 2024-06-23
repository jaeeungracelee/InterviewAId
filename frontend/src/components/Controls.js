import React from 'react';
import { Mic, MicOff, CallEnd } from '@mui/icons-material';

const Controls = ({ recording, onStart, onStop, onEnd }) => {
  return (
    <div className="controls flex justify-center gap-4 mt-4">
      <button
        onClick={recording ? onStop : onStart}
        className={`py-2 px-4 rounded-full text-white flex items-center justify-center ${recording ? 'bg-black hover:bg-gray-700' : 'bg-black hover:bg-gray-700'}`}
      >
        {recording ? <MicOff /> : <Mic />}
      </button>
      <button onClick={onEnd} className="py-2 px-4 rounded-full bg-black hover:bg-gray-700 text-white flex items-center justify-center">
        <CallEnd />
      </button>
    </div>
  );
};

export default Controls;
