const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 5001;

app.use(cors());

app.use('/hls', express.static(path.join(__dirname, 'hls_output')));

app.listen(PORT, () => {
  console.log(`HLS server running on http://localhost:${PORT}`);
});
