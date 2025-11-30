// src/profilesite/konyvfeltoltes/KonyvFeltoltes.jsx
// HÁTTÉRKÉPEK AUTOMATIKUSAN VÁLTAKOZNAK – PONT NÉLKÜL, PONT ÚGY, MINT A TÖBBI OLDALON!

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  BookOpen,
  Calendar,
  DollarSign,
  FileText
} from 'lucide-react';
import './KonyvFeltoltes.css';

// KÉPEK IMPORTJA – ugyanazok, mint a MainSite-on
import kep1 from '/src/mainsite/fooldalkep1.png';
import kep2 from '/src/mainsite/fooldalkep2.png';
import kep3 from '/src/mainsite/fooldalkep3.jpg';
import kep4 from '/src/mainsite/fooldalkep4.jpg';

const images = [kep1, kep2, kep3, kep4];

export default function KonyvFeltoltes() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // HÁTTÉRKÉP VÁLTÁS – 5 másodpercenként
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    year: '',
    price: '',
    coverImage: null,
    pdfFile: null
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [pdfFileName, setPdfFileName] = useState('');

  const userId = localStorage.getItem('userId') || '1';

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, coverImage: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setFormData({ ...formData, pdfFile: file });
      setPdfFileName(file.name);
    } else if (file) {
      alert('Csak PDF fájl tölthető fel!');
      e.target.value = '';
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.author) {
      alert('A cím és a szerző megadása kötelező!');
      return;
    }
    if (!formData.coverImage) {
      alert('Borítókép feltöltése kötelező!');
      return;
    }

    setIsLoading(true);

    try {
      const pictureBase64 = await fileToBase64(formData.coverImage);

      let pdfBase64 = '';
      if (formData.pdfFile) {
        pdfBase64 = await fileToBase64(formData.pdfFile);
      }

      const payload = {
        author: formData.author.trim(),
        title: formData.title.trim(),
        releaseDate: formData.year || null,
        pdfBase64: pdfBase64,
        pictureBase64: pictureBase64,
        userId: parseInt(userId),
        price: parseInt(formData.price) || 0
      };

      const response = await fetch('http://localhost:8080/api/v1/books/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert('Könyv sikeresen feltöltve!');
        navigate('/profile');
      } else {
        const err = await response.text();
        alert('Hiba a szerveren: ' + err);
      }
    } catch (err) {
      console.error(err);
      alert('Hiba történt a feltöltés közben.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="konyvfeltoltes-wrapper">

      {/* HÁTTÉRKÉPEK – AUTOMATIKUS VÁLTÁS (PONT NÉLKÜL) */}
      <div className="background-slider">
        {images.map((img, index) => (
          <div
            key={index}
            className={`background-image ${index === currentIndex ? 'active' : ''}`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}
      </div>

      {/* VISSZA GOMB */}
      <button onClick={() => navigate('/profile')} className="fixed-back-btn">
        <ArrowLeft size={26} />
        Vissza a profilomhoz
      </button>

      <div className="konyvfeltoltes-container">
        <div className="konyvfeltoltes-card">

          <h1 className="konyvfeltoltes-title">Új könyv feltöltése</h1>

          {/* BORÍTÓKÉP */}
          <div className="image-upload-section">
            <label htmlFor="coverImage" className="image-upload-label">
              {imagePreview ? (
                <img src={imagePreview} alt="Borító" className="image-preview" />
              ) : (
                <div className="image-upload-placeholder">
                  <ImageIcon size={48} />
                  <p>Kattints a borítókép feltöltéséhez *</p>
                </div>
              )}
            </label>
            <input
              type="file"
              id="coverImage"
              accept="image/*"
              onChange={handleImageChange}
              className="image-input"
            />
          </div>

          {/* FEHÉR KONTÉNER */}
          <div className="form-white-container">
            <form onSubmit={handleSubmit} className="konyvfeltoltes-form">

              {/* PDF */}
              <div className="pdf-upload-section">
                <label htmlFor="pdfFile" className="pdf-upload-label">
                  <div className="pdf-upload-content">
                    <FileText size={36} />
                    {pdfFileName ? (
                      <span className="pdf-filename">{pdfFileName}</span>
                    ) : (
                      <span className="pdf-placeholder-text">
                        PDF feltöltése <strong>(opcionális)</strong>
                      </span>
                    )}
                  </div>
                </label>
                <input
                  type="file"
                  id="pdfFile"
                  accept=".pdf,application/pdf"
                  onChange={handlePdfChange}
                  className="pdf-input"
                />
              </div>

              {/* ADATOK GRID */}
              <div className="form-grid">
                <div className="input-group">
                  <label><BookOpen size={18} /> Cím *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="pl. A Gyűrűk Ura"
                  />
                </div>

                <div className="input-group">
                  <label>Szerző *</label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="pl. J.R.R. Tolkien"
                  />
                </div>

                <div className="input-group">
                  <label><Calendar size={18} /> Kiadás éve</label>
                  <input
                    type="number"
                    min="1000"
                    max="2025"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    placeholder="pl. 1954"
                  />
                </div>

                <div className="input-group">
                  <label><DollarSign size={18} /> Ár (Ft)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="pl. 3500"
                  />
                </div>
              </div>

              {/* GOMB */}
              <button type="submit" className="submit-btn" disabled={isLoading}>
                {isLoading ? (
                  'Feltöltés...'
                ) : (
                  <>
                    <Upload size={22} />
                    Könyv feltöltése
                  </>
                )}
              </button>

            </form>
          </div>

        </div>
      </div>
    </div>
  );
}