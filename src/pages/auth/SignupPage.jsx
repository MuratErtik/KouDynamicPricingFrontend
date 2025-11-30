import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/authService';
import { toast } from 'react-toastify';

const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    lastname: '',
    email: '',
    password: '',
    mobileNo: '',
    dateOfBirth: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    // Basit Validasyon (Geliştirilebilir)
    if (formData.password.length < 6) {
      toast.warning('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    try {
      await authService.register(formData);
      toast.success('Kayıt başarılı! Lütfen giriş yapın.');
      navigate('/login');
    } catch (error) {
      toast.error('Kayıt işlemi sırasında bir hata oluştu.');
      console.error(error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-6 bg-white p-8 rounded-lg shadow-lg border-t-4 border-blue-600">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">KOU Airlines'a Katılın</h2>
      <form onSubmit={handleSignup} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Ad */}
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-1">Ad</label>
          <input name="name" type="text" required onChange={handleChange} className="w-full border border-gray-300 px-3 py-2 rounded focus:border-blue-500 outline-none" />
        </div>
        {/* Soyad */}
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-1">Soyad</label>
          <input name="lastname" type="text" required onChange={handleChange} className="w-full border border-gray-300 px-3 py-2 rounded focus:border-blue-500 outline-none" />
        </div>
        {/* Email */}
        <div className="md:col-span-2">
          <label className="block text-gray-700 text-sm font-bold mb-1">Email</label>
          <input name="email" type="email" required onChange={handleChange} className="w-full border border-gray-300 px-3 py-2 rounded focus:border-blue-500 outline-none" />
        </div>
        {/* Şifre */}
        <div className="md:col-span-2">
          <label className="block text-gray-700 text-sm font-bold mb-1">Şifre</label>
          <input name="password" type="password" required onChange={handleChange} className="w-full border border-gray-300 px-3 py-2 rounded focus:border-blue-500 outline-none" />
        </div>
        {/* Telefon */}
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-1">Telefon No</label>
          <input name="mobileNo" type="tel" placeholder="0555..." required onChange={handleChange} className="w-full border border-gray-300 px-3 py-2 rounded focus:border-blue-500 outline-none" />
        </div>
        {/* Doğum Tarihi */}
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-1">Doğum Tarihi</label>
          <input name="dateOfBirth" type="date" required onChange={handleChange} className="w-full border border-gray-300 px-3 py-2 rounded focus:border-blue-500 outline-none" />
        </div>

        <div className="md:col-span-2 mt-4">
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-bold shadow-md transition">
            Üye Ol
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignupPage;