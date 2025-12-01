// src/bongeszes/Bongeszes.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, BookOpen } from 'lucide-react';
import './Bongeszes.css';

import kep1 from '../mainsite/fooldalkep1.png';
import kep2 from '../mainsite/fooldalkep2.png';
import kep3 from '../mainsite/fooldalkep3.jpg';
import kep4 from '../mainsite/fooldalkep4.jpg';
import avatar from '../mainsite/avatar.jpg';

const images = [kep1, kep2, kep3, kep4];

export default function Bongeszes() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const username = localStorage.getItem("username") || "Felhasználó";

  const [filters, setFilters] = useState({
    title: '',
    author: '',
    maxPrice: ''
  });

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
    window.location.reload();
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === 'maxPrice') {
      const numericValue = value.replace(/\D/g, '');
      setFilters(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFilters(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSearch = () => {
    console.log("Keresés indítva:", filters);
  };

  return (
    <div className="bongeszes-wrapper">

      <div className="background-slider">
        {images.map((img, index) => (
          <div
            key={index}
            className={`background-image ${index === currentIndex ? 'active' : ''}`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}
      </div>

      <header className="mainsite-topbar">
        <div className="topbar-container">
          <div className="topbar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <BookOpen size={32} />
            <h2>SFM Könyvkölcsönzési <span className="highlight">Rendszer</span></h2>
          </div>

          <nav className="topbar-buttons">
            {isLoggedIn ? (
              <div className="topbar-auth-area">
                <div className="username">{username}</div>
                <div className="profile-menu-wrapper">
                  <div className="avatar-circle" onClick={() => setMenuOpen(!menuOpen)}>
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
            ) : (
              <button onClick={() => navigate('/login')} className="topbar-btn login">
                Bejelentkezés
              </button>
            )}
          </nav>
        </div>
      </header>

      <button onClick={() => navigate(-1)} className="fixed-back-btn">
        <ArrowLeft size={26} /> Vissza
      </button>

      <section className="bongeszes-hero">
        <div className="bongeszes-content">
          <div className="hero-card bongeszes-card">

            <h1 className="bongeszes-title">
              <Filter size={42} /> Könyvek böngészése
            </h1>

            <div className="white-panel filter-panel">
              <div className="filter-header">
                <Filter size={28} className="filter-icon" />
                <h3>Könyvek szűrése</h3>
              </div>

              <div className="form-grid">
                <div className="input-group">
                  <label>Cím</label>
                  <input
                    type="text"
                    name="title"
                    value={filters.title}
                    onChange={handleFilterChange}
                    placeholder="Adja meg a könyv címét."
                  />
                </div>

                <div className="input-group">
                  <label>Szerző</label>
                  <input
                    type="text"
                    name="author"
                    value={filters.author}
                    onChange={handleFilterChange}
                    placeholder="Adja meg a könyv szerzőjét"
                  />
                </div>

                <div className="input-group">
                  <label>Maximum ár (Ft)</label>
                  <input
                    type="text"
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    placeholder="pl. 5000"
                    className="price-input"
                  />
                </div>
              </div>

              <button onClick={handleSearch} className="submit-btn">
                <Search size={24} /> Keresés
              </button>
            </div>

            <div className="results-container white-panel">
              <p className="results-text">
                Itt fognak megjelenni a könyvek a keresés után
              </p>
            </div>

          </div>
        </div>
      </section>

      <footer className="mainsite-footer">
        <p>© 2025 GitPush-F • Minden jog fenntartva</p>
      </footer>
    </div>
  );
}