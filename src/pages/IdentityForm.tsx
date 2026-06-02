import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { store, AttendeeData } from '../store/store';
import { motion } from 'motion/react';
import { User, Mail, Map, BookOpen, Camera, Phone, Loader2 } from 'lucide-react';

export default function IdentityForm() {
  const navigate = useNavigate();
  const [attendee, setAttendee] = useState<AttendeeData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [photoError, setPhotoError] = useState('');
  
  const [npkInput, setNpkInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [formKey, setFormKey] = useState(Date.now());

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

  const handleQuickFill = async () => {
    if (!npkInput) {
      alert('Masukkan NPK terlebih dahulu untuk mencari data.');
      return;
    }
    setIsSearching(true);
    try {
      const all = await store.getAllAttendees();
      const existing = Object.values(all).find(a => a.npk === npkInput);
      if (existing) {
        setAttendee({
          ...attendee!,
          fullName: existing.fullName,
          email: existing.email,
          address: existing.address,
          city: existing.city,
          province: existing.province,
          schoolName: existing.schoolName,
          phoneWA: existing.phoneWA,
          studyField: existing.studyField,
          npk: existing.npk
        });
        setFormKey(Date.now());
      } else {
        alert('Data peserta dengan NPK tersebut tidak ditemukan.');
      }
    } catch (e) {
      console.error(e);
      alert('Gagal mencari data.');
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Convert form to object and handle specific constraints
    const data: Partial<AttendeeData> = {
      email: formData.get('email') as string,
      fullName: (formData.get('fullName') as string).toUpperCase(),
      npk: formData.get('npk') as string,
      address: (formData.get('address') as string).toUpperCase(),
      city: (formData.get('city') as string).toUpperCase(),
      province: (formData.get('province') as string).toUpperCase(),
      schoolName: (formData.get('schoolName') as string).toUpperCase(),
      phoneWA: formData.get('phoneWA') as string,
      studyField: formData.get('studyField') as string,
    };

    const photoFile = formData.get('photoFile') as File;
    if (photoFile && photoFile.size > 0) {
      if (photoFile.size > 500 * 1024) {
        setPhotoError('Ukuran file maksimal 500KB');
        return;
      }
      setPhotoError('');
      // Mock File Upload directly converting to base64 for local dev
      const reader = new FileReader();
      reader.onload = async () => {
        data.photoUrl = reader.result as string;
        await store.saveAttendee(data);
        navigate('/form-kehadiran');
      };
      reader.readAsDataURL(photoFile);
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
                onChange={(e) => { handleNumbers(e); setNpkInput(e.target.value); }} 
                className="input-base font-mono flex-1" 
                placeholder="123456789" 
                defaultValue={attendee?.npk || ''} 
              />
              <button 
                type="button"
                onClick={handleQuickFill}
                disabled={isSearching}
                className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-4 rounded-xl font-bold text-xs hover:bg-indigo-100 transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {isSearching ? 'Mencari...' : 'Quick Fill'}
              </button>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <Mail className="w-4 h-4 text-teal-600" /> Alamat Email
            </label>
            <input required name="email" type="email" className="input-base" placeholder="peserta@gmail.com" defaultValue={attendee?.email || ''} />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <User className="w-4 h-4 text-teal-600" /> Nama Lengkap Sesuai Ijazah
            </label>
            <input required name="fullName" type="text" onChange={handleUppercase} className="input-base" placeholder="ALI RAHMAN" defaultValue={attendee?.fullName || ''} />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <Phone className="w-4 h-4 text-teal-600" /> Nomor WhatsApp
            </label>
            <input required name="phoneWA" type="text" onChange={handleNumbers} className="input-base font-mono" placeholder="081234567890" defaultValue={attendee?.phoneWA || ''} />
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 mt-6">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
            <Map className="w-4 h-4 text-teal-600" /> Alamat Domisili
          </label>
          <textarea required name="address" rows={2} onChange={handleUppercase} className="input-base resize-none" placeholder="Alamat Lengkap" defaultValue={attendee?.address || ''}></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Kota / Kabupaten</label>
            <input required name="city" type="text" onChange={handleUppercase} className="input-base" placeholder="KAB MALANG" defaultValue={attendee?.city || ''} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Provinsi</label>
            <input required name="province" type="text" onChange={handleUppercase} className="input-base" placeholder="JAWA TIMUR" defaultValue={attendee?.province || ''} />
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <BookOpen className="w-4 h-4 text-teal-600" /> Asal Instansi (Madrasah/Sekolah)
            </label>
            <input required name="schoolName" type="text" onChange={handleUppercase} className="input-base" placeholder="MIN 1 MALANG" defaultValue={attendee?.schoolName || ''} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Bidang Studi Sertifikasi</label>
            <select required name="studyField" className="input-base bg-white" defaultValue={attendee?.studyField || ''}>
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

        <div className="bg-teal-50/50 p-5 rounded-2xl border border-teal-100/50 relative overflow-hidden mt-8">
          <div className="absolute -right-6 -bottom-6 opacity-10"><Camera className="w-32 h-32 text-teal-600" /></div>
          <div className="relative z-10">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-1">
              <Camera className="w-4 h-4 text-teal-600" /> Pas Foto Resmi
            </label>
            <p className="text-xs text-slate-500 mb-4 font-medium tracking-wide">Maksimal 500kb. Latar Biru/Merah. Kemeja/Jas. Rasio 3x4.</p>
            <input 
              type="file" 
              name="photoFile" 
              accept="image/*"
              required={!attendee?.photoUrl} 
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2.5 file:px-5
                file:rounded-lg file:border-0
                file:text-xs file:font-semibold file:tracking-wider file:uppercase
                file:bg-white file:text-teal-700 file:border file:border-teal-200
                hover:file:bg-teal-50 transition-all cursor-pointer"
            />
            {photoError ? <p className="text-rose-500 text-sm mt-3 font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-500 block"></span>{photoError}</p> : null}
            {attendee?.photoUrl ? <p className="text-sm font-medium text-teal-600 mt-3 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-teal-500 block"></span>Image verification passed.</p> : null}
          </div>
        </div>

        <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end">
          <button 
            type="submit" 
            className="group relative px-8 py-3 bg-teal-600 text-white rounded-xl font-semibold shadow-[0_8px_20px_-4px_rgba(13,148,136,0.4)] overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="relative z-10">Lanjut ke Presensi →</span>
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-teal-700 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </form>
    </div>
  );
}
