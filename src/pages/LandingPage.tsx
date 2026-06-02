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
          className="text-2xl md:text-3xl font-extrabold text-slate-800 uppercase tracking-tight mb-4 leading-relaxed"
        >
          Registrasi Kegiatan Yudisium & Pengukuhan<br className="hidden md:block"/> Guru Profesional PPG Daljab Batch 4 2025
        </motion.h2>
        <motion.span 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="inline-block bg-teal-50 text-teal-700 border border-teal-200 px-5 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase shadow-sm"
        >
          LPTK UIN Maulana Malik Ibrahim Malang
        </motion.span>
      </div>

      <div className="prose max-w-none text-slate-600 space-y-6">
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-slate-500 leading-relaxed max-w-3xl mx-auto"
        >
          Selamat Datang Peserta <strong className="text-slate-800 font-semibold">"Yudisium dan Pengukuhan Guru Profesional"</strong> di portal registrasi digital yang dikelola bersama Ascent Premiere Hotel and Convention Malang.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="bg-white border border-slate-100 rounded-2xl p-6 md:p-8 space-y-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] my-10 relative overflow-hidden"
        >
          {/* Subtle decoration inside the box */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50/50 rounded-full blur-3xl -mr-10 -mt-10" />

          <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2 relative z-10">
            <div className="p-1.5 bg-teal-50 rounded-lg"><Info className="w-4 h-4 text-teal-600"/></div> 
            Informasi Pelaksanaan
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm relative z-10">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                  <Calendar className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 mb-1">Waktu Penyelenggaraan</p>
                  <p className="text-slate-500 leading-snug">Hari: Kamis<br/>Tanggal: 02 Mei 2026</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                  <MapPin className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 mb-1">Lokasi Yudisium</p>
                  <p className="text-slate-500">Ascent Premiere Hotel and Convention</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                  <CreditCard className="w-5 h-5 text-teal-600" />
                </div>
                <div className="space-y-4 w-full">
                  <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100 space-y-4">
                    <p className="text-[11px] font-semibold text-teal-600 uppercase tracking-wider mb-2">Instruksi Pembayaran</p>
                    
                    <div>
                      <p className="font-semibold text-slate-800 text-sm mb-1">Pembayaran Hotel</p>
                      <p className="text-xs text-slate-500 mb-1">Silakan transfer sebesar <strong className="text-slate-700">Rp 350.000,00</strong> ke rekening:</p>
                      <p className="font-mono text-slate-600 text-sm">Bank BRI</p>
                      <p className="font-mono text-slate-600 text-sm">An. IMAM KHOIRUDDIN</p>
                      <p className="font-mono font-bold text-slate-800 mt-0.5">612901018729531</p>
                    </div>

                    <div className="pt-2 border-t border-slate-200">
                      <p className="font-semibold text-slate-800 text-sm mb-1">Pembayaran Legalisir</p>
                      <p className="text-xs text-slate-500 mb-1">Silakan transfer sebesar <strong className="text-slate-700">Rp 100.000,00</strong> ke rekening:</p>
                      <p className="font-mono text-slate-600 text-sm">Bank BRI</p>
                      <p className="font-mono text-slate-600 text-sm">An. Hariono</p>
                      <p className="font-mono font-bold text-slate-800 mt-0.5">350501055880533</p>
                    </div>

                    <p className="text-[10px] text-rose-500 mt-2 bg-rose-50 p-2 rounded italic leading-relaxed">
                      * Pembayaran terpisah/sendiri-sendiri tidak dijadikan 1. Contoh: hotel bayar sendiri, legalisir bayar sendiri.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100/50 p-4 rounded-xl mt-6 text-center relative z-10 shadow-sm shadow-teal-100/20">
            <p className="text-teal-700 font-bold text-xs mb-1 uppercase tracking-widest">Batas Akhir Sesi Pendaftaran</p>
            <p className="text-teal-900 font-medium text-lg">10 Juni 2026 &mdash; 16.00 WIB</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="flex justify-center mt-10 pb-6"
        >
          <button 
            onClick={() => navigate('/login')}
            className="group relative px-8 py-4 bg-teal-600 text-white rounded-xl font-semibold shadow-[0_8px_20px_-4px_rgba(13,148,136,0.4)] overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto min-w-[240px]"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Mulai Registrasi <span className="transition-transform group-hover:translate-x-1">→</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-teal-700 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
