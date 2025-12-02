import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/authService';
import { useAuth } from '../../context/AuthContext'; // 1. Context Hook'unu çağır
import { toast } from 'react-toastify';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  
  
  // 2. Context'ten login fonksiyonunu al
  const { login } = useAuth(); 

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // 1. İsteği at
      const responseData = await authService.login(email, password);
      
      // --- DEBUG BAŞLANGICI ---
      console.log("--------------------------------------");
      console.log("🚀 BACKEND'DEN GELEN CEVAP:", responseData);
      
      // Token ismini kontrol et (token mı? accessToken mı? jwt mi?)
      if (!responseData.token && !responseData.accessToken && !responseData.jwt) {
        console.error("❌ HATA: Backend cevabında token bulunamadı!");
        console.log("Gelen anahtarlar:", Object.keys(responseData));
        toast.error("Sunucu hatası: Token alınamadı.");
        return;
      }
      console.log("✅ Token bulundu, Context'e gönderiliyor...");
      // --- DEBUG BİTİŞİ ---

      // 2. Context'i güncelle
      // Eğer backend 'accessToken' diyorsa burayı ona göre düzeltmelisin!
      // Şimdilik responseData'yı olduğu gibi gönderiyoruz.
      login(responseData); 

      toast.success('Giriş başarılı!');
    } catch (error) {
      console.error("Login Hatası:", error);
      toast.error('Giriş başarısız.');
    }
  };

  return (
    // ... JSX Form kodları (Aynı kalacak)
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow-lg border-t-4 border-blue-600">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Giriş Yap</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        {/* Inputlar aynı... */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Email</label>
          <input
            type="email"
            required
            className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:border-blue-500 transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Şifre</label>
          <input
            type="password"
            required
            className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:border-blue-500 transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-bold transition duration-200"
        >
          Giriş Yap
        </button>
      </form>
      <div className="mt-4 text-center text-sm text-gray-600">
         Hesabınız yok mu? <Link to="/signup" className="text-blue-600 font-bold hover:underline">Kayıt Ol</Link>
      </div>
    </div>
  );
};

export default LoginPage;