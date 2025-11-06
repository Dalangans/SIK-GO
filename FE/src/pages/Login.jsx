import React, { useState, useContext } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/colors.css';

export default function Login() {
  const { login, isAuthenticated } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  if (isAuthenticated) {
    navigate(from, { replace: true });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Gagal login');
    }
  };

  const formStyles = {
    maxWidth: '420px',
    margin: '40px auto',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    backgroundColor: 'var(--white)'
  };

  const inputStyles = {
    width: '100%',
    padding: '0.75rem',
    marginTop: '0.5rem',
    marginBottom: '1rem',
    border: '1px solid var(--gray-300)',
    borderRadius: '4px',
    fontSize: '1rem'
  };

  const buttonStyles = {
    backgroundColor: 'var(--primary)',
    color: 'var(--text-primary)',
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'background-color 0.3s'
  };

  return (
    <div style={formStyles}>
      <h2 style={{color: 'var(--primary)', marginBottom: '1.5rem'}}>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            style={inputStyles}
          />
        </div>
        <div>
          <label>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            style={inputStyles}
          />
        </div>
        {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
        <button type="submit" style={buttonStyles}>Login</button>
        <Link to="/" style={{marginLeft: '1rem', color: 'var(--primary)'}}>Kembali</Link>
      </form>
    </div>
  );
}
