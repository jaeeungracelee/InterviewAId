"use client";

import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:8000', { path: '/socket.io' });

const VoiceCommunication = () => {
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    socket.on('voice_response', (data) => {
      console.log('Voice response:', data);
      // Handle the voice response (e.g., display text)
    });

    return () => {
      socket.off('voice_response');
    };
  }, []);

  const startRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = (event) => {
          const audioBlob = event.data;
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64data = reader.result;
            socket.emit('voice_message', base64data);
          };
          reader.readAsDataURL(audioBlob);
        };
        mediaRecorder.start(1000); // send data every second
        setRecording(true);

        mediaRecorder.onstop = () => {
          setRecording(false);
        };
      })
      .catch(err => {
        console.error("Error accessing microphone: ", err);
      });
  };

  const stopRecording = () => {
    // Stop the MediaRecorder and streaming
    setRecording(false);
    socket.emit('voice_message', 'stop');
  };

  return (
    <div className="voice-communication">
      <button
        onClick={recording ? stopRecording : startRecording}
        className={`py-3 px-5 rounded-full text-white font-semibold ${
          recording ? "bg-red-500" : "bg-[var(--primary-color)]"
        }`}
      >
        {recording ? "Stop" : "Start"}
      </button>
    </div>
  );
};

export default VoiceCommunication;
