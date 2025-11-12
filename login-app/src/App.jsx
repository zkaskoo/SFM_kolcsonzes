import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCreateAccount, setIsCreateAccount] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // <-- ide kell
  const [jwtToken, setJwtToken] = useState('');
  const [show2FA, setShow2FA] = useState(false);
  const [authCode, setAuthCode] = useState('');

  const navigate = useNavigate();

  // Login handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/v1/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      // 🔹 Ha az email/jelszó helyes → megjelenik a 2FA panel
      setShow2FA(true);
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Login error:', err);
    }
  };

  // 🔹 2FA VERIFY HANDLER
  const handleVerify = async () => {
    if (!authCode) {
      setError('Please enter the authentication code');
      return;
    }
  
    try {
      const res = await fetch('http://localhost:8080/api/v1/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: authCode, email }),
      });
  
      // Mindig próbáljuk JSON-ként olvasni
      const data = await res.json();
  
      if (!res.ok) {
        setError(data?.message || 'Verification failed');
        return;
      }
  
      // Sikeres 2FA → át a MainSite.jsx-re
      setJwtToken(data.token);
      setIsLoggedIn(true);
      setShow2FA(false);
      setError('');
    } catch (err) {
      setError('Verification error: ' + err.message);
      console.error('Verification error:', err);
    }
  };
  
  

  // Registration handler
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!name || !username || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/v1/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, email, password, confirmPassword }),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        data = await response.text();
      }

      if (!response.ok) {
        setError(data.message || data || 'Registration failed');
        return;
      }

      setSuccessMessage(typeof data === 'string' ? data : data.message || 'Sikeres regisztráció!');
      setTimeout(() => {
        setIsCreateAccount(false);
        setSuccessMessage('');
      }, 3000);

      setName('');
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setError('');
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Registration error:', err);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setEmail('');
    setPassword('');
    setName('');
    setError('');
  };

  // Logged in view
  if (isLoggedIn) {
    return (
      <div className="app">
        <div className="welcome-container">
          <h1>Welcome!</h1>
          <p>You are successfully logged in as: <strong>{email}</strong></p>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>
    );
  }

  // Registration view
  if (isCreateAccount) {
    return (
      <div className="app">
        <div className="login-container">
          <div className="login-header">
            <h1>Create Account</h1>
            <p>Join us today</p>
          </div>

          {successMessage && (
            <div className="success-message">{successMessage}</div>
          )}

          <form onSubmit={handleCreateAccount} className="login-form">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" className="form-input" />
            </div>

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter your username" className="form-input" />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="form-input" />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="form-input" />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm your password" className="form-input" />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="login-btn">Create Account</button>
          </form>

          <div className="login-footer">
            <a href="#" onClick={(e) => { e.preventDefault(); setIsCreateAccount(false); setError(''); }} className="footer-link">
              Already have an account? Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Login view
  return (
    <div className="app">
      <div className="login-container">
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Please login to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="form-input" />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="form-input" />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-btn">Login</button>
        </form>

        <div className="login-footer">
          <a href="#" className="footer-link">Forgot password?</a>
          <span className="footer-divider">•</span>
          <a href="#" onClick={(e) => { e.preventDefault(); setIsCreateAccount(true); setError(''); }} className="footer-link">Create account</a>
        </div>
      </div>

      {/* 🔹 2FA PANEL */}
      {show2FA && (
        <div className="overlay">
          <div className="twofa-panel">
            <h2>Two-Factor Authentication</h2>
            <p>Enter the code sent to your email:</p>
            <input
              type="text"
              placeholder="Enter verification code"
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value)}
            />
            <button onClick={handleVerify}>Verify</button>
            {error && <div className="error-message">{error}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
