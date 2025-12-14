import React, { useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { X, TrendingUp, Info } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const PriceHistoryModal = ({ isOpen, onClose, data, flightNumber }) => {
  
  useEffect(() => {
    if (isOpen && data) {
      console.log("Grafik Verisi Yüklendi:", data);
    }
  }, [isOpen, data]);

  if (!isOpen || !data) return null;

  // Veriyi grafik için formatla
  const chartData = data.priceHistories.map(item => ({
    ...item,
    formattedDate: format(new Date(item.changeTime), 'dd MMM HH:mm', { locale: tr }),
    timestamp: new Date(item.changeTime).getTime() 
  })).sort((a, b) => a.timestamp - b.timestamp);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      const isNegative = d.priceChangePercentage < 0;

      return (
        <div className="bg-white p-4 rounded-xl shadow-2xl border border-gray-100 min-w-[250px] animate-in fade-in zoom-in-95 duration-200" style={{ zIndex: 100 }}>
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
            <span className="text-gray-500 text-xs font-bold uppercase">{d.formattedDate}</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isNegative ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {isNegative ? '▼ İndirim' : '▲ Zam'}
            </span>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Eski Fiyat:</span>
              {/* DÜZELTME: ₺ yerine $ ve başa alındı */}
              <span className="font-mono text-gray-400 line-through">${d.oldPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-bold">Yeni Fiyat:</span>
              {/* DÜZELTME: ₺ yerine $ ve başa alındı */}
              <span className="font-mono text-xl font-bold text-blue-600">${d.newPrice.toFixed(2)}</span>
            </div>
            
            <div className="bg-gray-50 p-2 rounded-lg mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span>Değişim:</span>
                <span className={`font-bold ${isNegative ? 'text-green-600' : 'text-red-600'}`}>
                  {isNegative ? '' : '+'}{d.priceChangePercentage.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Fuzzy Çarpanı:</span>
                <span className="font-mono text-purple-600">{d.fuzzyMultiplier?.toFixed(4) || '-'}</span>
              </div>
              <div className="flex justify-between text-xs pt-1 border-t border-gray-200 mt-1">
                <span>Sebep:</span>
                <span className="font-medium text-gray-700 italic">{d.reason}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-6 flex justify-between items-center text-white shrink-0">
          <div>
            <div className="flex items-center gap-2 opacity-80 mb-1">
              <TrendingUp size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Dinamik Fiyatlandırma Analizi</span>
            </div>
            <h2 className="text-2xl font-bold">Uçuş #{flightNumber} Fiyat Geçmişi</h2>
          </div>
          <button onClick={onClose} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition">
            <X size={24} />
          </button>
        </div>

        {/* İstatistik Barı */}
        <div className="flex gap-4 p-6 bg-gray-50 border-b border-gray-100 shrink-0 overflow-x-auto">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-1 min-w-[150px]">
            <p className="text-xs text-gray-400 uppercase font-bold mb-1">Ortalama Fiyat</p>
            {/* DÜZELTME: $ sembolü */}
            <p className="text-2xl font-bold text-gray-800">${data.averagePrice.toFixed(2)}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-1 min-w-[150px]">
            <p className="text-xs text-gray-400 uppercase font-bold mb-1">Toplam Değişim</p>
            <p className="text-2xl font-bold text-blue-600">{data.priceHistories.length} Kez</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-1 min-w-[150px]">
            <p className="text-xs text-gray-400 uppercase font-bold mb-1">Son Fiyat</p>
            {/* DÜZELTME: $ sembolü */}
            <p className="text-2xl font-bold text-green-600">
              ${data.priceHistories[data.priceHistories.length - 1]?.newPrice.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Grafik Alanı */}
        <div className="w-full h-[400px] p-6 bg-white">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              
              <XAxis 
                dataKey="formattedDate" 
                tick={{ fontSize: 12, fill: '#6b7280' }} 
                tickMargin={10}
                stroke="#d1d5db"
              />
              
              <YAxis 
                domain={['auto', 'auto']} 
                tick={{ fontSize: 12, fill: '#6b7280' }} 
                // DÜZELTME: Y Ekseninde $ sembolü
                tickFormatter={(value) => `$${value}`}
                stroke="#d1d5db"
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              <Line 
                type="monotone" 
                dataKey="newPrice" 
                stroke="#2563eb" 
                strokeWidth={3}
                dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 8, fill: '#1d4ed8', strokeWidth: 0 }}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t text-center text-xs text-gray-400 shrink-0">
          <Info size={12} className="inline mr-1" />
          Grafik üzerindeki noktalara gelerek detaylı analiz verilerini (Fuzzy çarpanı, değişim sebebi vb.) görüntüleyebilirsiniz.
        </div>

      </div>
    </div>
  );
};

export default PriceHistoryModal;