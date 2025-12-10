setInterval(() => {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    // Dekódoljuk a JWT-t (base64)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // másodperc → milliszekundum

    // Ha lejárt
    if (Date.now() > exp) {
      alert("A munkamenet lejárt! Kérlek jelentkezz be újra.");
      localStorage.clear();
      window.location.href = '/login';
    }
  } catch (e) {
    // Hibás token → kijelentkeztetés
    localStorage.clear();
    window.location.href = '/login';
  }
}, 5000); // 5 másodpercenként ellenőrzi