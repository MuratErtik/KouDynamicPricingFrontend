import React, { useEffect, useState } from "react";
import specialDayService from "../../services/specialDayService";
import { toast } from "react-toastify";
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  RefreshCw, // Tekrar eden kural ikonu
  MapPin, 
  Globe 
} from "lucide-react";

const SpecialDays = () => {
  // --- STATE YÖNETİMİ ---
  const [specialDays, setSpecialDays] = useState([]);
  const [countries, setCountries] = useState([]); // Backend'den gelen ülke listesi
  const [cities, setCities] = useState([]);       // Seçilen ülkeye göre değişen şehir listesi
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // Null = Yeni Ekle, ID = Düzenle

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    priceMultiplier: 1.0,
    targetCountry: "",
    targetCity: "",
    isRecurring: false
  });

  // --- BAŞLANGIÇ YÜKLEMELERİ ---
  useEffect(() => {
    loadData();      // Kuralları çek
    loadCountries(); // Ülkeleri çek (Selectbox için)
  }, []);

  const loadData = async () => {
    try {
      const data = await specialDayService.getAllSpecialDays();
      setSpecialDays(data);
    } catch (error) {
      toast.error("Kurallar yüklenirken hata oluştu.");
    }
  };

  const loadCountries = async () => {
    try {
      // Backend: /api/public/airport/countries
      const data = await specialDayService.getCountries();
      setCountries(data);
    } catch (error) {
      console.error("Ülkeler yüklenemedi", error);
    }
  };

  // --- HANDLERS (Olay Yönetimi) ---

  // Ülke değişince Şehirleri getiren fonksiyon (Cascading Dropdown)
  const handleCountryChange = async (e) => {
    const selectedCountry = e.target.value;
    
    // 1. State'i güncelle ve Şehri sıfırla
    setFormData(prev => ({ 
      ...prev, 
      targetCountry: selectedCountry, 
      targetCity: "" 
    }));

    // 2. Eğer geçerli bir ülke seçildiyse şehirleri çek
    if (selectedCountry && selectedCountry !== "Global") {
      try {
        // Backend: /api/public/airport/cities?country=Turkey
        const cityList = await specialDayService.getCitiesByCountry(selectedCountry);
        setCities(cityList);
      } catch (error) {
        toast.error("Şehirler yüklenemedi.");
        setCities([]);
      }
    } else {
      // Global seçildiyse veya boşsa şehir listesini temizle
      setCities([]);
    }
  };

  const handleOpenModal = (rule = null) => {
    if (rule) {
      // Düzenleme Modu (Edit Mode)
      setEditingId(rule.id);
      setFormData({
        name: rule.name,
        startDate: rule.startDate,
        endDate: rule.endDate,
        priceMultiplier: rule.priceMultiplier,
        targetCountry: rule.targetCountry || "",
        targetCity: rule.targetCity || "",
        isRecurring: rule.isRecurring
      });
      // Eğer düzenlediğimiz kuralda ülke varsa, şehirlerini de hemen çekelim
      if (rule.targetCountry) {
        specialDayService.getCitiesByCountry(rule.targetCountry).then(setCities);
      } else {
        setCities([]);
      }
    } else {
      // Yeni Ekleme Modu (Create Mode)
      setEditingId(null);
      setFormData({
        name: "", startDate: "", endDate: "", priceMultiplier: 1.1,
        targetCountry: "", targetCity: "", isRecurring: false
      });
      setCities([]);
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bu kuralı silmek istediğinize emin misiniz?")) {
      try {
        await specialDayService.deleteSpecialDay(id);
        toast.success("Kural silindi.");
        setSpecialDays(specialDays.filter(d => d.id !== id));
      } catch (error) {
        toast.error("Silme işlemi başarısız.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basit Validasyonlar
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      toast.warning("Bitiş tarihi başlangıç tarihinden önce olamaz!");
      return;
    }
    if (formData.priceMultiplier <= 0) {
      toast.warning("Çarpan pozitif olmalıdır!");
      return;
    }

    // Backend null beklediği yerlere boş string gitmesin diye temizlik yapıyoruz
    const payload = {
      ...formData,
      targetCountry: formData.targetCountry === "" || formData.targetCountry === "Global" ? null : formData.targetCountry,
      targetCity: formData.targetCity === "" ? null : formData.targetCity,
    };

    try {
      if (editingId) {
        await specialDayService.updateSpecialDay(editingId, payload);
        toast.success("Kural güncellendi!");
      } else {
        await specialDayService.createSpecialDay(payload);
        toast.success("Yeni kural oluşturuldu!");
      }
      setIsModalOpen(false);
      loadData(); // Tabloyu yenile
    } catch (error) {
      toast.error("İşlem başarısız.");
    }
  };

  return (
    <div className="container mx-auto p-6 min-h-screen bg-gray-50/50">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-900 flex items-center gap-3">
          <Calendar className="text-blue-600" /> Özel Günler & Fiyatlandırma
        </h1>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold shadow-md flex items-center gap-2 transition"
        >
          <Plus size={20} /> Yeni Kural Ekle
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Kural Adı</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Tarih Aralığı</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Kapsam</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Fiyat Çarpanı</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">İşlem</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {specialDays.map((day) => (
              <tr key={day.id} className="hover:bg-blue-50/50 transition">
                {/* Name */}
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                  {day.name}
                </td>
                
                {/* Dates & Recurring Badge */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 text-sm">
                      {day.startDate} ➝ {day.endDate}
                    </span>
                    {day.isRecurring && (
                      <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1 border border-purple-200" title="Her Yıl Tekrar Eder">
                        <RefreshCw size={10} /> Her Yıl
                      </span>
                    )}
                  </div>
                </td>

                {/* Scope (Global vs Local) */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {!day.targetCountry ? (
                    <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold w-fit">
                      <Globe size={12}/> Global
                    </span>
                  ) : (
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-700 flex items-center gap-1">
                         <MapPin size={12} className="text-gray-400"/> {day.targetCountry}
                      </span>
                      {day.targetCity && <span className="text-xs text-gray-500 ml-4">↳ {day.targetCity}</span>}
                    </div>
                  )}
                </td>

                {/* Multiplier Badge */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full font-bold text-sm ${
                    day.priceMultiplier > 1 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    x{day.priceMultiplier}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleOpenModal(day)} className="text-gray-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded transition">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(day.id)} className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded transition">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {specialDays.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                  Henüz tanımlanmış bir kural yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- ADD/EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 border border-gray-100 overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
              <h3 className="text-lg font-bold flex items-center gap-2">
                {editingId ? <Edit size={20}/> : <Plus size={20}/>} 
                {editingId ? "Kural Düzenle" : "Yeni Kural Ekle"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-blue-700 p-1 rounded-full"><X size={20}/></button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {/* Name & Multiplier Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Kural Adı</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Örn: Yılbaşı"
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Fiyat Çarpanı (x)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    min="0.1"
                    required
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.priceMultiplier}
                    onChange={e => setFormData({...formData, priceMultiplier: e.target.value})}
                  />
                  <span className="text-xs text-gray-500">1.0 = Normal, 1.5 = %50 Zam</span>
                </div>
              </div>

              {/* Date Range Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Başlangıç</label>
                  <input 
                    type="date" 
                    required
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.startDate}
                    onChange={e => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Bitiş</label>
                  <input 
                    type="date" 
                    required
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.endDate}
                    onChange={e => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
              </div>

              {/* Recurring Checkbox */}
              <div className="flex items-center gap-2 bg-purple-50 p-2 rounded border border-purple-100">
                <input 
                  type="checkbox" 
                  id="recurring"
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  checked={formData.isRecurring}
                  onChange={e => setFormData({...formData, isRecurring: e.target.checked})}
                />
                <label htmlFor="recurring" className="text-sm font-semibold text-purple-800 cursor-pointer">
                  Her yıl tekrarla (Recurring)
                </label>
              </div>

              <div className="border-t pt-4 mt-2">
                <p className="text-xs font-bold text-gray-500 uppercase mb-3">Kapsam (Opsiyonel)</p>
                <div className="grid grid-cols-2 gap-4">
                  {/* Country Select */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Ülke</label>
                    <select 
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      value={formData.targetCountry}
                      onChange={handleCountryChange}
                    >
                      <option value="">Global (Tüm Ülkeler)</option>
                      {countries.map((c, i) => (
                        <option key={i} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* City Select (Disabled if no country) */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Şehir</label>
                    <select 
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white disabled:bg-gray-100 disabled:text-gray-400"
                      value={formData.targetCity}
                      onChange={e => setFormData({...formData, targetCity: e.target.value})}
                      disabled={!formData.targetCountry || formData.targetCountry === "Global"}
                    >
                      <option value="">Tüm Şehirler</option>
                      {cities.map((c, i) => (
                        <option key={i} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 border rounded-lg font-bold text-gray-600 hover:bg-gray-50">
                  İptal
                </button>
                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow flex justify-center items-center gap-2">
                  <Save size={18} /> Kaydet
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SpecialDays;