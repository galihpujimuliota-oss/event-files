import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { BadgeCheck, Printer, MailCheck, Edit3, Download, Fingerprint } from 'lucide-react';
import { toPng } from 'html-to-image';
import { store, AttendeeData } from '../store/store';
import { motion } from 'motion/react';

export default function SuccessCard() {
  const navigate = useNavigate();
  const [attendee, setAttendee] = useState<AttendeeData | null>(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const fetchAttendee = async () => {
      const data = await Promise.resolve(store.getAttendee()); // wait if it's async
      if (!data || !data.isRegistered) {
        navigate('/login');
      } else {
        setAttendee(data);
        // Simulate Email Notification trigger
        setTimeout(() => setShowToast(true), 1000);
        setTimeout(() => setShowToast(false), 5000);
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

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className="p-4 md:p-8 space-y-6 flex flex-col items-center"
    >
      {/* Simulation Email Toast */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-teal-600 text-white px-5 py-4 rounded-xl shadow-[0_8px_30px_rgb(13,148,136,0.3)] flex items-center gap-4 animate-in slide-in-from-top-4 fade-in duration-300 z-50">
          <MailCheck className="w-6 h-6 shrink-0" />
          <p className="text-sm font-medium">Data Terkirim: <span className="font-bold opacity-90 block text-xs mt-0.5">{attendee.email || 'Email terdaftar'}</span></p>
        </div>
      )}

      <div className="text-center space-y-3 mb-8">
        <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-teal-100/50">
          <BadgeCheck className="w-8 h-8 text-teal-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Registrasi Berhasil</h2>
        <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">Sistem telah merekam data Anda. Simpan QR Code ini untuk akses pada saat acara.</p>
      </div>

      {/* Registration Card Layout */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 overflow-hidden relative" id="registration-card">
        {/* Card Header matching new style */}
        <div className="bg-teal-600 p-5 text-center relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10"><Fingerprint className="w-24 h-24 text-white" /></div>
          <h3 className="text-white font-bold text-lg tracking-widest relative z-10">ACCESS PASS</h3>
          <p className="text-teal-100/80 text-xs font-mono mt-1 relative z-10">SYS.26 // BATCH_4_2025</p>
        </div>
        
        <div className="p-6 relative">
          <div className="absolute top-1/2 left-0 -ml-4 w-8 h-8 bg-slate-50 rounded-full border-r border-slate-100 -mt-4" />
          <div className="absolute top-1/2 right-0 -mr-4 w-8 h-8 bg-slate-50 rounded-full border-l border-slate-100 -mt-4" />
          
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

          <div className="border-t-2 border-dashed border-slate-100 pt-6 pb-2 flex flex-col items-center">
            
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
      </div>

      <div className="flex flex-col w-full max-w-sm gap-3 mt-6">
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
            <Edit3 className="w-4 h-4" /> Edit
          </button>
        </div>
      </div>

      <div className="text-center mt-8 text-xs text-slate-400 font-mono border-t border-slate-100 pt-6 w-full max-w-sm">
        <p>SECURE_SYSTEM_AUTH_REQUIRED</p>
        <button onClick={() => navigate('/admin-login')} className="text-teal-600 hover:text-teal-700 transition-colors mt-1 font-semibold">ACCESS_ADMIN_TERMINAL</button>
      </div>
    </motion.div>
  );
}
