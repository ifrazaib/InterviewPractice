import { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import axios from '../axiosInstance';
import '../styles/VideoInterview.css';
import { useNavigate } from 'react-router-dom';
import { FaceDetection } from '@mediapipe/face_detection';
import { Camera } from '@mediapipe/camera_utils';
import * as tf from '@tensorflow/tfjs';

const VideoInterview = () => {
  const [role, setRole] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceDetectionError, setFaceDetectionError] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const faceDetectionRef = useRef(null);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user"
  };

  // Initialize face detection
  useEffect(() => {
    async function initializeFaceDetection() {
      await tf.ready();
      
      const faceDetection = new FaceDetection({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`;
        }
      });

      faceDetection.setOptions({
        model: 'short',
        minDetectionConfidence: 0.7
      });

      faceDetection.onResults((results) => {
        if (results.detections.length > 0) {
          setFaceDetected(true);
          setFaceDetectionError('');
        } else {
          setFaceDetected(false);
          if (isRecording) {
            setFaceDetectionError('Face not detected - please center your face');
          }
        }
      });

      faceDetectionRef.current = faceDetection;

      if (webcamRef.current && webcamRef.current.video) {
        new Camera(webcamRef.current.video, {
          onFrame: async () => {
            await faceDetection.send({ image: webcamRef.current.video });
          },
          width: 1280,
          height: 720
        }).start();
      }
    }

    initializeFaceDetection();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Handle file upload with face detection check
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setVideoFile(file);
    setFaceDetectionError('');

    try {
      const videoElement = document.createElement('video');
      videoElement.src = URL.createObjectURL(file);
      
      await new Promise((resolve) => {
        videoElement.onloadedmetadata = () => {
          videoElement.currentTime = 0;
          resolve();
        };
      });

      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      const ctx = canvas.getContext('2d');
      
      // Check multiple frames for face detection
      let faceFound = false;
      const frameCheckInterval = 2; // seconds
      const checks = 5; // number of frames to check
      
      for (let i = 0; i < checks; i++) {
        videoElement.currentTime = i * frameCheckInterval;
        await new Promise((r) => videoElement.onseeked = r);
        
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        await faceDetectionRef.current.send({ image: canvas });
        
        if (faceDetected) {
          faceFound = true;
          break;
        }
      }

      if (!faceFound) {
        setFaceDetectionError('No face detected in uploaded video');
        setVideoFile(null);
      }
    } catch (error) {
      console.error('Face detection error:', error);
      setFaceDetectionError('Error processing video');
    } finally {
      setIsLoading(false);
    }
  };

  // Start recording
  const startRecording = () => {
    if (!faceDetected) {
      setFaceDetectionError('Please position your face in the frame before recording');
      return;
    }

    setRecordedChunks([]);
    setIsRecording(true);
    setRecordingTime(0);
    setFaceDetectionError('');

    // Start timer
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);

    // Start media recorder
    const stream = webcamRef.current.video.srcObject;
    mediaRecorderRef.current = new MediaRecorder(stream, {
      mimeType: "video/webm",
      videoBitsPerSecond: 2500000
    });

    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) {
        setRecordedChunks((prev) => [...prev, e.data]);
      }
    };

    mediaRecorderRef.current.start(1000); // Collect data every second
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      clearInterval(timerRef.current);
      setIsRecording(false);
      
      // Force final data available event
      mediaRecorderRef.current.requestData();
    }
  };

  // Format time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Submit video
  const submitVideo = async () => {
    if (!role) {
      setFaceDetectionError('Please enter the target job role');
      return;
    }

    if (!recordedChunks.length && !videoFile) {
      setFaceDetectionError('Please record or upload a video');
      return;
    }

    if (!faceDetected) {
      setFeedback({
        error: "Face not detected",
        confidenceScore: 0,
        eyeContactScore: 0,
        strengths: [],
        improvements: ["No face detected in the video. Please ensure your face is clearly visible."]
      });
      return;
    }

    setIsLoading(true);
    setFaceDetectionError('');

    try {
      const formData = new FormData();
      formData.append('role', role);

      if (recordedChunks.length) {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        formData.append('video', blob, 'interview.webm');
      } else {
        formData.append('video', videoFile);
      }

      const response = await axios.post('/video/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setFeedback(response.data.feedback);
    } catch (error) {
      console.error('Analysis failed:', error);
      setFeedback({
        error: "Analysis failed",
        confidenceScore: 0,
        eyeContactScore: 0,
        strengths: [],
        improvements: [error.response?.data?.message || 'Failed to analyze video']
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="video-interview-container">
      <h1>Video Interview Assessment</h1>
      
      {!feedback ? (
        <>
          <div className="role-selection">
            <label>Target Job Role:</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Software Engineer"
              required
            />
          </div>

          <div className="video-options">
            <div className="webcam-section">
              <Webcam
                audio={true}
                ref={webcamRef}
                videoConstraints={videoConstraints}
                mirrored={true}
              />
              <div className="recording-controls">
                {!isRecording ? (
                  <button onClick={startRecording} className="record-btn">
                    Start Recording
                  </button>
                ) : (
                  <div className="recording-status">
                    <button onClick={stopRecording} className="stop-recording-btn">
                      Stop Recording
                    </button>
                    <div className="recording-indicator">
                      <span className="recording-dot"></span>
                      <span>REC {formatTime(recordingTime)}</span>
                    </div>
                  </div>
                )}
              </div>
              {faceDetectionError && (
                <div className="face-detection-error">{faceDetectionError}</div>
              )}
            </div>

            <div className="upload-section">
              <p className="or-divider">OR</p>
              <div className="upload-box">
                <p>Upload existing video:</p>
                <label className="file-upload-label">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="file-upload-input"
                  />
                  Choose File
                </label>
                {videoFile && (
                  <p className="file-name">{videoFile.name}</p>
                )}
              </div>
            </div>
          </div>

          <button 
            onClick={submitVideo} 
            disabled={isLoading || (!recordedChunks.length && !videoFile)}
            className="submit-btn"
          >
            {isLoading ? 'Analyzing...' : 'Submit Video'}
          </button>
        </>
      ) : (
        <div className="feedback-section">
          <h2>Interview Feedback</h2>
          {feedback.error ? (
            <div className="error-feedback">
              <h3 style={{ color: 'red' }}>{feedback.error}</h3>
              <p>{feedback.improvements[0]}</p>
            </div>
          ) : (
            <>
              <div className="feedback-metrics">
                <div className="metric">
                  <span className="metric-label">Confidence:</span>
                  <span className="metric-value">{feedback.confidenceScore}/10</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Eye Contact:</span>
                  <span className="metric-value">{feedback.eyeContactScore}/10</span>
                </div>
              </div>
              
              <div className="detailed-feedback">
                <h3>Strengths:</h3>
                <ul>
                  {feedback.strengths.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
                
                <h3>Areas for Improvement:</h3>
                <ul>
                  {feedback.improvements.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </>
          )}

          <button 
            onClick={() => {
              setFeedback(null);
              setRecordedChunks([]);
              setVideoFile(null);
            }}
            className="dashboard-btn"
          >
            Start New Assessment
          </button>
           <button 
            onClick={() => navigate('/dashboard')}
            className="dashboard-btn"
          >
            Back to Dashboard
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoInterview;