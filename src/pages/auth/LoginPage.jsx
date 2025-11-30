import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/authService';
import { toast } from 'react-toastify';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await authService.login(email, password);
      toast.success('Giriş başarılı! Yönlendiriliyorsunuz...');
      navigate('/'); // Anasayfaya yönlendir
    } catch (error) {
      toast.error('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
      console.error(error);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow-lg border-t-4 border-blue-600">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Giriş Yap</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1">Email</label>
          <input
            type="email"
            required
            className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:border-blue-500 transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ornek@kou.edu.tr"
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