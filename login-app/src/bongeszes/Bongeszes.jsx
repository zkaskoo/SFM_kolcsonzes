// src/bongeszes/Bongeszes.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, BookOpen, Calendar, User } from 'lucide-react';
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
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const username = localStorage.getItem("username") || "Felhasználó";
  const userId = localStorage.getItem("userId");

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

  useEffect(() => {
    if (!isLoggedIn || !userId) {
      setError("Be kell jelentkezned a könyvek megtekintéséhez!");
      setLoading(false);
      return;
    }

    const fetchBooks = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/v1/books/others', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: parseInt(userId) })
        });

        if (!response.ok) throw new Error('Hiba a szerverrel');
        const data = await response.json();
        setBooks(data);
        setFilteredBooks(data);
        setLoading(false);
      } catch (err) {
        console.error("Hiba:", err);
        setError("Nem sikerült betölteni a könyveket.");
        setLoading(false);
      }
    };

    fetchBooks();
  }, [isLoggedIn, userId]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === 'maxPrice') {
      const numericValue = value.replace(/\D/g, '');
      setFilters(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFilters(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleSearch = () => {
    let result = [...books];

    if (filters.title.trim()) {
      result = result.filter(book =>
        book.title?.toLowerCase().includes(filters.title.toLowerCase())
      );
    }
    if (filters.author.trim()) {
      result = result.filter(book =>
        book.author?.toLowerCase().includes(filters.author.toLowerCase())
      );
    }
    if (filters.maxPrice) {
      result = result.filter(book =>
        book.price !== null && book.price <= parseInt(filters.maxPrice)
      );
    }

    setFilteredBooks(result);
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
          {/* NEM KATTINTHATÓ, FEHÉR SZÖVEG */}
          <div className="topbar-logo">
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
                      <button onClick={() => navigate('/profile')} className="dropdown-item">Profilom</button>
                      <button onClick={handleLogout} className="dropdown-item logout">Kijelentkezés</button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button onClick={() => navigate('/login')} className="topbar-btn login">Bejelentkezés</button>
            )}
          </nav>
        </div>
      </header>

      {/* VISSZA GOMB – TOPBAR ALATT */}
      <button onClick={() => navigate(-1)} className="fixed-back-btn">
        <ArrowLeft size={26} /> Vissza
      </button>

      <section className="bongeszes-hero">
        <div className="bongeszes-content">
          <div className="hero-card bongeszes-card">

            <h1 className="bongeszes-title">
              <Filter size={42} /> Könyvek böngészése
            </h1>

            {/* FEHÉR SZŰRŐPANEL */}
            <div className="white-panel filter-panel">
              <div className="filter-header">
                <Filter size={28} className="filter-icon" />
                <h3>Könyvek szűrése</h3>
              </div>

              <div className="form-grid">
                <div className="input-group">
                  <label>Cím</label>
                  <input type="text" name="title" value={filters.title} onChange={handleFilterChange} onKeyDown={handleKeyDown} placeholder="pl. Harry Potter" />
                </div>
                <div className="input-group">
                  <label>Szerző</label>
                  <input type="text" name="author" value={filters.author} onChange={handleFilterChange} onKeyDown={handleKeyDown} placeholder="pl. J.K. Rowling" />
                </div>
                <div className="input-group">
                  <label>Maximum ár (Ft)</label>
                  <input
                    type="text"
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    onKeyDown={handleKeyDown}
                    placeholder="pl. 5000"
                    className="price-input"
                  />
                </div>
              </div>

              <button onClick={handleSearch} className="submit-btn">
                <Search size={24} /> Keresés
              </button>
            </div>

            {/* KÖNYVEK – PROFILOLDAL STÍLUS */}
            <div className="books-list-container">
              {loading && <div className="empty-books"><p>Betöltés...</p></div>}
              {error && <div className="empty-books" style={{color: '#ff6b6b'}}><p><strong>Hiba:</strong> {error}</p></div>}
              {!loading && !error && filteredBooks.length === 0 && (
                <div className="empty-books"><p>Nincs találat a megadott szűrők alapján.</p></div>
              )}

              {!loading && !error && filteredBooks.length > 0 && (
                <div className="books-list">
                  {filteredBooks.map(book => (
                    <div key={book.id} className="book-item">
                      <div className="book-cover">
                        {book.picture ? (
                          <img src={book.picture} alt={book.title}
                            onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/300x450/f0f4ff/667eea?text=Könyv"; }}
                          />
                        ) : (
                          <div className="book-placeholder">
                            <BookOpen size={40} />
                            <span>Nincs kép</span>
                          </div>
                        )}
                      </div>

                      <div className="book-info">
                        <h3 className="book-title">{book.title || 'Nincs cím'}</h3>
                        <p className="book-author"><User size={16} /> {book.author || 'Ismeretlen szerző'}</p>
                        <p className="book-year">
                          <Calendar size={16} /> {book.releaseDate ? new Date(book.releaseDate).getFullYear() : 'N/A'}
                          {' • '}
                          {book.price !== null && book.price !== undefined ? `${Number(book.price).toLocaleString()} Ft` : 'Ár egyeztetendő'}
                        </p>
                        <button className="visibility-btn public">Kölcsönzés kérése</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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