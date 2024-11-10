import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

const LiveStreamPlayer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    if (videoRef.current) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource('http://localhost:5001/hls/stream.m3u8');
        hls.attachMedia(videoRef.current);
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = 'http://localhost:5001/hls/stream.m3u8';
      }
    }
  }, []);

  const goLive = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = videoRef.current.duration;
      setIsLive(true);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setIsLive(videoRef.current.currentTime >= videoRef.current.duration - 1);
    }
  };

  return (
    <div>
      <h2>Live Stream of Zoom Meeting</h2>
      <video
        ref={videoRef}
        controls
        autoPlay
        onTimeUpdate={handleTimeUpdate}
        style={{ width: '100%' }}
      />
      {!isLive && (
        <button onClick={goLive} style={{ marginTop: '10px' }}>
          Go Live
        </button>
      )}
    </div>
  );
};

export default LiveStreamPlayer;
