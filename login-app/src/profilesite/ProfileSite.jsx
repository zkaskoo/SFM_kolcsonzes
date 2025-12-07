// src/profilesite/ProfileSite.jsx – TELJES, TÖRLÉS MŰKÖDIK!

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, Upload, Wallet, 
  MessageCircle, X, User, Calendar, Eye, EyeOff 
} from 'lucide-react';
import './ProfileSite.css';
import avatar from '/src/mainsite/avatar.jpg';

import kep1 from '/src/mainsite/fooldalkep1.png';
import kep2 from '/src/mainsite/fooldalkep2.png';
import kep3 from '/src/mainsite/fooldalkep3.jpg';
import kep4 from '/src/mainsite/fooldalkep4.jpg';

const images = [kep1, kep2, kep3, kep4];

export default function ProfileSite() {
  const navigate = useNavigate();
  const location = useLocation();

  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const username = localStorage.getItem('username') || 'Felhasználó';
  const fullName = localStorage.getItem('fullName') || 'Ismeretlen Névtelen';
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  const [balance, setBalance] = useState(0);
  const [userBooks, setUserBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('private');
  const [showOffers, setShowOffers] = useState(false);
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchBalance = async () => {
    if (!token || !userId) return;
    try {
      const res = await fetch('http://localhost:8080/api/v1/books/balance', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: parseInt(userId) })
      });
      if (res.ok) {
        const data = await res.json();
        setBalance(Math.round(data.money || 0));
        localStorage.setItem('balance', Math.round(data.money || 0).toString());
      }
    } catch (err) { console.error(err); }
  };

  const toggleVisibility = async (bookId, currentIsPublic) => {
    const endpoint = currentIsPublic
      ? 'http://localhost:8080/api/v1/books/changeprivate'
      : 'http://localhost:8080/api/v1/books/changepublic';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId })
      });
      if (res.ok || res.status === 204) fetchBooks(activeTab);
    } catch (err) { console.error(err); }
  };

  // ÚJ: TÖRLÉS FÜGGVÉNY
  // TÖRLÉS FÜGGVÉNY – MOST MÁR HELYESEN KÜLDI AZ ID-T!
