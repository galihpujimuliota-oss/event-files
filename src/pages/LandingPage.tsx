import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, CreditCard, Info } from 'lucide-react';
import { motion } from 'motion/react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 md:p-10"
    >
      <div className="text-center mb-10">
        <motion.h2 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-2xl md:text-3xl font-extrabold text-slate-800 uppercase tracking-tight mb-4 leading-snug"
        >
          Registrasi Kegiatan Yudisium & Pengukuhan<br className="hidden md:block"/> Guru Profesional PPG Daljab Batch 4 Tahun 2025
        </motion.h2>
        <motion.span 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="inline-block bg-[#1e3a8a] text-white px-4 py-1.5 rounded-full text-sm font-semibold tracking-wider shadow-sm"
        >
          LPTK UIN Maulana Malik Ibrahim Malang
        </motion.span>
      </div>

      <div className="prose max-w-none text-slate-600 space-y-6">
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-center md:text-left leading-relaxed"
        >
          Selamat Datang Peserta <strong className="text-slate-800">"Yudisium dan Pengukuhan Guru Profesional bagi Mahasiswa PPG Daljab Batch 4 2025 FITK - LPTK UIN Maulana Malik Ibrahim Malang"</strong> di website yang dikelola oleh Ascent Premiere Hotel and Convention Bersama Prodi PPG untuk registrasi peserta.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="bg-blue-50 border border-blue-100 rounded-lg p-6 space-y-4 shadow-sm my-8 hover:shadow-md transition-shadow"
        >
          <h3 className="font-bold text-blue-900 border-b border-blue-200 pb-2 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5"/> Informasi Acara
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800">Waktu Pelaksanaan</p>
                  <p>Hari: Kamis<br/>Tanggal: 02 Mei 2026</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800">Tempat</p>
                  <p>Ascent Premiere Hotel and Convention</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-3">
                  <div>
                    <span className="font-semibold text-slate-800 block">Biaya Acara (LURING)</span>
                    <span className="text-lg font-bold text-rose-600">Rp 450.000,00</span>
                    <p className="text-xs text-slate-500 mt-1">
                      (Rincian: Hotel Rp 350.000 + Legalisir Rp 100.000)
                    </p>
                  </div>
                  
                  <div className="bg-white p-3 rounded border border-slate-200">
                    <p className="text-xs font-semibold text-slate-800 mb-1">Transfer Pembayaran:</p>
                    <p className="font-mono text-slate-700">🏦 BANK BRI</p>
                    <p className="font-mono text-slate-700">📛 An. IMAM KHOIRUDDIN</p>
                    <p className="font-mono font-bold text-slate-900">🔢 612901018729531</p>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-800 block">Biaya Acara (DARING)</span>
                    <span className="text-green-600 font-bold">GRATIS  + Rp 100.000</span>
                    <p className="text-xs text-slate-500 mt-1">
                      (Tidak Dipungut Biaya + Biaya Legalisir Rp 100.000)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-4 rounded mt-6 text-center">
            <p className="text-red-700 font-bold text-sm mb-1 uppercase tracking-wider">Batas Akhir Pengisian Form</p>
            <p className="text-slate-800 font-semibold text-lg">Tanggal 10 Juni 2026, Pukul 16.00 WIB</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="flex justify-center mt-10"
        >
          <button 
            onClick={() => navigate('/login')}
            className="bg-[#1e3a8a] hover:bg-[#0f172a] text-white px-10 py-3.5 rounded-md font-bold shadow-md transform transition-all active:scale-95 text-lg hover:shadow-lg"
          >
            Mulai Registrasi
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
