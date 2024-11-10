import './App.css';
import { useState, useRef, useEffect } from 'react';
import { TextField, Box, Container, Typography, Button} from '@mui/material';
import RecordRTC from 'recordrtc';
import { ListComponent } from './components/ListComponent/ListComponent';
import Chip from '@mui/material/Chip';
import FlagIcon from '@mui/icons-material/Flag';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [allFlags, setAllFlags] = useState([]);
  const [displayedFlags, setDisplayedFlags] = useState([{ label: 'Flag 1:', timestamp: '---' }]);
  const [flagCount, setFlagCount] = useState(1);
  const playbackRef = useRef(null);

  // Video player props
  // const videoRef = useRef();
  const [isRecording, setIsRecording] = useState(false);
  const [recordRTC, setRecordRTC] = useState(null);
  const mediaSource = useRef(new MediaSource()); 
  const sourceBuffer = useRef(null); 
  const multiblob = useRef([]); 

  useEffect(() => {
    if (allFlags.length === 0) {
      setDisplayedFlags([{ label: 'Flag 1:', timestamp: '---' }]);
    } else {
      setDisplayedFlags(allFlags.slice(0, 3));
    }
  }, [allFlags]);

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleAddElapsedTime = () => {
    if (playbackRef.current) {
      const elapsedTime = playbackRef.current.currentTime.toFixed(2);

      if (allFlags.length === 0 || allFlags[0].timestamp === '---') {
        const newFlag = { label: 'Flag 1:', timestamp: elapsedTime };
        setAllFlags([newFlag]);
        setFlagCount(1);
      } else {
        const newFlagCount = flagCount + 1;

        const newFlag = {
          label: `Flag ${newFlagCount}:`,
          timestamp: elapsedTime,
        };

        const updatedAllFlags = [newFlag, ...allFlags];
        setAllFlags(updatedAllFlags);
        setFlagCount(newFlagCount);
      }
    }
  };

  const handleFlagClick = (index) => {
    if (playbackRef.current) {
      playbackRef.current.currentTime = parseFloat(allFlags[index].timestamp);
      playbackRef.current.play();

      const updatedAllFlags = allFlags.filter((_, i) => i > index);
      setAllFlags(updatedAllFlags);

      const updatedDisplayedFlags = updatedAllFlags.slice(0, 3);
      setDisplayedFlags(updatedDisplayedFlags);
      setFlagCount(updatedAllFlags.length);
    }
  };

  // const listItems = Array.from({ length: 6 }, (_, i) => {
  //   const itemNumber = i + 1;
  //   const paddedNumber = String(50 + i * 10).padStart(3, '0');
  //   return (
  //     <ListItemComponent 
  //       key={i} 
  //       itemNumber={`${itemNumber}`} 
  //       paddedNumber={paddedNumber} 
  //     />
  //   );
  // });

  const startStream = async () => {
    try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true,
        });
        // videoRef.current.srcObject = stream;

        const recorder = new RecordRTC(stream, {
            type: 'video',
            mimeType: 'video/webm; codecs="vp8, opus"',
            timeSlice: 1000,
            ondataavailable: handleDataAvailable,
        });

        playbackRef.current.src = URL.createObjectURL(mediaSource.current);
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

// Video player
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
        await recordRTC.stopRecording(() => {
            setIsRecording(false);

            // const stream = videoRef.current.srcObject;
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            setRecordRTC(null);
        });

        if (mediaSource.current.readyState === "open") {
            mediaSource.current.endOfStream();
        }
    }
};

  return (
    <>
      {/* <video ref={videoRef} width={400} height={300} autoPlay muted></video> */}
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
              />
              <Button 
                variant="outlined"
                onClick={handleAddElapsedTime} 
                sx={{
                  position: 'absolute', 
                  top: '1rem', 
                  right: '1rem',
                  backgroundColor: 'rgba(211, 211, 211, 0.7)',
                  border: '2px solid black',
                  color: 'black',
                  '&:hover': {
                    backgroundColor: 'rgba(211, 211, 211, 0.9)',
                  },
                }}
              >
                Flag
              </Button>
            </div>
          </Box>
            <div className="playback-container">
                  <TextField id="standard-basic" 
                    label="Flags" 
                    variant="standard" 
                    placeholder="Search for flags..."
                    value={searchTerm}
                    onChange={handleInputChange}
                    />
                  <ListComponent
                    flags={displayedFlags}
                    onClick={handleFlagClick}
                  />
                  <div className='option-bar'>
                    <Chip label={isRecording ? "Finish" : "Stream"} onClick={isRecording ? stopStream : startStream} />
                    <Chip label="Download" onClick={()=>console.log("test")} />
                    <Chip label="Live" onClick={()=>console.log("test")} />
                  </div>
            </div>
        </Box>
    </>
  );
}

export default App;