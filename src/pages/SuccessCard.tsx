import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { BadgeCheck, Printer, MailCheck, Edit3, Download, Fingerprint } from 'lucide-react';
import { toPng } from 'html-to-image';
import { store, AttendeeData } from '../store/store';
import { motion } from 'motion/react';
import Confetti from 'react-confetti';

export default function SuccessCard() {
  const navigate = useNavigate();
  const [attendee, setAttendee] = useState<AttendeeData | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [windowDimension, setWindowDimension] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setWindowDimension({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchAttendee = async () => {
      const data = await Promise.resolve(store.getAttendee());
      if (!data || !data.isRegistered) {
        navigate('/login');
      } else {
        setAttendee(data);
        setTimeout(() => setShowToast(true), 1500);
        setTimeout(() => setShowToast(false), 5500);

        // Automatically trigger email dispatch when the card is generated and viewed
        if (data.email) {
          fetch('/api/sendemail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: data.email,
              subject: 'Berhasil: Registrasi Yudisium & Access Pass',
              html: `<div style="font-family:sans-serif;max-width:550px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:16px;box-shadow:0 10px 15px -3px rgba(0,0,0,0.05);">
                <div style="background:#0d9488;padding:16px;text-align:center;border-top-left-radius:12px;border-top-right-radius:12px;">
                  <h2 style="color:#ffffff;margin:0;font-size:20px;letter-spacing:1px;">ACCESS PASS REGISTRASI</h2>
                </div>
                <div style="padding:20px;background:#ffffff;">
                  <p style="font-size:16px;color:#1e293b;margin-bottom:8px;">Halo <strong>${data.fullName}</strong>,</p>
                  <p style="font-size:14px;color:#64748b;line-height:1.6;">Selamat, registrasi Anda untuk kegiatan <strong>Yudisium & Pengukuhan Guru Profesional PPG Dalam Jabatan Batch 4 Tahun 2025</strong> telah berhasil direkam.</p>
                  
                  <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:16px;border-radius:8px;margin:20px 0;">
                    <p style="margin:4px 0;font-size:13px;color:#64748b;">NAMA: <strong style="color:#0f172a;">${data.fullName}</strong></p>
                    <p style="margin:4px 0;font-size:13px;color:#64748b;">ID / NPK: <strong style="color:#0f172a;">${data.npk}</strong></p>
                    <p style="margin:4px 0;font-size:13px;color:#64748b;">TIPE KEHADIRAN: <strong style="color:#0d9488;text-transform:uppercase;">${data.attendanceType}</strong></p>
                  </div>

                  <p style="font-size:13px;color:#475569;line-height:1.5;">Kartu bukti registrasi (Access Pass QR Code) Anda telah siap. Silakan buka kembali halaman registrasi untuk mengunduh versi gambar (PNG) atau mencetaknya.</p>
                  <p style="font-size:11px;color:#94a3b8;margin-top:24px;border-t:1px solid #f1f5f9;padding-top:12px;text-align:center;">Email ini dikirim secara otomatis oleh Sistem Yudisium PPG LPTK UIN Malang & Ascent Hotel.</p>
                </div>
              </div>`
            })
          })
          .then(() => console.log("Auto-email triggered successfully via success page."))
          .catch(e => console.error('Failed to auto-send registration success email:', e));
        }
      }
    };
    fetchAttendee();
  }, [navigate]);

  if (!attendee) return null;

  const handleDownload = () => {
    const cardElement = document.getElementById('registration-card');
    if (cardElement) {
      toPng(cardElement, { cacheBust: true, pixelRatio: 2 })
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = `Kartu-Registrasi-${attendee?.fullName || 'Peserta'}.png`;
          link.href = dataUrl;
          link.click();
        })
        .catch((err) => {
          console.error('Failed to download card', err);
        });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="p-4 md:p-8 flex flex-col items-center overflow-x-hidden min-h-screen">
      <Confetti
        width={windowDimension.width}
        height={windowDimension.height}
        recycle={false}
        numberOfPieces={400}
        gravity={0.15}
        initialVelocityY={20}
        colors={['#0d9488', '#14b8a6', '#5eead4', '#ec4899', '#f43f5e', '#fbbf24']}
        style={{ position: 'fixed', zIndex: 100, pointerEvents: 'none' }}
      />
      
      {/* Simulation Email Toast */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-teal-600 text-white px-5 py-4 rounded-xl shadow-[0_8px_30px_rgb(13,148,136,0.3)] flex items-center gap-4 animate-in slide-in-from-top-4 fade-in duration-300 z-50">
          <MailCheck className="w-6 h-6 shrink-0" />
          <p className="text-sm font-medium">Data Terkirim: <span className="font-bold opacity-90 block text-xs mt-0.5">{attendee.email || 'Email terdaftar'}</span></p>
        </div>
      )}

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="w-full max-w-sm"
      >
        <motion.div variants={itemVariants} className="text-center space-y-3 mb-8">
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            transition={{ type: 'spring', delay: 0.2, bounce: 0.5 }}
            className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-teal-100/50"
          >
            <BadgeCheck className="w-8 h-8 text-teal-600" />
          </motion.div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Registrasi Berhasil</h2>
          <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">Sistem telah merekam data Anda. Simpan QR Code ini untuk akses pada saat acara.</p>
        </motion.div>

        {/* Registration Card Layout */}
        <motion.div variants={itemVariants} className="w-full bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 overflow-hidden relative" id="registration-card">
          {/* Card Header matching new style */}
          <div className="bg-teal-600 p-5 text-center relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10"><Fingerprint className="w-24 h-24 text-white" /></div>
            <h3 className="text-white font-bold text-lg tracking-widest relative z-10">ACCESS PASS</h3>
            <p className="text-teal-100/80 text-xs font-mono mt-1 relative z-10">SYS.26 // BATCH_4_2025</p>
          </div>
          
          <div className="p-6 relative">
            <div className="absolute top-1/2 left-0 -ml-4 w-8 h-8 bg-slate-50 rounded-full border-r border-slate-100 -mt-4 shadow-inner" />
            <div className="absolute top-1/2 right-0 -mr-4 w-8 h-8 bg-slate-50 rounded-full border-l border-slate-100 -mt-4 shadow-inner" />
            
            <div className="flex gap-5 mb-8">
              <div className="w-20 h-28 bg-rose-600 shrink-0 rounded-xl overflow-hidden shadow-sm flex items-center justify-center border-4 border-white ring-1 ring-slate-100">
                {attendee.photoUrl ? (
                  <img src={attendee.photoUrl} alt="Photo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] text-white/80 px-2 text-center uppercase tracking-widest">No Image</span>
                )}
              </div>
              <div className="flex flex-col justify-center space-y-3 flex-1 overflow-hidden">
                <div>
                  <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase mb-0.5">Attendee</p>
                  <p className="font-bold text-slate-800 text-sm leading-tight truncate">{attendee.fullName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase mb-0.5">ID / NPK</p>
                  <p className="font-bold text-slate-800 text-sm leading-tight">{attendee.npk}</p>
                </div>
                <div>
                  <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] items-center font-bold tracking-widest uppercase shadow-sm ${attendee.attendanceType === 'LURING' ? 'bg-indigo-50 border border-indigo-100 text-indigo-700' : 'bg-teal-50 border border-teal-100 text-teal-700'}`}>
                    {attendee.attendanceType}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t-2 border-dashed border-slate-200 pt-6 pb-2 flex flex-col items-center">
              {/* Waktu Registrasi */}
              <div className="w-full bg-slate-50 rounded-xl p-3 mb-6 border border-slate-100 text-center">
                <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase mb-1">Time Server Login</p>
                <p className="font-mono text-xs font-bold text-slate-700">{new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', dateStyle: 'medium', timeStyle: 'short' })} WIB</p>
                {attendee.attendanceType === 'LURING' && (
                  <div className="mt-2 pt-2 border-t border-slate-200">
                    <p className="text-[10px] text-teal-600 font-bold uppercase tracking-wide">Jadwal Registrasi Offline</p>
                    <p className="font-mono text-xs font-bold text-slate-700">11.00 - 12.00 WIB</p>
                  </div>
                )}
              </div>

              <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                <QRCodeSVG 
                  value={`https://yudisium.verify/attendee/${attendee.id}`}
                  size={140}
                  level={"H"}
                  includeMargin={false}
                />
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-4 uppercase tracking-widest">GATEWAY: {attendee.id}</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-col w-full gap-3 mt-6">
          <button 
            onClick={handleDownload} 
            className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3.5 rounded-xl font-semibold transition-all shadow-[0_8px_20px_-4px_rgba(13,148,136,0.3)] hover:scale-[1.02] active:scale-[0.98]"
          >
            <Download className="w-5 h-5" /> Download Pass
          </button>
          <div className="flex gap-3">
            <button 
              onClick={() => window.print()} 
              className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-3 rounded-xl font-medium transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
            <button 
              onClick={() => navigate('/form-identitas')} 
              className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 px-4 py-3 rounded-xl font-medium transition-colors"
            >
              <Edit3 className="w-4 h-4" /> Edit Data
            </button>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="text-center mt-8 text-xs text-slate-400 font-mono border-t border-slate-100 pt-6 w-full">
          <p>SECURE_SYSTEM_AUTH_REQUIRED</p>
          <button onClick={() => navigate('/admin-login')} className="text-teal-600 hover:text-teal-700 transition-colors mt-1 font-semibold">ACCESS_ADMIN_TERMINAL</button>
        </motion.div>
      </motion.div>
    </div>
  );
}
