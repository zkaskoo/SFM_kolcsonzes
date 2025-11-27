// src/App.jsx – TÖKÉLETES, HIBAMENTES VERZIÓ (teljes név megjelenik a profilban!)
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './App.css';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCreateAccount, setIsCreateAccount] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 2FA
  const [jwtToken, setJwtToken] = useState('');
  const [show2FA, setShow2FA] = useState(false);
  const [authCode, setAuthCode] = useState('');

  // Jelszó javaslat
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [suggestedPassword, setSuggestedPassword] = useState('');
  const [loadingPassword, setLoadingPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // URL alapján nézetváltás
  useEffect(() => {
    if (location.pathname === '/register') {
      setIsCreateAccount(true);
      setIsForgotPassword(false);
    } else if (location.pathname === '/forgot-password' || location.pathname === '/forgotten-password') {
      setIsForgotPassword(true);
      setIsCreateAccount(false);
    } else {
      setIsCreateAccount(false);
      setIsForgotPassword(false);
    }
    setError('');
    setSuccessMessage('');
    setShowSuggestion(false);
    setSuggestedPassword('');
  }, [location.pathname]);

  // Jelszó generálás
  const generatePassword = async () => {
    if (loadingPassword) return;
    setLoadingPassword(true);
    setError('');

    try {
      const res = await fetch('http://localhost:8080/api/v1/password/generate');
      if (!res.ok) throw new Error('Szerver hiba');
      const data = await res.text();
      const pwd = typeof data === 'string' ? data.trim() : data.password || data;
      if (pwd && pwd.length >= 8) {
        setSuggestedPassword(pwd);
      }
    } catch (err) {
      setError('Nem sikerült jelszót generálni');
      console.error(err);
    } finally {
      setLoadingPassword(false);
    }
  };

  const useSuggestedPassword = () => {
    setPassword(suggestedPassword);
    setConfirmPassword(suggestedPassword);
    setShowSuggestion(false);
  };

  const handlePasswordFocus = () => {
    setShowSuggestion(true);
    if (!suggestedPassword) generatePassword();
  };

  // ====================== REGISZTRÁCIÓ ======================
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!name || !username || !email || !password || !confirmPassword) {
      setError('Kérlek töltsd ki az összes mezőt');
      return;
    }
    if (password.length < 6) {
      setError('A jelszónak legalább 6 karakternek kell lennie');
      return;
    }
    if (password !== confirmPassword) {
      setError('A jelszavak nem egyeznek');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/v1/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, email, password, confirmPassword }),
      });

      let data;
      try { data = await response.json(); } catch { data = await response.text(); }

      if (!response.ok) {
        setError(data.message || data || 'Regisztráció sikertelen');
        return;
      }

      setSuccessMessage('Sikeres regisztráció! Most már bejelentkezhetsz.');
      setTimeout(() => {
        setSuccessMessage('');
        navigate('/login');
        setName(''); setUsername(''); setEmail(''); setPassword(''); setConfirmPassword('');
      }, 3000);
    } catch (err) {
      setError('Nem sikerült csatlakozni a szerverhez');
    }
  };

  // ====================== BEJELENTKEZÉS ======================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Kérlek töltsd ki az összes mezőt');
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
        setError(data.message || 'Hibás email vagy jelszó');
        return;
      }
      setShow2FA(true);
    } catch (err) {
      setError('Nem sikerült csatlakozni a szerverhez');
    }
  };

  // ====================== 2FA – TELJES NÉV MENTÉSE ======================
  const handleVerify = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/v1/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: authCode, email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || 'Érvénytelen vagy lejárt kód');
        return;
      }

      // EZ A SOR MENTI EL A TELJES NEVET – MINDEN ESETRE BIZTOSÍTVA!
      localStorage.setItem("fullName", data.name || data.fullName || data.username || email.split('@')[0]);

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("username", data.name || data.username || email);
      localStorage.setItem("email", email);
      localStorage.setItem("token", data.token);
      if (data.id) {
        localStorage.setItem("userId", data.id);
      }

      setJwtToken(data.token);
      setIsLoggedIn(true);
      setShow2FA(false);
      setError('');
      setAuthCode('');
    } catch (err) {
      setError('Hiba az ellenőrzés során');
    }
  };

  // ====================== ELFELEJTETT JELSZÓ ======================
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('Küldés folyamatban...');
    if (!email) {
      setError('Kérem adja meg az emailjét');
      setSuccessMessage('');
      return;
    }
    try {
      const res = await fetch('http://localhost:8080/api/v1/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMessage('Ellenőrizze az email fiókját! Elküldtük a visszaállítási linket.');
      } else {
        setError(data.message || 'Hiba történt');
        setSuccessMessage('');
      }
    } catch (err) {
      setError('Nem sikerült csatlakozni a szerverhez');
      setSuccessMessage('');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setEmail(''); setPassword(''); setJwtToken(''); setError('');
    navigate('/');
  };

  const goToMain = (e) => { e.preventDefault(); navigate('/'); };

  // Átirányítás bejelentkezés után
  useEffect(() => {
    if (isLoggedIn) {
      const timer = setTimeout(() => {
        navigate('/');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn]);

  // BEJELENTKEZVE – üdvözlő képernyő
  if (isLoggedIn) {
    return (
      <div className="app">
        <div className="welcome-container">
          <h1>Üdvözöllek!</h1>
          <p>Sikeresen bejelentkeztél: <strong>{email}</strong></p>
          <button onClick={handleLogout} className="logout-btn">Kijelentkezés</button>
        </div>
      </div>
    );
  }

  // REGISZTRÁCIÓ
  if (isCreateAccount) {
    return (
      <div className="app">
        <div className="login-container">
          <div className="login-header">
            <h1>Regisztráció</h1>
            <p>Hozzon létre új fiókot</p>
          </div>
          {successMessage && <div className="success-message">{successMessage}</div>}

          <form onSubmit={handleCreateAccount} className="login-form">
            <div className="form-group">
              <label>Név</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Teljes neve" className="form-input" />
            </div>
            <div className="form-group">
              <label>Felhasználónév</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Válasszon felhasználónevet" className="form-input" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@pelda.hu" className="form-input" />
            </div>
            <div className="form-group">
              <label>Jelszó</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onFocus={handlePasswordFocus} placeholder="Minimum 8 karakter" className="form-input" />
              {showSuggestion && (
                <div className="password-suggestion-compact">
                  <div className="suggestion-header">
                    <span>Jelszó javaslat</span>
                    <button type="button" onClick={generatePassword} disabled={loadingPassword} className="refresh-btn-small">Új</button>
                  </div>
                  {suggestedPassword ? (
                    <div className="suggested-password-line" onClick={useSuggestedPassword}>
                      <code>{suggestedPassword}</code>
                    </div>
                  ) : (
                    <div className="loading-small">Generálás...</div>
                  )}
                </div>
              )}
            </div>
            <div className="form-group">
              <label>Jelszó megerősítése</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Írja be újra" className="form-input" />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="login-btn">Fiók létrehozása</button>
          </form>
          <div className="login-footer">
            <a href="/" onClick={goToMain} className="footer-link">Vissza a főoldalra</a>
          </div>
        </div>
      </div>
    );
  }

  // BEJELENTKEZÉS + 2FA MODAL
  return (
    <div className="app">
      <div className="login-container">
        <div className="login-header">
          <h1>Üdvözöljük újra!</h1>
          <p>Jelentkezzen be a fiókjába</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@pelda.hu" className="form-input" autoFocus />
          </div>
          <div className="form-group">
            <label>Jelszó</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Adja meg a jelszavát" className="form-input" />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="login-btn">Bejelentkezés</button>
        </form>

        <div className="login-footer">
          <a href="/forgotten-password" onClick={(e) => { e.preventDefault(); navigate('/forgotten-password'); }} className="footer-link">
            Elfelejtette a jelszavát?
          </a>
          <span className="footer-divider">•</span>
          <a href="/" onClick={goToMain} className="footer-link">Vissza a főoldalra</a>
        </div>
      </div>

      {/* 2FA MODAL */}
      {show2FA && (
        <div className="overlay" onClick={() => setShow2FA(false)}>
          <div className="twofa-panel" onClick={(e) => e.stopPropagation()}>
            <h2>Kétlépcsős hitelesítés</h2>
            <p>Írd be az emailben kapott 6 jegyű kódot:</p>
            <input
              type="text"
              placeholder="123456"
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength="6"
              autoFocus
            />
            <div className="twofa-buttons">
              <button onClick={handleVerify} className="verify-btn">Ellenőrzés</button>
              <button onClick={() => setShow2FA(false)} className="verify-btn cancel">Mégse</button>
            </div>
            {error && <div className="error-message">{error}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;