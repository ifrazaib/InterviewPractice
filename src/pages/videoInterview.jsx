import { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import axios from '../axiosInstance';
import '../styles/VideoInterview.css';
import { useNavigate } from 'react-router-dom';

const CombinedInterview = () => {
  // Application states
  const [file, setFile] = useState(null);
  const [role, setRole] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [recordedAnswers, setRecordedAnswers] = useState([]);
  const [transcribedAnswers, setTranscribedAnswers] = useState({});
  const [countdown, setCountdown] = useState(30);
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [faceDetected, setFaceDetected] = useState(true); // For face detection (simplified)

  // Refs
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const countdownRef = useRef(null);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  // Video constraints
  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user"
  };

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      recognitionRef.current = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setTranscribedText(prev => prev + ' ' + transcript);
          }
        }
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Handle CV upload
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Generate questions from CV
  const generateQuestions = async () => {
    if (!file || !role) {
      alert('Please provide both role and CV');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('cv', file);
    formData.append('role', role);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/interview/combined/start', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });

      setQuestions(response.data.questions);
    } catch (error) {
      console.error('Error generating questions:', error);
      if (error.response?.status === 401) {
        alert('Session expired. Please log in again.');
        navigate('/login');
      } else {
        alert('Failed to generate questions. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };
// ✅ Start recording and speech recognition
const startRecording = () => {
  if (!faceDetected) {
    alert('Please position your face in the frame');
    return;
  }

  setRecordedChunks([]);
  setTranscribedText(''); // reset text
  setIsRecording(true);
  setCountdown(30);

  // Start countdown
  countdownRef.current = setInterval(() => {
    setCountdown(prev => {
      if (prev <= 1) {
        clearInterval(countdownRef.current);
        stopRecording(); // auto-stop at 0
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  // Start media recording
  const stream = webcamRef.current.video.srcObject;
  mediaRecorderRef.current = new MediaRecorder(stream, {
    mimeType: "video/webm"
  });

  mediaRecorderRef.current.ondataavailable = (e) => {
    if (e.data.size > 0) {
      setRecordedChunks(prev => [...prev, e.data]);
    }
  };

  mediaRecorderRef.current.start(100);

  // ✅ Start speech recognition
  if (recognitionRef.current) {
    recognitionRef.current.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        }
      }

      // Append to existing transcribed text
      setTranscribedText(prev => (prev + finalTranscript).trim());
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
    };

    try {
      recognitionRef.current.start();
    } catch (err) {
      console.warn("Recognition already started");
    }
  }
};

// ✅ Stop recording and speech recognition
const stopRecording = () => {
  if (mediaRecorderRef.current?.state === 'recording') {
    mediaRecorderRef.current.stop();
  }

  if (recognitionRef.current) {
    try {
      recognitionRef.current.stop();
    } catch (err) {
      console.warn("Recognition already stopped");
    }
  }

  clearInterval(countdownRef.current);
  setIsRecording(false);
};

  // Submit answer to backend
  const submitAnswer = async () => {
    if (recordedChunks.length === 0) return;

    setIsLoading(true);
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const formData = new FormData();
    formData.append('video', blob);
    formData.append('questionId', questions[currentQuestionIndex].id);
    formData.append('transcribedText', transcribedText);

    try {
      const response = await axios.post('/interview/combined/record-answer', formData);
      
      setRecordedAnswers(prev => [
        ...prev,
        {
          questionId: questions[currentQuestionIndex].id,
          videoAnalysis: response.data.videoAnalysis,
          transcribedText: transcribedText
        }
      ]);
      
      setTranscribedAnswers(prev => ({
        ...prev,
        [questions[currentQuestionIndex].id]: transcribedText
      }));

      // Move to next question or finish
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setRecordedChunks([]);
        setTranscribedText('');
      } else {
        await submitAllAnswers();
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit all answers for final evaluation
  const submitAllAnswers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('/interview/combined/final-evaluate', {
        answers: transcribedAnswers,
        videoAnalyses: recordedAnswers,
        role
      });
      setFeedback(response.data.feedback);
    } catch (error) {
      console.error('Error getting feedback:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset interview
  const resetInterview = () => {
    setFile(null);
    setQuestions([]);
    setRecordedAnswers([]);
    setTranscribedAnswers({});
    setFeedback(null);
    setCurrentQuestionIndex(0);
    setRole('');
    setTranscribedText('');
  };

  return (
    <div className="combined-interview-container">
      {!questions.length ? (
        <div className="cv-upload-section">
          <h1>Start Your Interview</h1>
          <p>Upload your CV to get personalized questions</p>
          
          <div className="form-group">
            <label>Target Job Role</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Software Engineer"
            />
          </div>
          
          <div className="file-upload-box">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf"
              id="cv-upload"
            />
            <label htmlFor="cv-upload">
              {file ? file.name : 'Choose your CV (PDF)'}
              <span className="browse-button">Browse</span>
            </label>
          </div>
          
          <button
            onClick={generateQuestions}
            disabled={!file || !role || isLoading}
            className="primary-button"
          >
            {isLoading ? 'Generating Questions...' : 'Get Questions'}
          </button>
        </div>
      ) : !feedback ? (
        <div className="video-interview-section">
          <div className="progress-indicator">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
          
          <div className="question-card">
            <h2>{questions[currentQuestionIndex].text}</h2>
            <div className="countdown-timer">
              Time remaining: {countdown}s
            </div>
          </div>
          
          <div className="video-container">
            <Webcam
              audio={true}
              ref={webcamRef}
              videoConstraints={videoConstraints}
              mirrored={true}
            />
            
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="record-button"
                disabled={isLoading}
              >
                Start Recording Answer
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="stop-button"
              >
                Stop Recording
              </button>
            )}
          </div>
          
          {recordedChunks.length > 0 && !isRecording && (
            <div className="answer-review">
              <h3>Your Answer:</h3>
              <video
                controls
                src={URL.createObjectURL(new Blob(recordedChunks, { type: 'video/webm' }))}
                className="recorded-video"
              />
              
             <div className="transcription-result">
  <h4>Live Transcription:</h4>
  {transcribedText ? (
    <div className="transcribed-text">{transcribedText}</div>
  ) : (
    <div className="transcribing">
      {isRecording ? 'Listening...' : 'No transcription yet'}
    </div>
  )}
</div>
              
              <button
                onClick={submitAnswer}
                className="submit-button"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Submit Answer'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="feedback-section">
          <h1>Interview Feedback</h1>
          
          <div className="feedback-grid">
            <div className="feedback-card">
              <h2>Content Feedback</h2>
              <div className="score-display">
                <span>Overall Score:</span>
                <span className="score">{feedback.score}/10</span>
              </div>
              
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
            
            <div className="feedback-card">
              <h2>Delivery Metrics</h2>
              <div className="metrics-grid">
                <div className="metric">
                  <span>Confidence:</span>
                  <span>{feedback.videoMetrics.confidenceScore}/10</span>
                </div>
                <div className="metric">
                  <span>Eye Contact:</span>
                  <span>{feedback.videoMetrics.eyeContactScore}/10</span>
                </div>
                <div className="metric">
                  <span>Clarity:</span>
                  <span>{feedback.videoMetrics.clarityScore}/10</span>
                </div>
                <div className="metric">
                  <span>Pace:</span>
                  <span>{feedback.videoMetrics.paceScore}/10</span>
                </div>
              </div>
              
              <h3>Delivery Tips:</h3>
              <ul>
                {feedback.videoMetrics.tips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="action-buttons">
            <button
              onClick={resetInterview}
              className="primary-button"
            >
              Start New Interview
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="secondary-button"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CombinedInterview;
