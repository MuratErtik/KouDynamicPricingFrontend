import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout
import Layout from './components/layout/Layout';

// Pages
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';

// Placeholder Home Page
const HomePage = () => (
  <div className="text-center py-20">
    <h1 className="text-4xl font-bold text-blue-900 mb-4">Dünyayı Keşfetmeye Hazır mısınız?</h1>
    <p className="text-lg text-gray-600">KOU Airlines ile en uygun fiyatlı biletleri hemen bulun.</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
        </Route>
      </Routes>
      
      {/* Global Bildirimler */}
      <ToastContainer position="top-right" autoClose={3000} />
    </BrowserRouter>
  );
}

export default App;