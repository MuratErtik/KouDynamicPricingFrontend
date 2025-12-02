import React, { useEffect, useState } from "react";
import adminService from "../../services/adminService";
import publicService from "../../services/publicService";
import { toast } from "react-toastify";
import { Trash2, Plus, Plane } from "lucide-react";

const AdminDashboard = () => {
  const [flights, setFlights] = useState([]);
  const [airports, setAirports] = useState([]);

  // Yeni uçuş formu state'i
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
      // Promise.all ile iki isteği paralel atıyoruz
      const [flightsData, airportsData] = await Promise.all([
        adminService.getAllFlights(),

        publicService.getAirports(), // <--- EKSİK OLAN KISIM BURASIYDI
      ]);

      setFlights(flightsData);
      setAirports(airportsData); // <--- State'i güncellemeyi unutma
    } catch (error) {
      console.error(error);
      toast.error("Veriler yüklenirken hata oluştu.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bu uçuşu silmek istediğinize emin misiniz?")) {
      try {
        await adminService.deleteFlight(id);
        toast.success("Uçuş başarıyla silindi.");
        setFlights(flights.filter((f) => f.id !== id));
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
      toast.success("Uçuş planlandı!");
      setNewFlight({
        departureAirportId: "",
        arrivalAirportId: "",
        departureTime: "",
      });
      loadData(); // Listeyi yenile
    } catch (error) {
      toast.error("Uçuş oluşturulamadı.");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-900 mb-8 flex items-center gap-2">
        <Plane /> Uçuş Yönetim Paneli
      </h1>

      {/* Yeni Uçuş Ekleme Formu (Basit Kart Görünümü) */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-10 border-l-4 border-blue-500">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Yeni Uçuş Planla
        </h2>
        <form
          onSubmit={handleCreate}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nereden
            </label>
            <select
              className="w-full border p-2 rounded"
              value={newFlight.departureAirportId}
              onChange={(e) =>
                setNewFlight({
                  ...newFlight,
                  departureAirportId: e.target.value,
                })
              }
              required
            >
              <option value="">Seçiniz</option>
              {airports.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.city} ({a.iataCode})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nereye
            </label>
            <select
              className="w-full border p-2 rounded"
              value={newFlight.arrivalAirportId}
              onChange={(e) =>
                setNewFlight({ ...newFlight, arrivalAirportId: e.target.value })
              }
              required
            >
              <option value="">Seçiniz</option>
              {airports.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.city} ({a.iataCode})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tarih ve Saat
            </label>
            <input
              type="datetime-local"
              className="w-full border p-2 rounded"
              value={newFlight.departureTime}
              onChange={(e) =>
                setNewFlight({ ...newFlight, departureTime: e.target.value })
              }
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 font-bold flex justify-center items-center gap-2"
          >
            <Plus size={18} /> Planla
          </button>
        </form>
      </div>

      {/* Uçuş Listesi Tablosu */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Uçuş No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rota
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tarih
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Durum
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fiyat
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlem
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {flights.map((flight) => (
              <tr key={flight.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-blue-900">
                  {flight.flightNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {flight.departureAirport?.city} ➝{" "}
                  {flight.arrivalAirport?.city}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(flight.departureTime).toLocaleString("tr-TR")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {flight.status || "Aktif"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-700">
                  {flight.basePrice} ₺
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={() => handleDelete(flight.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
