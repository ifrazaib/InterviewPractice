import { useState } from 'react';
import axios from '../axiosInstance';
import { useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/auth/register', form);
      alert('Registration successful');
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || 'Error during registration');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join us today!</p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="auth-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="auth-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Create a password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="auth-input"
            />
          </div>
          
          <button type="submit" className="auth-button">Register</button>
        </form>
        
        <div className="auth-footer">
          Already have an account? <span className="auth-link" onClick={() => navigate('/login')}>Login</span>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;