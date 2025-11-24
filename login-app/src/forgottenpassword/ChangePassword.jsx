// src/components/ChangePassword.jsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import './ChangePassword.css';

export default function ChangePassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');           // EZT HIÁNYZOTT
  const [confirmPassword, setConfirmPassword] = useState(''); // EZT HIÁNYZOTT
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [changing, setChanging] = useState(false);

  // Automatikus token ellenőrzés oldal betöltésekor
  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/v1/auth/forgotten-password/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      console.log('Validate API státusz:', res.status);
      console.log('Validate API nyers válasz:', await res.clone().text());
      if (!res.ok) {
        const err = await res.json();
        setError(err.message || 'Hibás vagy lejárt token');
        setLoading(false);
        return;
      }

      const userEmail = await res.text();
      setEmail(userEmail);
      setLoading(false);
    } catch {
      setError('Nem sikerült csatlakozni a szerverhez.');
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChanging(true);
    setError('');

    try {
      const res = await fetch('http://localhost:8080/api/v1/auth/forgotten-password/change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, confirmPassword }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const err = await res.json();
        setError(err.message || 'Hiba történt a jelszó módosítása során.');
      }
    } catch {
      setError('Nem sikerült csatlakozni a szerverhez.');
    } finally {
      setChanging(false);
    }
  };

  // 1. Betöltés
  if (loading) {
    return (
      <div className="change-password-app">
        <div className="change-password-container">
          <div className="spinner">Link ellenőrzése...</div>
        </div>
      </div>
    );
  }

  // 2. Hibás/lejárt token → pontosan a backend üzenete
  if (error && !email) {
    return (
      <div className="change-password-app">
        <div className="change-password-container">
          <div className="error-box">
            <h2>Hoppá!</h2>
            <p>{error}</p>
            <a href="/forgotten-password" className="back-link">
              Új jelszó-visszaállítás kérése
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 3. Sikeres token → jelszócsere űrlap
  return (
    <div className="change-password-app">
      <div className="change-password-container">
        <div className="change-password-header">
          <h1>Új jelszó beállítása</h1>
          <p>Üdv, <strong>{email}</strong>!</p>
        </div>

        {!success ? (
          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label>Új jelszó</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Jelszó újra</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input"
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" disabled={changing} className="change-password-btn">
              {changing ? 'Feldolgozás...' : 'Jelszó módosítása'}
            </button>
          </form>
        ) : (
          <div className="success-box">
            <strong>Sikeres jelszóváltoztatás!</strong>
            <p>Most már bejelentkezhetsz az új jelszavaddal.</p>
            <a href="/login" className="success-link">Bejelentkezés</a>
          </div>
        )}

        <div className="change-password-footer">
          <a href="/login" className="footer-link">Vissza a bejelentkezéshez</a>
        </div>
      </div>
    </div>
  );
}