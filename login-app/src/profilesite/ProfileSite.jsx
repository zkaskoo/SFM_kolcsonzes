// src/profilesite/ProfileSite.jsx – TELJES, VÉGLEGES, SZINTAKTIKAILAG HELYES!

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const username = localStorage.getItem('username') || "Felhasználó";
  const fullName = localStorage.getItem('fullName');
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  const [balance, setBalance] = useState(0);
  const [userBooks, setUserBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('private');
  const [showOffers, setShowOffers] = useState(false);
  const [offerTab, setOfferTab] = useState('incoming');
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  // CSERE AJÁNLATOK
  const [incomingOffers, setIncomingOffers] = useState([]);
  const [outgoingOffers, setOutgoingOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineOfferId, setDeclineOfferId] = useState(null);

  useEffect(() => {
    document.title = "SFM Könyvportál";
  }, []);

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

  const deleteBook = async (bookId) => {
    if (!bookId || !confirm("Biztosan törölni szeretnéd ezt a könyvet? Ez végleges!")) return;

    try {
      const response = await fetch('http://localhost:8080/api/v1/books/delete', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: bookId })
      });

      if (response.ok || response.status === 204) {
        alert("Könyv sikeresen törölve!");
        fetchBooks(activeTab);
      } else {
        alert("Hiba történt a törlés során.");
      }
    } catch (err) {
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
        coverImage: `http://localhost:8080/api/v1/books/cover/${book.id}?t=${Date.now()}`,
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

  const handleSellerShip = async (offerId) => {
    await fetch(`http://localhost:8080/api/v1/trade/ship/seller/${offerId}`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` }
    });
    fetchTradeOffers();
  };

  const handleBuyerShip = async (offerId) => {
    await fetch(`http://localhost:8080/api/v1/trade/ship/buyer/${offerId}`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` }
    });
    fetchTradeOffers();
  };

  const handleSellerConfirm = async (offerId) => {
    await fetch(`http://localhost:8080/api/v1/trade/confirm/seller/${offerId}`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` }
    });
    fetchTradeOffers();
  };

  const handleBuyerConfirm = async (offerId) => {
    await fetch(`http://localhost:8080/api/v1/trade/confirm/buyer/${offerId}`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` }
    });
    fetchTradeOffers();
  };

  const handleSellerAccept = async (offerId) => {
    await fetch(`http://localhost:8080/api/v1/trade/accept/seller/${offerId}`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` }
    });

    fetchTradeOffers(); // frissítés
  };


  const handleTopUp = () => {
    const amount = parseInt(topUpAmount);
    if (!amount || amount < 100) { alert("Minimum 100 Ft!"); return; }
    navigate("/upload-money", { state: { amount } });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (showOffers) fetchTradeOffers();
    }, 3000);

    return () => clearInterval(interval);
  }, [showOffers]);

  // CSERE AJÁNLATOK LEKÉRÉSE
  const fetchTradeOffers = async () => {
    if (!token) return;
    setLoadingOffers(true);

    try {
      const [incRes, outRes] = await Promise.all([
        fetch(`http://localhost:8080/api/v1/trade/incoming?userId=${userId}`),
        fetch(`http://localhost:8080/api/v1/trade/outgoing?userId=${userId}`)
      ]);

      if (incRes.ok) setIncomingOffers(await incRes.json());
      if (outRes.ok) setOutgoingOffers(await outRes.json());
    } catch (err) {
      console.error("Ajánlatok betöltése sikertelen:", err);
    } finally {
      setLoadingOffers(false);
    }
  };

  const handleMarkShipped = async (offerId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/v1/trade/ship/${offerId}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) throw new Error();

      alert("Csomag feladva!");
      fetchTradeOffers(); // frissítse az ajánlatokat

    } catch {
      alert("Nem sikerült feladottnak jelölni.");
    }
  };


  const handleAccept = async (offerId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/v1/trade/accept/${offerId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert("Csere elfogadva! A könyv most már a tiéd!");
        fetchTradeOffers();
        fetchBooks(activeTab);
      } else {
        alert("Hiba történt az elfogadáskor");
      }
    } catch {
      alert("Nem sikerült elfogadni");
    }
  };

  const handleDecline = async (offerId) => {
    try {
          const res = await fetch(
              `http://localhost:8080/api/v1/trade/decline/${offerId}?userId=${userId}`,
              { method: 'POST' }
          );

          if (res.ok) {
              fetchTradeOffers();
          } else {
              const t = await res.text();
              alert(t);
          }
      } catch {
          alert("Hiba történt az elutasítás során.");
    }
};



  const openOffers = () => {
    fetchTradeOffers();
    setShowOffers(true);
  };

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
              <button className={`books-tab-btn ${activeTab === 'private' ? 'active' : ''}`} onClick={() => setActiveTab('private')}>
                <EyeOff size={18} /> Privát könyveim
              </button>
              <button className={`books-tab-btn ${activeTab === 'public' ? 'active' : ''}`} onClick={() => setActiveTab('public')}>
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

      {/* CSERE AJÁNLATOK – KÜLÖN FÜL STÍLUSSAL */}
      <div className="messages-button-container">
        <button onClick={openOffers} className="messages-button">
          <MessageCircle size={28} />
          {(incomingOffers.length + outgoingOffers.length) > 0 && 
            <span className="messages-badge">{incomingOffers.length + outgoingOffers.length}</span>
          }
        </button>

        {showOffers && (
          <div className="trade-offers-dropdown">
            <div className="trade-offers-header">
              <h3>Csereajánlatok</h3>
              <button onClick={() => setShowOffers(false)} className="close-offers">
                <X size={20} />
              </button>
            </div>

            {/* KÜLÖN FÜLEK */}
            <div className="offer-tabs">
              <button 
                className={`offer-tab-btn ${offerTab === 'incoming' ? 'offer-tab-active' : 'offer-tab-passive'}`}
                onClick={() => setOfferTab('incoming')}
              >
                Bejövő ({incomingOffers.length})
              </button>
              <button 
                className={`offer-tab-btn ${offerTab === 'outgoing' ? 'offer-tab-active' : 'offer-tab-passive'}`}
                onClick={() => setOfferTab('outgoing')}
              >
                Kimenő ({outgoingOffers.length})
              </button>
            </div>

            <div className="trade-offers-list">
              {loadingOffers ? (
                <p className="empty-text">Betöltés...</p>
              ) : offerTab === 'incoming' && incomingOffers.length === 0 ? (
                <p className="empty-text">Nincs bejövő ajánlatod</p>
              ) : offerTab === 'outgoing' && outgoingOffers.length === 0 ? (
                <p className="empty-text">Nincs kimenő ajánlatod</p>
              ) : (
                (offerTab === 'incoming' ? incomingOffers : outgoingOffers).map(offer => (
                  <div key={offer.id} className="trade-offer-item">
                    <div className="offer-header">
                      <div className="offer-from">
                        <User size={18} />
                        <strong>{offer.from}</strong>
                      </div>
                      <small><Calendar size={14} /> {offer.date}</small>
                    </div>

                      {offerTab === "incoming" && (
                      <>

                        {/* ======== FIZETÉS ======== */}
                        {offer.pay === true && (
                          <>

                            {/* 1. Seller még nem postázott */}
                            {!offer.sellerShipped && (
                              <button
                                onClick={() => handleSellerShip(offer.id)}
                                className="accept-btn"
                              >
                                Csomag feladása
                              </button>
                            )}

                            {/* 2. Seller postázott, buyer még nem igazolt */}
                            {offer.sellerShipped && !offer.buyerConfirmed && (
                              <div className="offer-status offer-status-pending">
                                Ön feladta a csomagot. Várakozás a vevő visszaigazolására.
                              </div>
                            )}

                            {/* 3. Buyer visszaigazolta → kész */}
                            {offer.buyerConfirmed && (
                              <div className="offer-status offer-status-complete">
                                A vevő visszaigazolta az átvételt. A fizetés megtörtént.
                              </div>
                            )}

                          </>
                        )}

                        {/* ======== CSERE ======== */}
                        {offer.pay === false && (
                          <>

                            {/* 1. Seller még nem postázott */}
                            {offer.sellerAccept === true && offer.sellerShipped === false && (
                              <button
                                onClick={() => handleSellerShip(offer.id)}
                                className="accept-btn"
                              >
                                Csomag feladása
                              </button>
                            )}

                            {offerTab === "incoming" && offer.pay === false && offer.sellerAccept === false && (
                              <button
                                onClick={() => handleSellerAccept(offer.id)}
                                className="accept-btn"
                              >
                                Elfogadás
                              </button>
                            )}


                            {offerTab === "incoming" && offer.pay === false && offer.sellerAccept == false && (
                              <button
                                  onClick={() => handleDecline(offer.id)}
                                  className="decline-btn"
                              >
                                  Elutasítás
                              </button>
                            )}


                            {/* 2. Seller postázott, buyer még nem */}
                            {offer.sellerShipped && !offer.buyerShipped && (
                              <div className="offer-status offer-status-pending">
                                Ön feladta a csomagot. Várakozás a vevőre.
                              </div>
                            )}

                            {/* 3. Mindketten postáztak → sellernek vissza kell igazolnia */}
                            {offer.sellerShipped && offer.buyerShipped && !offer.sellerConfirmed && (
                              <button
                                onClick={() => handleSellerConfirm(offer.id)}
                                className="accept-btn"
                              >
                                Kézbesítés visszaigazolása
                              </button>
                            )}

                            {/* 4. Seller visszaigazolta */}
                            {offer.sellerConfirmed && (
                              <div className="offer-status offer-status-pending">
                                Ön visszaigazolta a kézbesítést.
                              </div>
                            )}

                          </>
                        )}

                      </>
                    )}

                    {offerTab === "outgoing" && (
                    <>

                      {/* ======== FIZETÉS ======== */}
                      {offer.pay === true && (
                        <>

                          {/* 1. Seller még nem postázott */}
                          {!offer.sellerShipped && (
                            <div className="offer-status offer-status-pending">
                              Az eladó még nem postázta a csomagot.
                            </div>
                          )}

                          {/* 2. Seller postázott → buyer visszaigazol */}
                          {offer.sellerShipped && !offer.buyerConfirmed && (
                            <button
                              onClick={() => handleBuyerConfirm(offer.id)}
                              className="accept-btn"
                            >
                              Megérkezett
                            </button>
                          )}

                          {/* 3. Buyer visszaigazolta */}
                          {offer.buyerConfirmed && (
                            <div className="offer-status offer-status-complete">
                              A csomag átvétele sikeresen visszaigazolva.
                            </div>
                          )}

                        </>
                      )}

                      {/* ======== CSERE ======== */}
                      {offer.pay === false && (
                        <>

                          {/* 1. buyer még nem postázott */}
                          {offer.sellerAccept === true && offer.buyerShipped === false && (
                            <button
                              onClick={() => handleBuyerShip(offer.id)}
                              className="accept-btn"
                            >
                              Csomag feladása
                            </button>
                          )}

                          {/* 2. buyer postázott, seller még nem */}
                          {offer.buyerShipped && !offer.sellerShipped && (
                            <div className="offer-status offer-status-pending">
                              Ön feladta a csomagot. Várakozás az eladóra.
                            </div>
                          )}

                          {/* 3. mindketten postáztak → buyer visszaigazol */}
                          {offer.buyerShipped && offer.sellerShipped && !offer.buyerConfirmed && (
                            <button
                              onClick={() => handleBuyerConfirm(offer.id)}
                              className="accept-btn"
                            >
                              Megérkezett
                            </button>
                          )}

                          {/* 4. buyer visszaigazolta */}
                          {offer.buyerConfirmed && (
                            <div className="offer-status offer-status-pending">
                              Ön visszaigazolta a kézbesítést.
                            </div>
                          )}

                        </>
                      )}

                    </>
                  )}



                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {showDeclineModal && (
        <div className="modal-overlay" onClick={() => setShowDeclineModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>

            <h2>Biztosan elutasítod?</h2>
            <p>Ha elutasítod, az ajánlat végleg törlődik.</p>

            <div className="modal-actions">
              <button 
                className="modal-cancel"
                onClick={() => setShowDeclineModal(false)}
              >
                Mégse
              </button>

              <button 
                className="modal-confirm"
                onClick={() => {
                  handleDecline(declineOfferId);
                  setShowDeclineModal(false);
                }}
              >
                Igen, töröld
              </button>
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