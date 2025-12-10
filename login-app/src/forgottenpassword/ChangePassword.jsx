// src/components/ChangePassword.jsx – MOST MÁR GARANTÁLTAN MEGJELENIK A HÁTTÉR!

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import './ChangePassword.css';

// KORREKT RELATÍV ÚTVONAL A components mappából!
import bg1 from '../mainsite/fooldalkep1.png';
import bg2 from '../mainsite/fooldalkep2.png';
import bg3 from '../mainsite/fooldalkep3.jpg';
import bg4 from '../mainsite/fooldalkep4.jpg';

const backgrounds = [bg1, bg2, bg3, bg4];

export default function ChangePassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [changing, setChanging] = useState(false);

  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  useEffect(() => {
  document.title = "SFM Könyvportál";
  }, []);
  // HÁTTÉRKÉP VÁLTÁS – 5 mp-enként
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % backgrounds.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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

  return (
    <div className="change-password-app">
      {/* HÁTTÉRKÉPEK – MOST MÁR LÁTSZANAK! */}
      <div className="background-slider">
        {backgrounds.map((bg, index) => (
          <div
            key={index}
            className={`background-image ${index === currentBgIndex ? 'active' : ''}`}
            style={{ backgroundImage: `url(${bg})` }}
          />
        ))}
      </div>

      <div className="change-password-container">
        {loading && <div className="spinner">Link ellenőrzése...</div>}

        {error && !email && !loading && (
          <div className="error-box">
            <h2>Hoppá!</h2>
            <p>{error}</p>
            <a href="/forgotten-password" className="back-link">
              Új jelszó-visszaállítás kérése
            </a>
          </div>
        )}

        {!loading && email && !success && (
          <>
            <div className="change-password-header">
              <h1>Új jelszó beállítása</h1>
              <p>Üdv, <strong>{email}</strong>!</p>
            </div>

            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label>Új jelszó</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-input" required autoFocus />
              </div>
              <div className="form-group">
                <label>Jelszó újra</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="form-input" required />
              </div>
              {error && <div className="error-message">{error}</div>}
              <button type="submit" disabled={changing} className="change-password-btn">
                {changing ? 'Feldolgozás...' : 'Jelszó módosítása'}
              </button>
            </form>
          </>
        )}

        {success && (
          <div className="success-box">
            <strong>Sikeres jelszóváltoztatás!</strong>
            <p>Most már bejelentkezhetsz az új jelszavaddal.</p>
          </div>
        )}

        <div className="change-password-footer">
          <a href="/login" className="footer-link">Vissza a bejelentkezéshez</a>
        </div>
      </div>
    </div>
  );
}