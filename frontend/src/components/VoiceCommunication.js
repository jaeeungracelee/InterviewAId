"use client";

import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const VoiceCommunication = () => {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io("http://localhost:8000", { path: "/socket.io" });
    setSocket(newSocket);

    newSocket.on("voice_response", (data) => {
      console.log("Voice response:", data);
      // Handle the voice response (e.g., display text)
    });

    return () => {
      newSocket.off("voice_response");
      newSocket.disconnect();
    };
  }, []);

  const startRecording = async () => {
    if (!socket) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const newMediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      newMediaRecorder.ondataavailable = (event) => {
        const audioBlob = event.data;
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result;
          socket.emit("voice_message", base64data);
          console.log(reader.result);
        };
        reader.readAsDataURL(audioBlob);
      };

      newMediaRecorder.start(5000); // send data every 5 seconds
      setMediaRecorder(newMediaRecorder);
      setRecording(true);

      newMediaRecorder.onstop = () => {
        setRecording(false);
      };
    } catch (err) {
      console.error("Error accessing microphone: ", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setMediaRecorder(null);
    }
    setRecording(false);
    if (socket) {
      socket.emit("voice_message", "stop");
    }
  };

  return (
    <div className="voice-communication">
      <button
        onClick={recording ? stopRecording : startRecording}
        className={`py-3 px-5 rounded-full text-black font-semibold ${
          recording ? "bg-red-500" : "bg-[var(--primary-color)]"
        }`}
      >
        {recording ? "Stop" : "Start"}
      </button>
    </div>
  );
};

export default VoiceCommunication;
