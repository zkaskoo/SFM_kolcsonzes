// src/components/AddBalance.jsx
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./uploadMoney.css";

import kep1 from '/src/mainsite/fooldalkep1.png';
import kep2 from '/src/mainsite/fooldalkep2.png';
import kep3 from '/src/mainsite/fooldalkep3.jpg';
import kep4 from '/src/mainsite/fooldalkep4.jpg';

export default function AddBalance() {
  const navigate = useNavigate();
  const location = useLocation();
  const amount = location.state?.amount || 0;

  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const images = [kep1, kep2, kep3, kep4];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (amount === 0) navigate("/profile");
  }, [amount, navigate]);

  const handlePayment = async () => {
    setError("");
    setIsLoading(true);

    // Frontend validáció
    if (cardNumber.replace(/\s/g, "").length !== 16) { setError("A kártyaszám 16 számjegy kell, hogy legyen!"); setIsLoading(false); return; }
    if (cardName.trim().length < 3) { setError("A kártyatulajdonos neve túl rövid!"); setIsLoading(false); return; }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) { setError("A lejárati dátum formátuma: MM/YY!"); setIsLoading(false); return; }
    if (cvv.length !== 3) { setError("A CVC kód 3 számjegy kell, hogy legyen!"); setIsLoading(false); return; }

    const email = localStorage.getItem("email") || "demo@sfm.hu";
    const token = localStorage.getItem("token");

    const payload = {
      email,
      cardNumber: cardNumber.replace(/\s/g, ""),
      expirationDate: expiry,
      cvcCode: cvv,
      money: amount
    };

    try {
      const response = await fetch("http://localhost:8080/api/v1/user/top-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      // A válasz szövegének beolvasása (ha nem JSON)
      const responseText = await response.text();

      if (response.ok) {
        setIsSuccess(true);
        
        // ⭐ MÓDOSÍTÁS: Navigáció az egyedi refreshKey-vel
        setTimeout(() => navigate("/profile", { state: { refreshKey: Date.now() } }), 3000);
      } else {
        setError(responseText || "Ismeretlen hiba történt a szerveren!");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Hálózati hiba:", err);
      setError("Nem sikerült csatlakozni a szerverhez!");
      setIsLoading(false);
    }
    
  };

  const handleCancel = () => navigate("/profile");

  const isFormValid = 
    cardNumber.replace(/\s/g, "").length === 16 &&
    cardName.trim().length >= 3 &&
    expiry.length === 5 &&
    cvv.length === 3;

  // SIKERES FIZETÉS KÉPERNYŐ
  if (isSuccess) {
    return (
      <div className="pay-wrapper success-mode">
        <div className="background-slider">
          {images.map((img, index) => (
            <div 
              key={index} 
              className={`background-image ${index === currentIndex ? "active" : ""}`} 
              style={{ backgroundImage: `url(${img})` }} 
            />
          ))}
        </div>
        <div className="success-container">
          <div className="success-card">
            <div className="success-checkmark">Checkmark</div>
            <h2>Sikeres fizetés!</h2>
            <p>{amount.toLocaleString()} Ft került jóváírásra az egyenlegeden.</p>
            <small>Visszairányítás 3 másodperc múlva...</small>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pay-wrapper">
      <div className="background-slider">
        {images.map((img, index) => (
          <div key={index} className={`background-image ${index === currentIndex ? "active" : ""}`} style={{ backgroundImage: `url(${img})` }} />
        ))}
      </div>

      <div className="glass-panel">
        <h2 className="title">Kártyaadatok megadása</h2>
        <p className="subtitle">
          Nem szükséges valós kártyaadatokat megadnia! • <strong>{amount.toLocaleString()} Ft</strong>
        </p>

        <div className="card-front card">
          <div className="chip"></div>
          <input className="card-input card-number" type="text" placeholder="0000 0000 0000 0000" value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value.replace(/[^\d]/g, "").replace(/(.{4})/g, "$1 ").trim().slice(0,19))} maxLength="19" />
          <div className="info-row">
            <div>
              <span className="info-label">Kártyatulajdonos</span>
              <input className="card-input" type="text" value={cardName} placeholder="Teljes név"
                onChange={(e) => setCardName(e.target.value.replace(/[^A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű\s]/g, ""))} />
            </div>
            <div>
              <span className="info-label">Lejárat</span>
              <input className="card-input expiry" type="text" value={expiry} placeholder="MM/YY" maxLength="5"
                onChange={(e) => {
                  let v = e.target.value.replace(/[^\d]/g, "");
                  if (v.length > 2) v = v.slice(0,2) + "/" + v.slice(2,4);
                  setExpiry(v.slice(0,5));
                }} />
            </div>
          </div>
        </div>

        <div className="card-back card">
          <div className="black-strip"></div>
          <div className="cvc-box">
            <label className="cvc-label">CVC</label>
            <input className="cvc-input" type="password" placeholder="123" value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0,3))} maxLength="3" />
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="button-group">
          <button className="back-btn" onClick={handleCancel} disabled={isLoading}>Mégse</button>
          <button className="pay-btn" disabled={!isFormValid || isLoading} onClick={handlePayment}>
            {isLoading ? "Feldolgozás..." : `Fizetés – ${amount.toLocaleString()} Ft`}
          </button>
        </div>
      </div>
    </div>
  );
}