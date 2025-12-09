import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout & Context
import Layout from './components/layout/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import HomePage from './pages/home/HomePage'; // <--- YENİ: Artık dışarıdan import ediyoruz
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import SearchResultsPage from './pages/booking/SearchResultsPage';
import SeatSelectionPage from './pages/booking/SeatSelectionPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import SpecialDays from './pages/admin/SpecialDays';

// --- GÜVENLİK BİLEŞENİ ---
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
              
              {/* Ana Sayfa (Artık yeni HomePage.jsx dosyası render edilecek) */}
              <Route index element={<HomePage />} />
              
              {/* Auth Routes */}
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