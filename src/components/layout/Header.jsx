import React from 'react';
import { Link } from 'react-router-dom';
import { Plane, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; // Hook'u import ettik

const Header = () => {
  const { user, logout } = useAuth(); // Context'ten verileri çek

  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold hover:text-blue-100 transition">
          <Plane className="w-8 h-8" />
          <span>KOU Airlines</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
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
                {/* İsim Context'ten geliyor */}
                Merhaba, {user.name} 
              </span>
              
              {/* Admin Linki (Sadece Adminlere) */}
              {user.role === 'ROLE_ADMIN' && (
                <Link to="/admin/dashboard" className="text-sm bg-blue-700 px-3 py-1 rounded hover:bg-blue-800">
                  Yönetim Paneli
                </Link>
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
  );
};

export default Header;