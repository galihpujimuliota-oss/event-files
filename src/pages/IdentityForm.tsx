import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { store, AttendeeData } from '../store/store';
import { getAllowedAttendee } from '../store/allowedAttendees';
import { motion } from 'motion/react';
import { User, Mail, Map, BookOpen, Camera, Phone, Loader2 } from 'lucide-react';

export default function IdentityForm() {
  const navigate = useNavigate();
  const [attendee, setAttendee] = useState<AttendeeData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [npkInput, setNpkInput] = useState('');
  const [validationError, setValidationError] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState<{
    visible: boolean;
    existing: AttendeeData | null;
    newData: Partial<AttendeeData> | null;
  }>({ visible: false, existing: null, newData: null });

  useEffect(() => {
    const data = store.getAttendee();
    if (!data || !data.id) {
      navigate('/login');
    } else {
      setAttendee(data);
      setNpkInput(data.npk || '');
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

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingPhoto(true);
    setPhotoError('');

    try {
      const compBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            const MAX_DIM = 800;
            if (width > MAX_DIM || height > MAX_DIM) {
              if (width > height) {
                height = Math.round((height * MAX_DIM) / width);
                width = MAX_DIM;
              } else {
                width = Math.round((width * MAX_DIM) / height);
                height = MAX_DIM;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
              resolve(dataUrl);
            } else {
              resolve(event.target?.result as string);
            }
          };
          img.onerror = () => reject(new Error('Format file gambar tidak valid.'));
          img.src = event.target?.result as string;
        };
        reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
        reader.readAsDataURL(file);
      });

      setAttendee(prev => prev ? { ...prev, photoUrl: compBase64 } : null);
      store.saveAttendee({ photoUrl: compBase64 });
      setPhotoError('');
    } catch (err: any) {
      console.error(err);
      setPhotoError(err.message || 'Gagal memproses gambar.');
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  const handleFieldChange = (field: keyof AttendeeData, value: any) => {
    setAttendee(prev => prev ? { ...prev, [field]: value } : null);
    store.saveAttendee({ [field]: value });
  };

  const handleNpkChange = (val: string) => {
    const cleanedVal = val.replace(/[^0-9]/g, '');
    setNpkInput(cleanedVal);
    
    // Auto lookup for easy helper completion, but never overrides/enforces manually edited fields
    const allowed = getAllowedAttendee(cleanedVal);
    if (allowed && allowed.fullName) {
      setAttendee(prev => {
        if (!prev) return null;
        return {
          ...prev,
          npk: cleanedVal,
          fullName: allowed.fullName,
          studyField: allowed.studyField
        };
      });
      store.saveAttendee({ npk: cleanedVal, fullName: allowed.fullName, studyField: allowed.studyField });
    } else {
      setAttendee(prev => prev ? { ...prev, npk: cleanedVal } : null);
      store.saveAttendee({ npk: cleanedVal });
    }
  };

  const handleConfirmEditDuplicate = async () => {
    if (duplicateWarning.existing && duplicateWarning.newData) {
      const merged = { ...duplicateWarning.existing, ...duplicateWarning.newData };
      await store.saveAttendee(merged);
      setAttendee(merged as AttendeeData);
      setDuplicateWarning({ visible: false, existing: null, newData: null });
      navigate('/form-kehadiran');
    }
  };

  const handleCancelDuplicate = () => {
    setDuplicateWarning({ visible: false, existing: null, newData: null });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationError('');
    
    const data: Partial<AttendeeData> = {
      email: (attendee.email || '').trim(),
      fullName: (attendee.fullName || '').toUpperCase().trim(),
      npk: npkInput.trim(),
      address: (attendee.address || '').toUpperCase().trim(),
      city: (attendee.city || '').toUpperCase().trim(),
      province: (attendee.province || '').toUpperCase().trim(),
      schoolName: (attendee.schoolName || '').toUpperCase().trim(),
      phoneWA: (attendee.phoneWA || '').trim(),
      studyField: (attendee.studyField || '').trim(),
      photoUrl: attendee.photoUrl || null
    };

    if (!data.npk) {
      setValidationError('Mohon isi Nomor NPK / Akun Siaga Anda.');
      return;
    }
    if (!data.fullName) {
      setValidationError('Mohon isi Nama Lengkap Anda.');
      return;
    }
    if (!data.studyField) {
      setValidationError('Mohon pilih Bidang Studi Sertifikasi Anda.');
      return;
    }

    setIsChecking(true);
    const existing = await store.getAttendeeByNpk(data.npk);
    setIsChecking(false);

    if (existing && existing.id !== attendee.id) {
      // Show gorgeous in-app modal instead of browser blocking confirm dialog to prevent crashes and provide edit options
      setDuplicateWarning({
        visible: true,
        existing,
        newData: data
      });
    } else {
      await store.saveAttendee(data);
      navigate('/form-kehadiran');
    }
  };

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-300">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-5 mb-6">
        <span className="text-teal-600 font-mono text-sm border border-teal-200 bg-teal-50 px-2 py-0.5 rounded-md">STEP_01</span>
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Identitas Peserta</h2>
          <p className="text-slate-400 text-[13px] leading-snug">Mohon lengkapi profil Anda dengan data yang valid.</p>
        </div>
      </div>

      {/* Warning Callout regarding Double Entries */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3 text-slate-800 animate-in slide-in-from-top-4 duration-300">
        <div className="shrink-0 text-amber-600">
          <svg className="w-5 h-5 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h4 className="font-bold text-amber-900 text-xs sm:text-sm uppercase tracking-wider mb-1">Peringatan Penting: Hindari Mengisi Double</h4>
          <p className="text-xs sm:text-[13px] leading-relaxed text-amber-800">
            Setiap peserta hanya diperkenankan memiliki <strong>satu data registrasi</strong>. Jika Anda sudah pernah mendaftar dan ingin melakukan penyesuaian jawaban atau mengunggah bukti baru, Anda cukup mengisi NPK Anda. Sistem akan otomatis mendeteksi dan menawarkan opsi <strong>"Ubah/Edit Jawaban"</strong> untuk melanjutkan data lama Anda agar tidak terjadi penumpukan data ganda.
          </p>
        </div>
      </div>

      {/* Validation Error Banner */}
      {validationError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 mb-6 text-sm flex gap-2 items-center animate-shake">
          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
          <span className="font-semibold">{validationError}</span>
        </div>
      )}

      {/* Duplicate Entry React Modal */}
      {duplicateWarning.visible && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-amber-50 border border-amber-250 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Nomor NPK/Akun Sudah Terdaftar!</h3>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-4">
                Nomor NPK / Akun Siaga <strong className="font-mono text-slate-850 bg-slate-100 px-1 py-0.5 rounded">{npkInput}</strong> atas nama <strong className="text-teal-700 capitalize">{(duplicateWarning.existing?.fullName || '').toLowerCase()}</strong> sudah mendaftar sebelumnya.
              </p>
              
              <div className="bg-amber-50/50 rounded-xl p-3.5 mb-6 text-left border border-amber-100/40">
                <p className="text-[11px] sm:text-xs text-amber-800 leading-normal font-medium">
                  ⚠️ <strong>Pilihan Aman (Agar Tidak Double Data):</strong> Anda disarankan memilih tombol edit jawaban di bawah untuk memutakhirkan data pendaftaran Anda yang lama, menjaga tertib administratif panitia.
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={handleConfirmEditDuplicate}
                  className="w-full py-3 px-4 rounded-xl font-bold bg-teal-600 text-white shadow-[0_4px_12px_rgba(13,148,136,0.3)] hover:bg-teal-700 transition-all cursor-pointer active:scale-95"
                >
                  Edit Jawaban Registrasi Saya
                </button>
                <button
                  type="button"
                  onClick={handleCancelDuplicate}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Batal / Ganti Nomor NPK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              No. NPK / Akun Siaga
            </label>
            <input 
              required 
              name="npk" 
              type="text" 
              value={npkInput}
              onChange={(e) => handleNpkChange(e.target.value)} 
              className="input-base font-mono w-full" 
              placeholder="Masukkan NPK atau Nomor Siaga Anda" 
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <Mail className="w-4 h-4 text-teal-600" /> Alamat Email
            </label>
            <input 
              required 
              name="email" 
              type="email" 
              value={attendee.email || ''} 
              onChange={(e) => handleFieldChange('email', e.target.value)}
              className="input-base" 
              placeholder="peserta@gmail.com" 
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <User className="w-4 h-4 text-teal-600" /> Nama Lengkap Sesuai Ijazah
            </label>
            <input 
              required 
              name="fullName" 
              type="text" 
              value={attendee.fullName || ''} 
              onChange={(e) => handleFieldChange('fullName', e.target.value.toUpperCase())}
              className="input-base text-slate-850 font-bold animate-in fade-in duration-200" 
              placeholder="NAMA LENGKAP DETAIL" 
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <Phone className="w-4 h-4 text-teal-600" /> Nomor WhatsApp
            </label>
            <input 
              required 
              name="phoneWA" 
              type="text" 
              value={attendee.phoneWA || ''} 
              onChange={(e) => handleFieldChange('phoneWA', e.target.value.replace(/[^0-9]/g, ''))}
              className="input-base font-mono" 
              placeholder="081234567890" 
            />
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 mt-6">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
            <Map className="w-4 h-4 text-teal-600" /> Alamat Domisili
          </label>
          <textarea 
            required 
            name="address" 
            rows={2} 
            value={attendee.address || ''} 
            onChange={(e) => handleFieldChange('address', e.target.value.toUpperCase())}
            className="input-base resize-none" 
            placeholder="Alamat Lengkap" 
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Kota / Kabupaten</label>
            <input 
              required 
              name="city" 
              type="text" 
              value={attendee.city || ''} 
              onChange={(e) => handleFieldChange('city', e.target.value.toUpperCase())}
              className="input-base" 
              placeholder="KAB MALANG" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Provinsi</label>
            <input 
              required 
              name="province" 
              type="text" 
              value={attendee.province || ''} 
              onChange={(e) => handleFieldChange('province', e.target.value.toUpperCase())}
              className="input-base" 
              placeholder="JAWA TIMUR" 
            />
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <BookOpen className="w-4 h-4 text-teal-600" /> Asal Instansi (Madrasah/Sekolah)
            </label>
            <input 
              required 
              name="schoolName" 
              type="text" 
              value={attendee.schoolName || ''} 
              onChange={(e) => handleFieldChange('schoolName', e.target.value.toUpperCase())}
              className="input-base" 
              placeholder="MIN 1 MALANG" 
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Bidang Studi Sertifikasi</label>
            <select 
              required 
              name="studyField" 
              className="input-base bg-white text-slate-800" 
              value={attendee.studyField || ''}
              onChange={(e) => handleFieldChange('studyField', e.target.value)}
            >
              <option value="" disabled>Pilih Bidang Studi...</option>
              <option value="Pendidikan Agama Islam (Dinas)">Pendidikan Agama Islam (Dinas)</option>
              <option value="Akidah Akhlak">Akidah Akhlak</option>
              <option value="Fiqih">Fiqih</option>
              <option value="Sejarah Kebudayaan Islam">Sejarah Kebudayaan Islam</option>
              <option value="Guru Kelas RA">Guru Kelas RA</option>
              <option value="Guru Kelas MI">Guru Kelas MI</option>
              <option value="Quran Hadist">Quran Hadist</option>
              <option value="Bahasa Arab">Bahasa Arab</option>
            </select>
          </div>
        </div>

        <div className="bg-teal-50/50 p-5 rounded-2xl border border-teal-100/50 mt-8">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            
            <div className="relative shrink-0 w-24 h-32 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden shadow-sm">
              {isProcessingPhoto ? (
                <div className="absolute inset-0 bg-slate-100/80 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-teal-600 animate-spin" />
                </div>
              ) : attendee.photoUrl ? (
                <img 
                  src={attendee.photoUrl} 
                  alt="Review Pas Foto" 
                  className="w-full h-full object-cover animate-in fade-in duration-300" 
                />
              ) : (
                <Camera className="w-8 h-8 text-slate-300" />
              )}
            </div>

            <div className="flex-1">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-1">
                <Camera className="w-4 h-4 text-teal-600" /> Pas Foto Resmi
              </label>
              <p className="text-xs text-slate-500 mb-4 font-medium tracking-wide">Latar Biru/Merah. Kemeja/Jas rapi. File asli akan otomatis dikompres ke ukuran optimal (<span className="text-teal-600 font-bold">&lt; 100KB</span>).</p>
              
              <input 
                type="file" 
                name="photoFile" 
                accept="image/*"
                onChange={handlePhotoChange}
                required={!attendee.photoUrl} 
                disabled={isProcessingPhoto}
                className="block w-full text-sm text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-xs file:font-bold file:tracking-wider file:uppercase
                  file:bg-white file:text-teal-700 file:border file:border-teal-200
                  hover:file:bg-teal-50 transition-all cursor-pointer disabled:opacity-50"
              />
              
              {photoError ? (
                <p className="text-rose-500 text-xs mt-2.5 font-semibold flex items-center gap-1.5 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  {photoError}
                </p>
              ) : null}
              
              {attendee.photoUrl && !isProcessingPhoto ? (
                <p className="text-emerald-700 text-xs mt-2.5 font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Foto berhasil diunggah & dikompres secara optimal!
                </p>
              ) : null}
            </div>
            
          </div>
        </div>

        <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end">
          <button 
            type="submit" 
            disabled={isChecking}
            className="group relative px-8 py-3 rounded-xl font-bold bg-teal-600 text-white shadow-[0_8px_20px_-4px_rgba(13,148,136,0.4)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              {isChecking ? 'Memeriksa Data...' : 'Lanjut ke Presensi'}
              {!isChecking && <span>→</span>}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-teal-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>
      </form>
    </div>
  );
}
