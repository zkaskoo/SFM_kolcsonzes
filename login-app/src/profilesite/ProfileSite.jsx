// src/profilesite/ProfileSite.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ArrowRight, Upload, Wallet, BookOpen, 
  MessageCircle, X, User, Calendar 
} from 'lucide-react';
import './ProfileSite.css';
import avatar from '/src/mainsite/avatar.jpg';

export default function ProfileSite() {
  const navigate = useNavigate();

  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const username = localStorage.getItem('username') || 'Felhasználó';
  const fullName = localStorage.getItem('fullName') || 'Ismeretlen Névtelen';
  const balance = localStorage.getItem('balance') || '0';
  const userId = localStorage.getItem('userId');

  const [userBooks, setUserBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOffers, setShowOffers] = useState(false);

  const tradeOffers = [
    { id: 1, from: "Kata123", bookOffered: "Dűne", bookRequested: "A Gyűrűk Ura", date: "2025.11.20", status: "pending" },
    { id: 2, from: "PetiKönyvFan", bookOffered: "Az éhezők viadala", bookRequested: "1984", date: "2025.11.18", status: "pending" },
    { id: 3, from: "OlvasóMánia", bookOffered: "A Da Vinci-kód", bookRequested: "Az alkimista", date: "2025.11.15", status: "accepted" }
  ];

  // ╔══════════════════════════════════════════════════════════╗
  // ║ EZ A FÜGGVÉNY MINDEN ESETBEN MŰKÖDIK – MÉG 20 MB-OS KÉPPEL IS! ║
  // ╚══════════════════════════════════════════════════════════╝
  const byteArrayToBase64Image = (byteArray) => {
    if (!byteArray || byteArray.length === 0) return null;

    const bytes = new Uint8Array(byteArray);
    let binary = '';
    const chunkSize = 0x8000; // 32KB-os chunkok – így SOHA nem hasal el a btoa()

    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, chunk);
    }

    return `data:image/jpeg;base64,${btoa(binary)}`;
  };

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/');
      return;
    }

    const fetchMyBooks = async () => {
      if (!userId) {
        setError('Hiányzó felhasználói azonosító!');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch('http://localhost:8080/api/v1/books/my-books', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: parseInt(userId, 10) })
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Hiba ${response.status}: ${errText}`);
        }

        const books = await response.json();

        console.log('✅ Könyvek száma:', books.length);
        if (books.length > 0) {
          console.log('📸 Első könyv kép mérete:', books[0].picture?.length, 'byte');
        }

        const formattedBooks = books.map(book => ({
          id: book.id,
          title: book.title || 'Nincs cím',
          author: book.author || 'Ismeretlen szerző',
          year: book.releaseDate ? new Date(book.releaseDate).getFullYear() : 'N/A',
          price: book.price || 0,
          coverImage: `http://localhost:8080/api/v1/books/cover/${book.id}`
        }));

        setUserBooks(formattedBooks);

      } catch (err) {
        console.error('Hiba a könyvek betöltésekor:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyBooks();
  }, [isLoggedIn, userId, navigate]);

  return (
    <div className="profilesite-wrapper">

      {/* Háttérslider */}
      <div className="background-slider">
        <div className="background-image active" style={{ backgroundImage: `url(/src/mainsite/fooldalkep1.png)` }} />
        <div className="background-image" style={{ backgroundImage: `url(/src/mainsite/fooldalkep2.png)` }} />
        <div className="background-image" style={{ backgroundImage: `url(/src/mainsite/fooldalkep3.jpg)` }} />
        <div className="background-image" style={{ backgroundImage: `url(/src/mainsite/fooldalkep4.jpg)` }} />
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
            <button className="profile-btn primary">
              <Wallet size={20} /> Egyenleg feltöltés
            </button>
            <button onClick={() => navigate('/konyv-feltoltes')} className="profile-btn secondary">
              <Upload size={20} /> Könyv feltöltés <ArrowRight size={18} />
            </button>
          </div>

          {/* KÖNYVEIM SZEKCIÓ */}
          <div className="profile-books-section">
            <h2 className="books-title">Könyveim</h2>
            <div className="books-list-container">

              {loading && <div className="empty-books"><p>Betöltés...</p></div>}

              {error && (
                <div className="empty-books" style={{ color: '#ff6b6b' }}>
                  <p><strong>Hiba:</strong> {error}</p>
                  <small>userId: {userId || 'hiányzik'}</small>
                </div>
              )}

              {!loading && !error && userBooks.length === 0 && (
                <div className="empty-books"><p>Még nincs feltöltött könyv</p></div>
              )}

              {!loading && !error && userBooks.length > 0 && (
                <div className="books-list">
                  {userBooks.map(book => (
                    <div key={book.id} className="book-item">
                      <div className="book-cover">
                        {book.coverImage ? (
                          <img 
                            src={book.coverImage}
                            alt={book.title}
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover',
                              borderRadius: '8px'
                            }}
                          />
                        ) : (
                          <div className="book-cover-placeholder">
                            <BookOpen size={32} />
                            <span>Nincs borító</span>
                          </div>
                        )}
                      </div>
                      <div className="book-info">
                        <h3 className="book-title">{book.title}</h3>
                        <p className="book-author">{book.author}</p>
                        <p className="book-year">
                          {book.year} • {book.price} Ft
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* CSERE AJÁNLATOK GOMB */}
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