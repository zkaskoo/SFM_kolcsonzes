// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainSite from './mainsite/MainSite.jsx';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainSite />} />
        <Route path="/login" element={<App />} />
        <Route path="/register" element={<App />} />
        {/* később pl. /dashboard stb. */}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);