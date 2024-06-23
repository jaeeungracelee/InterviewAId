import { Mic, MicOff, CallEnd } from '@mui/icons-material';

const Controls = ({ recording, onStart, onStop, onEnd }) => {
  return (
    <div className="controls flex justify-center gap-4 mt-4">
      <button
        onClick={recording ? onStop : onStart}
        className={`p-3 rounded-full text-white flex items-center transition-all justify-center ${
          recording
            ? "bg-black hover:bg-[var(--primary-color)]"
            : "bg-black hover:bg-[var(--primary-color)]"
        }`}
      >
        {recording ? (
          <MicOff sx={{ color: "var(--secondary-color)", fontSize: 24 }} />
        ) : (
          <Mic sx={{ color: "var(--secondary-color)", fontSize: 24 }} />
        )}
      </button>
      <button
        onClick={onEnd}
        className="p-3 rounded-full bg-black hover:bg-[var(--primary-color)] transition-all text-white flex items-center justify-center"
      >
        <CallEnd sx={{ color: "var(--secondary-color)", fontSize: 24 }} />
      </button>
    </div>
  );
};

export default Controls;
