# 🎤 StrideVocal - Real-time Speech Detection

A React application that provides real-time microphone access, speech detection, and automatic audio file transmission to a backend API.

## ✨ Features

- **Real-time Microphone Access**: Continuous microphone monitoring with user permission
- **Speech Detection**: Automatic detection of speech using audio level analysis
- **Dual Transcription**: Frontend (Web Speech API) + Backend (OpenAI Whisper)
- **Audio Recording**: Automatic recording when speech is detected
- **Smart Silence Detection**: Stops recording after 2 seconds of silence
- **Audio Visualization**: Real-time audio level display
- **AI-Powered Processing**: Backend speech-to-text with OpenAI Whisper API
- **Comparison Display**: Side-by-side frontend vs backend transcript comparison
- **Modern UI**: Beautiful, responsive design with animations
- **Configurable**: Customizable backend API endpoint

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Modern web browser with microphone support
- Backend server (optional - included example)
- OpenAI API key (for backend speech-to-text)
- FFmpeg (for audio conversion)

### Installation

1. **Clone or download the project**
   ```bash
   # If you have the files locally, navigate to the project directory
   cd "StrideVocal - IBM Hackathon"
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies (optional)**
   ```bash
   cd server
   npm install
   ```

4. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp server/env.example server/.env
   
   # Edit .env and add your OpenAI API key
   # OPENAI_API_KEY=your_openai_api_key_here
   ```

### Running the Application

#### Frontend (React App)
```bash
# From the root directory
npm start
```
The React app will start on `http://localhost:3000`

#### Backend Server (Optional)
```bash
# From the server directory
cd server
npm start
```
The backend server will start on `http://localhost:3001`

## 🎯 How It Works

### Speech Detection Flow

1. **User clicks "Start Listening"**
   - Requests microphone permission
   - Initializes Web Speech API
   - Starts audio level monitoring

2. **Continuous Monitoring**
   - Analyzes audio levels in real-time
   - Displays audio visualization
   - Monitors for speech activity

3. **Speech Detection**
   - When audio level exceeds threshold (>30), speech is detected
   - Automatically starts recording
   - Begins real-time transcription

4. **Silence Detection**
   - After 2 seconds of silence, recording stops
   - Audio file is automatically sent to backend
   - Transcript is included with the request

5. **Backend Processing**
   - Audio file received as FormData
   - Converted to MP3 format for Whisper API
   - Processed with OpenAI Whisper for high-accuracy transcription
   - Returns both frontend and backend transcripts for comparison

### Technical Implementation

#### Frontend Technologies
- **React 18**: Modern React with hooks
- **Web Speech API**: Real-time speech recognition
- **Web Audio API**: Audio level analysis and recording
- **MediaRecorder API**: Audio file creation
- **Axios**: HTTP requests to backend

#### Backend Technologies
- **Node.js**: Server runtime
- **Express.js**: Web framework
- **Multer**: File upload handling
- **CORS**: Cross-origin resource sharing
- **OpenAI Whisper**: Speech-to-text processing
- **FFmpeg**: Audio format conversion

## 📁 Project Structure

```
StrideVocal - IBM Hackathon/
├── public/
│   └── index.html
├── src/
│   ├── App.js          # Main React component
│   ├── App.css         # Styling
│   ├── index.js        # React entry point
│   └── index.css       # Global styles
├── server/
│   ├── server.js       # Express backend server
│   ├── package.json    # Backend dependencies
│   └── uploads/        # Audio file storage
├── package.json        # Frontend dependencies
└── README.md
```

## 🔧 Configuration

### Backend API URL
You can configure the backend API endpoint in the React app:
- Default: `http://localhost:3001/api/audio`
- Change via the configuration section in the UI
- Supports any HTTP endpoint that accepts multipart/form-data

### Audio Settings
- **Recording Format**: WebM with Opus codec
- **Silence Threshold**: 2 seconds
- **Audio Level Threshold**: 30 (adjustable in code)
- **File Size Limit**: 10MB (backend configurable)
- **Speech-to-Text**: OpenAI Whisper API (backend)
- **Audio Conversion**: WebM → MP3 for Whisper compatibility

## 🌐 Browser Compatibility

### Supported Browsers
- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge

### Required Permissions
- Microphone access
- HTTPS (for production deployment)

## 🔒 Security Considerations

- **HTTPS Required**: Microphone access requires secure context
- **User Permission**: Explicit microphone permission required
- **File Validation**: Backend validates audio file types
- **CORS Configuration**: Backend includes CORS headers
- **File Size Limits**: Configurable upload limits

## 🚀 Deployment

### Frontend Deployment
```bash
# Build for production
npm run build

# Deploy the build folder to your hosting service
# (Netlify, Vercel, AWS S3, etc.)
```

### Backend Deployment
```bash
# Set environment variables
export PORT=3001

# Start production server
npm start
```

## 🐛 Troubleshooting

### Common Issues

1. **Microphone Permission Denied**
   - Check browser permissions
   - Ensure HTTPS in production
   - Try refreshing the page

2. **Speech Recognition Not Working**
   - Check browser compatibility
   - Ensure microphone is working
   - Check console for errors

3. **Backend Connection Failed**
   - Verify backend server is running
   - Check API URL configuration
   - Ensure CORS is properly configured

4. **Audio Not Recording**
   - Check microphone permissions
   - Verify audio input device
   - Check browser console for errors

### Debug Mode
Open browser developer tools to see detailed logs and error messages.

## 📝 API Documentation

### Backend Endpoints

#### POST `/api/audio`
Upload audio file with metadata

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `audio`: Audio file (WebM format)
  - `timestamp`: ISO timestamp
  - `transcript`: Speech transcript

**Response:**
```json
{
  "success": true,
  "message": "Audio file processed successfully",
  "data": {
    "filename": "speech-2023-01-01T12-00-00-000Z.webm",
    "size": 12345,
    "timestamp": "2023-01-01T12:00:00.000Z",
    "frontendTranscript": "Hello world",
    "backendTranscript": "Hello world!",
    "processingTime": "1250ms",
    "audioFormat": "audio/webm"
  }
}
```

#### GET `/api/health`
Health check endpoint

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2023-01-01T12:00:00.000Z",
  "uptime": 123.456
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Web Speech API for speech recognition
- Web Audio API for audio processing
- React team for the amazing framework
- IBM Hackathon for the opportunity

---

**Made with ❤️ for the IBM Hackathon** 