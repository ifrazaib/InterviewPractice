import { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import axios from '../axiosInstance';
import '../styles/VideoInterview.css';
import { useNavigate } from 'react-router-dom';

export default function VideoInterview() {
  const [file, setFile] = useState(null);
  const [role, setRole] = useState('');
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [isRec, setIsRec] = useState(false);
  const [chunks, setChunks] = useState([]);
  const [audioText, setAudioText] = useState('');
  const [count, setCount] = useState(30);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  const webcamRef = useRef(null);
  const recRef = useRef(null);
  const cntRef = useRef(null);
  const nav = useNavigate();

  useEffect(() => {
    // setup Web Speech API
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const R = window.SpeechRecognition || window.webkitSpeechRecognition;
      recRef.current = new R();
      recRef.current.continuous = true;
      recRef.current.interimResults = false;
      recRef.current.lang = 'en-US';
      recRef.current.onresult = e => {
        let text = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) text += e.results[i][0].transcript + ' ';
        }
        setAudioText(t => (t + text).trim());
      };
    }
  }, []);

  const fetchQuestions = async () => {
    if (!file || !role) return alert('Role + CV required');
    setLoading(true);
    const fd = new FormData();
    fd.append('cv', file);
    fd.append('role', role);
    try {
      const { data } = await axios.post('/api/interview/start', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setQuestions(data.questions.map((q,i)=>({
        id: typeof q==='string'?i:q.id||q._id||i,
        text: typeof q==='string'?q:q.text||q.question
      })));
    } catch (err) {
      console.error(err);
      alert('Could not load questions');
    } finally {
      setLoading(false);
    }
  };

  const startAnswer = () => {
    setChunks([]); setAudioText(''); setIsRec(true); setCount(30);
    recRef.current?.start();
    cntRef.current = setInterval(()=> {
      setCount(c=> {
        if (c<=1) { stopAnswer(); return 0; }
        return c-1;
      });
    }, 1000);
  };

  const stopAnswer = () => {
    recRef.current?.stop();
    setIsRec(false);
    clearInterval(cntRef.current);
  };

  const submitAnswer = async () => {
    if (!audioText) return alert('Speak your answer first');
    setLoading(true);
    try {
      await axios.post('/api/interview/video-feedback/submit', {
        questionId: questions[idx].id,
        answerText: audioText,
        metrics: {} // insert your MediaPipe metrics here if desired
      });
      if (idx < questions.length - 1) {
        setIdx(idx + 1);
        setAudioText('');
      } else {
        // final evaluate
        const { data } = await axios.post(
          '/api/interview/video-feedback/final-evaluate',
          { answers: questions.map(q=>audioText), role }
        );
        setFeedback(data.feedback);
      }
    } catch (err) {
      console.error(err);
      alert('Submission error');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setRole('');
    setQuestions([]);
    setIdx(0);
    setFeedback(null);
    setAudioText('');
  };

  return (
    <div className="combined-interview-container">
      {!questions.length ? (
        <div className="cv-upload-section">
          <h1>Start Your Interview</h1>
          <input
            type="text"
            value={role}
            onChange={e => setRole(e.target.value)}
            placeholder="Role (e.g. Software Engineer)"
          />
          <input type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])}/>
          <button onClick={fetchQuestions} disabled={loading}>
            {loading ? 'Loading…' : 'Get Questions'}
          </button>
        </div>
      ) : feedback == null ? (
        <div className="video-interview-section">
          <div className="progress-indicator">
            Question {idx+1} of {questions.length}
          </div>
          <div className="question-card">
            <h2>{questions[idx].text}</h2>
            <div className="countdown-timer">Time remaining: {count}s</div>
          </div>
          <Webcam ref={webcamRef} mirrored/>
          {!isRec ? (
            <button onClick={startAnswer} className="record-button">
              Start Recording Answer
            </button>
          ) : (
            <button onClick={stopAnswer} className="stop-button">
              Stop Recording
            </button>
          )}
          {audioText && (
            <div className="answer-review">
              <h3>Your Answer:</h3>
              <p className="transcribed-text">{audioText}</p>
              <button onClick={submitAnswer} className="submit-button">
                {loading ? 'Submitting…' : 'Submit Answer'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="feedback-section">
          <h1>Interview Feedback</h1>
          <div className="feedback-grid">
            <div className="feedback-card">
              <h2>Overall Score</h2>
              <div className="score-display">
                <span className="score">{feedback.score}/10</span>
              </div>
              <h3>Strengths</h3>
              <ul>{feedback.strengths.map((s,i)=><li key={i}>{s}</li>)}</ul>
              <h3>Areas for Improvement</h3>
              <ul>{feedback.improvements.map((i,i2)=><li key={i2}>{i}</li>)}</ul>
            </div>
          </div>
          <div className="action-buttons">
            <button onClick={reset} className="primary-button">Start Over</button>
            <button onClick={()=>nav('/dashboard')} className="secondary-button">
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
