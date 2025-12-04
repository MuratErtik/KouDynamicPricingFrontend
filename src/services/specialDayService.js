import api from './api';

const BASE_URL = '/admin/special-days';
const PUBLIC_URL = '/public/airport'; 

// --- CRUD İşlemleri ---
const getAllSpecialDays = async () => {
  const response = await api.get(BASE_URL);
  return response.data;
};

const createSpecialDay = async (data) => {
  const response = await api.post(BASE_URL+"/add", data);
  return response.data;
};

const updateSpecialDay = async (id, data) => {
  const response = await api.put(`${BASE_URL}/${id}`, data);
  return response.data;
};

const deleteSpecialDay = async (id) => {
  await api.delete(`${BASE_URL}/${id}`);
};

const searchSpecialDays = async (filters) => {
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => v != null && v !== "")
  );

  const response = await api.get(`${BASE_URL}/search`, {
    params: cleanFilters 
  });
  return response.data;
};

// --- DROPDOWN HELPERLARI  ---

// Backend: @GetMapping("/countries") -> List<String>
const getCountries = async () => {
  const response = await api.get(`${PUBLIC_URL}/countries`);
  return response.data; // ["Turkey", "Germany", ...] döner
};

// Backend: @GetMapping("/cities") -> @RequestParam String country -> List<String>
const getCitiesByCountry = async (countryName) => {
  const response = await api.get(`${PUBLIC_URL}/cities`, {
    params: { country: countryName } // ?country=Turkey şeklinde istek atar
  });
  return response.data; // ["Istanbul", "Ankara", ...] döner
};

export default {
  getAllSpecialDays,
  createSpecialDay,
  updateSpecialDay,
  searchSpecialDays,
  deleteSpecialDay,
  getCountries,
  getCitiesByCountry
};