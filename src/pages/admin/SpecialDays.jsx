import React, { useEffect, useState } from "react";
import specialDayService from "../../services/specialDayService";
import SpecialDaysFilter from "../../components/admin/SpecialDaysFilter"; // Filtre bileşeni import edildi
import { toast } from "react-toastify";
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  RefreshCw, 
  MapPin, 
  Globe,
  AlertCircle,
  CheckCircle,
  ChevronLeft,   // Sayfalama ikonu
  ChevronRight   // Sayfalama ikonu
} from "lucide-react";

const SpecialDays = () => {
  // --- STATE YÖNETİMİ ---
  const [specialDays, setSpecialDays] = useState([]);
  const [countries, setCountries] = useState([]); // Backend'den gelen ülke listesi
  const [cities, setCities] = useState([]);       // Seçilen ülkeye göre değişen şehir listesi
  const [loading, setLoading] = useState(true);   // Yükleniyor animasyonu için
  
  // --- SAYFALAMA (PAGINATION) STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Her sayfada 10 kayıt gösterilecek

  // Arama Filtresi State'i
  const [activeFilters, setActiveFilters] = useState(null);

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
    fetchData();      // İlk açılışta verileri çek
    loadCountries(); // Ülke listesini çek
  }, []);

  // --- VERİ ÇEKME FONKSİYONU (Hem Arama Hem Listeleme) ---
  const fetchData = async (filters = null) => {
    setLoading(true);
    try {
      let data;
      if (filters) {
        // Filtre varsa Arama Endpoint'ini kullan
        data = await specialDayService.searchSpecialDays(filters);
        setActiveFilters(filters);
        toast.info(`${data.length} kural bulundu.`, { autoClose: 2000 });
      } else {
        // Filtre yoksa Tümünü Getir
        data = await specialDayService.getAllSpecialDays();
        setActiveFilters(null);
      }
      setSpecialDays(data);
      setCurrentPage(1); // Veri değişince her zaman 1. sayfaya dön
    } catch (error) {
      console.error("Veri yükleme hatası:", error);
      toast.error("Veriler yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const loadCountries = async () => {
    try {
      const data = await specialDayService.getCountries();
      setCountries(data);
    } catch (error) {
      console.error("Ülkeler yüklenemedi", error);
    }
  };

  // --- SAYFALAMA MANTIĞI ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = specialDays.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(specialDays.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // --- FİLTRE HANDLERLARI ---
  const handleFilterSearch = (filters) => {
    fetchData(filters);
  };

  const handleFilterClear = () => {
    fetchData(null); // Filtreyi temizle ve hepsini getir
  };

  // --- FORM HANDLERS (Olay Yönetimi) ---

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
      // Edit Mode
      setEditingId(rule.id);
      
      // Backend 'recurring' veya 'isRecurring' gönderebilir.
      const recurringValue = rule.recurring !== undefined ? rule.recurring : rule.isRecurring;

      setFormData({
        name: rule.name,
        startDate: rule.startDate,
        endDate: rule.endDate,
        priceMultiplier: rule.priceMultiplier,
        targetCountry: rule.targetCountry || "",
        targetCity: rule.targetCity || "",
        // Değeri boolean olduğundan emin ol
        isRecurring: !!recurringValue 
      });
      
      // Şehirleri getir
      if (rule.targetCountry) {
        specialDayService.getCitiesByCountry(rule.targetCountry).then(setCities);
      } else {
        setCities([]);
      }
    } else {
      // Create Mode
      setEditingId(null);
      setFormData({
        name: "", startDate: "", endDate: "", priceMultiplier: 1.1,
        targetCountry: "", targetCity: "", 
        isRecurring: false 
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
        
        // Listeden sil (State güncelleme)
        const updatedList = specialDays.filter(d => d.id !== id);
        setSpecialDays(updatedList);

        // Eğer sildiğimiz kayıt sayfadaki son kayıt ise bir önceki sayfaya git
        // (currentItems o anki sayfadaki verilerdir)
        if (currentItems.length === 1 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }

      } catch (error) {
        toast.error("Silme işlemi başarısız.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasyonlar
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      toast.warning("Bitiş tarihi başlangıç tarihinden önce olamaz!");
      return;
    }
    if (formData.priceMultiplier <= 0) {
      toast.warning("Çarpan pozitif olmalıdır!");
      return;
    }

    const payload = {
      name: formData.name,
      startDate: formData.startDate,
      endDate: formData.endDate,
      priceMultiplier: parseFloat(formData.priceMultiplier),
      targetCountry: formData.targetCountry === "" || formData.targetCountry === "Global" ? null : formData.targetCountry,
      targetCity: formData.targetCity === "" ? null : formData.targetCity,
      
      // Backend uyumluluğu için her iki anahtarı da gönderiyoruz
      recurring: formData.isRecurring,
      isRecurring: formData.isRecurring
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
      
      // İşlem bitince listeyi yenile (aktif filtre varsa onu koruyarak)
      fetchData(activeFilters);
    } catch (error) {
      toast.error("İşlem başarısız.");
    }
  };

  return (
    <div className="container mx-auto p-6 min-h-screen bg-gray-50/50">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-900 flex items-center gap-3">
            <Calendar className="text-blue-600" size={32} /> 
            Özel Günler & Fiyatlandırma
          </h1>
          <p className="text-gray-500 mt-1 text-sm ml-11">
            Toplam <strong>{specialDays.length}</strong> kural listeleniyor.
          </p>
        </div>
        
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transition transform hover:-translate-y-0.5"
        >
          <Plus size={20} /> Yeni Kural Ekle
        </button>
      </div>

      {/* --- FİLTRELEME BİLEŞENİ --- */}
      <SpecialDaysFilter 
        onSearch={handleFilterSearch} 
        onClear={handleFilterClear} 
        countries={countries}
      />

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col">
        
        {loading ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
            <p>Veriler yükleniyor...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Kural Adı</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tarih Aralığı</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Kapsam</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fiyat Çarpanı</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">İşlem</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.length > 0 ? (
                  currentItems.map((day) => {
                    // Badge gösterimi için recurring kontrolü
                    const isRec = day.recurring !== undefined ? day.recurring : day.isRecurring;
                    
                    return (
                      <tr key={day.id} className="hover:bg-blue-50/30 transition duration-150 group">
                        
                        {/* Kural Adı */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-bold text-gray-800 text-base">{day.name}</div>
                          {isRec && (
                            <span className="text-xs text-purple-600 flex items-center gap-1 mt-1 font-medium">
                              <RefreshCw size={10} /> Yıllık Tekrar
                            </span>
                          )}
                        </td>
                        
                        {/* Tarih Aralığı */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                              {new Date(day.startDate).toLocaleDateString("tr-TR")} 
                              <span className="text-gray-400">➝</span>
                              {new Date(day.endDate).toLocaleDateString("tr-TR")}
                            </span>
                            <span className="text-xs text-gray-400 mt-0.5">
                              {Math.ceil((new Date(day.endDate) - new Date(day.startDate)) / (1000 * 60 * 60 * 24))} Gün
                            </span>
                          </div>
                        </td>

                        {/* Kapsam (Scope) */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {!day.targetCountry ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                              <Globe size={12}/> Global
                            </span>
                          ) : (
                            <div className="flex flex-col items-start">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                                 <MapPin size={12}/> {day.targetCountry}
                              </span>
                              {day.targetCity && (
                                <span className="text-xs text-gray-500 ml-2 mt-1 pl-2 border-l-2 border-gray-300">
                                  ↳ {day.targetCity}
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Fiyat Çarpanı */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className={`px-4 py-1.5 rounded-lg font-bold text-sm shadow-sm border ${
                              day.priceMultiplier > 1 
                                ? 'bg-red-50 text-red-600 border-red-200' 
                                : day.priceMultiplier < 1
                                  ? 'bg-green-50 text-green-600 border-green-200'
                                  : 'bg-gray-100 text-gray-600 border-gray-200'
                            }`}>
                              x{day.priceMultiplier}
                            </span>
                            <span className="ml-2 text-xs text-gray-400">
                              {day.priceMultiplier > 1 
                                ? `%${Math.round((day.priceMultiplier - 1) * 100)} Zam` 
                                : day.priceMultiplier < 1 
                                  ? `%${Math.round((1 - day.priceMultiplier) * 100)} İndirim`
                                  : 'Standart'}
                            </span>
                          </div>
                        </td>

                        {/* İşlemler */}
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                            <button 
                              onClick={() => handleOpenModal(day)} 
                              className="p-2 bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-300 rounded-lg shadow-sm transition"
                              title="Düzenle"
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              onClick={() => handleDelete(day.id)} 
                              className="p-2 bg-white border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-300 rounded-lg shadow-sm transition"
                              title="Sil"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <AlertCircle size={48} className="mb-4 text-gray-300" />
                        <p className="text-lg font-medium text-gray-600">
                          {activeFilters ? "Filtre kriterlerine uygun kayıt bulunamadı." : "Henüz tanımlanmış bir kural yok."}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* --- PAGINATION FOOTER (EKLENDİ) --- */}
        {specialDays.length > itemsPerPage && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                    Sayfa <span className="font-medium text-gray-900">{currentPage}</span> / {totalPages}
                </span>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`p-2 rounded-lg border transition ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-transparent' : 'bg-white text-gray-600 hover:bg-white hover:border-blue-500 hover:text-blue-600 border-gray-300 shadow-sm'}`}
                    >
                        <ChevronLeft size={18} />
                    </button>

                    {/* Basit Sayfalama Numaraları */}
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => paginate(i + 1)}
                            className={`w-8 h-8 rounded-lg text-sm font-bold border transition shadow-sm ${
                                currentPage === i + 1
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "bg-white text-gray-600 border-gray-300 hover:border-blue-500 hover:text-blue-600"
                            }`}
                        >
                            {i + 1}
                        </button>
                    ))}

                    <button 
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`p-2 rounded-lg border transition ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-transparent' : 'bg-white text-gray-600 hover:bg-white hover:border-blue-500 hover:text-blue-600 border-gray-300 shadow-sm'}`}
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        )}
      </div>

      {/* --- ADD/EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 border border-gray-100 overflow-hidden transform transition-all scale-100 animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5 flex justify-between items-center text-white shadow-md">
              <h3 className="text-xl font-bold flex items-center gap-2">
                {editingId ? <Edit size={24} className="text-blue-200"/> : <Plus size={24} className="text-blue-200"/>} 
                {editingId ? "Kural Düzenle" : "Yeni Kural Ekle"}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="hover:bg-white/20 p-2 rounded-full transition"
              >
                <X size={24}/>
              </button>
            </div>

            {/* Modal Body (Form) */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              
              {/* Row 1: Name & Multiplier */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Kural Adı</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Örn: Yılbaşı, Sömestr..."
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Fiyat Çarpanı (x)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      step="0.1"
                      min="0.1"
                      required
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      value={formData.priceMultiplier}
                      onChange={e => setFormData({...formData, priceMultiplier: e.target.value})}
                    />
                    <span className="absolute right-3 top-3.5 text-xs text-gray-400 font-medium">
                      {formData.priceMultiplier > 1 ? 'ZAM' : formData.priceMultiplier < 1 ? 'İNDİRİM' : 'NORMAL'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-1">1.0 = Normal, 1.5 = %50 Zam</p>
                </div>
              </div>

              {/* Row 2: Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Başlangıç Tarihi</label>
                  <input 
                    type="date" 
                    required
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-gray-700"
                    value={formData.startDate}
                    onChange={e => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Bitiş Tarihi</label>
                  <input 
                    type="date" 
                    required
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-gray-700"
                    value={formData.endDate}
                    onChange={e => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
              </div>

              {/* Row 3: Recurring Checkbox (DÜZELTİLMİŞ) */}
              <div 
                className={`flex items-center gap-3 p-4 rounded-xl border transition cursor-pointer ${
                  formData.isRecurring 
                    ? 'bg-purple-50 border-purple-200 shadow-sm' 
                    : 'bg-gray-50 border-gray-200'
                }`}
                onClick={() => setFormData(prev => ({...prev, isRecurring: !prev.isRecurring}))}
              >
                <div className={`w-6 h-6 rounded border flex items-center justify-center transition ${
                  formData.isRecurring ? 'bg-purple-600 border-purple-600' : 'bg-white border-gray-400'
                }`}>
                  {formData.isRecurring && <CheckCircle size={16} className="text-white" />}
                </div>
                <div>
                  <p className={`text-sm font-bold ${formData.isRecurring ? 'text-purple-800' : 'text-gray-600'}`}>
                    Her Yıl Tekrarla (Recurring)
                  </p>
                  <p className="text-xs text-gray-500">
                    Seçilirse, bu kural her yıl aynı tarihlerde otomatik uygulanır.
                  </p>
                </div>
              </div>

              {/* Row 4: Scope (Cascading Dropdowns) */}
              <div className="border-t border-gray-100 pt-6 mt-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Globe size={14}/> Kapsam (Opsiyonel)
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Country */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-2 font-medium">Ülke</label>
                    <div className="relative">
                      <select 
                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white appearance-none"
                        value={formData.targetCountry}
                        onChange={handleCountryChange}
                      >
                        <option value="">Global (Tüm Ülkeler)</option>
                        {countries.map((c, i) => (
                          <option key={i} value={c}>{c}</option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-3.5 pointer-events-none text-gray-400">▼</div>
                    </div>
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-2 font-medium">Şehir</label>
                    <div className="relative">
                      <select 
                        className={`w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none transition ${
                          !formData.targetCountry ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white'
                        }`}
                        value={formData.targetCity}
                        onChange={e => setFormData({...formData, targetCity: e.target.value})}
                        disabled={!formData.targetCountry || formData.targetCountry === "Global"}
                      >
                        <option value="">Tüm Şehirler</option>
                        {cities.map((c, i) => (
                          <option key={i} value={c}>{c}</option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-3.5 pointer-events-none text-gray-400">▼</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex gap-4 pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 py-3 px-6 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition"
                >
                  İptal
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg hover:shadow-blue-200 transition flex justify-center items-center gap-2"
                >
                  <Save size={20} /> Kaydet
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