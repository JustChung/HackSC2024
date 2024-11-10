import './App.css';
import { useState, useRef } from 'react';
import { List, TextField, Box, Container, Typography, Button } from '@mui/material';
import ListItemComponent from './ListItemComponent';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [flags, setFlags] = useState([{ label: 'Flag 1:', timestamp: '---' }]);
  const [flagCount, setFlagCount] = useState(1);
  const videoRef = useRef(null);

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleAddElapsedTime = () => {
    if (videoRef.current) {
      const elapsedTime = videoRef.current.currentTime.toFixed(2);

      if (flags.length === 1 && flags[0].timestamp === '---') {
        const updatedFlag = { ...flags[0], timestamp: elapsedTime };
        setFlags([updatedFlag]);
      } else {
        const newFlagCount = flagCount + 1;

        const newFlag = {
          label: `Flag ${newFlagCount}:`,
          timestamp: elapsedTime,
        };

        const updatedFlags = [newFlag, ...flags].slice(0, 3);
        setFlags(updatedFlags);
        setFlagCount(newFlagCount);
      }
    }
  };

  const listItems = Array.from({ length: 6 }, (_, i) => {
    const itemNumber = i + 1;
    const paddedNumber = String(50 + i * 10).padStart(3, '0');
    return (
      <ListItemComponent 
        key={i} 
        itemNumber={`${itemNumber}`} 
        paddedNumber={paddedNumber} 
      />
    );
  });

  return (
    <div className="App">
      <Container maxWidth="lg">
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} spacing={2}>
          <Box flex={1} mr={{ md: 2 }}>
            <div className="video-container">
              <video
                ref={videoRef}
                className="video-player"
                src="https://www.w3schools.com/html/mov_bbb.mp4"
                controls
                muted={false}
              />
              <Button 
                variant="outlined"
                onClick={handleAddElapsedTime} 
                sx={{
                  position: 'absolute', 
                  top: '10px', 
                  right: '10px',
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
          <Box flex={1}>
            <div className="playback-container">
              <Box sx={{ pt: 4 }}>
                <TextField
                  variant="outlined"
                  placeholder="Search for tags..."
                  value={searchTerm}
                  onChange={handleInputChange}
                  sx={{
                    width: '80%',
                    '& .MuiOutlinedInput-root': {
                      height: '40px',
                      '& fieldset': { borderColor: 'white' },
                      '&.Mui-focused fieldset': { borderColor: 'white' },
                    },
                    '& input': {
                      padding: '0 14px',
                    },
                  }}
                />
              </Box>
              <List>
                {listItems}
              </List>
              <Box mt={2}>
                <Typography variant="h6" color="white">Flags</Typography>
                <List>
                  {flags.map((flag, index) => (
                    <ListItemComponent
                      key={index}
                      itemNumber={flag.label}
                      paddedNumber={flag.timestamp}
                    />
                  ))}
                </List>
              </Box>
            </div>
          </Box>
        </Box>
      </Container>
    </div>
  );
}

export default App;