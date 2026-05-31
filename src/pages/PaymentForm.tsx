import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { store, AttendeeData } from '../store/store';
import { motion } from 'motion/react';

export default function PaymentForm() {
  const navigate = useNavigate();
  const [attendee] = useState<AttendeeData | null>(store.getAttendee());
  const [agreed, setAgreed] = useState(false);
  const [photoError, setPhotoError] = useState('');

  if (!attendee || attendee.attendanceType !== 'LURING') {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!agreed) return;

    const formData = new FormData(e.currentTarget);
    const data: Partial<AttendeeData> = {
      paymentAccountName: (formData.get('paymentAccountName') as string).toUpperCase(),
      paymentAccountNumber: (formData.get('paymentAccountNumber') as string).toUpperCase(),
      paymentBank: (formData.get('paymentBank') as string).toUpperCase(),
    };

    const proofFile = formData.get('proofFile') as File;
    if (proofFile && proofFile.size > 0) {
      if (proofFile.size > 1024 * 1024) {
        setPhotoError('Ukuran file maksimal 1MB');
        return;
      }
      setPhotoError('');
      const reader = new FileReader();
      reader.onload = async () => {
        data.paymentProofUrl = reader.result as string;
        await store.submitFinalRegistration(data);
        navigate('/success');
      };
      reader.readAsDataURL(proofFile);
      return;
    }

    if (!attendee.paymentProofUrl) {
      setPhotoError('Bukti pembayaran wajib diunggah.');
      return;
    }

    await store.submitFinalRegistration(data);
    navigate('/success');
  };

  const handleUppercase = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.target.value = e.target.value.toUpperCase();
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
        <h2 className="text-xl font-bold text-slate-800">HALAMAN 4: UNGGAH BUKTI PEMBAYARAN</h2>
        <p className="text-slate-500 text-sm mt-1">Khusus bagi peserta LURING (Offline).</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-md mb-6">
        <p className="text-sm text-slate-700">Silakan transfer biaya sebesar <strong className="text-rose-600 font-bold">Rp 450.000,00</strong> ke rekening berikut:</p>
        <p className="font-mono font-bold mt-2 text-slate-900">BANK BRI <br/> An. IMAM KHOIRUDDIN <br/> No. Rekening: 612901018729531</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Peserta</label>
          <input required type="text" value={attendee.fullName} disabled className="input-base bg-slate-100 text-slate-500 font-bold uppercase" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Pemilik Buku Rekening Bank Pembayaran</label>
          <input required name="paymentAccountName" type="text" onChange={handleUppercase} className="input-base uppercase" placeholder="Masukkan Nama Pemilik Rekening" defaultValue={attendee.paymentAccountName} />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Nomor Rekening Bank Pembayaran</label>
          <input required name="paymentAccountNumber" type="text" onChange={handleUppercase} className="input-base uppercase" placeholder="Contoh: 123456789" defaultValue={attendee.paymentAccountNumber} />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Bank Pembayaran</label>
          <input required name="paymentBank" type="text" onChange={handleUppercase} className="input-base uppercase" placeholder="Contoh: BANK BCA" defaultValue={attendee.paymentBank} />
        </div>

        <div className="space-y-1 pt-2">
          <label className="block text-sm font-semibold text-slate-700">Upload Bukti Pembayaran</label>
          <p className="text-xs text-slate-500 mb-2">Ukuran file maksimal 1 MB (PNG/JPG).</p>
          <input 
            type="file" 
            name="proofFile" 
            accept="image/*"
            required={!attendee.paymentProofUrl}
            className="block w-full text-sm text-slate-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-brand-blue file:text-white
              hover:file:bg-[#0f172a] transition-all cursor-pointer"
          />
          {photoError && <p className="text-red-500 text-sm mt-1">{photoError}</p>}
          {attendee.paymentProofUrl && <p className="text-sm font-medium text-green-600 mt-1">Bukti telah tersimpan, upload baru untuk mengganti.</p>}
        </div>

        <div className="bg-amber-50 border border-amber-200 p-4 rounded-md mt-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-5 h-5 text-[#1e3a8a] rounded focus:ring-[#1e3a8a]" 
              required
            />
            <span className="text-sm font-medium text-slate-800 leading-relaxed">
              <strong className="text-red-700">Pernyataan:</strong> Data yang telah diisi telah benar dan sesuai, jika dalam pengisian data melakukan pemalsuan data maka siap dikenai sanksi dan dibatalkan mengikuti acara oleh panitia.
            </span>
          </label>
        </div>

        <div className="pt-4 flex justify-between">
          <button type="button" onClick={() => navigate('/form-kehadiran')} className="text-slate-600 hover:text-slate-900 border border-slate-300 px-6 py-2.5 rounded-md font-medium transition-colors">
            Kembali
          </button>
          <button type="submit" disabled={!agreed} className={`px-8 py-2.5 rounded-md font-bold transition-colors shadow-sm text-white ${agreed ? 'bg-[#1e3a8a] hover:bg-[#0f172a]' : 'bg-slate-400 cursor-not-allowed'}`}>
            Kirim
          </button>
        </div>
      </form>
    </motion.div>
  );
}
