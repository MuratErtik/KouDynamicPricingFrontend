import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout & Context
import Layout from './components/layout/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext'; 

// Pages
import HomePage from './pages/home/HomePage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import SearchResultsPage from './pages/booking/SearchResultsPage';
import PassengerInfoPage from './pages/booking/PassengerInfoPage'; 
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
        <BookingProvider> 
          <div className="flex flex-col min-h-screen">
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                
                {/* Auth */}
                <Route path="login" element={<LoginPage />} />
                <Route path="signup" element={<SignupPage />} />
                
                {/* Booking */}
                <Route path="flights" element={<SearchResultsPage />} />
                <Route path="flights/search" element={<SearchResultsPage />} />
                <Route path="booking/passenger-info" element={<PassengerInfoPage />} /> 
                <Route path="booking/seat-selection" element={<SeatSelectionPage />} /> 
                
                {/* Admin */}
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
        </BookingProvider> 
      </AuthProvider>
      
      <ToastContainer position="top-right" autoClose={3000} />
    </BrowserRouter>
  );
}

export default App;