const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Speech-to-text imports
const OpenAI = require('openai');
const ffmpeg = require('fluent-ffmpeg');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for audio file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    cb(null, `speech-${timestamp}.webm`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed!'), false);
    }
  }
});

// Speech-to-text processing function
async function processSpeechToText(audioFilePath) {
  try {
    console.log('Processing speech-to-text for:', audioFilePath);
    
    // Convert WebM to MP3 for better compatibility with Whisper
    const mp3Path = audioFilePath.replace('.webm', '.mp3');
    
    return new Promise((resolve, reject) => {
      ffmpeg(audioFilePath)
        .toFormat('mp3')
        .on('end', async () => {
          try {
            // Read the converted audio file
            const audioBuffer = fs.readFileSync(mp3Path);
            
            // Send to OpenAI Whisper API
            const transcription = await openai.audio.transcriptions.create({
              file: Buffer.from(audioBuffer),
              model: "whisper-1",
              response_format: "text"
            });
            
            // Clean up temporary MP3 file
            fs.unlinkSync(mp3Path);
            
            console.log('Transcription completed:', transcription);
            resolve(transcription);
          } catch (error) {
            console.error('Error in Whisper API call:', error);
            reject(error);
          }
        })
        .on('error', (err) => {
          console.error('Error converting audio:', err);
          reject(err);
        })
        .save(mp3Path);
    });
  } catch (error) {
    console.error('Error in speech-to-text processing:', error);
    throw error;
  }
}

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'StrideVocal Backend API',
    version: '1.0.0',
    endpoints: {
      '/api/audio': 'POST - Upload audio file for speech-to-text',
      '/api/health': 'GET - Health check'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    speechToText: 'OpenAI Whisper API'
  });
});

// Audio upload and speech-to-text endpoint
app.post('/api/audio', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No audio file provided'
      });
    }

    const audioFile = req.file;
    const timestamp = req.body.timestamp || new Date().toISOString();
    const frontendTranscript = req.body.transcript || '';

    console.log('Received audio file:', {
      filename: audioFile.filename,
      originalName: audioFile.originalname,
      size: audioFile.size,
      mimetype: audioFile.mimetype,
      timestamp: timestamp,
      frontendTranscript: frontendTranscript
    });

    // Process speech-to-text
    let backendTranscript = '';
    let processingTime = 0;
    
    try {
      const startTime = Date.now();
      backendTranscript = await processSpeechToText(audioFile.path);
      processingTime = Date.now() - startTime;
    } catch (sttError) {
      console.error('Speech-to-text processing failed:', sttError);
      // Fall back to frontend transcript if available
      backendTranscript = frontendTranscript || 'Speech-to-text processing failed';
    }

    // Here you would typically:
    // - Store the transcript in a database
    // - Send to other processing services
    // - Trigger notifications
    // - etc.

    res.json({
      success: true,
      message: 'Audio file processed successfully',
      data: {
        filename: audioFile.filename,
        size: audioFile.size,
        timestamp: timestamp,
        frontendTranscript: frontendTranscript,
        backendTranscript: backendTranscript,
        processingTime: `${processingTime}ms`,
        audioFormat: audioFile.mimetype
      }
    });

  } catch (error) {
    console.error('Error processing audio file:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing audio file',
      error: error.message
    });
  }
});

// Get list of uploaded files
app.get('/api/files', (req, res) => {
  try {
    const files = fs.readdirSync(uploadsDir);
    const fileList = files.map(filename => {
      const filePath = path.join(uploadsDir, filename);
      const stats = fs.statSync(filePath);
      return {
        filename,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
      };
    });

    res.json({
      success: true,
      files: fileList,
      totalFiles: fileList.length
    });
  } catch (error) {
    console.error('Error reading files:', error);
    res.status(500).json({
      success: false,
      message: 'Error reading files',
      error: error.message
    });
  }
});

// Download a specific file
app.get('/api/files/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    res.download(filePath);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading file',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: error.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 StrideVocal Backend Server running on port ${PORT}`);
  console.log(`📁 Upload directory: ${uploadsDir}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📤 Audio upload: http://localhost:${PORT}/api/audio`);
  console.log(`🎤 Speech-to-text: OpenAI Whisper API`);
  
  if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠️  OPENAI_API_KEY not set. Speech-to-text will not work.');
    console.warn('   Set OPENAI_API_KEY in your .env file or environment variables.');
  }
}); 