import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Layout from './components/layout/Layout';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import SpecialDays from './pages/admin/SpecialDays'; // <--- YENİ: Import Eklendi
import SearchResultsPage from './pages/booking/SearchResultsPage';
import SeatSelectionPage from './pages/booking/SeatSelectionPage';
import SearchForm from './components/booking/SearchForm';
import { AuthProvider, useAuth } from './context/AuthContext'; // <--- useAuth eklendi

// Anasayfa Bileşeni
const HomePage = () => (
  <div className="relative">
    {/* Hero Bölümü */}
    <div className="bg-blue-600 h-80 flex flex-col items-center justify-center text-white pb-20">
      <h1 className="text-4xl font-bold mb-2">KOU Airlines ile Dünyayı Keşfet</h1>
      <p className="text-blue-100">Konforlu ve güvenli uçuşlar sizi bekliyor.</p>
    </div>
    {/* Arama Formu */}
    <SearchForm />

    <div className="container mx-auto mt-20 p-4 text-center text-gray-500">
      <p>Popüler Destinasyonlar: İstanbul, İzmir, Antalya...</p>
    </div>
  </div>
);

// --- GÜVENLİK BİLEŞENİ (YENİ) ---
// Sadece ROLE_ADMIN olan kullanıcıların girmesine izin verir
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-10 text-center">Yükleniyor...</div>;

  // Kullanıcı yoksa veya Admin değilse anasayfaya at
  if (!user || user.role !== 'ROLE_ADMIN') {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="signup" element={<SignupPage />} />

              {/* Public Booking Routes */}
              <Route path="flights" element={<SearchResultsPage />} />
              <Route path="book/:flightId" element={<SeatSelectionPage />} />

              {/* --- ADMIN ROUTES (KORUMALI) --- */}
              <Route 
                path="admin/dashboard" 
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } 
              />
              
              {/* YENİ EKLENEN ROUTE */}
              <Route 
                path="admin/special-days" 
                element={
                  <AdminRoute>
                    <SpecialDays />
                  </AdminRoute>
                } 
              />

            </Route>
          </Routes>
        </div>
      </AuthProvider>

      <ToastContainer position="top-right" autoClose={3000} />
    </BrowserRouter>
  );
}

export default App;