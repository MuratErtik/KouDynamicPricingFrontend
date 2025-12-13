import React from 'react';
import HomeSearchSection from '../../components/home/HomeSearchSection';
import { ShieldCheck, Headset, RefreshCw } from 'lucide-react'; // İkonları görsel zenginlik için ekledim

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      
      {/* --- 1. HERO SECTION --- */}
      <div className="relative bg-gradient-to-r from-blue-700 to-blue-600 h-[500px] text-white overflow-hidden">
        {/* Dekoratif Arka Plan */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full pb-20 px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight drop-shadow-md">
            KOU Airlines ile <br/> Dünyayı Keşfet
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl font-light">
            Konforlu, güvenli ve en uygun fiyatlı uçuşlar sizi bekliyor.
          </p>
        </div>
      </div>

      {/* --- 2. ARAMA MOTORU --- */}
      {/* -mt-24 ile yukarı taşıyoruz */}
      <HomeSearchSection />

      {/* Araya boşluk veya Popüler Rotalar vb. gelebilir. 
          Şimdilik boşluk bırakarak alt kısmı aşağı itiyoruz. */}
      <div className="flex-grow"></div> 

      {/* --- 3. BİLGİ ALANI (DÜZELTİLEN KISIM) --- */}
      {/* mt-32: Arama motorunun üzerine binmemesi için yukarıdan boşluk bırakıldı */}
      <div className="bg-blue-900 text-white py-20 mt-32">
        <div className="container mx-auto px-4">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            
            {/* Kart 1 */}
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="bg-blue-800 p-4 rounded-full mb-2">
                <ShieldCheck size={32} className="text-blue-200" />
              </div>
              <h4 className="text-xl font-bold">Güvenli Ödeme</h4>
              <p className="text-blue-200 text-sm max-w-xs mx-auto">
                256-bit SSL sertifikası ile tüm işlemleriniz güvende.
              </p>
            </div>

            {/* Kart 2 */}
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="bg-blue-800 p-4 rounded-full mb-2">
                <Headset size={32} className="text-blue-200" />
              </div>
              <h4 className="text-xl font-bold">7/24 Destek</h4>
              <p className="text-blue-200 text-sm max-w-xs mx-auto">
                Sorularınız için çağrı merkezimiz her zaman yanınızda.
              </p>
            </div>

            {/* Kart 3 */}
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="bg-blue-800 p-4 rounded-full mb-2">
                <RefreshCw size={32} className="text-blue-200" />
              </div>
              <h4 className="text-xl font-bold">Kolay İade</h4>
              <p className="text-blue-200 text-sm max-w-xs mx-auto">
                Bilet iptal ve değişiklik işlemlerini kolayca yapın.
              </p>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};

export default HomePage;