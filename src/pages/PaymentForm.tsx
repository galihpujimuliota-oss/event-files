import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { store, AttendeeData } from '../store/store';
import { motion } from 'motion/react';
import { Receipt, Landmark, FileCheck, Loader2, ExternalLink, Sparkles } from 'lucide-react';

export default function PaymentForm() {
  const navigate = useNavigate();
  const [attendee, setAttendee] = useState<AttendeeData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [photoError, setPhotoError] = useState('');
  
  // Daring certificate model
  const [certificateModel, setCertificateModel] = useState<'MODEL_1' | 'MODEL_2' | 'MODEL_3' | undefined>(undefined);
  
  // Custom optional sash (selempang) selection
  const [wantsSash, setWantsSash] = useState(false);

  useEffect(() => {
    const data = store.getAttendee();
    if (!data || !data.id) {
      navigate('/login');
    } else {
      setAttendee(data);
      if (data.certificateRetrievalMethod) {
        setCertificateModel(data.certificateRetrievalMethod);
      }
      if (data.wantsSash !== undefined) {
        setWantsSash(!!data.wantsSash);
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

      // Sash details (optional, both Daring and Luring)
      data.wantsSash = wantsSash;
      if (wantsSash) {
        data.paymentSashAccountName = (formData.get('paymentSashAccountName') as string).toUpperCase();
        data.paymentSashAccountNumber = (formData.get('paymentSashAccountNumber') as string).toUpperCase();
        data.paymentSashBank = (formData.get('paymentSashBank') as string).toUpperCase();

        const sashFile = formData.get('sashProofFile') as File;
        if (sashFile && sashFile.size > 0) {
          if (sashFile.size > 1024 * 1024) throw new Error('Ukuran file bukti pembayaran selempang maksimal 1MB');
          data.paymentSashProofUrl = await readProofFile(sashFile);
        } else if (!attendee.paymentSashProofUrl) {
          throw new Error('Bukti pembayaran selempang wajib diunggah karena Anda memilih memesan selempang.');
        }
      } else {
        data.paymentSashAccountName = '';
        data.paymentSashAccountNumber = '';
        data.paymentSashBank = '';
        data.paymentSashProofUrl = null;
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
        <span className="text-teal-600 font-mono text-sm border border-teal-200 bg-teal-50 px-2 py-0.5 rounded-md font-bold">STEP_03</span>
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Verifikasi Pembayaran</h2>
          <p className="text-slate-400 text-[13px] leading-snug font-medium">Selesaikan pendaftaran yudisium dengan mengunggah bukti transfer yang valid.</p>
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
        <div className="bg-gradient-to-r from-teal-5o to-emerald-50 bg-teal-50/50 border border-teal-100 p-6 rounded-2xl mb-8 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 p-4 opacity-[0.03]"><Landmark className="w-24 h-24 text-teal-700" /></div>
          <div className="relative z-10 space-y-4">
            <div>
              <p className="text-xs font-bold text-teal-700 uppercase tracking-widest mb-1.5">Panduan Pembayaran Luring</p>
              <p className="text-slate-600 text-sm">
                Harap transfer ke nomor rekening penanggung jawab masing-masing di bawah ini:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-teal-100/60 shadow-sm">
                <span className="bg-indigo-50 border border-indigo-150 text-indigo-700 text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                  🏨 1. Pembayaran Acara Hotel
                </span>
                <p className="text-xs text-slate-500 mt-2">Nominal transfer sebesar:</p>
                <p className="font-bold text-sm text-slate-800">Rp 350.000,00</p>
                <div className="mt-2 text-[11px] font-mono text-slate-600 border-t border-slate-100 pt-2 font-medium">
                  BANK BRI <br/>
                  An. IMAM KHOIRUDDIN <br/>
                  <span className="font-extrabold text-indigo-600 text-xs">612901018729531</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-teal-100/60 shadow-sm">
                <span className="bg-teal-50 border border-teal-150 text-teal-700 text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                  🎓 2. Pembayaran Legalisir
                </span>
                <p className="text-xs text-slate-500 mt-2">Nominal transfer sebesar:</p>
                <p className="font-bold text-sm text-slate-800">Rp 100.000,00</p>
                <div className="mt-2 text-[11px] font-mono text-slate-600 border-t border-slate-100 pt-2 font-medium">
                  BANK BRI <br/>
                  An. Hariono <br/>
                  <span className="font-extrabold text-teal-600 text-xs">350501055880533</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-amber-100/60 shadow-sm">
                <span className="bg-amber-50 border border-amber-150 text-amber-700 text-[9px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1 inline-block">
                  <Sparkles className="w-2.5 h-2.5" /> 3. Pembayaran Selempang
                </span>
                <p className="text-xs text-slate-500 mt-2">Nominal transfer sebesar:</p>
                <p className="font-bold text-sm text-slate-800">Rp 60.000,00</p>
                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">(Selempang Tanpa Nama)</p>
                <div className="mt-2 text-[11px] font-mono text-slate-600 border-t border-slate-100 pt-2 font-medium">
                  BANK BRI <br/>
                  An. Ramadhan Al Ayubi <br/>
                  <span className="font-extrabold text-amber-600 text-xs">227101000168532</span>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-rose-600 bg-rose-50/50 p-2 rounded-xl italic font-medium">
              * Perhatian: Pembayaran harus ditransfer ke masing-masing rekening di atas secara terpisah. Jangan digabungkan jadi satu kali transfer.
            </p>
          </div>
        </div>
      )}

      {isDaring && (
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 bg-teal-50/50 border border-teal-100 p-6 rounded-2xl mb-8 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 p-4 opacity-[0.03]"><Landmark className="w-24 h-24 text-teal-700" /></div>
          <div className="relative z-10 space-y-4">
            <div>
              <p className="text-xs font-bold text-teal-700 uppercase tracking-widest mb-1.5">Panduan Pembayaran Daring</p>
              <p className="text-slate-600 text-sm font-medium">
                Sewa Hotel tidak dikenakan karena via Daring. Silakan transfer pembayaran ke rekening berikut:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-teal-100/60 shadow-sm">
                <span className="bg-teal-50 border border-teal-150 text-teal-700 text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                  🎓 1. Pembayaran Legalisir
                </span>
                <p className="text-xs text-slate-500 mt-2">Nominal transfer sebesar:</p>
                <p className="font-bold text-sm text-slate-800">Rp 100.000,00</p>
                <div className="mt-2 text-[11px] font-mono text-slate-600 border-t border-slate-100 pt-2 font-medium">
                  BANK BRI <br/>
                  An. Hariono <br/>
                  <span className="font-extrabold text-teal-600 text-xs">350501055880533</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-amber-100/60 shadow-sm">
                <span className="bg-amber-50 border border-amber-150 text-amber-700 text-[9px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1 inline-block">
                  <Sparkles className="w-2.5 h-2.5" /> 2. Pembayaran Selempang
                </span>
                <p className="text-xs text-slate-500 mt-2">Nominal transfer sebesar:</p>
                <p className="font-bold text-sm text-slate-800">Rp 60.000,00</p>
                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">(Selempang Tanpa Nama)</p>
                <div className="mt-2 text-[11px] font-mono text-slate-600 border-t border-slate-100 pt-2 pt-2 font-medium">
                  BANK BRI <br/>
                  An. Ramadhan Al Ayubi <br/>
                  <span className="font-extrabold text-amber-600 text-xs">227101000168532</span>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-rose-600 bg-rose-50/50 p-2 rounded-xl italic font-medium">
              * Perhatian: Pembayaran harus ditransfer secara mandiri dan terpisah. Jangan digabungkan jadi satu transaksi transfer.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Peserta</label>
          <input required type="text" value={attendee?.fullName || ''} disabled className="input-base bg-slate-50 text-slate-400 font-bold uppercase cursor-not-allowed border-slate-200 shadow-none font-sans" />
        </div>

        {isLuring && (
          <div className="border border-slate-200 rounded-2xl overflow-hidden mb-6">
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-700 text-sm">Form Bukti Pembayaran Acara Hotel</h3>
            </div>
            <div className="p-5 space-y-5 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Pengirim/Rekening</label>
                  <input required name="paymentHotelAccountName" type="text" onChange={handleUppercase} className="input-base uppercase font-medium" placeholder="Nama di Rekening" defaultValue={attendee?.paymentHotelAccountName || ''} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nomor Rekening</label>
                  <input required name="paymentHotelAccountNumber" type="text" onChange={handleUppercase} className="input-base font-mono uppercase font-medium" placeholder="1234567890" defaultValue={attendee?.paymentHotelAccountNumber || ''} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Bank Pengirim</label>
                <input required name="paymentHotelBank" type="text" onChange={handleUppercase} className="input-base uppercase font-medium" placeholder="Contoh: BANK BCA" defaultValue={attendee?.paymentHotelBank || ''} />
              </div>
              <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-100/50">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-2">
                  <Receipt className="w-4 h-4 text-teal-600" /> Upload Bukti Acara Hotel
                </label>
                <p className="text-xs text-slate-500 mb-3">Maks 1 MB (PNG/JPG).</p>
                <input type="file" name="hotelProofFile" accept="image/*" required={!attendee?.paymentHotelProofUrl} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:uppercase file:bg-white file:text-teal-700 file:border file:border-teal-200 hover:file:bg-teal-50 transition-all cursor-pointer font-sans" />
                {attendee?.paymentHotelProofUrl && <p className="text-xs font-semibold text-teal-600 mt-2">✓ Bukti pembayaran hotel terlampir.</p>}
              </div>
            </div>
          </div>
        )}

        <div className="border border-slate-200 rounded-2xl overflow-hidden mb-6">
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
            <h3 className="font-bold text-slate-700 text-sm">Form Bukti Pembayaran Legalisir</h3>
          </div>
          <div className="p-5 space-y-5 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Pengirim/Rekening</label>
                <input required name="paymentLegalisirAccountName" type="text" onChange={handleUppercase} className="input-base uppercase font-medium" placeholder="Nama di Rekening" defaultValue={attendee?.paymentLegalisirAccountName || ''} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nomor Rekening</label>
                <input required name="paymentLegalisirAccountNumber" type="text" onChange={handleUppercase} className="input-base font-mono uppercase font-medium" placeholder="1234567890" defaultValue={attendee?.paymentLegalisirAccountNumber || ''} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Bank Pengirim</label>
              <input required name="paymentLegalisirBank" type="text" onChange={handleUppercase} className="input-base uppercase font-medium" placeholder="Contoh: BANK BCA" defaultValue={attendee?.paymentLegalisirBank || ''} />
            </div>
            <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-100/50">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-2">
                <Receipt className="w-4 h-4 text-teal-600" /> Upload Bukti Legalisir
              </label>
              <p className="text-xs text-slate-500 mb-3">Maks 1 MB (PNG/JPG).</p>
              <input type="file" name="legalisirProofFile" accept="image/*" required={!attendee?.paymentLegalisirProofUrl} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:uppercase file:bg-white file:text-teal-700 file:border file:border-teal-200 hover:file:bg-teal-50 transition-all cursor-pointer font-sans" />
              {attendee?.paymentLegalisirProofUrl && <p className="text-xs font-semibold text-teal-600 mt-2">✓ Bukti pembayaran legalisir terlampir.</p>}
            </div>
          </div>
        </div>

        {/* Form Bukti Pembayaran Selempang (Opsional, bagi Daring & Luring) */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden mb-6">
          <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-bold text-slate-700 flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" /> Form Pemesanan Selempang (Opsional)
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Aktifkan tombol jika Anda juga memesan selempang (Tanpa Nama).</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={wantsSash} 
                onChange={(e) => setWantsSash(e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              <span className="ml-2 text-xs font-bold text-slate-700 uppercase">{wantsSash ? 'PESAN' : 'TIDAK'}</span>
            </label>
          </div>

          {wantsSash && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 space-y-5 bg-white border-t border-slate-100"
            >
              <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/50 text-xs text-amber-850 space-y-1.5 mb-2">
                <p className="font-bold flex items-center gap-1 text-amber-900">
                  <Landmark className="w-3.5 h-3.5 text-amber-600" /> Informasi Transfer Pembayaran Selempang
                </p>
                <p className="leading-relaxed font-medium text-slate-650">
                  Silakan lakukan transfer sebesar <strong className="text-amber-900 font-bold">Rp 60.000,00</strong> secara terpisah ke rekening penanggung jawab selempang berikut:
                </p>
                <div className="bg-white/90 p-3 rounded-lg border border-amber-200 inline-block text-[11px] font-mono mt-1 font-semibold text-slate-800">
                  BANK BRI &mdash; An. Ramadhan Al Ayubi &mdash; <span className="font-bold text-amber-700">Rp 60.000,00</span> <br/>
                  <span className="text-sm font-extrabold text-amber-700 font-mono tracking-wider">227101000168532</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-sans">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Pengirim/Rekening Selempang</label>
                  <input required={wantsSash} name="paymentSashAccountName" type="text" onChange={handleUppercase} className="input-base uppercase font-medium" placeholder="Nama di Rekening" defaultValue={attendee?.paymentSashAccountName || ''} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nomor Rekening Selempang</label>
                  <input required={wantsSash} name="paymentSashAccountNumber" type="text" onChange={handleUppercase} className="input-base font-mono uppercase font-medium" placeholder="1234567890" defaultValue={attendee?.paymentSashAccountNumber || ''} />
                </div>
              </div>
              <div className="font-sans">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Bank Pengirim Selempang</label>
                <input required={wantsSash} name="paymentSashBank" type="text" onChange={handleUppercase} className="input-base uppercase font-medium" placeholder="Contoh: BANK BCA" defaultValue={attendee?.paymentSashBank || ''} />
              </div>
              <div className="bg-amber-50/30 p-4 rounded-xl border border-amber-100/40">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-2">
                  <Receipt className="w-4 h-4 text-amber-600" /> Upload Bukti Selempang
                </label>
                <p className="text-xs text-slate-500 mb-3 font-medium">Maks 1 MB (PNG/JPG).</p>
                <input type="file" name="sashProofFile" accept="image/*" required={wantsSash && !attendee?.paymentSashProofUrl} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:uppercase file:bg-white file:text-amber-750 file:border file:border-amber-200 hover:file:bg-amber-50 transition-all cursor-pointer font-sans" />
                {attendee?.paymentSashProofUrl && <p className="text-xs font-semibold text-amber-600 mt-2">✓ Bukti pembayaran selempang terlampir.</p>}
              </div>
            </motion.div>
          )}
        </div>

        {isDaring && (
          <div className="border border-indigo-200 rounded-2xl overflow-hidden mb-6 shadow-sm shadow-indigo-100/50" id="certificate-model">
            <div className="bg-indigo-50 px-5 py-4 border-b border-indigo-200">
              <h3 className="font-bold text-indigo-800 text-sm">Model Pengambilan Sertifikat Pendidik</h3>
              <p className="text-xs text-indigo-600 mt-1 font-medium">Silakan pilih metode pengambilan sertifikat Anda.</p>
            </div>
            <div className="p-5 space-y-4 bg-white">
              <label className={`block border rounded-xl p-4 cursor-pointer transition-all ${certificateModel === 'MODEL_1' ? 'border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500' : 'border-slate-200 hover:border-indigo-300'}`}>
                <div className="flex items-start gap-4">
                  <div className="mt-0.5">
                    <input type="radio" name="certificateModel" value="MODEL_1" checked={certificateModel === 'MODEL_1'} onChange={() => setCertificateModel('MODEL_1')} className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Model 1: Mengambil sendiri ke kampus</h4>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Cukup menyerahkan bukti registrasi.</p>
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
                    <p className="text-xs text-slate-500 mt-1 font-medium">Membawa bukti registrasi, fotokopi KTP peserta PPG, dan Surat kuasa bermaterai.</p>
                  </div>
                </div>
              </label>
              <label className={`block border rounded-xl p-4 cursor-pointer transition-all ${certificateModel === 'MODEL_3' ? 'border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500' : 'border-slate-200 hover:border-indigo-300'}`}>
                <div className="flex items-start gap-4">
                  <div className="mt-0.5">
                    <input type="radio" name="certificateModel" value="MODEL_3" checked={certificateModel === 'MODEL_3'} onChange={() => setCertificateModel('MODEL_3')} className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800 text-sm">Model 3: Jasa Pengiriman oleh HMPS</h4>
                    <p className="text-xs text-slate-500 mt-1 mb-2.5 font-medium">Mengambil serdik melalui jasa pengiriman oleh HMPS. Jika memilih ini, WAJIB Mengisi google form dari HMPS:</p>
                    <a 
                      href="https://forms.gle/ibfwFHKbkFvncmZm7" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition-all focus:ring-2 focus:ring-indigo-500/30 font-sans"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Formulir Paket Serdik
                    </a>
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
            <span className="text-xs sm:text-sm font-medium text-slate-700 leading-relaxed max-w-[90%]">
              <strong className="text-amber-800 font-bold">Pakta Integritas:</strong> Saya menyatakan bahwa seluruh data dan bukti pembayaran yang saya unggah adalah benar dan valid. Saya bersedia menerima sanksi pembatalan kepesertaan jika ditemukan indikasi pemalsuan.
            </span>
          </label>
        </div>

        <div className="pt-6 mt-6 border-t border-slate-100 flex justify-between items-center font-sans">
          <button type="button" onClick={() => navigate('/form-kehadiran')} className="text-slate-500 hover:text-slate-850 font-semibold transition-colors px-4 py-2 text-sm">
            Kembali
          </button>
          <button 
            type="submit" 
            disabled={!agreed} 
            className={`px-8 py-3 rounded-xl font-bold transition-all shadow-sm group relative overflow-hidden text-white text-sm ${agreed ? 'bg-teal-600 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]' : 'bg-slate-300 cursor-not-allowed opacity-70'}`}
          >
            <span className="relative z-10">Kirim Pendaftaran</span>
            {agreed && <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-teal-700 opacity-0 group-hover:opacity-100 transition-opacity" />}
          </button>
        </div>
      </form>
    </div>
  );
}
