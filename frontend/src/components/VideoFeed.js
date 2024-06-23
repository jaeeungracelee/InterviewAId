import React, { useEffect, useRef } from 'react';

const VideoFeed = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    // webcam access pleasee
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(err => {
        console.error("Error accessing webcam: ", err);
      });
  }, []);

  return (
    <div className="video-feed bg-gray-900 flex items-center justify-center rounded-lg overflow-hidden shadow-lg w-full h-96">
      <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
    </div>
  );
};

export default VideoFeed;
