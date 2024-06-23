"use client";

import { socket } from "@/lib/socket";
import React, { useEffect, useRef, useState } from "react";

const VoiceCommunication = ({ startRecording, stopRecording }) => {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const recorderIntervalId = useRef(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    socket.on("voice_response", (data) => {
      console.log("Voice response:", data);
      // Handle the voice response (e.g., display text)
    });

    return () => {
      socket.off("voice_response");
      socket.disconnect();
    };
  }, []);

  return (
    <div className="voice-communication">
      <button
        onClick={() => {
          if (recording) {
            stopRecording();
            setRecording(false);
            setLoading(true);
            setTimeout(() => setLoading(false), 1200);
          } else {
            startRecording();
            setRecording(true);
          }
        }}
        className={`py-3 px-5 rounded-full text-black ${
          recording ? "bg-red-500" : "bg-[var(--primary-color)]"
        }`}
      >
        {loading ? "Loading..." : recording ? "Stop Talking" : "Start Talking"}
      </button>
    </div>
  );
};

export default VoiceCommunication;
