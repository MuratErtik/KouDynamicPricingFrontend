import React from 'react';
import { Link } from 'react-router-dom';
import { Plane, User, LogOut, Calendar } from 'lucide-react';
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

              {user.role === 'ROLE_ADMIN' && (
                <div className="flex gap-2">
                  <Link to="/admin/dashboard" className="text-sm bg-blue-700 px-3 py-1 rounded hover:bg-blue-800">
                    Uçuşlar
                  </Link>
                  {/* NEW LINK */}
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
  );
};

export default Header;