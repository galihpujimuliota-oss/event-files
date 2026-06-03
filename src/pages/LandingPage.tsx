import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Calendar, MapPin, CreditCard, Info, Copy, Check, Sparkles, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeAccount, setActiveAccount] = useState<string | null>(null);

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
            Informasi Pembayaran
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
                    <p className="text-slate-500 text-xs leading-relaxed font-medium">Hari: Kamis<br/>Tanggal: 02 Mei 2026<br/>Pukul 11.00 - 17.00 WIB</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 pt-2">
                  <div className="p-2.5 bg-white shadow-sm rounded-xl border border-slate-100">
                    <MapPin className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm mb-0.5">Lokasi Yudisium</p>
                    <p className="text-slate-500 text-xs text-justify leading-relaxed font-medium">Ascent Premiere Hotel and Convention Malang<br/><span className="text-[11px] text-slate-400 block mt-1 font-sans">Alamat: Jl. Kolonel Sugiono No. 6, Ciptomulyo, Kecamatan Sukun, Kota Malang, Jawa Timur</span></p>
                  </div>
                </div>
              </div>

              {/* Deadline card */}
              <div className="bg-gradient-to-r from-teal-50 to-emerald-550 border border-teal-100 p-5 rounded-2xl text-left shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-teal-700 mb-1.5">Batas Sesi Pendaftaran</p>
                <div className="text-slate-900 font-medium text-xs space-y-1 font-sans">
                  <p>Hari: <strong className="text-teal-950 font-bold">Jumat</strong></p>
                  <p>Tanggal: <strong className="text-teal-950 font-bold">12 Juni 2026</strong></p>
                  <p>Pukul: <strong className="text-teal-950 font-bold">16.00 WIB</strong></p>
                </div>
              </div>
            </div>

            {/* Right side: Payment details organic cards as accordion */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="w-5 h-5 text-teal-600 animate-bounce" style={{ animationDuration: '3s' }} />
                <h4 className="font-extrabold text-slate-800 text-sm font-sans">Daftar Rekening Pembayaran</h4>
              </div>

              <div className="space-y-3">
                {/* Accordion 1: Hotel */}
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:border-teal-400 transition-all">
                  <button
                    type="button"
                    onClick={() => setActiveAccount(activeAccount === 'hotel' ? null : 'hotel')}
                    className="w-full text-left p-4 flex items-center justify-between gap-4 font-sans focus:outline-none focus:ring-1 focus:ring-teal-500/35 cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-indigo-50 border border-indigo-150 text-indigo-700 text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-lg">
                          🏨 A. Pembayaran Acara Hotel
                        </span>
                        <span className="bg-indigo-500/10 text-indigo-700 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                          LURING
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1.5 font-medium">Klik untuk melihat detail rekening transfer</p>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="text-teal-700 font-extrabold text-xs sm:text-sm font-mono tracking-tight bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-xl font-bold">
                        Rp 350.000
                      </span>
                      {activeAccount === 'hotel' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {activeAccount === 'hotel' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden border-t border-slate-100 bg-slate-50/40"
                      >
                        <div className="p-4 space-y-3">
                          <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">Khusus untuk peserta dengan kehadiran <strong className="text-slate-700">LURING</strong>.</p>
                          <div className="bg-white border border-slate-200 rounded-xl p-3 flex justify-between items-center gap-3 shadow-inner">
                            <div className="text-xs font-semibold text-slate-700 font-sans">
                              <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">REKENING BANK BRI</span>
                              <span className="text-sm font-extrabold font-mono text-slate-850">612901018729531</span>
                              <span className="text-[10px] text-indigo-650 font-bold block mt-0.5">An. IMAM KHOIRUDDIN</span>
                            </div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleCopy('612901018729531', 'hotel'); }}
                              className="text-slate-400 hover:text-indigo-600 transition-colors p-2.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-200 active:scale-95 shrink-0 cursor-pointer"
                              title="Salin No. Rekening"
                            >
                              {copiedId === 'hotel' ? <Check className="w-4 h-4 text-emerald-600 font-bold" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Accordion 2: Legalisir */}
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:border-teal-400 transition-all">
                  <button
                    type="button"
                    onClick={() => setActiveAccount(activeAccount === 'legalisir' ? null : 'legalisir')}
                    className="w-full text-left p-4 flex items-center justify-between gap-4 font-sans focus:outline-none focus:ring-1 focus:ring-teal-500/35 cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-teal-50 border border-teal-150 text-teal-700 text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-lg">
                          🎓 B. Pembayaran Legalisir
                        </span>
                        <span className="bg-teal-500/10 text-teal-700 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                          SEMUA
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1.5 font-medium">Klik untuk melihat detail rekening transfer</p>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="text-teal-700 font-extrabold text-xs sm:text-sm font-mono tracking-tight bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-xl font-bold">
                        Rp 100.000
                      </span>
                      {activeAccount === 'legalisir' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {activeAccount === 'legalisir' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden border-t border-slate-100 bg-slate-50/40"
                      >
                        <div className="p-4 space-y-3">
                          <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">Wajib dibayar oleh <strong className="text-slate-700">SEMUA PESERTA</strong> (Daring & Luring).</p>
                          <div className="bg-white border border-slate-200 rounded-xl p-3 flex justify-between items-center gap-3 shadow-inner">
                            <div className="text-xs font-semibold text-slate-700 font-sans">
                              <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">REKENING BANK BRI</span>
                              <span className="text-sm font-extrabold font-mono text-slate-850">350501055880533</span>
                              <span className="text-[10px] text-teal-650 font-bold block mt-0.5">An. Hariono</span>
                            </div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleCopy('350501055880533', 'legalisir'); }}
                              className="text-slate-400 hover:text-teal-600 transition-colors p-2.5 rounded-xl bg-white border border-slate-200 hover:border-teal-200 active:scale-95 shrink-0 cursor-pointer"
                              title="Salin No. Rekening"
                            >
                              {copiedId === 'legalisir' ? <Check className="w-4 h-4 text-emerald-600 font-bold" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Accordion 3: Selempang */}
                <div className="bg-white border border-amber-150 rounded-2xl overflow-hidden shadow-sm hover:border-amber-400 transition-all">
                  <button
                    type="button"
                    onClick={() => setActiveAccount(activeAccount === 'selempang' ? null : 'selempang')}
                    className="w-full text-left p-4 flex items-center justify-between gap-4 font-sans focus:outline-none focus:ring-1 focus:ring-amber-500/35 cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-amber-50 border border-amber-150 text-amber-750 text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-lg inline-flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-500 animate-spin" style={{ animationDuration: '5s' }} /> C. Pembayaran Selempang
                        </span>
                        <span className="bg-amber-500/10 text-amber-700 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                          OPSIONAL
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1.5 font-medium">Klik untuk melihat detail rekening transfer</p>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="text-amber-850 font-extrabold text-xs sm:text-sm font-mono tracking-tight bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-xl font-bold">
                        Rp 60.000
                      </span>
                      {activeAccount === 'selempang' ? <ChevronUp className="w-4 h-4 text-amber-700" /> : <ChevronDown className="w-4 h-4 text-amber-700" />}
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {activeAccount === 'selempang' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden border-t border-slate-100 bg-slate-50/40"
                      >
                        <div className="p-4 space-y-3">
                          <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">Tersedia untuk semua peserta <strong className="text-slate-700">DARING & LURING</strong>.</p>
                          <div className="bg-white border border-amber-100 rounded-xl p-3 flex justify-between items-center gap-3 shadow-inner">
                            <div className="text-xs font-semibold text-slate-700 font-sans">
                              <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">REKENING BANK BRI</span>
                              <span className="text-sm font-extrabold font-mono text-slate-850">227101000168532</span>
                              <span className="text-[10px] text-amber-600 font-bold block mt-0.5">An. Ramadhan Al Ayubi</span>
                            </div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleCopy('227101000168532', 'selempang'); }}
                              className="text-slate-400 hover:text-amber-600 transition-colors p-2.5 rounded-xl bg-white border border-slate-200 hover:border-amber-200 active:scale-95 shrink-0 cursor-pointer"
                              title="Salin No. Rekening"
                            >
                              {copiedId === 'selempang' ? <Check className="w-4 h-4 text-emerald-600 font-bold" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                          <p className="text-[10px] sm:text-xs bg-amber-50/50 p-2.5 rounded-xl text-amber-850 leading-normal border border-amber-100/40 font-medium font-sans">
                            <strong>CATATAN:</strong> Pemesanan Selempang <strong>tidak wajib</strong> dilakukan. Jika menginginkan saja, silakan melakukan pemesanan dan pembayaran ke no. Rekening di atas sebesar <strong className="text-amber-900 font-bold">Rp 60.000,00 (Sash/Selempang Tanpa Nama)</strong>.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