const deleteBook = async (bookId) => {
  if (!bookId) {
    alert("Hiba: hiányzó könyv ID!");
    return;
  }

  if (!confirm("Biztosan törölni szeretnéd ezt a könyvet? Ez végleges!")) return;

  try {
    const response = await fetch('http://localhost:8080/api/v1/books/delete', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: bookId })  // FONTOS: { id: bookId }, nem { bookId }!!!
    });

    if (response.ok || response.status === 204) {
      alert("Könyv sikeresen törölve!");
      fetchBooks(activeTab); // Frissítjük a listát
    } else {
      const errorText = await response.text();
      console.error("Törlési hiba:", response.status, errorText);
      alert("Hiba történt a törlés során.");
    }
  } catch (err) {
    console.error("Hálózati hiba a törlésnél:", err);
    alert("Nem sikerült kapcsolódni a szerverhez.");
  }
};

  const fetchBooks = async (type) => {
    if (!token || !userId) { setError('Bejelentkezés szükséges!'); setLoading(false); return; }

    const endpoint = type === 'private'
      ? 'http://localhost:8080/api/v1/books/privatebooks'
      : 'http://localhost:8080/api/v1/books/publicbooks';

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: parseInt(userId) })
      });

      if (response.status === 204) {
        setUserBooks([]);
        setLoading(false);
        return;
      }

      if (!response.ok) throw new Error('Hiba');

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
      setError('Nem sikerült betölteni a könyveket.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn || !token || !userId) { navigate('/'); return; }
    fetchBooks(activeTab);
    fetchBalance();
  }, [isLoggedIn, token, userId, navigate, activeTab]);

  const handleTopUp = () => {
    const amount = parseInt(topUpAmount);
    if (!amount || amount < 100) { alert("Minimum 100 Ft!"); return; }
    navigate("/upload-money", { state: { amount } });
  };

  const tradeOffers = [
    { id: 1, from: "Kata123", bookOffered: "Dűne", bookRequested: "A Gyűrűk Ura", date: "2025.11.20", status: "pending" },
    { id: 2, from: "PetiKönyvFan", bookOffered: "Az éhezőueled viadala", bookRequested: "1984", date: "2025.11.18", status: "pending" },
    { id: 3, from: "OlvasóMánia", bookOffered: "A Da Vinci-kód", bookRequested: "Az alkimista", date: "2025.11.15", status: "accepted" }
  ];

  return (
    <div className="profilesite-wrapper">
      <div className="background-slider">
        {images.map((img, index) => (
          <div key={index} className={`background-image ${index === currentIndex ? 'active' : ''}`} style={{ backgroundImage: `url(${img})` }} />
        ))}
      </div>
        
      <button onClick={() => navigate('/')} className="fixed-back-btn">
        <ArrowLeft size={26} /> Vissza
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
            <span className="balance-amount">{balance.toLocaleString()} Ft</span>
          </div>

          <div className="profile-actions">
            <div className="topup-section">
              <button onClick={() => setShowTopUp(!showTopUp)} className="profile-btn primary">
                <Wallet size={20} /> Egyenleg feltöltés
              </button>
              {showTopUp && (
                <div onClick={(e) => e.stopPropagation()} className="topup-dropdown">
                  <div className="topup-content">
                    <button onClick={() => setShowTopUp(false)} className="topup-close"><X size={22} /></button>
                    <h3>Egyenleg feltöltés</h3>
                    <input type="number" placeholder="Összeg (Ft)" value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)} className="topup-input" min="100" />
                    <button onClick={handleTopUp} className="topup-pay-btn">Tovább a fizetéshez</button>
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
              <button className={`tab-btn ${activeTab === 'private' ? 'active' : ''}`} onClick={() => setActiveTab('private')}>
                <EyeOff size={18} /> Privát könyveim
              </button>
              <button className={`tab-btn ${activeTab === 'public' ? 'active' : ''}`} onClick={() => setActiveTab('public')}>
                <Eye size={18} /> Publikus könyveim
              </button>
            </div>

            <div className="books-list-container">
              {loading && <div className="empty-books"><p>Betöltés...</p></div>}
              {error && <div className="empty-books" style={{color: '#ff6b6b'}}><p><strong>Hiba:</strong> {error}</p></div>}
              {!loading && !error && userBooks.length === 0 && (
                <div className="empty-books"><p>{activeTab === 'private' ? 'Nincs privát könyved!' : 'Nincs publikus könyved!'}</p></div>
              )}

              {!loading && !error && userBooks.length > 0 && (
                <div className="books-list">
                  {userBooks.map(book => (
                    <div key={book.id} className="book-item">
                      <div className="book-cover">
                        <img src={book.coverImage} alt={book.title} onError={(e) => e.target.src = '/placeholder-book.jpg'} />
                      </div>

                      <div className="book-info-container">
                        <div className="book-details">
                          <div className="book-info-row"><strong>Cím:</strong> {book.title}</div>
                          <div className="book-info-row"><strong>Szerző:</strong> {book.author}</div>
                          <div className="book-info-row"><strong>Év:</strong> {book.year}</div>
                          <div className="book-info-row book-price"><strong>Ár:</strong> {book.price.toLocaleString()} Ft</div>
                        </div>

                        <div className="book-actions">
                          <button
                            className={`visibility-btn ${book.isPublic ? 'private' : 'public'}`}
                            onClick={() => toggleVisibility(book.id, book.isPublic)}
                          >
                            {book.isPublic ? (
                              <>Priváttá tétel <EyeOff size={16} style={{ marginLeft: '8px' }} /></>
                            ) : (
                              <>Publikussá tétel <Eye size={16} style={{ marginLeft: '8px' }} /></>
                            )}
                          </button>

                          {/* TÖRLÉS GOMB – MOST MÁR MŰKÖDIK! */}
                          <button className="delete-btn" onClick={() => deleteBook(book.id)}>
                            Tétel törlése
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CSERE AJÁNLATOK */}
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
      <footer className="mainsite-footer">
        <p>© 2025 GitPush-F • Minden jog fenntartva</p>
      </footer>
    </div>
  );
}