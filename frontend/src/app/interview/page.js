"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";
import VideoFeed from "../../components/VideoFeed";
import Controls from "../../components/Controls";
import VoiceCommunication from "../../components/VoiceCommunication";
import CodeEditor from "../../components/CodeEditor";
import { socket } from "@/lib/socket";

const InterviewPage = () => {
  const router = useRouter();
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const recorderIntervalId = useRef(null);
  const [generatingResponse, setGeneratingResponse] = useState(false);
  const [code, setCode] = useState("");

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
          // console.log(reader.result);
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
    socketRecording();
    setGeneratingResponse(true);
    setTimeout(() => {
      sendText("");
      setGeneratingResponse(false);
    }, 1000);
  };

  const endCall = () => {
    // end the call
    setRecording(false);
    router.push("/feedback");
  };

  const submitInfo = async () => {
    socketRecording();
    setGeneratingResponse(true);
    setTimeout(() => {
      sendText(code);
      setGeneratingResponse(false);
    }, 1000);
  };

  const socketRecording = async () => {
    setGeneratingResponse(true);
    if (mediaRecorder) {
      mediaRecorder.stop();
      setMediaRecorder(null);
      clearInterval(recorderIntervalId.current);
    }
    setRecording(false);
    socket.emit("voice_message", "stop");
  };

  const sendText = (codeInfo) => {
    fetch("http://localhost:8000/groq/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        voice: "Here is my code:",
        code: codeInfo,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data)
        fetch("http://localhost:8000/text-to-speech/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: data.content }),
        })
          .then((response) => response.json())
          .then((data) => console.log(data))
          .catch((error) => console.error(error));
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    sendText("Please introduce yourself and provide a question for the interview.");
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full">
      <Head>
        <title>InterviewAId - Interview</title>
        <meta name="description" content="AI Powered Interview Assistant" />
      </Head>

      <div className="flex flex-row w-full h-[70vh] max-w-[90%] mb-6 gap-4">
        <div className="w-full">
          <VideoFeed />
        </div>
        <div className="w-3/5">
          <CodeEditor onSubmit={submitInfo} code={code} setCode={setCode} />
        </div>
      </div>
      <VoiceCommunication
        startRecording={startRecording}
        stopRecording={stopRecording}
      />
      <Controls
        recording={recording}
        onStart={startRecording}
        onStop={stopRecording}
        onEnd={endCall}
      />
    </div>
  );
};

export default InterviewPage;
