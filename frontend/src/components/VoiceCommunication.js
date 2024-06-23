"use client";

import { socket } from "@/lib/socket";
import React, { useEffect, useRef, useState } from "react";

const VoiceCommunication = () => {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const recorderIntervalId = useRef(null);

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

  const startRecording = async () => {
    if (!socket) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream, {
        // mimeType: "audio/webm",
      });

      mediaRecorder.ondataavailable = (event) => {
        const audioBlob = event.data;
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result;
          socket.emit("voice_message", base64data);
          console.log(reader.result);
        };
        reader.readAsDataURL(audioBlob);
      };
      recorderIntervalId.current = setInterval(() => {
        mediaRecorder.stop();
        mediaRecorder.start();
      }, 5000);
      mediaRecorder.start(); // send data every second
      setRecording(true);

      setMediaRecorder(mediaRecorder);
    } catch (err) {
      console.error("Error accessing microphone: ", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setMediaRecorder(null);
      clearInterval(recorderIntervalId.current);
    }
    setRecording(false);
    socket.emit("voice_message", "stop");
  };

  return (
    <div className="voice-communication">
      <button
        onClick={recording ? stopRecording : startRecording}
        className={`py-3 px-5 rounded-full text-black ${
          recording ? "bg-red-500" : "bg-[var(--primary-color)]"
        }`}
      >
        {recording ? "Stop Talking" : "Start Talking"}
      </button>
    </div>
  );
};

export default VoiceCommunication;
