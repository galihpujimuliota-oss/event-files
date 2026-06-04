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
  
  const [npkInput, setNpkInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [formKey, setFormKey] = useState(Date.now());

  useEffect(() => {
    const data = store.getAttendee();
    if (!data || !data.id) {
      navigate('/login');
    } else {
      setAttendee(data);
      const initialNpk = data.npk || '';
      setNpkInput(initialNpk);
      if (initialNpk) {
        setIsVerified(true);
        if (getAllowedAttendee(initialNpk)) {
          setIsManualEntry(false);
        } else {
          setIsManualEntry(true);
        }
      }
      setIsLoaded(true);
    }
  }, [navigate]);

  const handleQuickFill = async () => {
    const cleaned = npkInput.trim();
    if (!cleaned) {
      alert('Pemberitahuan: Data yang Anda inputkan salah, isikan dengan benar.');
      setIsVerified(false);
      return;
    }

    // Format validation: must be alphanumeric of length 4 to 24 digit/character
    const isValidFormat = /^[a-zA-Z0-9-]{4,24}$/.test(cleaned);
    if (!isValidFormat) {
      alert('Pemberitahuan: Format NPK/Nomor Siaga salah. Harus berupa angka/karakter 4 hingga 24 digit.');
      setIsVerified(false);
      return;
    }

    const allowed = getAllowedAttendee(cleaned);
    if (!allowed) {
      alert('Pemberitahuan: Data yang Anda inputkan salah, isikan dengan benar.');
      setIsVerified(false);
      return;
    }

    setIsSearching(true);
    try {
      const all = await store.getAllAttendees();
      const existing = Object.values(all).find(a => a.npk === cleaned);
      
      const isManual = !allowed.fullName;

      setAttendee({
        ...attendee!,
        fullName: existing?.fullName || allowed.fullName || attendee?.fullName || '',
        studyField: existing?.studyField || allowed.studyField || attendee?.studyField || '',
        npk: cleaned,
        email: existing?.email || attendee?.email || '',
        address: existing?.address || attendee?.address || '',
        city: existing?.city || attendee?.city || '',
        province: existing?.province || attendee?.province || '',
        schoolName: existing?.schoolName || attendee?.schoolName || '',
        phoneWA: existing?.phoneWA || attendee?.phoneWA || ''
      });
      setIsVerified(true);
      setIsManualEntry(isManual);
      setFormKey(Date.now());
      
      if (isManual) {
        alert('Verifikasi Berhasil! Silakan lengkapi Nama Lengkap Anda & pilih Bidang Studi Sertifikasi Anda secara mandiri di bawah.');
      } else {
        alert(`Pengecekan Sukses! Nama Anda cocok: ${allowed.fullName} (${allowed.studyField}). Silakan lengkapi data pendaftaran Anda.`);
      }
    } catch (e) {
      console.error(e);
      const isManual = !allowed.fullName;
      setAttendee({
        ...attendee!,
        fullName: allowed.fullName,
        studyField: allowed.studyField,
        npk: cleaned
      });
      setIsVerified(true);
      setIsManualEntry(isManual);
      setFormKey(Date.now());
      if (isManual) {
        alert('Verifikasi Berhasil! Silakan lengkapi Nama Lengkap Anda & pilih Bidang Studi Sertifikasi Anda secara mandiri di bawah.');
      } else {
        alert(`Pengecekan Sukses! Nama Anda cocok: ${allowed.fullName} (${allowed.studyField}). Silakan lengkapi data pendaftaran Anda.`);
      }
    } finally {
      setIsSearching(false);
    }
  };

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
              // Compress to JPEG with 0.75 quality (extremely light & fast)
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

      // Update state immediately so they see the live crop / preview!
      setAttendee(prev => prev ? { ...prev, photoUrl: compBase64 } : null);
      setPhotoError('');
    } catch (err: any) {
      console.error(err);
      setPhotoError(err.message || 'Gagal memproses gambar.');
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const npkVal = formData.get('npk') as string || npkInput;

    const allowed = getAllowedAttendee(npkVal);
    if (!allowed && !isManualEntry) {
      alert('Pemberitahuan: Data yang Anda inputkan salah, isikan dengan benar.');
      return;
    }
    
    // Convert form to object and handle specific constraints safely with fallbacks
    const data: Partial<AttendeeData> = {
      email: (formData.get('email') as string || '').trim(),
      fullName: (formData.get('fullName') as string || attendee?.fullName || allowed?.fullName || '').toUpperCase().trim(),
      npk: npkVal.trim(),
      address: (formData.get('address') as string || '').toUpperCase().trim(),
      city: (formData.get('city') as string || '').toUpperCase().trim(),
      province: (formData.get('province') as string || '').toUpperCase().trim(),
      schoolName: (formData.get('schoolName') as string || '').toUpperCase().trim(),
      phoneWA: (formData.get('phoneWA') as string || '').trim(),
      studyField: (formData.get('studyField') as string || attendee?.studyField || allowed?.studyField || '').trim(),
      photoUrl: attendee?.photoUrl || null
    };

    if (!data.fullName) {
      alert('Mohon isi Nama Lengkap Anda.');
      return;
    }
    if (!data.studyField) {
      alert('Mohon pilih Bidang Studi Sertifikasi Anda.');
      return;
    }

    await store.saveAttendee(data);
    navigate('/form-kehadiran');
  };

  const handleUppercase = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.value = e.target.value.toUpperCase();
  };

  const handleNumbers = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-5 mb-8">
        <span className="text-teal-600 font-mono text-sm border border-teal-200 bg-teal-50 px-2 py-0.5 rounded-md">STEP_01</span>
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Identitas Peserta</h2>
          <p className="text-slate-400 text-[13px] leading-snug">Mohon lengkapi profil Anda dengan data yang valid.</p>
        </div>
      </div>

      {!isVerified && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-5 text-[13px] font-semibold mb-8 flex items-start gap-3 shadow-sm">
          <span className="text-lg">⚠️</span>
          <div>
            <span className="block font-bold text-amber-950 mb-0.5">Perhatian: Form Identitas Terkunci</span>
            Silakan masukkan nomor NPK/Siaga Anda dan klik tombol <strong className="text-indigo-800">CEK DATA ANDA</strong> terlebih dahulu untuk memverifikasi keabsahan data sebelum dapat mengisi data yudisium.
          </div>
        </div>
      )}

      {isVerified && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl p-5 text-[13px] font-semibold mb-8 flex items-start gap-3 shadow-sm">
          <span className="text-lg">✅</span>
          <div>
            <span className="block font-bold text-emerald-950 mb-0.5">Selamat: Nomor NPK/Siaga Terverifikasi!</span>
            Data Anda terdaftar resmi di sistem yudisium. Silakan lengkapi sisa isian formulir di bawah ini dengan lengkap dan benar.
          </div>
        </div>
      )}

      <form key={formKey} onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              No. NPK / Akun Siaga
            </label>
            <div className="flex gap-2">
              <input 
                required 
                name="npk" 
                type="text" 
                value={npkInput}
                onChange={(e) => { 
                  const cleanedVal = e.target.value.replace(/[^0-9]/g, '');
                  setNpkInput(cleanedVal);
                  setIsVerified(false); // Reset status verifikasi jika input NPK berubah
                }} 
                className="input-base font-mono flex-1 ring-2 ring-indigo-100/50" 
                placeholder="123456789" 
              />
              <button 
                type="button"
                onClick={handleQuickFill}
                disabled={isSearching}
                className="bg-indigo-600 text-white px-5 rounded-xl font-extrabold text-xs hover:bg-indigo-700 transition-colors disabled:opacity-50 whitespace-nowrap shadow-sm"
              >
                {isSearching ? 'Memproses...' : 'CEK DATA ANDA'}
              </button>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <Mail className="w-4 h-4 text-teal-600" /> Alamat Email
            </label>
            <input 
              required 
              name="email" 
              type="email" 
              disabled={!isVerified}
              className="input-base disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-100" 
              placeholder="peserta@gmail.com" 
              defaultValue={attendee?.email || ''} 
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <User className="w-4 h-4 text-teal-600" /> Nama Lengkap Sesuai Ijazah {isManualEntry ? '(Ketik Mandiri)' : '(Terkunci Sesuai CSV)'}
            </label>
            {isManualEntry ? (
              <input 
                required 
                name="fullName" 
                type="text" 
                onChange={(e) => {
                  const val = e.target.value.toUpperCase();
                  setAttendee(prev => prev ? { ...prev, fullName: val } : null);
                }}
                className="input-base text-slate-850 border-slate-200 font-bold focus:ring-1 focus:ring-teal-500" 
                placeholder="NAMA LENGKAP DETAIL" 
                value={attendee?.fullName || ''} 
              />
            ) : (
              <input 
                required 
                name="fullName" 
                type="text" 
                readOnly={true} // Terkunci otomatis dari database resmi agar 100% akurat
                className="input-base bg-slate-100 text-slate-700 border-slate-200 font-bold cursor-not-allowed" 
                placeholder="Selesaikan pengecekan NPK..." 
                value={attendee?.fullName || ''} 
              />
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <Phone className="w-4 h-4 text-teal-600" /> Nomor WhatsApp
            </label>
            <input 
              required 
              name="phoneWA" 
              type="text" 
              onChange={handleNumbers} 
              disabled={!isVerified}
              className="input-base font-mono disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-100" 
              placeholder="081234567890" 
              defaultValue={attendee?.phoneWA || ''} 
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
            onChange={handleUppercase} 
            disabled={!isVerified}
            className="input-base resize-none disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-100" 
            placeholder="Alamat Lengkap" 
            defaultValue={attendee?.address || ''}
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Kota / Kabupaten</label>
            <input 
              required 
              name="city" 
              type="text" 
              onChange={handleUppercase} 
              disabled={!isVerified}
              className="input-base disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-100" 
              placeholder="KAB MALANG" 
              defaultValue={attendee?.city || ''} 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Provinsi</label>
            <input 
              required 
              name="province" 
              type="text" 
              onChange={handleUppercase} 
              disabled={!isVerified}
              className="input-base disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-100" 
              placeholder="JAWA TIMUR" 
              defaultValue={attendee?.province || ''} 
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
              onChange={handleUppercase} 
              disabled={!isVerified}
              className="input-base disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-100" 
              placeholder="MIN 1 MALANG" 
              defaultValue={attendee?.schoolName || ''} 
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Bidang Studi Sertifikasi {isManualEntry ? '(Pilih Mandiri)' : '(Terkunci Sesuai CSV)'}</label>
            <select 
              required 
              name="studyField" 
              disabled={!isManualEntry} // Terkunci otomatis jika bukan manual entry
              className={`input-base ${!isManualEntry ? 'bg-slate-100 text-slate-700 border-slate-200 font-bold' : 'bg-white text-slate-800'}`} 
              value={attendee?.studyField || ''}
              onChange={(e) => {
                const val = e.target.value;
                setAttendee(prev => prev ? { ...prev, studyField: val } : null);
              }}
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
            
            {/* Live Photo Preview Frame */}
            <div className="relative shrink-0 w-24 h-32 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden shadow-sm">
              {isProcessingPhoto ? (
                <div className="absolute inset-0 bg-slate-100/80 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-teal-600 animate-spin" />
                </div>
              ) : attendee?.photoUrl ? (
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
                required={!attendee?.photoUrl} 
                disabled={!isVerified || isProcessingPhoto}
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
              
              {attendee?.photoUrl && !isProcessingPhoto ? (
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
            disabled={!isVerified}
            className={`group relative px-8 py-3 rounded-xl font-bold shadow-md overflow-hidden transition-all duration-300 ${
              isVerified 
                ? 'bg-teal-600 text-white shadow-[0_8px_20px_-4px_rgba(13,148,136,0.4)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span className="relative z-10">Lanjut ke Presensi →</span>
            {isVerified && <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-teal-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />}
          </button>
        </div>
      </form>
    </div>
  );
}
