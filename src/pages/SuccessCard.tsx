import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { BadgeCheck, Printer, MailCheck, Edit3, Download } from 'lucide-react';
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
      toPng(cardElement, { cacheBust: true })
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
      className="p-4 md:p-8 space-y-6"
    >
      {/* Simulation Email Toast */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-3 rounded shadow-lg flex items-center gap-3 animate-in slide-in-from-top fade-in duration-300 z-50">
          <MailCheck className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">Notifikasi & Kartu berhasil dikirim ke email: <span className="font-bold">{attendee.email || 'Email terdaftar'}</span>!</p>
        </div>
      )}

      <div className="text-center space-y-2 mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <BadgeCheck className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Registrasi Berhasil!</h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto">Jawaban telah direkam oleh sistem. Berikut adalah Kartu Bukti Registrasi Anda. Tunjukkan QR Code ini pada petugas saat acara.</p>
      </div>

      {/* Registration Card Layout */}
      <div className="max-w-md mx-auto bg-white border-2 border-slate-200 rounded-xl shadow-lg overflow-hidden relative" id="registration-card">
        {/* Card Header matching Ascent Hotel */}
        <div className="bg-[#0f172a] p-4 text-center border-b-4 border-[#d4af37]">
          <h3 className="text-[#d4af37] font-bold text-lg leading-tight uppercase">KARTU REGISTRASI</h3>
          <p className="text-white text-xs opacity-90">Yudisium & Pengukuhan Guru Profesional<br/>PPG Daljab Batch 4 2025</p>
        </div>
        
        <div className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="w-24 h-32 bg-red-600 shrink-0 rounded border-2 border-slate-200 overflow-hidden shadow-sm flex items-center justify-center">
              {attendee.photoUrl ? (
                <img src={attendee.photoUrl} alt="Photo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-white px-2 text-center">Foto Background Merah Jas</span>
              )}
            </div>
            <div className="flex flex-col justify-center space-y-2 text-sm flex-1">
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase">Nama Lengkap</p>
                <p className="font-bold text-slate-900 leading-tight">{attendee.fullName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase">NPK/Siaga</p>
                <p className="font-bold text-slate-900 leading-tight">{attendee.npk}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase">Tipe Kehadiran</p>
                <span className={`inline-block px-2 py-0.5 mt-0.5 rounded text-xs font-bold ${attendee.attendanceType === 'LURING' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                  {attendee.attendanceType}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-dashed border-slate-300 pt-6 flex flex-col items-center">
            <QRCodeSVG 
              value={`https://yudisium.verify/attendee/${attendee.id}`}
              size={140}
              level={"H"}
              includeMargin={false}
              className="mb-2"
            />
            <p className="text-[10px] text-slate-400 font-mono mt-2 uppercase tracking-widest">ID: {attendee.id}</p>
          </div>
        </div>

        {/* Watermark / Footer */}
        <div className="bg-slate-50 p-2 text-center text-[10px] text-slate-400 font-medium border-t border-slate-100">
          LPTK UIN Maulana Malik Ibrahim Malang & Ascent Premiere
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8 pt-4">
        <button 
          onClick={handleDownload} 
          className="flex items-center justify-center gap-2 bg-[#1e3a8a] hover:bg-[#0f172a] text-white px-6 py-2.5 rounded-md font-medium transition-colors shadow-sm"
        >
          <Download className="w-5 h-5" /> Download Kartu
        </button>
        <button 
          onClick={() => window.print()} 
          className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-md font-medium transition-colors shadow-sm"
        >
          <Printer className="w-5 h-5" /> Cetak / PDF
        </button>
        <button 
          onClick={() => navigate('/form-identitas')} 
          className="flex items-center justify-center gap-2 border border-slate-300 hover:bg-slate-50 text-slate-700 px-6 py-2.5 rounded-md font-medium transition-colors"
        >
          <Edit3 className="w-5 h-5" /> Edit Jawaban
        </button>
      </div>

      <div className="text-center mt-12 text-sm text-slate-400">
        <p>Petugas Administrator? <button onClick={() => navigate('/admin-login')} className="text-blue-600 underline hover:text-blue-800">Login Petugas Scan</button></p>
      </div>
    </motion.div>
  );
}
