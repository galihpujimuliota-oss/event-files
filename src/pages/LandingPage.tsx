import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Calendar, MapPin, CreditCard, Info, Copy, Check, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

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
          className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight mb-4 leading-relaxed whitespace-pre-line"
        >
          Registrasi Kegiatan{"\n"}
          Yudisium & Pengukuhan Guru Profesional{"\n"}
          PPG Dalam Jabatan Batch 4 Tahun 2025{"\n"}
          FITK - LPTK UIN Maulana Malik Ibrahim Malang
        </motion.h2>
      </div>

      <div className="prose max-w-none text-slate-600 space-y-6">
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-slate-500 leading-relaxed max-w-3xl mx-auto text-sm md:text-base"
        >
          Selamat Datang Peserta <strong className="text-slate-800 font-semibold">"Yudisium dan Pengukuhan Guru Profesional"</strong> di portal registrasi digital yang dikelola bersama Ascent Premiere Hotel and Convention Malang.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-8 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.06),0_12px_24px_-4px_rgba(0,0,0,0.03)] my-10 relative overflow-hidden"
        >
          {/* Subtle decoration inside the box */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-teal-50/40 rounded-full blur-3xl -mr-16 -mt-16" />

          <h3 className="font-extrabold text-slate-800 text-lg border-b border-slate-150 pb-3.5 flex items-center gap-2 relative z-10 font-sans">
            <div className="p-1.5 bg-teal-50 rounded-xl animate-pulse"><Info className="w-5 h-5 text-teal-600"/></div> 
            Informasi Pelaksanaan & Pembayaran Resmi
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
            {/* Left side: Event Core Info */}
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-5 space-y-4">
                <p className="text-xs font-bold text-teal-700 uppercase tracking-widest">Detail Pelaksanaan</p>
                
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-white shadow-sm rounded-xl border border-slate-100">
                    <Calendar className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm mb-0.5">Waktu Penyelenggaraan</p>
                    <p className="text-slate-500 text-xs leading-relaxed font-medium">Hari: Kamis<br/>Tanggal: 02 Mei 2026</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 pt-2">
                  <div className="p-2.5 bg-white shadow-sm rounded-xl border border-slate-100">
                    <MapPin className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm mb-0.5">Lokasi Yudisium</p>
                    <p className="text-slate-500 text-xs leading-relaxed font-medium">Ascent Premiere Hotel and Convention Malang</p>
                  </div>
                </div>
              </div>

              {/* Deadline card */}
              <div className="bg-gradient-to-r from-teal-50 to-emerald-550 border border-teal-100 p-5 rounded-2xl text-left shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-teal-700 mb-1">Batas Sesi Pendaftaran</p>
                <p className="text-lg font-extrabold text-teal-950">10 Juni 2026</p>
                <p className="text-xs text-teal-750 font-medium">Pukul 16.00 WIB malam</p>
              </div>
            </div>

            {/* Right side: Payment details organic cards */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="w-5 h-5 text-teal-600 animate-bounce" style={{ animationDuration: '3s' }} />
                <h4 className="font-extrabold text-slate-800 text-sm font-sans">Daftar Rekening Pembayaran</h4>
              </div>

              <div className="space-y-4">
                {/* 1. Pembayaran Hotel */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4.5 hover:border-teal-400 transition-all shadow-sm space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="bg-indigo-650 text-indigo-700 bg-indigo-50 border border-indigo-150 text-[10px] sm:text-xs font-bold px-3 py-1 rounded-xl">
                        🏨 A. Pembayaran Penginapan Hotel (Luring)
                      </span>
                      <p className="text-[11px] text-slate-500 mt-2 font-semibold">Khusus untuk peserta dengan kehadiran <strong className="text-slate-700">LURING</strong></p>
                    </div>
                    <span className="text-teal-700 font-extrabold text-sm font-mono tracking-tight bg-teal-50 border border-teal-100 px-3 py-1 rounded-xl shrink-0">
                      Rp 350.000,00
                    </span>
                  </div>
                  
                  <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 flex justify-between items-center gap-3">
                    <div className="text-xs font-semibold text-slate-700 font-sans">
                      <span className="text-[9px] text-slate-400 font-bold block uppercase">REKENING BANK BRI</span>
                      <span className="text-sm font-extrabold font-mono text-slate-850">612901018729531</span>
                      <span className="text-[10px] text-indigo-650 font-bold block mt-0.5">An. IMAM KHOIRUDDIN</span>
                    </div>
                    <button 
                      onClick={() => handleCopy('612901018729531', 'hotel')}
                      className="text-slate-400 hover:text-indigo-600 transition-colors p-2.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-200 active:scale-95"
                      title="Salin No. Rekening"
                    >
                      {copiedId === 'hotel' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* 2. Pembayaran Legalisir */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4.5 hover:border-teal-400 transition-all shadow-sm space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="bg-teal-650 text-teal-700 bg-teal-50 border border-teal-150 text-[10px] sm:text-xs font-bold px-3 py-1 rounded-xl">
                        🎓 B. Pembayaran Legalisir (Daring & Luring)
                      </span>
                      <p className="text-[11px] text-slate-500 mt-2 font-semibold">Wajib dibayar oleh <strong className="text-slate-700">SEMUA PESERTA</strong> (Daring & Luring)</p>
                    </div>
                    <span className="text-teal-700 font-extrabold text-sm font-mono tracking-tight bg-teal-50 border border-teal-100 px-3 py-1 rounded-xl shrink-0">
                      Rp 100.000,00
                    </span>
                  </div>
                  
                  <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 flex justify-between items-center gap-3">
                    <div className="text-xs font-semibold text-slate-700 font-sans">
                      <span className="text-[9px] text-slate-400 font-bold block uppercase">REKENING BANK BRI</span>
                      <span className="text-sm font-extrabold font-mono text-slate-850">350501055880533</span>
                      <span className="text-[10px] text-teal-650 font-bold block mt-0.5">An. Hariono</span>
                    </div>
                    <button 
                      onClick={() => handleCopy('350501055880533', 'legalisir')}
                      className="text-slate-400 hover:text-teal-600 transition-colors p-2.5 rounded-xl bg-white border border-slate-200 hover:border-teal-200 active:scale-95"
                      title="Salin No. Rekening"
                    >
                      {copiedId === 'legalisir' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* 3. Pembayaran Selempang */}
                <div className="bg-white border border-amber-150/60 rounded-2xl p-4.5 hover:border-amber-400 transition-all shadow-sm space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="bg-amber-650 text-amber-700 bg-amber-50 border border-amber-150 text-[10px] sm:text-xs font-bold px-3 py-1 rounded-xl inline-flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500 animate-spin" style={{ animationDuration: '5s' }} /> C. Pembayaran Selempang (Opsional)
                      </span>
                      <p className="text-[11px] text-slate-500 mt-2 font-semibold">Tersedia untuk semua peserta <strong className="text-slate-700">DARING & LURING</strong></p>
                    </div>
                    <span className="text-amber-800 font-extrabold text-[10px] sm:text-xs uppercase tracking-wider bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl shrink-0">
                      TIDAK WAJIB
                    </span>
                  </div>
                  
                  <div className="bg-slate-50/70 border border-amber-100 rounded-xl p-3.5 flex justify-between items-center gap-3">
                    <div className="text-xs font-semibold text-slate-700 font-sans">
                      <span className="text-[9px] text-slate-400 font-bold block uppercase">REKENING BANK BRI</span>
                      <span className="text-sm font-extrabold font-mono text-slate-850">227101000168532</span>
                      <span className="text-[10px] text-amber-600 font-bold block mt-0.5">An. Ramadhan Al Ayubi</span>
                    </div>
                    <button 
                      onClick={() => handleCopy('227101000168532', 'selempang')}
                      className="text-slate-400 hover:text-amber-600 transition-colors p-2.5 rounded-xl bg-white border border-slate-200 hover:border-amber-200 active:scale-95"
                      title="Salin No. Rekening"
                    >
                      {copiedId === 'selempang' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <p className="text-[10px] sm:text-xs bg-amber-50/50 p-2.5 rounded-xl text-amber-800 leading-normal border border-amber-100/40 font-medium">
                    <strong>CATATAN:</strong> Pemesanan Selempang <strong>tidak wajib</strong> dilakukan. Jika menginginkan saja, silakan melakukan pemesanan dan pembayaran ke no. Rekening di atas <strong>(Sash/Selempang Tanpa Nama)</strong>.
                  </p>
                </div>
              </div>

              {/* Crucial separator note */}
              <div className="bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl p-4 flex items-start gap-3 mt-4 text-xs leading-relaxed font-medium">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Aturan Transfer Dana Resmi:</strong> Harap lakukan transfer secara <strong>terpisah/sendiri-sendiri</strong> sesuai dengan kepesertaan Anda ke rekening di atas. Jangan digabung menjadi satu nominal transfer, karena dana dikelola secara terpisah oleh pihak penanggung jawab masing-masing.
                </p>
              </div>
            </div>
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
