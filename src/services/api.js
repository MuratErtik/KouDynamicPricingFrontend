import axios from 'axios';

// 1. Base URL tanımlaması
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Request Interceptor (İstek Atılmadan Önce)
// Her isteği yakalar ve localStorage'da token varsa Header'a ekler.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Response Interceptor (Cevap Geldikten Sonra)
// Eğer backend 401 (Yetkisiz) hatası dönerse, oturumu otomatik kapatır.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token geçersiz veya süresi dolmuş
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Kullanıcıyı login'e at (SPA içinde window.location en güvenli yoldur)
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;