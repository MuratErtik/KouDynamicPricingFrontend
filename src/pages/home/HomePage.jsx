import React from 'react';
import HomeSearchSection from '../../components/home/HomeSearchSection'; // Yeni bileşeni import et
import { MapPin, ArrowRight, Star } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {/* --- 1. HERO SECTION (Mavi Alan) --- */}
      <div className="relative bg-gradient-to-r from-blue-700 to-blue-600 h-[500px] text-white overflow-hidden">
        
        {/* Arka plan dekoratif daireler (Opsiyonel görsel zenginlik) */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>

        {/* Hero İçerik */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full pb-20 px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight drop-shadow-md">
            KOU Airlines ile <br/> Dünyayı Keşfet
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl font-light">
            Konforlu, güvenli ve en uygun fiyatlı uçuşlar sizi bekliyor. Hayalinizdeki tatile bir bilet uzaktasınız.
          </p>
        </div>
      </div>

      {/* --- 2. ARAMA MOTORU (Search Engine) --- */}
      {/* Not: HomeSearchSection içinde '-mt-24' olduğu için yukarıdaki mavi alana taşacaktır */}
      <HomeSearchSection />

      {/* --- 3. POPÜLER DESTİNASYONLAR (İçerik) --- */}
      <div className="container mx-auto px-4 py-20">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Popüler Rotalar</h2>
            <p className="text-gray-500 mt-2">En çok tercih edilen uçuş noktalarını keşfedin.</p>
          </div>
          <button className="hidden md:flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition">
            Tümünü Gör <ArrowRight size={20}/>
          </button>
        </div>

        {/* Kartlar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Kart 1 */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition cursor-pointer border border-gray-100">
            <div className="h-48 bg-gray-200 relative overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1527838832700-5059252407fa?q=80&w=800&auto=format&fit=crop" 
                alt="Istanbul" 
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              />
              <span className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-blue-800 flex items-center gap-1">
                <Star size={12} fill="currentColor"/> 4.9
              </span>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">İstanbul (IST)</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin size={14}/> Türkiye
                  </p>
                </div>
                <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">
                  950₺'den
                </span>
              </div>
            </div>
          </div>

          {/* Kart 2 */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition cursor-pointer border border-gray-100">
            <div className="h-48 bg-gray-200 relative overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=800&auto=format&fit=crop" 
                alt="London" 
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              />
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Londra (LHR)</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin size={14}/> İngiltere
                  </p>
                </div>
                <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">
                  2.450₺'den
                </span>
              </div>
            </div>
          </div>

          {/* Kart 3 */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition cursor-pointer border border-gray-100">
            <div className="h-48 bg-gray-200 relative overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1533929736472-594e69d348eb?q=80&w=800&auto=format&fit=crop" 
                alt="Amsterdam" 
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              />
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Amsterdam (AMS)</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin size={14}/> Hollanda
                  </p>
                </div>
                <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">
                  3.100₺'den
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* --- Footer Öncesi Bilgi Alanı --- */}
      <div className="bg-blue-900 text-white py-16">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <h4 className="text-xl font-bold mb-2">Güvenli Ödeme</h4>
            <p className="text-blue-200 text-sm">256-bit SSL sertifikası ile tüm işlemleriniz güvende.</p>
          </div>
          <div>
            <h4 className="text-xl font-bold mb-2">7/24 Destek</h4>
            <p className="text-blue-200 text-sm">Sorularınız için çağrı merkezimiz her zaman yanınızda.</p>
          </div>
          <div>
            <h4 className="text-xl font-bold mb-2">Kolay İade</h4>
            <p className="text-blue-200 text-sm">Bilet iptal ve değişiklik işlemlerini kolayca yapın.</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default HomePage;