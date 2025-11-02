import { useState } from 'react'
import './App.css'

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isCreateAccount, setIsCreateAccount] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Login failed')
        return
      }

      // Login successful
      setIsLoggedIn(true)
    } catch (err) {
      setError('Failed to connect to server')
      console.error('Login error:', err)
    }
  }

  const handleCreateAccount = async (e) => {
    e.preventDefault()
    setError('')

    if (!name || !email || !password) {
      setError('Please fill in all fields')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Registration failed')
        return
      }

      // Switch to login page after successful account creation
      setIsCreateAccount(false)
      setName('')
      setPassword('')
      setError('')
    } catch (err) {
      setError('Failed to connect to server')
      console.error('Registration error:', err)
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setEmail('')
    setPassword('')
    setName('')
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

  if (isCreateAccount) {
    return (
      <div className="app">
        <div className="login-container">
          <div className="login-header">
            <h1>Create Account</h1>
            <p>Join us today</p>
          </div>

          <form onSubmit={handleCreateAccount} className="login-form">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="form-input"
              />
            </div>

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
              Create Account
            </button>
          </form>

          <div className="login-footer">
            <a href="#" onClick={(e) => { e.preventDefault(); setIsCreateAccount(false); setError(''); }} className="footer-link">
              Already have an account? Login
            </a>
          </div>
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
          <a href="#" onClick={(e) => { e.preventDefault(); setIsCreateAccount(true); setError(''); }} className="footer-link">
            Create account
          </a>
        </div>
      </div>
    </div>
  )
}

export default App
