// src/profilesite/ProfileSite.jsx – HÁTTÉRKÉPEK AUTOMATIKUSAN VÁLTAKOZNAK (PONT NÉLKÜL!)
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Upload, Wallet, 
  MessageCircle, X, User, Calendar, Eye, EyeOff 
} from 'lucide-react';
import './ProfileSite.css';
import avatar from '/src/mainsite/avatar.jpg';

// KÉPEK IMPORTJA
import kep1 from '/src/mainsite/fooldalkep1.png';
import kep2 from '/src/mainsite/fooldalkep2.png';
import kep3 from '/src/mainsite/fooldalkep3.jpg';
import kep4 from '/src/mainsite/fooldalkep4.jpg';

const images = [kep1, kep2, kep3, kep4];

export default function ProfileSite() {
  const navigate = useNavigate();

  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const username = localStorage.getItem('username') || 'Felhasználó';
  const fullName = localStorage.getItem('fullName') || 'Ismeretlen Névtelen';
  const balance = localStorage.getItem('balance') || '0';
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  const [userBooks, setUserBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('private');
  const [showOffers, setShowOffers] = useState(false);
  const [showTopUp, setShowTopUp] = useState(false);

  // HÁTTÉRKÉP AUTOMATIKUS VÁLTÁSA – 5 másodpercenként
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const tradeOffers = [
    { id: 1, from: "Kata123", bookOffered: "Dűne", bookRequested: "A Gyűrűk Ura", date: "2025.11.20", status: "pending" },
    { id: 2, from: "PetiKönyvFan", bookOffered: "Az éhezők viadala", bookRequested: "1984", date: "2025.11.18", status: "pending" },
    { id: 3, from: "OlvasóMánia", bookOffered: "A Da Vinci-kód", bookRequested: "Az alkimista", date: "2025.11.15", status: "accepted" }
  ];

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  const toggleVisibility = async (bookId, currentIsPublic) => {
    const endpoint = currentIsPublic
      ? 'http://localhost:8080/api/v1/books/changeprivate'
      : 'http://localhost:8080/api/v1/books/changepublic';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({ bookId })
      });

      if (res.ok || res.status === 204) {
        fetchBooks(activeTab);
      } else {
        alert('Hiba a láthatóság váltásakor!');
      }
    } catch (err) {
      console.error('Láthatóság váltás hiba:', err);
    }
  };

  const fetchBooks = async (type) => {
    if (!token || !userId) {
      setError('Nincs bejelentkezve vagy hiányzik a felhasználói azonosító!');
      setLoading(false);
      return;
    }

    const endpoint = type === 'private'
      ? 'http://localhost:8080/api/v1/books/privatebooks'
      : 'http://localhost:8080/api/v1/books/publicbooks';

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({ userId: parseInt(userId) })
      });

      if (response.status === 204) {
        setUserBooks([]);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          alert('Lejárt a bejelentkezés!');
          localStorage.clear();
          navigate('/');
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const books = await response.json();

      const formatted = books.map(book => ({
        id: book.id,
        title: book.title || 'Nincs cím',
        author: book.author || 'Ismeretlen szerző',
        year: book.releaseDate ? new Date(book.releaseDate).getFullYear() : 'N/A',
        price: book.price || 0,
        coverImage: `http://localhost:8080/api/v1/books/cover/${book.id}`,
        isPublic: !book.private
      }));

      setUserBooks(formatted);

    } catch (err) {
      console.error('Hiba a könyvek betöltésekor:', err);
      setError('Nem sikerült betölteni a könyveket. Ellenőrizd a szervert vagy a bejelentkezést.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn || !token || !userId) {
      navigate('/');
      return;
    }
    fetchBooks(activeTab);
  }, [isLoggedIn, token, userId, navigate, activeTab]);

  return (
    <div className="profilesite-wrapper">

      {/* HÁTTÉRKÉPEK – AUTOMATIKUS VÁLTÁS, PONT NÉLKÜL */}
      <div className="background-slider">
        {images.map((img, index) => (
          <div
            key={index}
            className={`background-image ${index === currentIndex ? 'active' : ''}`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}
      </div>

      <button onClick={() => navigate('/')} className="fixed-back-btn">
        <ArrowLeft size={26} /> Vissza a főoldalra
      </button>

      <div className="profile-container">
        <div className="profile-card">

          <div className="profile-avatar">
            <img src={avatar} alt="Profilkép" className="profile-avatar-img" />
          </div>

          <h1 className="profile-username">{username}</h1>
          <p className="profile-fullname">{fullName}</p>

          <div className="profile-balance">
            <Wallet size={22} />
            <span className="balance-amount">{balance} Ft</span>
          </div>

          <div className="profile-actions">
            <div className="topup-section">
              <button 
                onClick={() => setShowTopUp(!showTopUp)} 
                className="profile-btn primary"
              >
                <Wallet size={20} /> Egyenleg feltöltés
              </button>

              {showTopUp && (
                <div className="topup-dropdown">
                  <div className="topup-content">
                    <button 
                      onClick={() => setShowTopUp(false)} 
                      className="topup-close"
                    >
                      <X size={22} />
                    </button>
                    <h3>Egyenleg feltöltés</h3>
                    <input 
                      type="number" 
                      placeholder="Összeg (Ft)" 
                      className="topup-input"
                    />
                    <button className="topup-pay-btn">
                      Fizetés
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button onClick={() => navigate('/konyv-feltoltes')} className="profile-btn secondary">
              <Upload size={20} /> Könyv feltöltés
            </button>
          </div>

          <div className="profile-books-section">
            <h2 className="books-title">Könyveim</h2>

            <div className="books-tabs">
              <button 
                className={`tab-btn ${activeTab === 'private' ? 'active' : ''}`} 
                onClick={() => setActiveTab('private')}
              >
                <EyeOff size={18} /> Privát könyveim
              </button>
              <button 
                className={`tab-btn ${activeTab === 'public' ? 'active' : ''}`} 
                onClick={() => setActiveTab('public')}
              >
                <Eye size={18} /> Publikus könyveim
              </button>
            </div>

            <div className="books-list-container">
              {loading && <div className="empty-books"><p>Betöltés...</p></div>}

              {error && (
                <div className="empty-books" style={{color: '#ff6b6b'}}>
                  <p><strong>Hiba:</strong> {error}</p>
                </div>
              )}

              {!loading && !error && userBooks.length === 0 && (
                <div className="empty-books" style={{fontSize: '18px', color: '#999', fontStyle: 'italic', padding: '60px 20px', textAlign: 'center'}}>
                  <p>
                    {activeTab === 'private' 
                      ? 'Nem rendelkezik privát könyvekkel!' 
                      : 'Nem rendelkezik publikus könyvekkel!'
                    }
                  </p>
                </div>
              )}

              {!loading && !error && userBooks.length > 0 && (
                <div className="books-list">
                  {userBooks.map(book => (
                    <div key={book.id} className="book-item">
                      <div className="book-cover">
                        <img 
                          src={book.coverImage} 
                          alt={book.title}
                          style={{width:'100%', height:'100%', objectFit:'cover', borderRadius:'12px'}}
                          onError={(e) => e.target.src = '/placeholder-book.jpg'}
                        />
                      </div>
                      <div className="book-info">
                        <h3 className="book-title">{book.title}</h3>
                        <p className="book-author">{book.author}</p>
                        <p className="book-year">{book.year} • {book.price} Ft</p>
                        
                        <button
                          className={`visibility-btn ${book.isPublic ? 'private' : 'public'}`}
                          onClick={() => toggleVisibility(book.id, book.isPublic)}
                        >
                          {book.isPublic 
                            ? <>Priváttá tétel <EyeOff size={16}/></>
                            : <>Publikussá tétel <Eye size={16}/></>
                          }
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="messages-button-container">
        <button onClick={() => setShowOffers(!showOffers)} className="messages-button">
          <MessageCircle size={28} />
          {tradeOffers.length > 0 && <span className="messages-badge">{tradeOffers.length}</span>}
        </button>

        {showOffers && (
          <div className="trade-offers-dropdown">
            <div className="trade-offers-header">
              <h3>Bejövő csereajánlatok</h3>
              <button onClick={() => setShowOffers(false)} className="close-offers">
                <X size={20} />
              </button>
            </div>
            <div className="trade-offers-list">
              {tradeOffers.map(offer => (
                <div key={offer.id} className="trade-offer-item">
                  <div className="offer-from">
                    <User size={18} /><strong>{offer.from}</strong>
                  </div>
                  <div className="offer-details">
                    <p><strong>{offer.bookOffered}</strong> → <strong>{offer.bookRequested}</strong></p>
                    <small><Calendar size={14} /> {offer.date}</small>
                  </div>
                  <div className="offer-status">
                    {offer.status === 'pending' 
                      ? <span className="status-pending">Függőben</span>
                      : <span className="status-accepted">Elfogadva</span>
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}