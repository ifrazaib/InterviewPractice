import { useState, useRef } from 'react';
import axios from '../axiosInstance';
import '../styles/CVInterview.css';
import { useNavigate } from 'react-router-dom';
const CVInterview = () => {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState('');
  const fileInputRef = useRef(null);

  const navigate = useNavigate(); 
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !role) {
      alert('Please provide both role and CV.');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('cv', file);      // Backend expects 'cv'
    formData.append('role', role);    // Backend expects 'role'

    try {
      const response = await axios.post('/interview/start', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      const formattedQuestions = response.data.questions.map((q, i) => ({
        id: `q${i + 1}`,
        text: q,
      }));

      setQuestions(formattedQuestions);
    } catch (error) {
      console.error('Upload failed:', error.response || error.message);
      alert('Failed to upload CV. Make sure it is a PDF and try again.');
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const submitAnswers = async () => {
    if (Object.keys(answers).length === 0 || !role) return;

    setIsLoading(true);

    try {
      const payload = { questions, answers, role };

      const response = await axios.post('/interview/evaluate', payload);
      setFeedback(response.data.feedback);
    } catch (error) {
      console.error('Evaluation failed:', error.response?.data || error.message);
      alert('Failed to get feedback. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetInterview = () => {
    setFile(null);
    setQuestions([]);
    setAnswers({});
    setFeedback(null);
    setRole('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="cv-interview-container">
      <div className="cv-interview-card">
        <h1 className="cv-interview-title">CV-Based Interview</h1>
        <p className="cv-interview-subtitle">
          Upload your CV and get personalized interview questions
        </p>

        {!feedback ? (
          <>
            {questions.length === 0 ? (
              <div className="upload-section">
                <div className="form-group">
                  <label htmlFor="role">Target Job Role</label>
                  <input
                    id="role"
                    type="text"
                    placeholder="e.g. Software Engineer"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="file-upload-box">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf"
                    className="file-input"
                    id="cv-upload"
                  />
                  <label htmlFor="cv-upload" className="file-upload-label">
                    {file ? file.name : 'Choose your CV (PDF)'}
                    <span className="browse-button">Browse</span>
                  </label>
                  {file && (
                    <button
                      onClick={handleUpload}
                      disabled={isLoading || !role}
                      className="upload-button"
                    >
                      {isLoading ? 'Uploading...' : 'Generate Questions'}
                    </button>
                  )}
                </div>

                {uploadProgress > 0 && (
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                    <span>{uploadProgress}%</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="questions-section">
                <h2 className="questions-title">
                  Questions for {role} Position
                </h2>
                <div className="questions-list">
                  {questions.map((question) => (
                    <div key={question.id} className="question-item">
                      <p className="question-text">{question.text}</p>
                      <textarea
                        placeholder="Type your answer here..."
                        value={answers[question.id] || ''}
                        onChange={(e) =>
                          handleAnswerChange(question.id, e.target.value)
                        }
                        className="answer-input"
                        rows={4}
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={submitAnswers}
                  disabled={isLoading || Object.keys(answers).length === 0}
                  className="submit-button"
                >
                  {isLoading ? 'Processing...' : 'Submit Answers'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="feedback-section">
            <h2 className="feedback-title">Interview Feedback</h2>
            <div className="feedback-content">
              <div className="feedback-score">
                <span className="score-label">Overall Score:</span>
                <span className="score-value">
                  {feedback?.score ?? 'N/A'}/10
                </span>
              </div>
              <div className="feedback-details">
                <h3>Strengths:</h3>
                <ul>
                  {Array.isArray(feedback?.strengths) &&
                  feedback.strengths.length > 0 ? (
                    feedback.strengths.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))
                  ) : (
                    <li>No strengths provided.</li>
                  )}
                </ul>

                <h3>Areas for Improvement:</h3>
                <ul>
                  {Array.isArray(feedback?.improvements) &&
                  feedback.improvements.length > 0 ? (
                    feedback.improvements.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))
                  ) : (
                    <li>No improvement areas listed.</li>
                  )}
                </ul>

                <h3>Recommendations:</h3>
                <p>
                  {feedback?.recommendations || 'No recommendations provided.'}
                </p>
              </div>
            </div>
             <div className="button-group">
  <button 
    onClick={() => navigate('/dashboard')}
    className="dashboard-btn"
  >
    Back to Dashboard
  </button>

  <button 
    onClick={resetInterview}
    className="restart-btn"
  >
    Start New Assessment
  </button>
</div>

          </div>
        )}
      </div>
    </div>
  );
};

export default CVInterview;
