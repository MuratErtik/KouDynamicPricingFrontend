import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, PlaneTakeoff, PlaneLanding, ArrowRightLeft, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import AsyncAirportSelect from '../common/AsyncAirportSelect';
import PassengerCounter from '../common/PassengerCounter';

const HomeSearchSection = () => {
  const navigate = useNavigate();
  
  // --- STATE ---
  const [tripType, setTripType] = useState('one-way'); // 'one-way' | 'round-trip'
  const [fromAirport, setFromAirport] = useState(null);
  const [toAirport, setToAirport] = useState(null);
  const [passengers, setPassengers] = useState(1);
  
  // Date States (Using ISO String YYYY-MM-DD for input compatibility)
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');

  // --- HELPERS ---
  const getTodayDate = () => new Date().toISOString().split('T')[0];

  // --- HANDLERS ---
  const handleSearch = (e) => {
    e.preventDefault();

    // Validation
    if (!fromAirport || !toAirport) {
      toast.warning("Lütfen kalkış ve varış noktalarını seçiniz.");
      return;
    }
    if (fromAirport.id === toAirport.id) {
      toast.error("Kalkış ve varış noktası aynı olamaz.");
      return;
    }
    if (!departureDate) {
      toast.warning("Lütfen gidiş tarihini seçiniz.");
      return;
    }
    if (tripType === 'round-trip' && !returnDate) {
      toast.warning("Lütfen dönüş tarihini seçiniz.");
      return;
    }

    // Navigate to results
    const queryParams = new URLSearchParams({
      fromId: fromAirport.id,
      toId: toAirport.id,
      departureDate,
      ...(tripType === 'round-trip' && { returnDate }),
      passengers
    }).toString();

    navigate(`/flights?${queryParams}`);
  };

  // Date Logic: Ensure Return Date >= Departure Date
  const handleDepartureChange = (e) => {
    const newDate = e.target.value;
    setDepartureDate(newDate);
    // If return date exists and is before new departure, reset it
    if (returnDate && newDate > returnDate) {
      setReturnDate('');
    }
  };

  return (
    <div className="relative -mt-24 z-20 max-w-6xl mx-auto px-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 md:p-8">
        
        {/* --- TRIP TYPE TOGGLE --- */}
        <div className="flex gap-6 mb-6 border-b border-gray-100 pb-4">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="radio" 
              name="tripType" 
              value="one-way"
              checked={tripType === 'one-way'} 
              onChange={() => setTripType('one-way')}
              className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className={`font-bold ${tripType === 'one-way' ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`}>
              Tek Yön
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="radio" 
              name="tripType" 
              value="round-trip"
              checked={tripType === 'round-trip'} 
              onChange={() => setTripType('round-trip')}
              className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className={`font-bold ${tripType === 'round-trip' ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`}>
              Gidiş - Dönüş
            </span>
          </label>
        </div>

        {/* --- MAIN SEARCH FORM --- */}
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          
          {/* 1. FROM (3 Cols) */}
          <div className="md:col-span-3">
            <AsyncAirportSelect 
              label="Nereden" 
              icon={PlaneTakeoff}
              placeholder="Şehir veya Havalimanı"
              onSelect={setFromAirport}
              selectedValue={fromAirport}
              disabledId={toAirport?.id}
            />
          </div>

          {/* SWAP ICON (Optional Visual) */}
          <div className="hidden md:flex md:col-span-1 justify-center pb-4">
            <div className="bg-gray-100 p-2 rounded-full text-gray-400">
              <ArrowRight className="text-gray-400" />
            </div>
          </div>

          {/* 2. TO (3 Cols) */}
          <div className="md:col-span-3">
            <AsyncAirportSelect 
              label="Nereye" 
              icon={PlaneLanding}
              placeholder="Şehir veya Havalimanı"
              onSelect={setToAirport}
              selectedValue={toAirport}
              disabledId={fromAirport?.id}
            />
          </div>

          {/* 3. DATES (3 Cols - Dynamic) */}
          <div className="md:col-span-3 flex gap-2">
            {/* Departure Date */}
            <div className={`relative w-full ${tripType === 'round-trip' ? 'md:w-1/2' : 'w-full'}`}>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Gidiş</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500"><Calendar size={20} /></div>
                <input 
                  type="date"
                  min={getTodayDate()}
                  value={departureDate}
                  onChange={handleDepartureChange}
                  className="w-full pl-10 pr-2 py-4 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all [color-scheme:light]"
                  required
                />
              </div>
            </div>

            {/* Return Date (Conditional) */}
            {tripType === 'round-trip' && (
              <div className="relative w-full md:w-1/2 animate-in fade-in slide-in-from-left-4">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Dönüş</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500"><Calendar size={20} /></div>
                  <input 
                    type="date"
                    min={departureDate || getTodayDate()}
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full pl-10 pr-2 py-4 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all [color-scheme:light]"
                    required
                  />
                </div>
              </div>
            )}
          </div>

          {/* 4. PASSENGERS (2 Cols) */}
          <div className="md:col-span-2">
            <PassengerCounter count={passengers} onChange={setPassengers} />
          </div>

        </form>

        {/* --- SEARCH BUTTON --- */}
        <div className="mt-6 flex justify-end">
          <button 
            onClick={handleSearch}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 px-12 rounded-xl shadow-lg hover:shadow-blue-200 transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3"
          >
            <Search size={24} />
            Uçuş Ara
          </button>
        </div>

      </div>
    </div>
  );
};

export default HomeSearchSection;