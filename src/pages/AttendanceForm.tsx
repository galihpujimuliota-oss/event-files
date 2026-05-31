import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { store, AttendeeData } from '../store/store';
import { motion } from 'motion/react';

export default function AttendanceForm() {
  const navigate = useNavigate();
  const [attendee] = useState<AttendeeData | null>(store.getAttendee());

  if (!attendee) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const attendanceType = formData.get('attendanceType') as 'DARING' | 'LURING';

    if (attendanceType === 'DARING') {
      await store.submitFinalRegistration({ attendanceType });
      navigate('/success');
    } else {
      await store.saveAttendee({ attendanceType });
      navigate('/form-pembayaran');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
      className="p-6 md:p-8"
    >
      <div className="border-b border-slate-200 pb-4 mb-6">
        <h2 className="text-xl font-bold text-slate-800">HALAMAN 3: KESEDIAAN HADIR</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-slate-50 p-6 rounded-md border border-slate-200 space-y-4">
          <label className="block font-semibold text-slate-800 text-lg leading-relaxed">
            Dengan ini saya menyatakan untuk Hadir dalam acara Yudisium dan Pengukuhan Guru Profesional PPG Daljab Batch 4 Th 2025 FITK-LPTK UIN Maulana Malik Ibrahim Malang secara:
          </label>
          
          <div className="relative">
            <select 
              required 
              name="attendanceType" 
              className="w-full text-lg border-2 border-[#1e3a8a] rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent cursor-pointer font-bold text-slate-800 bg-white"
              defaultValue={attendee.attendanceType || ''}
            >
              <option value="" disabled>-- Pilih Metode Kehadiran --</option>
              <option value="DARING">1. DARING (Menyimak via Youtube Channel PPG UIN MALANG)</option>
              <option value="LURING">2. LURING (Hadir di lokasi Hotel Ascent Premiere Malang)</option>
            </select>
          </div>
          
          <div className="text-sm text-slate-600 space-y-2 pt-2">
            <p><strong className="text-slate-800">Note:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Pilihan <strong>DARING</strong> artinya jawaban langsung disimpan. Biaya: GRATIS + Rp 100.000 (Legalisir).</li>
              <li>Pilihan <strong>LURING</strong> akan dilanjutkan ke halaman form pembayaran donasi (Rp 450.000).</li>
            </ul>
          </div>
        </div>

        <div className="pt-4 flex justify-between">
          <button type="button" onClick={() => navigate('/form-identitas')} className="text-slate-600 hover:text-slate-900 border border-slate-300 px-6 py-2.5 rounded-md font-medium transition-colors">
            Kembali
          </button>
          <button type="submit" className="bg-[#1e3a8a] hover:bg-[#0f172a] text-white px-8 py-2.5 rounded-md font-bold transition-colors shadow-sm">
            Lanjut
          </button>
        </div>
      </form>
    </motion.div>
  );
}
