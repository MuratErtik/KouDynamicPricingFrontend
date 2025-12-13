import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plane, User, LogOut, Calendar, Ticket } from 'lucide-react'; // Ticket ikonu eklendi
import { useAuth } from '../../context/AuthContext';
import PnrSearchModal from '../home/PnrSearchModal'; // Modal import edildi

const Header = () => {
  const { user, logout } = useAuth();
  
  // Modal görünürlük state'i
  const [isPnrModalOpen, setIsPnrModalOpen] = useState(false);

  return (
    <>
      <header className="bg-blue-600 text-white shadow-md relative z-40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold hover:text-blue-100 transition">
            <Plane className="w-8 h-8 rotate-[-45deg]" />
            <span>KOU Airlines</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            
            {/* --- YENİ: Bilet Sorgula Butonu (Herkes görebilir) --- */}
            <button 
              onClick={() => setIsPnrModalOpen(true)}
              className="flex items-center gap-2 text-white hover:text-blue-200 font-medium transition-colors"
            >
              <Ticket size={20} />
              <span className="hidden md:inline">Bilet Sorgula</span>
            </button>
            
            {/* Ayırıcı Çizgi */}
            <div className="h-5 w-[1px] bg-blue-400 hidden md:block"></div>

            {!user ? (
              // Giriş Yapmamış Kullanıcı
              <>
                <Link to="/login" className="hover:text-blue-200 font-medium">Giriş Yap</Link>
                <Link
                  to="/signup"
                  className="bg-white text-blue-600 px-4 py-2 rounded-full font-bold hover:bg-blue-50 transition shadow-sm"
                >
                  Kayıt Ol
                </Link>
              </>
            ) : (
              // Giriş Yapmış Kullanıcı
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 font-medium">
                  <User size={18} />
                  Merhaba, {user.name}
                </span>

                {user.role === 'ROLE_ADMIN' && (
                  <div className="flex gap-2">
                    <Link to="/admin/dashboard" className="text-sm bg-blue-700 px-3 py-1 rounded hover:bg-blue-800">
                      Uçuşlar
                    </Link>
                    <Link to="/admin/special-days" className="text-sm bg-purple-600 px-3 py-1 rounded hover:bg-purple-700 flex items-center gap-1">
                      <Calendar size={14} /> Özel Günler
                    </Link>
                  </div>
                )}

                <button
                  onClick={logout}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition"
                >
                  <LogOut size={16} /> Çıkış
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* --- PNR MODAL --- */}
      {/* Header bileşeninin return kısmında, header tag'inin dışına ekliyoruz */}
      <PnrSearchModal 
        isOpen={isPnrModalOpen} 
        onClose={() => setIsPnrModalOpen(false)} 
      />
    </>
  );
};

export default Header;