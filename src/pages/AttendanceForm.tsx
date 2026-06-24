import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { store, AttendeeData } from '../store/store';
import { motion } from 'motion/react';
import { RadioTower, Users, Loader2 } from 'lucide-react';

export default function AttendanceForm() {
  const navigate = useNavigate();
  const [attendee, setAttendee] = useState<AttendeeData | null>(null);
  const [selectedType, setSelectedType] = useState<'DARING' | 'LURING' | ''>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState<boolean | null>(null);
  const [isLuringOpen, setIsLuringOpen] = useState<boolean>(true);
  const [isDaringOpen, setIsDaringOpen] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    store.getSettings().then(s => {
      setIsRegistrationOpen(s?.isRegistrationOpen !== false);
      setIsLuringOpen(s?.isLuringOpen !== false);
      setIsDaringOpen(s?.isDaringOpen !== false);
    });
  }, []);

  useEffect(() => {
    const data = store.getAttendee();
    if (!data || !data.id) {
      navigate('/login');
    } else if (!data.fullName || !data.npk || !data.studyField) {
      navigate('/form-identitas');
    } else {
      setAttendee(data);
      setSelectedType(data.attendanceType || '');
      setIsLoaded(true);
    }
  }, [navigate]);

  if (isRegistrationOpen === false) {
    return (
      <div className="p-12 flex flex-col items-center justify-center bg-white rounded-2xl min-h-[400px]">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Registrasi Ditutup</h2>
        <p className="text-slate-500 text-center mb-6">Mohon maaf, sesi pendaftaran telah berakhir atau ditutup oleh Admin.</p>
        <button onClick={() => navigate('/')} className="px-6 py-2 bg-teal-600 text-white rounded-xl font-medium">Kembali ke Beranda</button>
      </div>
    );
  }

  if (!isLoaded || !attendee || isRegistrationOpen === null) {
    return (
      <div className="p-12 flex flex-col items-center justify-center bg-white rounded-2xl min-h-[400px]">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin mb-4" />
        <h2 className="text-base text-slate-500 font-medium tracking-tight">Memuat data sesi Anda...</h2>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedType) return;
    
    if (selectedType === 'DARING' && !isDaringOpen) {
      setErrorMsg('Registrasi Daring telah ditutup, Silahkan memilih Luring');
      return;
    }
    if (selectedType === 'LURING' && !isLuringOpen) {
      setErrorMsg('Registrasi Luring telah ditutup, Silahkan memilih Daring');
      return;
    }

    await store.saveAttendee({ attendanceType: selectedType });
    navigate('/form-pembayaran');
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-5 mb-8">
        <span className="text-teal-600 font-mono text-sm border border-teal-200 bg-teal-50 px-2 py-0.5 rounded-md">STEP_02</span>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Presensi Kehadiran</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <label className="block text-slate-600 leading-relaxed">
            Menyatakan kesediaan hadir pada Yudisium dan Pengukuhan Guru Profesional secara:
          </label>
          
          {errorMsg && (
            <div className="bg-rose-50 text-rose-600 p-4 rounded-xl border border-rose-200 text-sm font-medium animate-in fade-in zoom-in duration-200">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => {
                if (!isDaringOpen) {
                  setErrorMsg('Registrasi Daring telah ditutup, Silahkan memilih Luring');
                  return;
                }
                setErrorMsg('');
                setSelectedType('DARING'); 
                store.saveAttendee({ attendanceType: 'DARING' }); 
              }}
              className={`p-6 text-left rounded-2xl border-2 transition-all ${selectedType === 'DARING' ? 'border-teal-500 bg-teal-50 shadow-[0_4px_20px_-4px_rgba(20,184,166,0.3)] scale-[1.02]' : !isDaringOpen ? 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed' : 'border-slate-100 bg-white hover:border-teal-200 hover:bg-slate-50'}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${selectedType === 'DARING' ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <RadioTower className="w-5 h-5" />
                </div>
                <span className="font-bold text-slate-800" translate="no">DARING</span>
                {!isDaringOpen && <span className="ml-auto text-xs font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded">DITUTUP</span>}
              </div>
              <p className="text-sm text-slate-500">Live Streaming YouTube</p>
              <p className="text-xs text-slate-400 mt-2 font-mono">Biaya Surat: Rp 100k</p>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!isLuringOpen) {
                  setErrorMsg('Registrasi Luring telah ditutup, Silahkan memilih Daring');
                  return;
                }
                setErrorMsg('');
                setSelectedType('LURING'); 
                store.saveAttendee({ attendanceType: 'LURING' }); 
              }}
              className={`p-6 text-left rounded-2xl border-2 transition-all ${selectedType === 'LURING' ? 'border-teal-500 bg-teal-50 shadow-[0_4px_20px_-4px_rgba(20,184,166,0.3)] scale-[1.02]' : !isLuringOpen ? 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed' : 'border-slate-100 bg-white hover:border-teal-200 hover:bg-slate-50'}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${selectedType === 'LURING' ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <Users className="w-5 h-5" />
                </div>
                <span className="font-bold text-slate-800" translate="no">LURING</span>
                {!isLuringOpen && <span className="ml-auto text-xs font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded">DITUTUP</span>}
              </div>
              <p className="text-sm text-slate-500">Hadir di Ascent Premiere Hotel</p>
              <p className="text-xs text-slate-400 mt-2 font-mono">Biaya Total: Rp 450k</p>
            </button>
          </div>
        </div>

        <div className="pt-6 mt-6 border-t border-slate-100 flex justify-between items-center">
          <button type="button" onClick={() => navigate('/form-identitas')} className="text-slate-500 hover:text-slate-800 font-medium transition-colors px-4 py-2">
            Kembali
          </button>
          <button 
            type="submit" 
            disabled={!selectedType}
            className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:hover:bg-teal-600 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md"
          >
            Lanjut Ke Pembayaran
          </button>
        </div>
      </form>
    </div>
  );
}
