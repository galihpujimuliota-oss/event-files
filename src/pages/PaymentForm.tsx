import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { store, AttendeeData } from '../store/store';
import { motion } from 'motion/react';
import { Receipt, Landmark, FileCheck, Loader2 } from 'lucide-react';

export default function PaymentForm() {
  const navigate = useNavigate();
  const [attendee, setAttendee] = useState<AttendeeData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [photoError, setPhotoError] = useState('');
  
  // Daring certificate model
  const [certificateModel, setCertificateModel] = useState<'MODEL_1' | 'MODEL_2' | 'MODEL_3' | undefined>(undefined);

  useEffect(() => {
    const data = store.getAttendee();
    if (!data || !data.id) {
      navigate('/login');
    } else {
      setAttendee(data);
      if (data.certificateRetrievalMethod) {
        setCertificateModel(data.certificateRetrievalMethod);
      }
      setIsLoaded(true);
    }
  }, [navigate]);

  if (!isLoaded || !attendee) {
    return (
      <div className="p-12 flex flex-col items-center justify-center bg-white rounded-2xl min-h-[400px]">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin mb-4" />
        <h2 className="text-base text-slate-500 font-medium tracking-tight">Memuat data sesi Anda...</h2>
      </div>
    );
  }

  const isDaring = attendee?.attendanceType === 'DARING';
  const isLuring = attendee?.attendanceType === 'LURING';

  const readProofFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!agreed) return;

    if (isDaring && !certificateModel) {
      setPhotoError('Pilih model pengambilan sertifikat pendidik terlebih dahulu.');
      window.scrollTo(0, 0);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const data: Partial<AttendeeData> = {};

    if (isDaring) {
      data.certificateRetrievalMethod = certificateModel;
    }

    try {
      if (isLuring) {
        data.paymentHotelAccountName = (formData.get('paymentHotelAccountName') as string).toUpperCase();
        data.paymentHotelAccountNumber = (formData.get('paymentHotelAccountNumber') as string).toUpperCase();
        data.paymentHotelBank = (formData.get('paymentHotelBank') as string).toUpperCase();
        
        const hotelFile = formData.get('hotelProofFile') as File;
        if (hotelFile && hotelFile.size > 0) {
          if (hotelFile.size > 1024 * 1024) throw new Error('Ukuran file hotel maksimal 1MB');
          data.paymentHotelProofUrl = await readProofFile(hotelFile);
        } else if (!attendee.paymentHotelProofUrl) {
          throw new Error('Bukti pembayaran hotel wajib diunggah.');
        }
      }

      // Legalisir details (both Daring and Luring)
      data.paymentLegalisirAccountName = (formData.get('paymentLegalisirAccountName') as string).toUpperCase();
      data.paymentLegalisirAccountNumber = (formData.get('paymentLegalisirAccountNumber') as string).toUpperCase();
      data.paymentLegalisirBank = (formData.get('paymentLegalisirBank') as string).toUpperCase();

      const legalisirFile = formData.get('legalisirProofFile') as File;
      if (legalisirFile && legalisirFile.size > 0) {
        if (legalisirFile.size > 1024 * 1024) throw new Error('Ukuran file legalisir maksimal 1MB');
        data.paymentLegalisirProofUrl = await readProofFile(legalisirFile);
      } else if (!attendee.paymentLegalisirProofUrl) {
        throw new Error('Bukti pembayaran legalisir wajib diunggah.');
      }

      setPhotoError('');
      await store.submitFinalRegistration(data);
      navigate('/success');
    } catch (err: any) {
      setPhotoError(err.message);
      window.scrollTo(0, 0);
    }
  };

  const handleUppercase = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.target.value = e.target.value.toUpperCase();
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-5 mb-8">
        <span className="text-teal-600 font-mono text-sm border border-teal-200 bg-teal-50 px-2 py-0.5 rounded-md">STEP_03</span>
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Verifikasi Pembayaran</h2>
          <p className="text-slate-400 text-[13px] leading-snug">Selesaikan administrasi untuk peserta {attendee?.attendanceType || 'Yudisium'}.</p>
        </div>
      </div>

      {photoError && (
        <div className="mb-6 bg-rose-50 border border-rose-200 p-4 rounded-xl">
          <p className="text-rose-600 text-sm font-semibold flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 block" />
            {photoError}
          </p>
        </div>
      )}

      {isLuring && (
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100/50 p-6 rounded-2xl mb-8 relative overflow-hidden shadow-sm shadow-teal-100/20">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Landmark className="w-24 h-24 text-teal-700" /></div>
          <div className="relative z-10">
            <p className="text-sm text-slate-600 mb-3">
              <strong>1. Pembayaran Hotel</strong><br/>
              Silakan transfer sebesar <strong className="text-teal-700 font-bold bg-teal-100/50 px-2 py-0.5 rounded">Rp 350.000,00</strong> ke rekening:
            </p>
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-teal-100 inline-block mb-4">
              <p className="font-mono text-xs text-slate-500 uppercase tracking-widest mb-1">Bank BRI</p>
              <p className="font-mono font-bold text-slate-800">An. IMAM KHOIRUDDIN</p>
              <p className="font-mono font-bold text-lg tracking-wider text-teal-700 mt-1">612901018729531</p>
            </div>
            
            <p className="text-sm text-slate-600 mb-3">
              <strong>2. Pembayaran Legalisir</strong><br/>
              Silakan transfer sebesar <strong className="text-teal-700 font-bold bg-teal-100/50 px-2 py-0.5 rounded">Rp 100.000,00</strong> ke rekening:
            </p>
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-teal-100 inline-block">
              <p className="font-mono text-xs text-slate-500 uppercase tracking-widest mb-1">Bank BRI</p>
              <p className="font-mono font-bold text-slate-800">An. Hariono</p>
              <p className="font-mono font-bold text-lg tracking-wider text-teal-700 mt-1">350501055880533</p>
            </div>
            <p className="text-xs text-slate-500 mt-4 italic">
              * Pembayaran terpisah/sendiri-sendiri tidak dijadikan 1. Contoh: hotel bayar sendiri, legalisir bayar sendiri.
            </p>
          </div>
        </div>
      )}

      {isDaring && (
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100/50 p-6 rounded-2xl mb-8 relative overflow-hidden shadow-sm shadow-teal-100/20">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Landmark className="w-24 h-24 text-teal-700" /></div>
          <div className="relative z-10">
            <p className="text-sm text-slate-600 mb-3">
              <strong>Pembayaran Legalisir</strong><br/>
              Silakan transfer sebesar <strong className="text-teal-700 font-bold bg-teal-100/50 px-2 py-0.5 rounded">Rp 100.000,00</strong> ke rekening:
            </p>
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-teal-100 inline-block">
              <p className="font-mono text-xs text-slate-500 uppercase tracking-widest mb-1">Bank BRI</p>
              <p className="font-mono font-bold text-slate-800">An. Hariono</p>
              <p className="font-mono font-bold text-lg tracking-wider text-teal-700 mt-1">350501055880533</p>
            </div>
            <p className="text-xs text-slate-500 mt-4 italic">
              * Sewa Hotel tidak ada pembayaran, karena via Daring.<br/>
              * Pembayaran terpisah/sendiri-sendiri tidak dijadikan 1. Contoh: legalisir bayar sendiri, pengiriman sendiri.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Peserta</label>
          <input required type="text" value={attendee?.fullName || ''} disabled className="input-base bg-slate-50 text-slate-400 font-bold uppercase cursor-not-allowed border-slate-200 shadow-none" />
        </div>

        {isLuring && (
          <div className="border border-slate-200 rounded-2xl overflow-hidden mb-6">
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-700">Form Bukti Pembayaran Hotel</h3>
            </div>
            <div className="p-5 space-y-5 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Pengirim/Rekening</label>
                  <input required name="paymentHotelAccountName" type="text" onChange={handleUppercase} className="input-base uppercase" placeholder="Nama di Rekening" defaultValue={attendee?.paymentHotelAccountName || ''} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nomor Rekening</label>
                  <input required name="paymentHotelAccountNumber" type="text" onChange={handleUppercase} className="input-base font-mono uppercase" placeholder="1234567890" defaultValue={attendee?.paymentHotelAccountNumber || ''} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Bank Pengirim</label>
                <input required name="paymentHotelBank" type="text" onChange={handleUppercase} className="input-base uppercase" placeholder="Contoh: BANK BCA" defaultValue={attendee?.paymentHotelBank || ''} />
              </div>
              <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-100/50">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-2">
                  <Receipt className="w-4 h-4 text-teal-600" /> Upload Bukti Hotel
                </label>
                <p className="text-xs text-slate-500 mb-3">Maks 1 MB (PNG/JPG).</p>
                <input type="file" name="hotelProofFile" accept="image/*" required={!attendee?.paymentHotelProofUrl} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:uppercase file:bg-white file:text-teal-700 file:border file:border-teal-200 hover:file:bg-teal-50 transition-all cursor-pointer" />
                {attendee?.paymentHotelProofUrl && <p className="text-xs font-medium text-teal-600 mt-2">Bukti pembayaran terlampir.</p>}
              </div>
            </div>
          </div>
        )}

        <div className="border border-slate-200 rounded-2xl overflow-hidden mb-6">
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
            <h3 className="font-bold text-slate-700">Form Bukti Pembayaran Legalisir</h3>
          </div>
          <div className="p-5 space-y-5 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Pengirim/Rekening</label>
                <input required name="paymentLegalisirAccountName" type="text" onChange={handleUppercase} className="input-base uppercase" placeholder="Nama di Rekening" defaultValue={attendee?.paymentLegalisirAccountName || ''} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nomor Rekening</label>
                <input required name="paymentLegalisirAccountNumber" type="text" onChange={handleUppercase} className="input-base font-mono uppercase" placeholder="1234567890" defaultValue={attendee?.paymentLegalisirAccountNumber || ''} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Bank Pengirim</label>
              <input required name="paymentLegalisirBank" type="text" onChange={handleUppercase} className="input-base uppercase" placeholder="Contoh: BANK BCA" defaultValue={attendee?.paymentLegalisirBank || ''} />
            </div>
            <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-100/50">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-2">
                <Receipt className="w-4 h-4 text-teal-600" /> Upload Bukti Legalisir
              </label>
              <p className="text-xs text-slate-500 mb-3">Maks 1 MB (PNG/JPG).</p>
              <input type="file" name="legalisirProofFile" accept="image/*" required={!attendee?.paymentLegalisirProofUrl} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:uppercase file:bg-white file:text-teal-700 file:border file:border-teal-200 hover:file:bg-teal-50 transition-all cursor-pointer" />
              {attendee?.paymentLegalisirProofUrl && <p className="text-xs font-medium text-teal-600 mt-2">Bukti pembayaran terlampir.</p>}
            </div>
          </div>
        </div>

        {isDaring && (
          <div className="border border-indigo-200 rounded-2xl overflow-hidden mb-6 shadow-sm shadow-indigo-100/50" id="certificate-model">
            <div className="bg-indigo-50 px-5 py-4 border-b border-indigo-200">
              <h3 className="font-bold text-indigo-800">Model Pengambilan Sertifikat Pendidik</h3>
              <p className="text-sm text-indigo-600 mt-1">Silakan pilih metode pengambilan sertifikat Anda.</p>
            </div>
            <div className="p-5 space-y-4 bg-white">
              <label className={`block border rounded-xl p-4 cursor-pointer transition-all ${certificateModel === 'MODEL_1' ? 'border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500' : 'border-slate-200 hover:border-indigo-300'}`}>
                <div className="flex items-start gap-4">
                  <div className="mt-0.5">
                    <input type="radio" name="certificateModel" value="MODEL_1" checked={certificateModel === 'MODEL_1'} onChange={() => setCertificateModel('MODEL_1')} className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Model 1: Mengambil sendiri ke kampus</h4>
                    <p className="text-sm text-slate-500 mt-1">Cukup menyerahkan bukti registrasi.</p>
                  </div>
                </div>
              </label>
              <label className={`block border rounded-xl p-4 cursor-pointer transition-all ${certificateModel === 'MODEL_2' ? 'border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500' : 'border-slate-200 hover:border-indigo-300'}`}>
                <div className="flex items-start gap-4">
                  <div className="mt-0.5">
                    <input type="radio" name="certificateModel" value="MODEL_2" checked={certificateModel === 'MODEL_2'} onChange={() => setCertificateModel('MODEL_2')} className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Model 2: Diwakilkan</h4>
                    <p className="text-sm text-slate-500 mt-1">Membawa bukti registrasi, fotokopi KTP peserta PPG, dan Surat kuasa bermaterai.</p>
                  </div>
                </div>
              </label>
              <label className={`block border rounded-xl p-4 cursor-pointer transition-all ${certificateModel === 'MODEL_3' ? 'border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500' : 'border-slate-200 hover:border-indigo-300'}`}>
                <div className="flex items-start gap-4">
                  <div className="mt-0.5">
                    <input type="radio" name="certificateModel" value="MODEL_3" checked={certificateModel === 'MODEL_3'} onChange={() => setCertificateModel('MODEL_3')} className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Model 3: Jasa Pengiriman oleh HMPS</h4>
                    <p className="text-sm text-slate-500 mt-1">Mengambil serdik melalui jasa pengiriman oleh HMPS. Jika memilih ini, WAJIB Mengisi google form dari HMPS: <a href="#" className="font-semibold text-indigo-600 hover:underline">(KOSONGI DAHULU)</a></p>
                  </div>
                </div>
              </label>
            </div>
          </div>
        )}

        <div className="bg-amber-50/50 border border-amber-200/50 p-5 rounded-2xl mt-8 transition-colors hover:bg-amber-50">
          <label className="flex items-start gap-4 cursor-pointer group">
            <div className="relative flex items-center justify-center mt-0.5">
              <input 
                type="checkbox" 
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="peer shrink-0 appearance-none w-5 h-5 border-2 border-amber-300 rounded cursor-pointer checked:bg-amber-500 checked:border-0 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/30 ring-offset-2" 
              />
              <FileCheck className="w-3.5 h-3.5 text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3}/>
            </div>
            <span className="text-sm font-medium text-slate-700 leading-relaxed max-w-[90%]">
              <strong className="text-amber-800">Pakta Integritas:</strong> Saya menyatakan bahwa seluruh data dan bukti pembayaran yang saya unggah adalah benar dan valid. Saya bersedia menerima sanksi pembatalan kepesertaan jika ditemukan indikasi pemalsuan.
            </span>
          </label>
        </div>

        <div className="pt-6 mt-6 border-t border-slate-100 flex justify-between items-center">
          <button type="button" onClick={() => navigate('/form-kehadiran')} className="text-slate-500 hover:text-slate-800 font-medium transition-colors px-4 py-2">
            Kembali
          </button>
          <button 
            type="submit" 
            disabled={!agreed} 
            className={`px-8 py-3 rounded-xl font-semibold transition-all shadow-sm group relative overflow-hidden text-white ${agreed ? 'bg-teal-600 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]' : 'bg-slate-300 cursor-not-allowed opacity-70'}`}
          >
            <span className="relative z-10">Kirim Pendaftaran</span>
            {agreed && <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-teal-700 opacity-0 group-hover:opacity-100 transition-opacity" />}
          </button>
        </div>
      </form>
    </div>
  );
}
