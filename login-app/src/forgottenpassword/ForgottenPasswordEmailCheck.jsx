// src/components/ForgottenPasswordEmailCheck.jsx – TELJES, HÁTTÉRKÉPEK VÁLTAKOZNAK!

import { useState, useEffect } from 'react';
import './ForgottenPasswordEmailCheck.css';

// HÁTTÉRKÉPEK – ugyanazok, mint mindenhol
import bg1 from '../mainsite/fooldalkep1.png';
import bg2 from '../mainsite/fooldalkep2.png';
import bg3 from '../mainsite/fooldalkep3.jpg';
import bg4 from '../mainsite/fooldalkep4.jpg';

const backgrounds = [bg1, bg2, bg3, bg4];

export default function ForgottenPasswordEmailCheck() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  // HÁTTÉRKÉP VÁLTÁS – 5 másodpercenként
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % backgrounds.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
        setSent(true);
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.message || 'Hiba történt');
      }
    } catch {
      setError('Nem sikerült csatlakozni a szerverhez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgotten-app">
      {/* HÁTTÉRKÉPEK – PONT ÚGY, MINT A FŐOLDALON */}
      <div className="background-slider">
        {backgrounds.map((bg, index) => (
          <div
            key={index}
            className={`background-image ${index === currentBgIndex ? 'active' : ''}`}
            style={{ backgroundImage: `url(${bg})` }}
          />
        ))}
      </div>

      <div className="forgotten-container">
        <div className="forgotten-header">
          <h1>Jelszó helyreállítása</h1>
          <p>Írja be email címét, és elküldjük önnek a linket</p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="forgotten-form">
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
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              className="forgotten-btn"
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

        <div className="forgotten-footer">
          <a href="/login" className="footer-link">
            ← Vissza a bejelentkezéshez
          </a>
        </div>
      </div>
    </div>
  );
}