import React, { useEffect, useState } from "react";
import adminService from "../../services/adminService";
import publicService from "../../services/publicService";
import { toast } from "react-toastify";
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
  Users // Koltuk ikonu için
} from "lucide-react";

const AdminDashboard = () => {
  const [flights, setFlights] = useState([]);
  const [airports, setAirports] = useState([]);
  
  // Pagination State'leri
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [newFlight, setNewFlight] = useState({
    departureAirportId: "",
    arrivalAirportId: "",
    departureTime: "",
  });

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

  // --- YARDIMCI: Tarih Formatlama ---
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
    <div className="container mx-auto p-6 min-h-screen bg-gray-50/50">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-900 flex items-center gap-3">
          <Plane className="text-blue-600" /> Uçuş Yönetim Paneli
        </h1>
        <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm border">
            Toplam <strong>{flights.length}</strong> Uçuş Listeleniyor
        </div>
      </div>

      {/* --- YENİ UÇUŞ EKLEME KARTI --- */}
      <div className="bg-white p-8 rounded-xl shadow-lg mb-10 border border-blue-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
        <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
           <Plus className="bg-blue-100 text-blue-600 rounded-full p-1" size={24}/> Yeni Uçuş Planla
        </h2>
        
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-7 gap-6 items-end">
          {/* NEREDEN SELECT */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nereden</label>
            <div className="relative">
                {/* İkonu dikeyde tam ortalamak için top-1/2 ve -translate-y-1/2 kullanıyoruz */}
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
                    {airports.map((a) => (
                        <option key={a.id} value={a.id}>{a.city} ({a.iataCode})</option>
                    ))}
                </select>
            </div>
          </div>

          {/* NEREYE SELECT */}
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
                    {airports.map((a) => (
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

      {/* --- TABLO --- */}
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
                {/* YENİ EKLENEN SÜTUN: KOLTUK */}
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
                
                // Doluluk Hesabı
                const bookedSeats = flight.totalSeats - flight.remainingSeats;
                const occupancyRate = Math.round((bookedSeats / flight.totalSeats) * 100);

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

                  {/* DOLULUK ORANI (Koltuk) */}
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
                          flight.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                      {flight.status === 'SCHEDULED' ? 'Zamanında' : flight.status}
                    </span>
                  </td>

                  {/* Fiyat */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900 font-bold text-lg">${flight.basePrice}</div>
                  </td>

                  {/* İşlem */}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleDelete(flight.id)}
                      className="text-gray-400 hover:text-red-600 bg-white hover:bg-red-50 p-2 rounded-lg border border-transparent hover:border-red-100 transition shadow-sm"
                      title="Uçuşu Sil"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>

        {/* --- PAGINATION FOOTER --- */}
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
    </div>
  );
};

export default AdminDashboard;