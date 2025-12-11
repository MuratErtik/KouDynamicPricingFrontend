import React, { useState, useEffect } from 'react';
import PassengerFormItem from './PassengerFormItem';
import { toast } from 'react-toastify';
import { ArrowRight, Users } from 'lucide-react';

const PassengerStepContainer = ({ passengerCount, onNext, resetKey }) => {
  // State for all passengers
  const [passengers, setPassengers] = useState([]);
  
  // Index of the passenger selected as contact (Default: 0 / First Passenger)
  const [contactIndex, setContactIndex] = useState(0);
  
  // Validation Errors State: { 0: { firstName: 'Required' }, 1: { ... } }
  const [errors, setErrors] = useState({});

  // Initialize passengers based on prop count
  useEffect(() => {
    const initialPassengers = Array.from({ length: passengerCount }, () => ({
      firstName: '',
      lastName: '',
      identityNumber: '',
      birthDate: '',
      email: '',
      phone: '',
      selectedSeatNumber: null // Placeholder for next step
    }));
    setPassengers(initialPassengers);
    setContactIndex(0);
    setErrors({});
  }, [passengerCount, resetKey]);

  // Handle Input Change for a specific passenger
  const handlePassengerChange = (index, field, value) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index] = { ...updatedPassengers[index], [field]: value };
    setPassengers(updatedPassengers);

    // Clear error for this field if user types
    if (errors[index] && errors[index][field]) {
      const newErrors = { ...errors };
      delete newErrors[index][field];
      setErrors(newErrors);
    }
  };

  // Validation Logic
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    passengers.forEach((p, index) => {
      const passengerErrors = {};

      if (!p.firstName.trim()) passengerErrors.firstName = "Ad zorunludur";
      if (!p.lastName.trim()) passengerErrors.lastName = "Soyad zorunludur";
      
      // TC Identity Validation (Basic 11 digits check)
      if (!p.identityNumber) {
        passengerErrors.identityNumber = "TCKN zorunludur";
      } else if (!/^\d{11}$/.test(p.identityNumber)) {
        passengerErrors.identityNumber = "TCKN 11 haneli olmalıdır";
      }

      if (!p.birthDate) passengerErrors.birthDate = "Doğum tarihi zorunludur";
      
      // Contact Validation (Email/Phone required for everyone, strictly validated for Contact Person)
      if (!p.email) {
        passengerErrors.email = "E-posta zorunludur";
      } else if (!/\S+@\S+\.\S+/.test(p.email)) {
        passengerErrors.email = "Geçersiz e-posta formatı";
      }

      if (!p.phone) passengerErrors.phone = "Telefon zorunludur";

      if (Object.keys(passengerErrors).length > 0) {
        newErrors[index] = passengerErrors;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Submit Handler
  const handleNextClick = () => {
    if (validateForm()) {
      // 1. Extract Contact Person Data
      const contactPerson = passengers[contactIndex];

      // 2. Prepare Root Request Object
      const requestData = {
        contactEmail: contactPerson.email,
        contactPhone: contactPerson.phone,
        passengers: passengers
      };

      console.log("Step 1 Data Ready:", requestData);
      
      // 3. Pass data to parent
      onNext(requestData);
    } else {
      toast.error("Lütfen tüm alanları doğru şekilde doldurunuz.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center gap-2 text-blue-900">
        <Users size={24} />
        <h2 className="text-2xl font-bold">Yolcu Bilgileri</h2>
      </div>

      <div className="space-y-6">
        {passengers.map((passenger, index) => (
          <PassengerFormItem
            key={index}
            index={index}
            data={passenger}
            errors={errors[index] || {}}
            onChange={(field, value) => handlePassengerChange(index, field, value)}
            isContact={contactIndex === index}
            onSetContact={() => setContactIndex(index)}
          />
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleNextClick}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-xl shadow-lg hover:shadow-blue-200 transform hover:-translate-y-0.5 transition-all flex items-center gap-2"
        >
          Devam Et (Koltuk Seçimi) <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default PassengerStepContainer;
