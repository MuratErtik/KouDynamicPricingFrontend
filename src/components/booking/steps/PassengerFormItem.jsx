import React, { useState } from 'react';
import { User, Calendar, Mail, Phone, CreditCard, CheckCircle, Circle } from 'lucide-react';

const PassengerFormItem = ({ 
  index, 
  data, 
  errors, 
  onChange, 
  isContact, 
  onSetContact 
}) => {
  const [isOpen, setIsOpen] = useState(true);

  // Helper for Input Styling
  const getInputClass = (fieldName) => `
    w-full pl-10 pr-4 py-3 rounded-lg border 
    focus:outline-none focus:ring-2 transition-all duration-200
    ${errors[fieldName] 
      ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50' 
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100 bg-white'
    }
  `;

  return (
    <div className={`mb-6 rounded-2xl border transition-all duration-300 shadow-sm ${isContact ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200'}`}>
      
      {/* Header / Accordion Trigger */}
      <div 
        className="flex justify-between items-center p-4 bg-gray-50 rounded-t-2xl cursor-pointer hover:bg-gray-100 transition"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${isContact ? 'bg-blue-600' : 'bg-gray-400'}`}>
            {index + 1}
          </div>
          <h3 className="font-bold text-gray-700">
            {index + 1}. Yolcu {isContact && <span className="text-xs ml-2 text-blue-600 font-normal">(İletişim Kişisi)</span>}
          </h3>
        </div>
        <span className="text-blue-600 text-sm font-semibold">
          {isOpen ? 'Gizle' : 'Düzenle'}
        </span>
      </div>

      {/* Form Content */}
      {isOpen && (
        <div className="p-6 bg-white rounded-b-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Ad */}
            <div className="relative">
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Ad</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Örn: Ahmet"
                  className={getInputClass('firstName')}
                  value={data.firstName}
                  onChange={(e) => onChange('firstName', e.target.value)}
                />
              </div>
              {errors.firstName && <p className="text-red-500 text-xs mt-1 ml-1">{errors.firstName}</p>}
            </div>

            {/* Soyad */}
            <div className="relative">
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Soyad</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Örn: Yılmaz"
                  className={getInputClass('lastName')}
                  value={data.lastName}
                  onChange={(e) => onChange('lastName', e.target.value)}
                />
              </div>
              {errors.lastName && <p className="text-red-500 text-xs mt-1 ml-1">{errors.lastName}</p>}
            </div>

            {/* TC Kimlik */}
            <div className="relative">
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 ml-1">TC Kimlik No</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  maxLength={11}
                  placeholder="11 Haneli TC Kimlik No"
                  className={getInputClass('identityNumber')}
                  value={data.identityNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, ''); // Only numbers
                    onChange('identityNumber', val);
                  }}
                />
              </div>
              {errors.identityNumber && <p className="text-red-500 text-xs mt-1 ml-1">{errors.identityNumber}</p>}
            </div>

            {/* Doğum Tarihi */}
            <div className="relative">
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Doğum Tarihi</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="date"
                  max={new Date().toISOString().split("T")[0]} // Disable future dates
                  className={getInputClass('birthDate')}
                  value={data.birthDate}
                  onChange={(e) => onChange('birthDate', e.target.value)}
                />
              </div>
              {errors.birthDate && <p className="text-red-500 text-xs mt-1 ml-1">{errors.birthDate}</p>}
            </div>

            {/* Email */}
            <div className="relative">
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 ml-1">E-Posta</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  placeholder="ornek@email.com"
                  className={getInputClass('email')}
                  value={data.email}
                  onChange={(e) => onChange('email', e.target.value)}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>}
            </div>

            {/* Telefon */}
            <div className="relative">
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Cep Telefonu</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="tel"
                  placeholder="555 123 45 67"
                  className={getInputClass('phone')}
                  value={data.phone}
                  onChange={(e) => onChange('phone', e.target.value)}
                />
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1 ml-1">{errors.phone}</p>}
            </div>

          </div>

          {/* Contact Person Toggle */}
          <div className="mt-6 border-t pt-4">
            <div 
              onClick={onSetContact}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${isContact ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50 border border-transparent'}`}
            >
              <div className={`transition-colors ${isContact ? 'text-blue-600' : 'text-gray-400'}`}>
                {isContact ? <CheckCircle size={24} fill="currentColor" className="text-white" /> : <Circle size={24} />}
              </div>
              <div>
                <p className={`font-bold text-sm ${isContact ? 'text-blue-800' : 'text-gray-600'}`}>
                  İletişim bilgileri bu yolcuya aittir
                </p>
                <p className="text-xs text-gray-500">
                  Bilet detayları ve uçuş bildirimleri bu kişiye gönderilecektir.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default PassengerFormItem;