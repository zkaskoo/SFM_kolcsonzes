// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import App from './App.jsx';
import MainSite from './mainsite/MainSite.jsx';
import ForgottenPasswordEmailCheck from './forgottenpassword/ForgottenPasswordEmailCheck.jsx';
import ChangePassword from './forgottenpassword/ChangePassword.jsx'; // vagy ahová tetted
// main.jsx vagy App.jsx
import ProfileSite from './profilesite/ProfileSite.jsx';
import KonyvFeltoltes from './profilesite/konyvfeltoltes/KonyvFeltoltes';
import Bongeszes from './bongeszes/Bongeszes';
import UploadMoney from './uploadmoney/uploadMoney.jsx'

import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainSite />} />
        <Route path="/login" element={<App />} />
        <Route path="/register" element={<App />} />
        
        {/* Elfelejtett jelszó – email ellenőrzés */}
        <Route path="/forgotten-password" element={<ForgottenPasswordEmailCheck />} />
        
        {/* FONTOS: pontosan így kell, hogy a ?token=... is működjön */}
        <Route path="/reset-password" element={<ChangePassword />} />
        <Route path="/profile" element={<ProfileSite />} />
        <Route path="/konyv-feltoltes" element={<KonyvFeltoltes />} />
        <Route path="/browse" element={<Bongeszes />} />
        <Route path="/upload-money" element={<UploadMoney/>}/>

        {/* Minden más → loginra irányít (opcionális) */}
        <Route path="*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);