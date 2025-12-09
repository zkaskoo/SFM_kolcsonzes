// src/bongeszes/Bongeszes.jsx – TELJES, VÉGLEGES, KIVÁLASZT GOMB KÖZÉPEN!

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
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const username = localStorage.getItem("username") || "Felhasználó";
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const [filters, setFilters] = useState({ title: '', author: '', maxPrice: '' });

  const [showTradeModal, setShowTradeModal] = useState(false);
  const [selectedBookForTrade, setSelectedBookForTrade] = useState(null);
  const [myBooks, setMyBooks] = useState([]);
  const [loadingMyBooks, setLoadingMyBooks] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
    window.location.reload();
  };

  useEffect(() => {
    document.title = "SFM Könyvportál";
  }, []);

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

    const fetchOthersBooks = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/v1/books/others', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: parseInt(userId) })
        });

        if (!response.ok) throw new Error('Hiba a szerverrel');

        const data = await response.json();

        const onlyOthersPublic = data.filter(book => {
          const ownerId = book.userId || book.user?.id;
          const isPrivate = book.private === true || book.isPrivate === true;
          const isMyBook = ownerId && parseInt(ownerId) === parseInt(userId);
          return !isPrivate && !isMyBook;
        });

        setBooks(onlyOthersPublic);
        setFilteredBooks(onlyOthersPublic);
      } catch (err) {
        console.error("Betöltési hiba:", err);
        setError("Nem sikerült betölteni a könyveket.");
      } finally {
        setLoading(false);
      }
    };

    fetchOthersBooks();
  }, [isLoggedIn, userId]);

  const loadMyBooksForTrade = async () => {
    if (myBooks.length > 0 && !loadingMyBooks) return;

    setLoadingMyBooks(true);
    try {
      const [privateRes, publicRes] = await Promise.all([
        fetch('http://localhost:8080/api/v1/books/privatebooks', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: parseInt(userId) })
        }),
        fetch('http://localhost:8080/api/v1/books/publicbooks', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: parseInt(userId) })
        })
      ]);

      const privateBooks = privateRes.ok && privateRes.status !== 204 ? await privateRes.json() : [];
      const publicBooks = publicRes.ok && publicRes.status !== 204 ? await publicRes.json() : [];

      const allMyBooks = [...privateBooks, ...publicBooks].map(book => ({
        id: book.id,
        title: book.title || 'Nincs cím',
        author: book.author || 'Ismeretlen szerző',
        picture: book.picture && book.picture.startsWith('data:')
          ? book.picture
          : `http://localhost:8080/api/v1/books/cover/${book.id}`,
        price: book.price,
        releaseDate: book.releaseDate
      }));

      setMyBooks(allMyBooks);
    } catch (err) {
      console.error("Saját könyvek betöltése sikertelen:", err);
    } finally {
      setLoadingMyBooks(false);
    }
  };

  const handleSearch = async () => {
    if (!filters.title.trim() && !filters.author.trim() && !filters.maxPrice) {
      setFilteredBooks(books);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8080/api/v1/books/filter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: parseInt(userId),
          title: filters.title.trim() || null,
          author: filters.author.trim() || null,
          maximumPrice: filters.maxPrice ? parseInt(filters.maxPrice) : null
        })
      });

      if (!response.ok) throw new Error('Szűrés sikertelen');

      const data = await response.json();

      const safeResults = data.filter(book => {
        const ownerId = book.userId || book.user?.id;
        const isPrivate = book.private === true || book.isPrivate === true;
        const isMyBook = ownerId && parseInt(ownerId) === parseInt(userId);
        return !isPrivate && !isMyBook;
      });

      setFilteredBooks(safeResults);
    } catch (err) {
      console.error(" Hiba:", err);
      setError("Nem sikerült betölteni a könyveket");
      setFilteredBooks(books);
    } finally {
      setLoading(false);
    }
  };

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
          <div className="topbar-logo">
            <BookOpen size={32} />
            <h2>SFM Könyvportál Rendszer</h2>
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

      <button onClick={() => navigate(-1)} className="fixed-back-btn">
        <ArrowLeft size={26} /> Vissza
      </button>

      <section className="bongeszes-hero">
        <div className="bongeszes-content">
          <div className="hero-card bongeszes-card">

            <h1 className="bongeszes-title">Könyvek böngészése</h1>

            <div className="white-panel filter-panel">
              <div className="filter-header">
                <Filter size={28} className="filter-icon" />
                <h3>Könyvek szűrése</h3>
              </div>

              <div className="form-grid">
                <div className="input-group">
                  <label>Cím</label>
                  <input type="text" name="title" value={filters.title} onChange={handleFilterChange} onKeyDown={handleKeyDown} placeholder="Adja meg a könyv címét!" />
                </div>
                <div className="input-group">
                  <label>Szerző</label>
                  <input type="text" name="author" value={filters.author} onChange={handleFilterChange} onKeyDown={handleKeyDown} placeholder="Adja meg a szerzőt!" />
                </div>
                <div className="input-group">
                  <label>Maximális ár (Ft)</label>
                  <input
                    type="text"
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Adja meg a maximális árat!"
                  />
                </div>
              </div>

              <button onClick={handleSearch} className="submit-btn">
                <Search size={24} /> Keresés
              </button>
            </div>

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
                          <img 
                            src={book.picture.startsWith('data:') ? book.picture : `http://localhost:8080/api/v1/books/cover/${book.id}`}
                            alt={book.title}
                            onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder-book.jpg'; }}
                          />
                        ) : (
                          <div className="book-placeholder">
                            <BookOpen size={40} />
                            <span>Nincs kép</span>
                          </div>
                        )}
                      </div>

                      <div className="book-details">
                        <div className="book-info-row"><strong>Cím:</strong> {book.title || 'Nincs cím'}</div>
                        <div className="book-info-row"><strong>Szerző:</strong> {book.author || 'Ismeretlen szerző'}</div>
                        <div className="book-info-row"><strong>Év:</strong> {book.releaseDate ? new Date(book.releaseDate).getFullYear() : 'N/A'}</div>
                        <div className="book-info-row book-price"><strong>Ár:</strong> {book.price ? `${Number(book.price).toLocaleString()} Ft` : 'Ár egyeztetendő'}</div>
                      </div>

                      <div className="book-actions">
                        <button 
                          className="trade-btn"
                          onClick={() => {
                            setSelectedBookForTrade({
                              ...book,
                              picture: book.picture && book.picture.startsWith('data:')
                                ? book.picture
                                : `http://localhost:8080/api/v1/books/cover/${book.id}`
                            });
                            loadMyBooksForTrade();
                            setShowTradeModal(true);
                          }}
                        >
                          Csereajánlat küldése
                        </button>
                        <button className="buy-btn">
                          Vásárlás
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* CSEREAJÁNLAT MODAL – KIVÁLASZT GOMB KÖZÉPEN! */}
      {showTradeModal && (
        <div className="modal-overlay" onClick={() => setShowTradeModal(false)}>
          <div className="trade-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowTradeModal(false)}>×</button>

            <h2>Csereajánlat küldése</h2>
            <p className="modal-subtitle">
              Válassza ki, melyik saját könyvét kínálja fel cserébe:
            </p>

            <div className="modal-target-book">
              <div className="book-cover">
                <img 
                  src={selectedBookForTrade?.picture || '/placeholder-book.jpg'} 
                  alt={selectedBookForTrade?.title}
                  onError={(e) => e.target.src = '/placeholder-book.jpg'}
                />
              </div>
              <div className="book-details">
                <div className="book-info-row"><strong>Cím:</strong> {selectedBookForTrade?.title || 'Nincs cím'}</div>
                <div className="book-info-row"><strong>Szerző:</strong> {selectedBookForTrade?.author || 'Ismeretlen szerző'}</div>
                <div className="book-info-row"><strong>Év:</strong> {selectedBookForTrade?.releaseDate ? new Date(selectedBookForTrade.releaseDate).getFullYear() : 'N/A'}</div>
                <div className="book-info-row book-price"><strong>Ár:</strong> {selectedBookForTrade?.price ? `${Number(selectedBookForTrade.price).toLocaleString()} Ft` : 'Ár egyeztetendő'}</div>
              </div>
            </div>

            <h3 className="my-books-title">Saját könyveim</h3>

            <div className="modal-my-books-scroll">
              {loadingMyBooks ? (
                <p className="empty-text">Betöltés...</p>
              ) : myBooks.length === 0 ? (
                <p className="empty-text">Nincs egyetlen saját könyve sem.</p>
              ) : (
                myBooks.map(myBook => (
                  <div key={myBook.id} className="book-item my-book-item">
                    <div className="book-cover">
                      <img 
                        src={myBook.picture || '/placeholder-book.jpg'} 
                        alt={myBook.title}
                        onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder-book.jpg'; }}
                      />
                    </div>

                    <div className="book-details">
                      <div className="book-info-row"><strong>Cím:</strong> {myBook.title}</div>
                      <div className="book-info-row"><strong>Szerző:</strong> {myBook.author}</div>
                      <div className="book-info-row"><strong>Év:</strong> {myBook.releaseDate ? new Date(myBook.releaseDate).getFullYear() : 'N/A'}</div>
                      <div className="book-info-row book-price"><strong>Ár:</strong> {myBook.price ? `${Number(myBook.price).toLocaleString()} Ft` : 'Ár egyeztetendő'}</div>
                    </div>

                    {/* KIVÁLASZT GOMB – FÜGGŐLEGESEN KÖZÉPEN, SZÉPEN! */}
                    <div className="book-actions my-book-actions-centered">
                      <button className="trade-btn">
                        Kiválaszt
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <footer className="mainsite-footer">
        <p>© 2025 GitPush-F • Minden jog fenntartva</p>
      </footer>
    </div>
  );
}