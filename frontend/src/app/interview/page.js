"use client";

import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import Head from "next/head";
import VideoFeed from "../../components/VideoFeed";
import Controls from "../../components/Controls";
import VoiceCommunication from "../../components/VoiceCommunication";
import CodeEditor from "../../components/CodeEditor";

const InterviewPage = () => {
  const router = useRouter();
  const [recording, setRecording] = useState(false);

  const startRecording = () => {
    setRecording(true);
  };
  
  const stopRecording = () => {
    setRecording(false);
    // stop and handle recording
  };

  const endCall = () => {
    // end the call
    setRecording(false);
    router.push("/feedback");
  };

  const submitCode = async (code) => {
    try {
      const response = await fetch('/api/submit-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      const result = await response.json();
      console.log(result);
    } catch (error) {
      console.error("Error submitting code:", error);
    }
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
        <CodeEditor onSubmit={submitCode} />
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
