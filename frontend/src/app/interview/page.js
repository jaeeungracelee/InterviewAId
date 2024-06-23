"use client";

import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import Head from "next/head";
import VideoFeed from "../../components/VideoFeed";
import Controls from "../../components/Controls";
import VoiceCommunication from "../../components/VoiceCommunication";

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

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full">
      <Head>
        <title>InterviewAId - Interview</title>
        <meta name="description" content="AI Powered Interview Assistant" />
      </Head>

      <div className="w-full h-[70vh] max-w-4xl mb-6">
        <VideoFeed />
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
