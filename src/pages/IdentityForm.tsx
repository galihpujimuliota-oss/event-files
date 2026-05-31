import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { store, AttendeeData } from '../store/store';
import { motion } from 'motion/react';

export default function IdentityForm() {
  const navigate = useNavigate();
  const [attendee] = useState<AttendeeData | null>(store.getAttendee());
  const [photoError, setPhotoError] = useState('');

  if (!attendee) {
    navigate('/login');
    return null;
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
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
      className="p-6 md:p-8"
    >
      <div className="border-b border-slate-200 pb-4 mb-6">
        <h2 className="text-xl font-bold text-slate-800">BAGIAN 1: IDENTITAS DIRI</h2>
        <p className="text-slate-500 text-sm mt-1">Silakan lengkapi formulir identitas diri dengan benar.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Alamat Email</label>
          <input required name="email" type="email" className="input-base" placeholder="Contoh: peserta@gmail.com" defaultValue={attendee.email} />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Lengkap</label>
          <input required name="fullName" type="text" onChange={handleUppercase} className="input-base" placeholder="Contoh: ALI RAHMAN IBRAHIM" defaultValue={attendee.fullName} />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">No. NPK atau No. Akun Siaga</label>
          <input required name="npk" type="text" onChange={handleNumbers} className="input-base" placeholder="Hanya Angka" defaultValue={attendee.npk} />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Alamat</label>
          <textarea required name="address" rows={3} onChange={handleUppercase} className="input-base" placeholder="Alamat Domisili" defaultValue={attendee.address}></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Kota/Kabupaten</label>
            <input required name="city" type="text" onChange={handleUppercase} className="input-base" placeholder="Contoh: KAB. MALANG" defaultValue={attendee.city} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Provinsi</label>
            <input required name="province" type="text" onChange={handleUppercase} className="input-base" placeholder="Contoh: JAWA TIMUR" defaultValue={attendee.province} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Sekolah/Madrasah</label>
          <input required name="schoolName" type="text" onChange={handleUppercase} className="input-base" placeholder="Nama Sekolah Lengkap" defaultValue={attendee.schoolName} />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">No HP (WA)</label>
          <input required name="phoneWA" type="text" onChange={handleNumbers} className="input-base" placeholder="Hanya Angka" defaultValue={attendee.phoneWA} />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Bidang Studi</label>
          <select required name="studyField" className="input-base bg-white" defaultValue={attendee.studyField}>
            <option value="" disabled>Pilih Bidang Studi...</option>
            <option value="Pendidikan Agama Islam (Dinas)">1. Pendidikan Agama Islam (Dinas)</option>
            <option value="Akidah Akhlak">2. Akidah Akhlak</option>
            <option value="Fiqih">3. Fiqih</option>
            <option value="Sejarah Kebudayaan Islam">4. Sejarah Kebudayaan Islam</option>
            <option value="Guru Kelas RA">5. Guru Kelas RA</option>
            <option value="Guru Kelas MI">6. Guru Kelas MI</option>
            <option value="Quran Hadist">7. Quran Hadist</option>
            <option value="Bahasa Arab">8. Bahasa Arab</option>
          </select>
        </div>

        <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Foto Profil</label>
          <p className="text-xs text-slate-500 mb-3">Ketentuan: Maksimal 500kb, Rasio 3x4, Background Merah, Mengenakan Jas.</p>
          <input 
            type="file" 
            name="photoFile" 
            accept="image/*"
            required={!attendee.photoUrl} 
            className="block w-full text-sm text-slate-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-brand-blue file:text-white
              hover:file:bg-[#0f172a] transition-all cursor-pointer"
          />
          {photoError && <p className="text-red-500 text-sm mt-2">{photoError}</p>}
          {attendee.photoUrl && <p className="text-sm font-medium text-green-600 mt-2">Foto telah tersimpan, upload baru untuk mengganti.</p>}
        </div>

        <div className="pt-4 flex justify-end">
          <button type="submit" className="bg-[#1e3a8a] hover:bg-[#0f172a] text-white px-8 py-2.5 rounded-md font-bold transition-colors shadow-sm">
            Selanjutnya
          </button>
        </div>
      </form>
    </motion.div>
  );
}
