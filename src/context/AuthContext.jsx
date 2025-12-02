import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Sayfa yenilendiğinde kontrol et
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (data) => {
    console.log("📥 Context Login Fonksiyonu Çalıştı. Gelen Veri:", data);

    // 1. TOKEN İSMİ UYUMSUZLUĞU VAR MI?
    // Backend bazen 'accessToken', bazen 'jwt', bazen 'token' gönderir.
    // Hangisi doluysa onu alalım:
    const token = data.token || data.accessToken || data.jwt;

    if (!token) {
      console.error("❌ KRİTİK HATA: Context token'ı ayrıştıramadı!");
      return;
    }

    // 2. LocalStorage'a kaydet (api.js buradan okur)
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(data));

    console.log("💾 LocalStorage'a kaydedildi. Token:", token);

    // 3. State güncelle (Header buradan anlar)
    setUser(data);

    // 4. Yönlendirme
    if (data.role === 'ROLE_ADMIN') {
      console.log("🔀 Admin paneline yönlendiriliyor...");
      navigate('/admin/dashboard');
    } else {
      console.log("🔀 Anasayfaya yönlendiriliyor...");
      navigate('/');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);