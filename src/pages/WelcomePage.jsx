import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/WelcomePage.css';

const WelcomePage = () => {
  const navigate = useNavigate();
  const contentRef = useRef(null);
  const [displayedParagraphs, setDisplayedParagraphs] = useState([]);
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0);
  const [currentLine, setCurrentLine] = useState('');
  const [showButtons, setShowButtons] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);

  const paragraphs = [
    ["Welcome to InterviewAI Pro", "The ultimate AI-powered interview coach"],
    [],
    ["Transform your interview skills with our cutting-edge platform:"],
    ["CV-based personalized questions", 
     "Real-time video practice with feedback", 
     "Detailed performance analytics", 
     "30% faster interview preparation"],
    [],
    ["Let's get started!"]
  ];

  // Auto-scroll to bottom when new content appears
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [displayedParagraphs, currentLine]);

  useEffect(() => {
    if (currentParagraphIndex >= paragraphs.length) {
      setShowButtons(true);
      // Show features after a delay
      setTimeout(() => setShowFeatures(true), 500);
      return;
    }

    const currentParagraph = paragraphs[currentParagraphIndex];
    
    if (currentParagraph.length === 0) {
      setDisplayedParagraphs(prev => [...prev, '']);
      setCurrentParagraphIndex(prev => prev + 1);
      return;
    }

    let lineIndex = 0;
    let charIndex = 0;
    let currentLines = [];

    const typeWriter = () => {
      if (lineIndex < currentParagraph.length) {
        const line = currentParagraph[lineIndex];
        
        if (charIndex <= line.length) {
          setCurrentLine(line.substring(0, charIndex));
          charIndex++;
          setTimeout(typeWriter, 20); // Faster typing speed
        } else {
          currentLines.push(line);
          setDisplayedParagraphs(prev => [...prev.slice(0, -1), currentLines.join('\n')]);
          
          lineIndex++;
          charIndex = 0;
          
          if (lineIndex < currentParagraph.length) {
            currentLines = [...currentLines];
            setDisplayedParagraphs(prev => [...prev, '']);
            setTimeout(typeWriter, 50); // Shorter delay between lines
          } else {
            setCurrentLine('');
            setTimeout(() => {
              setCurrentParagraphIndex(prev => prev + 1);
            }, 300); // Shorter delay between paragraphs
          }
        }
      }
    };

    setDisplayedParagraphs(prev => [...prev, '']);
    setTimeout(typeWriter, 50);
  }, [currentParagraphIndex]);

  return (
    <div className="welcome-page">
      <div className="hero-section">
        <div className="hero-overlay"></div>
        
        <div className="hero-content">
          <div className="logo-container">
            <h1 className="logo">InterviewAI</h1>
            <p className="logo-subtext">Powered by AI • Trusted by Professionals</p>
          </div>
          
          <div className="typing-container" ref={contentRef}>
            {displayedParagraphs.map((paragraph, i) => (
              <p key={i} className="completed-paragraph">
                {paragraph}
              </p>
            ))}
            {currentLine && (
              <p className="typing-paragraph">
                {currentLine}
                <span className="cursor">|</span>
              </p>
            )}
          </div>
          
          {showButtons && (
            <div className="cta-buttons">
              <button 
                className="cta-button primary"
                onClick={() => navigate('/register')}
              >
                Start Free Trial
              </button>
              <button 
                className="cta-button secondary"
                onClick={() => navigate('/login')}
              >
                Existing User? Login
              </button>
            </div>
          )}
        </div>
      </div>

      {showFeatures && (
        <div className="features-section">
          <h2 className="section-title">Why Choose InterviewAI?</h2>
          <p className="section-subtitle">The most comprehensive interview preparation platform</p>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📄</div>
              <h3>Smart CV Analysis</h3>
              <p>Get personalized questions based on your resume and target job</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎥</div>
              <h3>Video Practice</h3>
              <p>Record answers and receive AI-powered feedback instantly</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Performance Tracking</h3>
              <p>Detailed analytics to track your improvement over time</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>AI Mock Interviews</h3>
              <p>Practice with our AI interviewer that adapts to your responses</p>
            </div>
          </div>
        </div>
      )}

      {showFeatures && (
        <div className="testimonial-section">
          <h2 className="section-title">Trusted by Professionals</h2>
          <div className="testimonials">
            <div className="testimonial-card">
              <p>"InterviewAI helped me land my dream job at Google. The feedback was incredibly accurate!"</p>
              <div className="testimonial-author">- Sarah K., Software Engineer</div>
            </div>
            <div className="testimonial-card">
              <p>"The video practice feature was a game-changer for my interview preparation."</p>
              <div className="testimonial-author">- Michael T., Product Manager</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomePage;