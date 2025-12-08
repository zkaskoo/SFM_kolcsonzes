// src/mainsite/MainSite.jsx – VÉGLEGES, PONT A SZÖVEG ÉS GOMBOK KÖZÖTT
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import './MainSite.css';

import kep1 from '/src/mainsite/fooldalkep1.png';
import kep2 from '/src/mainsite/fooldalkep2.png';
import kep3 from '/src/mainsite/fooldalkep3.jpg';
import kep4 from '/src/mainsite/fooldalkep4.jpg';
import avatar from '/src/mainsite/avatar.jpg';

const images = [kep1, kep2, kep3, kep4];

export default function MainSite() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const username = localStorage.getItem("username") || "Felhasználó";

  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
    window.location.reload();
  };

  const subtitles = [
    "Rengeteg könyv és e-book.",
    "Szerezzen könyveket online, bárhonnan, bármikor",
    "Cseréljen másokkal, kövesse nyilvántartását.",
    "Modern, gyors, biztonságos."
  ];

  // Háttérképek váltása MINDIG (bejelentkezve is)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mainsite-wrapper">

      {/* HÁTTÉRKÉPEK */}
      <div className="background-slider">
        {images.map((img, index) => (
          <div
            key={index}
            className={`background-image ${index === currentIndex ? 'active' : ''}`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}
      </div>

      {/* TOPBAR */}
      <header className="mainsite-topbar">
        <div className="topbar-container">
          <div className="topbar-logo">
            <BookOpen size={32} />
            <h2>SFM Könyvkölcsönzési <span className="highlight">Rendszer</span></h2>
          </div>

          <nav className="topbar-buttons">
            {!isLoggedIn ? (
              <>
                <button onClick={() => navigate('/login')} className="topbar-btn login">
                  Bejelentkezés
                </button>
                <button onClick={() => navigate('/register')} className="topbar-btn register">
                  Regisztráció
                </button>
              </>
            ) : (
              <div className="topbar-auth-area">
                <div className="username">{username}</div>

                <div className="profile-menu-wrapper">
                  <div
                    className="avatar-circle"
                    onClick={() => setMenuOpen(!menuOpen)}
                  >
                    <img src={avatar} alt="avatar" className="avatar-image" />
                  </div>

                  {menuOpen && (
                    <div className="dropdown-menu">
                      <button onClick={() => navigate('/profile')} className="dropdown-item">
                        Profilom
                      </button>
                      <button onClick={handleLogout} className="dropdown-item logout">
                        Kijelentkezés
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-card">

            {/* BEJELENTKEZETT ÁLLAPOT */}
            {isLoggedIn ? (
              <div className="logged-in-content">
                <h1 className="logged-in-greeting">
                  Szép napot kedves <span className="username-highlight">{username}</span>!
                </h1>
                <p className="logged-in-subtitle">
                  Örülünk, hogy újra itt van.
                </p>

                <div className="logged-in-button-wrapper">
                  <button className="btn-primary logged-in-browse-btn" onClick={() => navigate('/browse')}>
                    Böngészés a publikus könyvek között <ArrowRight size={22} />
                  </button>
                </div>
              </div>
            ) : (
              /* KIJELENTKEZETT ÁLLAPOT – PONT A SZÖVEG ÉS GOMBOK KÖZÖTT */
              <>
                <h1>Üdvözöljük az olvasók közösségében</h1>

                <p key={currentIndex} className="hero-subtitle dynamic-subtitle fade-in-up larger-spacing">
                  {subtitles[currentIndex]}
                </p>

                {/* 4 PONT – SZÉPEN KÖZÉPEN, A SZÖVEG ÉS GOMBOK KÖZÖTT */}
                <div className="hero-dots">
                  {subtitles.map((_, index) => (
                    <span
                      key={index}
                      className={`dot ${index === currentIndex ? 'active' : ''}`}
                      onClick={() => setCurrentIndex(index)}
                    />
                  ))}
                </div>

                {/* GOMBOK */}
                <div className="hero-buttons">
                  <button onClick={() => navigate('/register')} className="btn-primary">
                    Regisztráció <ArrowRight size={20} />
                  </button>
                  <button onClick={() => navigate('/login')} className="btn-secondary">
                    Bejelentkezés <ArrowRight size={20} />
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      </section>

      <footer className="mainsite-footer">
        <p>© 2025 GitPush-F • Minden jog fenntartva</p>
      </footer>
    </div>
  );
}