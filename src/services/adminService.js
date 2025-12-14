import api from './api';

// NOT: Controller'ının sınıf seviyesindeki (Class Level) mapping'inin 
// "/admin/flights" olduğunu varsayıyorum.
// Eğer sadece "/admin" ise aşağıdaki URL'leri ona göre kısaltabilirsin.

const BASE_URL = '/admin/flights';

// 1. Tüm Uçuşları Getir (Admin için)
// Backend: @GetMapping
const getAllFlights = async () => {
  // Token, api.js içindeki interceptor sayesinde otomatik eklenir.
  const response = await api.get(BASE_URL);
  console.log(response.data);
  return response.data;
};

// 2. Gelişmiş Arama (YENİ EKLENDİ)
const searchFlights = async (searchParams) => {
  // Boş veya null olan parametreleri temizle (URL kirliliğini önler)
  const cleanParams = Object.fromEntries(
    Object.entries(searchParams).filter(([_, v]) => v != null && v !== "")
  );

  const response = await api.get(`${BASE_URL}/search`, {
    params: cleanParams,
  });
  return response.data;
};

// 2. Yeni Uçuş Ekle
// Backend: @PostMapping("/add") -> URL sonuna /add eklendi
const createFlight = async (flightData) => {
  // Backend @RequestHeader("Authorization") istiyor.
  // Bizim api instance'ımız bunu otomatik olarak "Authorization: Bearer token" 
  // şeklinde eklediği için ekstra bir şey yapmana gerek yok.
  const response = await api.post(`${BASE_URL}/add`, flightData);
  return response.data;
};

// 3. Uçuş Sil
// Backend: @DeleteMapping("/{id}")
const deleteFlight = async (id) => {
  await api.delete(`${BASE_URL}/${id}`);
};

// 4. Uçuş Güncelle (İhtiyaç olursa diye ekledim)
// Backend: @PutMapping("/{id}")
const updateFlight = async (id, flightData) => {
  const response = await api.put(`${BASE_URL}/${id}`, flightData);
  return response.data;
};

// 5. ID'ye Göre Tek Uçuş Getir (Detay sayfası için)
// Backend: @GetMapping("/{id}")
const getFlightById = async (id) => {
  const response = await api.get(`${BASE_URL}/${id}`);
  return response.data;
};

const getPriceHistory = async (flightId) => {
  const response = await api.get(`/admin/price-history/${flightId}`);
  return response.data;
};

const getFlightCustomers = async (flightId) => {
  const response = await api.get(`/admin/flights/${flightId}/customer-list`);
  return response.data;
};

export default {
  getAllFlights,
  createFlight,
  getPriceHistory,
  searchFlights, 
  deleteFlight,
  getFlightCustomers,
  updateFlight,
  getFlightById
};