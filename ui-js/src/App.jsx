import './App.css';
import { useState, useRef, useEffect } from 'react';
import { TextField, Box, Button } from '@mui/material';
import RecordRTC from 'recordrtc';
import { ListComponent } from './components/ListComponent/ListComponent';
import Chip from '@mui/material/Chip';
import FlagIcon from '@mui/icons-material/Flag';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [allFlags, setAllFlags] = useState([]);
  const [displayedFlags, setDisplayedFlags] = useState([{ label: 'Flag 1:', timestamp: '---' }]);
  const [downloadURL, setDownloadURL] = useState(null);
  const playbackRef = useRef(null);

  const [isRecording, setIsRecording] = useState(false);
  const [isLive, setIsLive] = useState(true);
  const [recordRTC, setRecordRTC] = useState(null);
  const mediaSource = useRef(new MediaSource()); 
  const sourceBuffer = useRef(null); 
  const multiblob = useRef([]); 
  const stream = useRef(null);

  useEffect(() => {
    setDisplayedFlags(allFlags);
  }, [allFlags]);

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };
  
  const handleEditFlag = (index, newLabel) => {
    if (newLabel.trim() === allFlags[index].label.trim()) {
      return;
    }

    const updatedFlags = allFlags.map((flag, i) =>
      i === index ? { ...flag, label: newLabel || flag.label } : flag
    );
    setAllFlags(updatedFlags);
  };

  const handleAddElapsedTime = () => {
    if (playbackRef.current) {
      const elapsedTime = playbackRef.current.currentTime.toFixed(2);
      const nextFlagNumber = getNextFlagNumber(allFlags);

      const newFlag = {
        label: `Flag ${nextFlagNumber}:`, 
        timestamp: elapsedTime,
      };

      const updatedAllFlags = [newFlag, ...allFlags];
      setAllFlags(updatedAllFlags);
    }
  };

  const getNextFlagNumber = (flags) => {
    const flagNumbers = flags
      .map(flag => parseInt(flag.label.match(/\d+/)?.[0] || 0))
      .filter(num => !isNaN(num));
    
    return flagNumbers.length ? Math.max(...flagNumbers) + 1 : 1;
  };

  const handleFlagClick = (index) => {
    if (playbackRef.current) {
      playbackRef.current.currentTime = parseFloat(allFlags[index].timestamp);
      playbackRef.current.play();
    }
  };

  const startStream = async () => {
    try {
      const newStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
      });

      mediaSource.current = new MediaSource();
      sourceBuffer.current = null;
      multiblob.current = [];
      stream.current = newStream;

      const recorder = new RecordRTC(newStream, {
          type: 'video',
          mimeType: 'video/webm; codecs="vp8, opus"',
          timeSlice: 1000,
          ondataavailable: handleDataAvailable,
      });

      playbackRef.current.src = URL.createObjectURL(mediaSource.current);
      playbackRef.current.play();

      mediaSource.current.addEventListener("sourceopen", handleSourceOpen);

      recorder.startRecording();
      setIsRecording(true);
      setRecordRTC(recorder);
    } catch (error) {
      console.error("Error starting the stream:", error);
    }
  };

  const handleSourceOpen = () => {
    try {
      sourceBuffer.current = mediaSource.current.addSourceBuffer('video/webm; codecs="vp8, opus"');
      sourceBuffer.current.mode = "sequence"; 

      multiblob.current.forEach(blob => appendToBuffer(blob));
      multiblob.current = [];
    } catch (error) {
      console.error("Error creating SourceBuffer:", error);
    }
  };

  const handleDataAvailable = (blob) => {
    if (sourceBuffer.current && !sourceBuffer.current.updating) {
      appendToBuffer(blob);
    } else {
      multiblob.current.push(blob); 
    }
  };

  const appendToBuffer = (blob) => {
    if (sourceBuffer.current && !sourceBuffer.current.updating) {
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          sourceBuffer.current.appendBuffer(new Uint8Array(reader.result));
        } catch (error) {
          console.error("Error appending buffer:", error);
        }
      };
      reader.readAsArrayBuffer(blob);
    } else {
      multiblob.current.push(blob);
    }
  };

  const stopStream = async () => {
    if (recordRTC) {
      await recordRTC.stopRecording(async () => {
        setIsRecording(false);

        const blob = recordRTC.getBlob();
        const url = URL.createObjectURL(blob);
        setDownloadURL(url);

        if (stream.current) {
          stream.current.getTracks().forEach(track => track.stop());
        }
        setRecordRTC(null);
      });

      if (mediaSource.current.readyState === "open") {
        mediaSource.current.endOfStream();
      }
    }
  };

  const handleDeleteFlag = (index) => {
    const updatedAllFlags = allFlags.filter((_, i) => i !== index);
    setAllFlags(updatedAllFlags);
  };
  
  const handleDownload = () => {
    if (downloadURL) {
      const link = document.createElement('a');
      link.href = downloadURL;
      link.download = 'recording.webm';
      link.click();
    }
  };

  // Go Live button functionality
  const goLive = () => {
    if (playbackRef.current) {
      const video = playbackRef.current;
  
      // Check if there is buffered content
      if (video.buffered.length > 0) {
        // Set currentTime to the end of the buffered range (most recent data)
        video.currentTime = video.buffered.end(video.buffered.length - 1);
        setIsLive(true);
      }
    }
  };

  // Update isLive status based on current time
  const handleTimeUpdate = () => {
    if (playbackRef.current) {
      setIsLive(playbackRef.current.currentTime >= playbackRef.current.duration - 1);
    }
  };

  return (
    <>
      <Box display="flex" justifyContent="right" mt={2} mb={2}>
        <img src="/Logo.png" alt="Logo" className="app-logo" />
      </Box>
      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} spacing={2}>
        <Box flex={1} mr={{ md: 2 }}>
          <div className="video-container">
            <video
              ref={playbackRef}
              className="video-player"
              src="https://www.w3schools.com/html/mov_bbb.mp4"
              controls
              autoPlay
              muted={false}
              onTimeUpdate={handleTimeUpdate}
            />
            <Button 
              variant="outlined"
              onClick={handleAddElapsedTime} 
              sx={{
                position: 'absolute', 
                top: '1rem', 
                right: '1rem',
              }}
            >
              <FlagIcon color="primary"/>
            </Button>
          </div>
        </Box>
        <div className="playback-container">
          <TextField 
            id="standard-basic" 
            label="Flags" 
            variant="standard" 
            placeholder="Search for flags..."
            value={searchTerm}
            onChange={handleInputChange}
          />
          <ListComponent
            flags={displayedFlags}
            onClick={handleFlagClick}
            onDelete={handleDeleteFlag}
            onEdit={handleEditFlag}
          />
          <div className='option-bar'>
            <Chip label={isRecording ? "Finish" : "Stream"} onClick={isRecording ? stopStream : startStream} />
            <Chip label="Download" onClick={handleDownload} /> 
            <Chip label="Live" onClick={goLive} />
          </div>
        </div>
      </Box>
    </>
  );
}

export default App;
