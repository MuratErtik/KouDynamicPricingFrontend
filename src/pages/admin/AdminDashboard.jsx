import React, { useEffect, useState } from "react";
import adminService from "../../services/adminService";
import publicService from "../../services/publicService";
import { toast } from "react-toastify";
import PriceHistoryModal from '../../components/admin/PriceHistoryModal'; // <--- YENİ MODAL
import { 
  Trash2, 
  Plus, 
  Plane, 
  ChevronLeft, 
  ChevronRight, 
  PlaneTakeoff, 
  PlaneLanding,
  Calendar,
  Clock,
  Users,
  Edit,
  X,
  Save,
  Search,
  Filter,
  RotateCcw,
  LineChart // <--- YENİ İKON
} from "lucide-react";

const AdminDashboard = () => {
  const [flights, setFlights] = useState([]);
  const [airports, setAirports] = useState([]);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Search / Filter State
  const [showFilter, setShowFilter] = useState(false);
  const [searchParams, setSearchParams] = useState({
    departureCity: "",
    arrivalCity: "",
    departureTimeStart: "",
    departureTimeEnd: "",
    basePriceMin: "",
    basePriceMax: "",
    status: "",
    onlyFutureFlights: false
  });

  // Create Form State
  const [newFlight, setNewFlight] = useState({
    departureAirportId: "",
    arrivalAirportId: "",
    departureTime: "",
  });

  // Update Modal State
  const [editingFlight, setEditingFlight] = useState(null); 
  const [updateForm, setUpdateForm] = useState({
    newDepartureTime: "",
    status: "SCHEDULED"
  });

  // --- YENİ STATE: Fiyat Geçmişi Modalı ---
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [selectedPriceHistory, setSelectedPriceHistory] = useState(null);
  const [selectedFlightNum, setSelectedFlightNum] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [flightsData, airportsData] = await Promise.all([
        adminService.getAllFlights(),
        publicService.getAirports(),
      ]);
      const sortedFlights = flightsData.sort((a, b) => new Date(b.departureTime) - new Date(a.departureTime));
      setFlights(sortedFlights);
      setAirports(airportsData);
    } catch (error) {
      console.error(error);
      toast.error("Veriler yüklenirken hata oluştu.");
    }
  };

  // --- YENİ FONKSİYON: Fiyat Geçmişini Getir ---
  const handleShowPriceHistory = async (flightId, flightNumber) => {
    try {
      // Servisten veriyi çek
      const historyData = await adminService.getPriceHistory(flightId);
      
      if (!historyData || historyData.priceHistories.length === 0) {
        toast.info("Bu uçuş için henüz fiyat geçmişi verisi yok.");
        return;
      }

      setSelectedPriceHistory(historyData);
      setSelectedFlightNum(flightNumber);
      setIsPriceModalOpen(true);
      
    } catch (error) {
      console.error(error);
      toast.error("Fiyat geçmişi alınamadı.");
    }
  };

  // --- SEARCH FONKSİYONLARI ---
  const handleSearchChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSearchParams(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    try {
        const results = await adminService.searchFlights(searchParams);
        const sortedResults = results.sort((a, b) => new Date(b.departureTime) - new Date(a.departureTime));
        setFlights(sortedResults);
        setCurrentPage(1);
        toast.info(`${results.length} uçuş bulundu.`);
    } catch (error) {
        console.error(error);
        toast.error("Arama sırasında hata oluştu.");
    }
  };

  const handleClearSearch = () => {
    setSearchParams({
        departureCity: "",
        arrivalCity: "",
        departureTimeStart: "",
        departureTimeEnd: "",
        basePriceMin: "",
        basePriceMax: "",
        status: "",
        onlyFutureFlights: false
    });
    loadData();
  };

  // --- CRUD İŞLEMLERİ ---
  const handleDelete = async (id) => {
    if (window.confirm("Bu uçuşu silmek istediğinize emin misiniz?")) {
      try {
        await adminService.deleteFlight(id);
        toast.success("Uçuş silindi.");
        const updatedFlights = flights.filter((f) => f.id !== id);
        setFlights(updatedFlights);
        
        if (updatedFlights.length > 0 && currentFlights.length === 1 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
      } catch (error) {
        toast.error("Silme işlemi başarısız.");
      }
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (newFlight.departureAirportId === newFlight.arrivalAirportId) {
      toast.warning("Kalkış ve Varış noktası aynı olamaz!");
      return;
    }
    try {
      await adminService.createFlight(newFlight);
      toast.success("Uçuş başarıyla planlandı!");
      setNewFlight({
        departureAirportId: "",
        arrivalAirportId: "",
        departureTime: "",
      });
      loadData(); 
    } catch (error) {
      toast.error("Uçuş oluşturulamadı.");
    }
  };

  const handleEditClick = (flight) => {
    setEditingFlight(flight);
    setUpdateForm({
      newDepartureTime: flight.departureTime.slice(0, 16), 
      status: flight.status
    });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminService.updateFlight(editingFlight.id, updateForm);
      toast.success("Uçuş güncellendi!");
      setEditingFlight(null);
      loadData();
    } catch (error) {
      console.error(error);
      toast.error("Güncelleme başarısız.");
    }
  };

  // --- YARDIMCI FONKSİYONLAR ---
  const formatDate = (dateString) => {
    if (!dateString) return { time: "--:--", date: "Tarih Yok" };
    const date = new Date(dateString);
    return {
      time: date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
      date: date.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }),
    };
  };

  // --- PAGINATION ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentFlights = flights.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(flights.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container mx-auto p-6 min-h-screen bg-gray-50/50 relative">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-900 flex items-center gap-3">
          <Plane className="text-blue-600" /> Uçuş Yönetim Paneli
        </h1>
        <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm border">
            Toplam <strong>{flights.length}</strong> Uçuş Listeleniyor
        </div>
      </div>

      {/* --- CREATE FORM --- */}
      <div className="bg-white p-8 rounded-xl shadow-lg mb-8 border border-blue-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
        <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
           <Plus className="bg-blue-100 text-blue-600 rounded-full p-1" size={24}/> Yeni Uçuş Planla
        </h2>
        
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-7 gap-6 items-end">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nereden</label>
            <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                    <PlaneTakeoff size={20}/>
                </div>
                <select
                    className="w-full border border-gray-300 pl-10 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-gray-50 appearance-none"
                    value={newFlight.departureAirportId}
                    onChange={(e) => setNewFlight({ ...newFlight, departureAirportId: e.target.value })}
                    required
                >
                    <option value="">Havalimanı Seçiniz</option>
                    {airports
                        .filter(a => a.id.toString() !== newFlight.arrivalAirportId)
                        .map((a) => (
                        <option key={a.id} value={a.id}>{a.city} ({a.iataCode})</option>
                    ))}
                </select>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nereye</label>
            <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                    <PlaneLanding size={20}/>
                </div>
                <select
                    className="w-full border border-gray-300 pl-10 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-gray-50 appearance-none"
                    value={newFlight.arrivalAirportId}
                    onChange={(e) => setNewFlight({ ...newFlight, arrivalAirportId: e.target.value })}
                    required
                >
                    <option value="">Havalimanı Seçiniz</option>
                    {airports
                        .filter(a => a.id.toString() !== newFlight.departureAirportId)
                        .map((a) => (
                        <option key={a.id} value={a.id}>{a.city} ({a.iataCode})</option>
                    ))}
                </select>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tarih ve Saat</label>
            <input
              type="datetime-local"
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-gray-50"
              value={newFlight.departureTime}
              onChange={(e) => setNewFlight({ ...newFlight, departureTime: e.target.value })}
              required
            />
          </div>

          <div className="md:col-span-1">
            <button
                type="submit"
                className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 font-bold shadow-md hover:shadow-lg transition flex justify-center items-center gap-2 transform hover:-translate-y-0.5"
            >
                <Plus size={20} /> Ekle
            </button>
          </div>
        </form>
      </div>

      {/* --- ADVANCED SEARCH FILTER --- */}
      <div className="mb-6">
        <button 
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center gap-2 text-sm font-bold text-gray-600 bg-white border px-4 py-2 rounded-lg hover:bg-gray-50 transition shadow-sm mb-4"
        >
            <Filter size={16} /> Detaylı Arama / Filtrele {showFilter ? '▲' : '▼'}
        </button>

        {showFilter && (
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 animate-in fade-in slide-in-from-top-2">
                <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Kalkış Şehri</label>
                        <input type="text" name="departureCity" value={searchParams.departureCity} onChange={handleSearchChange} placeholder="Örn: Istanbul" className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Varış Şehri</label>
                        <input type="text" name="arrivalCity" value={searchParams.arrivalCity} onChange={handleSearchChange} placeholder="Örn: London" className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Uçuş Tarihi</label>
                        <input type="datetime-local" name="departureTimeStart" value={searchParams.departureTimeStart} onChange={handleSearchChange} className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Min Fiyat ($)</label>
                        <input type="number" name="basePriceMin" value={searchParams.basePriceMin} onChange={handleSearchChange} className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Max Fiyat ($)</label>
                        <input type="number" name="basePriceMax" value={searchParams.basePriceMax} onChange={handleSearchChange} className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Durum</label>
                        <select name="status" value={searchParams.status} onChange={handleSearchChange} className="w-full border p-2 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                            <option value="">Tümü</option>
                            <option value="SCHEDULED">SCHEDULED</option>
                            <option value="DELAYED">DELAYED</option>
                            <option value="CANCELLED">CANCELLED</option>
                            <option value="COMPLETED">COMPLETED</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2 mt-4 md:mt-6">
                        <input 
                            type="checkbox" 
                            name="onlyFutureFlights" 
                            id="future"
                            checked={searchParams.onlyFutureFlights} 
                            onChange={handleSearchChange} 
                            className="w-4 h-4 text-blue-600 rounded cursor-pointer" 
                        />
                        <label htmlFor="future" className="text-sm text-gray-700 cursor-pointer">Sadece Gelecek Uçuşlar</label>
                    </div>

                    <div className="md:col-span-4 flex justify-end gap-3 mt-2 border-t pt-4">
                        <button type="button" onClick={handleClearSearch} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">
                            <RotateCcw size={16}/> Filtreleri Temizle
                        </button>
                        <button type="submit" className="flex items-center gap-2 px-6 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition">
                            <Search size={16}/> Ara
                        </button>
                    </div>
                </form>
            </div>
        )}
      </div>

      {/* --- TABLE --- */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Uçuş No</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rota</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1"><PlaneTakeoff size={14}/> Kalkış</div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1"><PlaneLanding size={14}/> Varış</div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1"><Users size={14}/> Doluluk</div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Durum</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fiyat</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">İşlem</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentFlights.map((flight) => {
                const departure = formatDate(flight.departureTime);
                const arrival = formatDate(flight.arrivalTime);
                const bookedSeats = flight.totalSeats - flight.remainingSeats;
                const occupancyRate = flight.totalSeats > 0 ? Math.round((bookedSeats / flight.totalSeats) * 100) : 0;

                return (
                <tr key={flight.id} className="hover:bg-blue-50/50 transition duration-150 group">
                  {/* Uçuş No */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                        {flight.flightNumber}
                    </span>
                  </td>
                  
                  {/* Rota */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-gray-800 font-semibold">
                            <span>{flight.departureAirport?.city}</span>
                            <span className="text-gray-400 text-xs">➝</span>
                            <span>{flight.arrivalAirport?.city}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            {flight.departureAirport?.iataCode} - {flight.arrivalAirport?.iataCode}
                        </div>
                    </div>
                  </td>

                  {/* Kalkış */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                        <span className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <Clock size={16} className="text-blue-500"/> {departure.time}
                        </span>
                        <span className="text-xs text-gray-500 font-medium mt-1">
                            {departure.date}
                        </span>
                    </div>
                  </td>

                  {/* Varış */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                        <span className="text-lg font-bold text-gray-800 flex items-center gap-2">
                             {arrival.time}
                        </span>
                        <span className="text-xs text-gray-500 font-medium mt-1">
                             {arrival.date}
                        </span>
                    </div>
                  </td>

                  {/* Doluluk */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col w-24">
                        <div className="flex justify-between text-xs font-bold mb-1">
                            <span className="text-gray-600">{bookedSeats}/{flight.totalSeats}</span>
                            <span className="text-blue-600">%{occupancyRate}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                                className={`h-1.5 rounded-full ${occupancyRate > 90 ? 'bg-red-500' : 'bg-blue-500'}`} 
                                style={{ width: `${occupancyRate}%` }}
                            ></div>
                        </div>
                    </div>
                  </td>

                  {/* Durum */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border 
                        ${flight.status === 'SCHEDULED' ? 'bg-green-50 text-green-700 border-green-200' : 
                          flight.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' : 
                          flight.status === 'DELAYED' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                          'bg-gray-50 text-gray-700 border-gray-200'}`}>
                      {flight.status}
                    </span>
                  </td>

                  {/* Fiyat */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900 font-bold text-lg">${flight.basePrice}</div>
                  </td>

                  {/* İŞLEM BUTONLARI */}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                        
                        {/* --- YENİ BUTON: Fiyat Geçmişi Analizi --- */}
                        <button
                          onClick={() => handleShowPriceHistory(flight.id, flight.flightNumber)}
                          className="text-green-600 bg-white hover:bg-green-50 p-2 rounded-lg border border-transparent hover:border-green-100 transition shadow-sm relative group/tooltip"
                          title="Fiyat Analizi"
                        >
                          <LineChart size={18} />
                        </button>

                        {/* Düzenle */}
                        <button
                          onClick={() => handleEditClick(flight)}
                          className="text-blue-600 bg-white hover:bg-blue-50 p-2 rounded-lg border border-transparent hover:border-blue-100 transition shadow-sm"
                          title="Düzenle"
                        >
                          <Edit size={18} />
                        </button>

                        {/* Sil */}
                        <button
                          onClick={() => handleDelete(flight.id)}
                          className="text-red-600 bg-white hover:bg-red-50 p-2 rounded-lg border border-transparent hover:border-red-100 transition shadow-sm"
                          title="Uçuşu Sil"
                        >
                          <Trash2 size={18} />
                        </button>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {flights.length > itemsPerPage && (
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

      {/* --- UPDATE MODAL --- */}
      {editingFlight && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden border border-gray-100 scale-100 animate-in zoom-in-95 duration-200">
                <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Edit size={20}/> Uçuş Düzenle
                    </h3>
                    <button 
                        onClick={() => setEditingFlight(null)} 
                        className="p-1 hover:bg-blue-700 rounded-full transition"
                    >
                        <X size={20}/>
                    </button>
                </div>
                <form onSubmit={handleUpdateSubmit} className="p-6 space-y-4">
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4">
                         <div className="flex justify-between items-center mb-1">
                             <span className="text-xs font-bold text-blue-600 uppercase">Uçuş No</span>
                             <span className="font-mono font-bold text-gray-800">{editingFlight.flightNumber}</span>
                         </div>
                         <div className="flex justify-between items-center text-sm text-gray-700">
                             <span>{editingFlight.departureAirport.city} ({editingFlight.departureAirport.iataCode})</span>
                             <span>➝</span>
                             <span>{editingFlight.arrivalAirport.city} ({editingFlight.arrivalAirport.iataCode})</span>
                         </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Yeni Tarih ve Saat</label>
                        <input
                            type="datetime-local"
                            className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={updateForm.newDepartureTime}
                            onChange={(e) => setUpdateForm({...updateForm, newDepartureTime: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Uçuş Durumu</label>
                        <select
                            className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            value={updateForm.status}
                            onChange={(e) => setUpdateForm({...updateForm, status: e.target.value})}
                        >
                            <option value="SCHEDULED">SCHEDULED (Zamanında)</option>
                            <option value="DELAYED">DELAYED (Rötarlı)</option>
                            <option value="CANCELLED">CANCELLED (İptal)</option>
                            <option value="COMPLETED">COMPLETED (Tamamlandı)</option>
                        </select>
                    </div>
                    <div className="flex gap-3 mt-6 pt-2">
                        <button
                            type="button"
                            onClick={() => setEditingFlight(null)}
                            className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition"
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md transition flex justify-center items-center gap-2"
                        >
                            <Save size={18}/> Kaydet
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* --- PRICE HISTORY MODAL (YENİ) --- */}
      <PriceHistoryModal 
        isOpen={isPriceModalOpen}
        onClose={() => setIsPriceModalOpen(false)}
        data={selectedPriceHistory}
        flightNumber={selectedFlightNum}
      />

    </div>
  );
};

export default AdminDashboard;