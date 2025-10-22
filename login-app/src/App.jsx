import { useState } from 'react'
import './App.css'

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    if (email && password.length >= 6) {
      setIsLoggedIn(true)
    } else {
      setError('Invalid credentials. Password must be at least 6 characters.')
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setEmail('')
    setPassword('')
    setError('')
  }

  if (isLoggedIn) {
    return (
      <div className="app">
        <div className="welcome-container">
          <h1>Welcome!</h1>
          <p>You are successfully logged in as: <strong>{email}</strong></p>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    )
  }

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
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="form-input"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-btn">
            Login
          </button>
        </form>

        <div className="login-footer">
          <a href="#" className="footer-link">Forgot password?</a>
          <span className="footer-divider">•</span>
          <a href="#" className="footer-link">Create account</a>
        </div>
      </div>
    </div>
  )
}

export default App
