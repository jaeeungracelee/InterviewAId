"use client";

import React, { useState } from 'react';
import Head from 'next/head';
import VideoFeed from '../../components/VideoFeed';
import Controls from '../../components/Controls';
import VoiceCommunication from '../../components/VoiceCommunication';

const InterviewPage = () => {
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
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full">
      <Head>
        <title>InterviewAId - Interview</title>
        <meta name="description" content="AI Powered Interview Assistant" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1 className="text-4xl font-bold mb-6 text-white">Interview Session</h1>
      <div className="w-full max-w-4xl mb-6">
        <VideoFeed />
      </div>
      <VoiceCommunication />
      <Controls recording={recording} onStart={startRecording} onStop={stopRecording} onEnd={endCall} />
    </div>
  );
};

export default InterviewPage;
