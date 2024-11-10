import './App.css'
import { SetStateAction, useState } from 'react';

function App() {
  const [searchTerm, setSearchTerm] = useState('');

  const handleInputChange = (event: { target: { value: SetStateAction<string>; }; }) => {
    setSearchTerm(event.target.value);
  };

  return (
    <>
      <div className="container">
        <div className="video-container">
          <video className="video-player"
            src="https://www.w3schools.com/html/mov_bbb.mp4"
            controls
            muted={false}
          />
        </div>
        <div className="playback-container">
          <div style={{ margin: '20px' }}>
            <input
              type="text"
              placeholder="Search for tags..."
              value={searchTerm}
              onChange={handleInputChange}
              style={{
                padding: '9px',
                width: '250px',
                borderRadius: '5px',
                border: '1px solid #ccc',
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
