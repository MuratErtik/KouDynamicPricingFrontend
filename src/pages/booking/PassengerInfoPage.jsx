import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import { User, Mail, Phone, Calendar, CreditCard, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';

const PassengerInfoPage = () => {
  const navigate = useNavigate();
  const { bookingData, updateBookingData } = useBooking();
  const [passengers, setPassengers] = useState([]);
  const [contactEmailIndex, setContactEmailIndex] = useState(null);

  useEffect(() => {
    // Yolcu sayısı kadar boş form oluştur
    const initialPassengers = Array.from({ length: bookingData.passengerCount }, () => ({
      firstName: '',
      lastName: '',
      identityNumber: '',
      birthDate: '',
      email: '',
      phone: '',
      selectedSeatNumber: '' // Şimdilik boş, koltuk seçiminde dolacak
    }));
    setPassengers(initialPassengers);
  }, [bookingData.passengerCount]);

  const handleInputChange = (index, field, value) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index][field] = value;
    setPassengers(updatedPassengers);
  };

  const handleContactEmailSelect = (index) => {
    // Sadece bir kişi seçilebilir
    setContactEmailIndex(index);
  };

  const validateForm = () => {
    // Tüm alanların dolu olup olmadığını kontrol et
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.firstName || !p.lastName || !p.identityNumber || !p.birthDate || !p.email || !p.phone) {
        toast.error(`Lütfen ${i + 1}. yolcunun tüm bilgilerini doldurun.`);
        return false;
      }
      // Email formatı kontrolü
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(p.email)) {
        toast.error(`${i + 1}. yolcunun e-posta adresi geçersiz.`);
        return false;
      }
      // TC Kimlik No kontrolü (11 haneli)
      if (p.identityNumber.length !== 11 || !/^\d+$/.test(p.identityNumber)) {
        toast.error(`${i + 1}. yolcunun kimlik numarası 11 haneli olmalıdır.`);
        return false;
      }
      // Telefon kontrolü
      if (!p.phone.startsWith('+') || p.phone.length < 10) {
        toast.error(`${i + 1}. yolcunun telefon numarası geçersiz. Örn: +905551234567`);
        return false;
      }
    }

    // İletişim e-postası seçilmiş mi?
    if (contactEmailIndex === null) {
      toast.warning('Lütfen iletişim için bir yolcu seçin.');
      return false;
    }

    return true;
  };

  const handleContinue = () => {
    if (!validateForm()) return;

    // Contact email'i belirle
    const contactEmail = passengers[contactEmailIndex].email;

    // Context'e kaydet
    updateBookingData({
      passengers,
      contactEmail
    });

    // Koltuk seçimi sayfasına yönlendir
    navigate('/booking/seat-selection');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* BAŞLIK */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Yolcu Bilgileri</h1>
          <p className="text-gray-600">Lütfen tüm yolcuların bilgilerini eksiksiz doldurun.</p>
        </div>

        {/* YOLCU FORMLARI */}
        <div className="space-y-6">
          {passengers.map((passenger, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
              
              {/* Yolcu Başlığı */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <User className="text-blue-600" size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">{index + 1}. Yolcu</h2>
                </div>

                {/* İletişim Checkbox */}
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={contactEmailIndex === index}
                    onChange={() => handleContactEmailSelect(index)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-600 group-hover:text-blue-600 transition flex items-center gap-2">
                    <Mail size={16} />
                    İletişim için bu yolcuyu kullan
                  </span>
                </label>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Ad */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                    Ad <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={passenger.firstName}
                    onChange={(e) => handleInputChange(index, 'firstName', e.target.value)}
                    placeholder="Murat"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    required
                  />
                </div>

                {/* Soyad */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                    Soyad <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={passenger.lastName}
                    onChange={(e) => handleInputChange(index, 'lastName', e.target.value)}
                    placeholder="Ertik"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    required
                  />
                </div>

                {/* TC Kimlik No */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                    TC Kimlik No <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <CreditCard size={20} />
                    </div>
                    <input
                      type="text"
                      value={passenger.identityNumber}
                      onChange={(e) => handleInputChange(index, 'identityNumber', e.target.value.replace(/\D/g, '').slice(0, 11))}
                      placeholder="12345678901"
                      maxLength="11"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Doğum Tarihi */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                    Doğum Tarihi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Calendar size={20} />
                    </div>
                    <input
                      type="date"
                      value={passenger.birthDate}
                      onChange={(e) => handleInputChange(index, 'birthDate', e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all [color-scheme:light]"
                      required
                    />
                  </div>
                </div>

                {/* E-posta */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                    E-posta <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Mail size={20} />
                    </div>
                    <input
                      type="email"
                      value={passenger.email}
                      onChange={(e) => handleInputChange(index, 'email', e.target.value)}
                      placeholder="murat@example.com"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Telefon */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                    Telefon <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Phone size={20} />
                    </div>
                    <input
                      type="tel"
                      value={passenger.phone}
                      onChange={(e) => handleInputChange(index, 'phone', e.target.value)}
                      placeholder="+905551234567"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      required
                    />
                  </div>
                </div>

              </div>

              {/* İletişim Seçimi Bilgisi */}
              {contactEmailIndex === index && (
                <div className="mt-4 flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
                  <CheckCircle2 size={20} />
                  <span className="text-sm font-medium">Bu yolcunun e-postası iletişim adresi olarak kullanılacaktır.</span>
                </div>
              )}

            </div>
          ))}
        </div>

        {/* İLERLE BUTONU */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleContinue}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 px-12 rounded-xl shadow-lg hover:shadow-blue-200 transform hover:-translate-y-0.5 transition-all flex items-center gap-3"
          >
            Koltuk Seçimine Geç
            <CheckCircle2 size={24} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default PassengerInfoPage;