import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [status, setStatus] = useState('Initializing...');
  const [backendUrl, setBackendUrl] = useState(processingResults.env.REACT_APP_API_URL);
  const [processingResults, setProcessingResults] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  const audioChunksRef = useRef([]);
  const silenceTimerRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const streamRef = useRef(null);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    startContinuousRecording();
  }, []);

  const startAudioMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      microphoneRef.current.connect(analyserRef.current);
      
      const updateAudioLevel = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / bufferLength;
          setAudioLevel(average);
          
          if (average > 20) {
  if (!isSpeakingRef.current) {
    isSpeakingRef.current = true;
    setStatus('Speech detected! Recording...');
    startRecording();
  }

  if (silenceTimerRef.current) {
    clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = null;
  }

} 

  if (isSpeakingRef.current) {
    if (!silenceTimerRef.current) {
      console.log('Silence detected, starting silence timer...');
    resetSilenceTimer();
  }
}  requestAnimationFrame(updateAudioLevel);
        }
      };
      
      updateAudioLevel();
      setStatus('Listening for speech...');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setStatus('Error accessing microphone. Please check permissions.');
    }
  };

  const resetSilenceTimer = () => {
  if (silenceTimerRef.current) {
    clearTimeout(silenceTimerRef.current);
  }

  silenceTimerRef.current = setTimeout(() => {
    if (isSpeakingRef.current) {
      console.log('Audio dropped for 2 seconds, stopping recording...');
      isSpeakingRef.current = false;
      setStatus('Processing audio...');
      stopRecording();
    }
  }, 2000); 
};


  const startRecording = async () => {
    try {
      if (!streamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
      }

      mediaRecorderRef.current = new MediaRecorder(streamRef.current, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        console.log('Recording stopped');
        if (!isProcessingRef.current) {
          isProcessingRef.current = true;
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          sendAudioToBackend(audioBlob);
        }
      };

      mediaRecorderRef.current.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
      };
      
      mediaRecorderRef.current.start(100);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      setStatus('Error starting recording');
    }
  };

  const stopRecording = () => {
      try {
        console.log('Stopped recording...');
        mediaRecorderRef.current.stop();
        setIsRecording(false);

        if (audioChunksRef.current.length > 0 && !isProcessingRef.current) {
            console.log('Fallback: Processing audio manually');
            isProcessingRef.current = true;
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            sendAudioToBackend(audioBlob);
            audioChunksRef.current = [];        
      }
    } catch (error) {
        console.error('Error stopping MediaRecorder:', error);
      }
};

  const sendAudioToBackend = async (audioBlob) => {
    try {
      setStatus('Analyzing audio...');
      console.log('Audio Blob size (bytes):', audioBlob.size);
      
      const formData = new FormData();
      formData.append('audio', audioBlob, 'speech.webm');
      formData.append('timestamp', new Date().toISOString());
      
      const response = await axios.post(backendUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob',
        timeout: 30000,
      });
      
    const audioBlobResponse = response.data;
    const audioUrl = URL.createObjectURL(audioBlobResponse);
    const audio = new Audio(audioUrl);
    audio.play().catch((err) => console.warn('Playback error:', err));
    audio.onended = () => URL.revokeObjectURL(audioUrl);

      setStatus('Audio processed successfully!');
      
    } catch (error) {
      console.error('Error sending audio to backend:', error);
      setStatus('Error processing audio');
    
      setTimeout(() => {
        startRecording();
      }, 1000);
    } finally {
      isProcessingRef.current = false; // Reset processing flag
    }
  };

  const startContinuousRecording = () => {
    startAudioMonitoring();
  };

  return (
    <div className="App">
      <div className="header-section">
        <h1>StrideVocal</h1>
      </div>

      <div className="main-content">        
        <div className="status-display">
          <div className="status-indicator">
            <div className={`status-dot ${isRecording ? 'recording' : 'listening'}`}></div>
            <span className="status-text">{status}</span>
          </div>
          
          {isRecording && (
            <div className="audio-visualizer">
              <div 
                className="audio-bar"
                style={{ height: `${(audioLevel / 255) * 100}%` }}
              ></div>
              <span className="audio-level">{Math.round((audioLevel / 255) * 100)}%</span>
            </div>
          )}
        </div>

        {processingResults && (
          <div className="results-section">
            <h3>Processing Complete</h3>
            <div className="results-container">
              <div className="result-item">
                <strong>Processing Time:</strong>
                <p>{processingResults.processingTime}</p>
              </div>
              <div className="result-item">
                <strong>File Size:</strong>
                <p>{(processingResults.size / 1024).toFixed(2)} KB</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App; 