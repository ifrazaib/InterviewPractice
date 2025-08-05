import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

const Dashboard = ({ auth, setAuth }) => {
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');

  const handleLogout = () => {
    // 1. Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    

    // 3. Redirect to login page
    navigate('/login');
  };

  useEffect(() => {
    if (!auth?.token) {
      navigate('/login');
      return;
    }
    
    // Set time-based greeting
    const hour = new Date().getHours();
    setGreeting(
      hour < 12 ? 'Good morning' :
      hour < 18 ? 'Good afternoon' : 'Good evening'
    );
  }, [auth, navigate]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1 className="welcome-title">
            {greeting}, <span className="username">{auth?.name}</span>! 👋
          </h1>
          <p className="welcome-subtitle">Ready for your next career breakthrough?</p>
        </div>
        
        {/* Fabulous Logout Button */}
        <button className="logout-button" onClick={handleLogout}>
          <span className="logout-icon">⎋</span> Logout
        </button>
      </div>

      <div className="dashboard-content">
        <h2 className="action-title">Choose Interview Mode</h2>
        
        <div className="action-cards">
          <div className="action-card" onClick={() => navigate('/CVinterview')}>
            <div className="card-icon">📄</div>
            <h3>CV-based Interview</h3>
            <p>Get interviewed based on your resume content</p>
            <button className="action-button">Start Now</button>
          </div>
          
          <div className="action-card" onClick={() => navigate('/videoInterview')}>
            <div className="card-icon">🎥</div>
            <h3>Video-based Interview</h3>
            <p>Face-to-face interview simulation</p>
            <button className="action-button">Start Now</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;