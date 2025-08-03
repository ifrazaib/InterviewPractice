import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import CVInterview from './pages/CVIntrview';
import VideoInterview from './pages/videoInterview';
import ProtectedRoute from './components/PrivateRoute'; 
import WelcomePage from './pages/WelcomePage';

const App = () => {
  const [auth, setAuth] = useState({
    token: localStorage.getItem('token'),
    name: localStorage.getItem('name') || '',
  });

  return (
    <BrowserRouter>
      <Routes>
         <Route path="/" element={<WelcomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage setAuth={setAuth} />} />
        
        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute auth={auth}>
              <Dashboard auth={auth} />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/CVInterview" 
          element={
            <ProtectedRoute auth={auth}>
              <CVInterview auth={auth} />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/videoInterview" 
          element={
            
              <VideoInterview />
          } 
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;