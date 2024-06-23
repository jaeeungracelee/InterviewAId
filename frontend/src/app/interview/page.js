"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";
import VideoFeed from "../../components/VideoFeed";
import Controls from "../../components/Controls";
import VoiceCommunication from "../../components/VoiceCommunication";
import CodeEditor from "../../components/CodeEditor";

const InterviewPage = () => {
  const router = useRouter();
  const [recording, setRecording] = useState(false);
  const [generatingResponse, setGeneratingResponse] = useState(false);
  const [code, setCode] = useState("");
  const speech = "";

  const startRecording = () => {
    setRecording(true);
  };

  const stopRecording = () => {
    setRecording(false);
    // stop and handle recording
    setGeneratingResponse(true);
    submitInfo();
  };

  const endCall = () => {
    // end the call
    setRecording(false);
    router.push("/feedback");
  };

  const submitInfo = async () => {
    fetch("http://localhost:8000/groq/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        voice: "Here is my code:",
        code: code
      })
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.content);
      })
      .catch((error) => {
        console.error(error);
      });
  };

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
          <CodeEditor onSubmit={stopRecording} code={code} setCode={setCode} />
        </div>
      </div>
      <VoiceCommunication />
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
