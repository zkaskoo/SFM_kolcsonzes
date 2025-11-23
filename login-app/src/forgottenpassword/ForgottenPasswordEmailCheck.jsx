// src/components/ForgottenPasswordEmailCheck.jsx
import { useState } from 'react';
import './ForgottenPasswordEmailCheck.css';

export default function ForgottenPasswordEmailCheck() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');   // csak a backend üzenetei + 1 saját hálózati hiba
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:8080/api/v1/auth/forgotten-password/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSent(true);                    // backend true-t küld → siker
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.message || '');      // csak a backend szövege
      }
    } catch {
      // EZ AZ EGYETLEN saját üzenet – csak ha a szerver nem elérhető
      setError('Nem sikerült csatlakozni a szerverhez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="login-container">
        <div className="login-header">
          <h1>Jelszó helyreállítása</h1>
          <p>Írja be email címét, és elküldjük önnek a linket</p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>Email címed</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@pelda.hu"
                className="form-input"
                autoFocus
                disabled={loading}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading ? 'Küldés...' : 'Link küldése'}
            </button>
          </form>
        ) : (
          <div className="success-message">
            <strong>Kész!</strong><br /><br />
            Elküldtük a jelszó-visszaállító linket az email címére.
          </div>
        )}

        <div className="login-footer">
          <a href="/login" className="footer-link">
            ← Vissza a bejelentkezéshez
          </a>
        </div>
      </div>
    </div>
  );
}