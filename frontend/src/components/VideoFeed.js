import React, { useEffect, useRef } from 'react';

const VideoFeed = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const wsRef = useRef(null);

  useEffect(() => {
    const constraints = { video: true, audio: true };
    navigator.mediaDevices.getUserMedia(constraints)
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        const ws = new WebSocket("ws://localhost:8000/ws");
        wsRef.current = ws;
        ws.onopen = () => {
          console.log("WebSocket connection opened.");
        };
        ws.onmessage = (event) => {
          console.log("WebSocket message received:", event.data);
        };
        ws.onclose = () => {
          console.log("WebSocket connection closed.");
        };
        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
        };
      })
      .catch(err => {
        console.error("Error accessing webcam: ", err);
      });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && canvasRef.current && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const context = canvasRef.current.getContext('2d');
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        canvasRef.current.toBlob(blob => {
          if (blob) {
            wsRef.current.send(blob);
          }
        }, 'video/webm');
      }
    }, 1000); // Send every second

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="video-feed bg-gray-900 flex items-center justify-center rounded-lg overflow-hidden shadow-lg w-full h-[50vh]">
      <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default VideoFeed;
