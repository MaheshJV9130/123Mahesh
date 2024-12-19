const express = require('express');
const multer = require('multer');
const fs = require('fs');
const drivelist = require('drivelist');
const path = require('path');

const app = express();

// Multer setup for handling ISO file uploads
const upload = multer({ dest: 'uploads/' });

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Route for uploading ISO file
app.post('/upload', upload.single('iso'), async (req, res) => {
  const isoPath = req.file.path;
  console.log(`ISO uploaded: ${isoPath}`);

  try {
    // Detect USB drives
    const drives = await drivelist.list();
    const targetDrive = drives.find(drive => drive.isUSB);

    if (!targetDrive) {
      return res.status(400).send('No USB drive detected.');
    }

    const devicePath = targetDrive.device;
    console.log(`Writing to USB: ${devicePath}`);

    // Mock writing ISO to USB
    const stream = fs.createReadStream(isoPath);
    const writeStream = fs.createWriteStream(devicePath);

    stream.pipe(writeStream);

    writeStream.on('finish', () => {
      console.log('ISO written successfully.');
      res.send('ISO written successfully.');
    });

    writeStream.on('error', (err) => {
      console.error(err);
      res.status(500).send(`Error: ${err.message}`);
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('An error occurred.');
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});