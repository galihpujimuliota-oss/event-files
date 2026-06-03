import { supabase } from '../lib/supabase';

const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export type AttendeeData = {
  id: string;
  email?: string;
  fullName: string;
  npk: string;
  address: string;
  city: string;
  province: string;
  schoolName: string;
  phoneWA: string;
  studyField: string;
  photoUrl: string | null;
  attendanceType: 'DARING' | 'LURING' | null;
  paymentHotelBank?: string;
  paymentHotelAccountName?: string;
  paymentHotelAccountNumber?: string;
  paymentHotelProofUrl?: string | null;
  paymentLegalisirBank?: string;
  paymentLegalisirAccountName?: string;
  paymentLegalisirAccountNumber?: string;
  paymentLegalisirProofUrl?: string | null;
  wantsSash?: boolean;
  paymentSashBank?: string;
  paymentSashAccountName?: string;
  paymentSashAccountNumber?: string;
  paymentSashProofUrl?: string | null;
  certificateRetrievalMethod?: 'MODEL_1' | 'MODEL_2' | 'MODEL_3';
  isRegistered: boolean;
  status: 'PENDING' | 'VERIFIED';
};

let memoryAttendee: AttendeeData | null = null;
let memoryDb: Record<string, AttendeeData> = {};

// Internal Local Storage helper
const getLocalDb = (): Record<string, AttendeeData> => {
  try {
    const db = localStorage.getItem('yudisium_db');
    return db ? JSON.parse(db) : memoryDb;
  } catch (e) {
    return memoryDb;
  }
};
const setLocalDb = (data: Record<string, AttendeeData>) => {
  memoryDb = data;
  try {
    localStorage.setItem('yudisium_db', JSON.stringify(data));
  } catch (e) {}
};

export const store = {
  getAttendee(): AttendeeData | null {
    try {
      const data = localStorage.getItem('yudisium_attendee');
      if (data) return JSON.parse(data);
    } catch(e) {
      console.error('Failed to parse attendee data', e);
    }
    return memoryAttendee;
  },
  
  // NOTE: Keep saveAttendee synchronous for draft session forms
  saveAttendee(data: Partial<AttendeeData>) {
    let current = this.getAttendee();
    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(current?.id || '');
    if (current && current.id && !isValidUUID) {
      // Prevent passing non-UUID to Supabase for old local sessions
      current.id = generateUUID();
    }
    
    if (!current) {
      current = { 
        id: generateUUID(),
        status: 'PENDING',
        isRegistered: false
      };
    }
    const updated = { ...current, ...data };
    memoryAttendee = updated as AttendeeData;
    try {
      localStorage.setItem('yudisium_attendee', JSON.stringify(updated));
    } catch (e) {}
    return updated;
  },
  
  async getAllAttendees(): Promise<Record<string, AttendeeData>> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('attendees').select('*');
        if (!error && data) {
          const dict: Record<string, AttendeeData> = {};
          for (const item of data) { dict[item.id] = item; }
          return dict;
        }
      } catch (e) {
        console.error('Supabase exception:', e);
      }
    }
    
    // API fallback
    try {
      const res = await fetch('/api/attendees');
      if (res.ok) {
        return await res.json();
      }
    } catch(e) {
      console.error(e);
    }
    return getLocalDb();
  },
  
  async submitFinalRegistration(data: Partial<AttendeeData>) {
    // 1. Save to local session
    const updated = this.saveAttendee({ ...data, isRegistered: true });
    
    // 2. Upsert to Supabase if available
    let savedToSupabase = false;
    if (supabase) {
      const { error } = await supabase.from('attendees').upsert([updated]);
      if (error) {
        console.error('Supabase error:', error);
        
        let customMessage = "Gagal menyimpan ke Supabase: " + error.message;
        
        if (error.message.includes("Invalid path specified in request URL") || error.message.includes("Failed to fetch")) {
           customMessage = `Error URL Supabase: Pastikan 'VITE_SUPABASE_URL' di menu rahasia (Settings -> API/Secrets) formatnya benar. Contoh yang benar: https://[PROYEK-ID].supabase.co (Jangan ada tambahan /rest/v1 di belakang, dan hapus tanda petik bila ada). Error Asli: ${error.message}`;
        }

        throw new Error(customMessage);
      } else {
        savedToSupabase = true;
      }
    }

    if (!savedToSupabase) {
      // 3. Keep local API fallback
      try {
        await fetch('/api/attendees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
        });
      } catch (e) {
        const all = getLocalDb();
        all[updated.id] = updated as AttendeeData;
        setLocalDb(all);
      }
    }

    // Attempt to send email
    if (updated.email) {
      try {
        await fetch('/api/sendemail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: updated.email,
            subject: 'Berhasil: Registrasi Yudisium & Access Pass',
            html: `<div style="font-family:sans-serif;max-width:500px;margin:auto;padding:20px;border:1px solid #e2e8f0;border-radius:12px;">
              <h2 style="color:#0d9488;">Registrasi Berhasil</h2>
              <p>Halo ${updated.fullName},</p>
              <p>Terima kasih. Anda telah berhasil melakukan registrasi. Berikut ID/NPK Anda:</p>
              <h3 style="letter-spacing:2px;background:#f8fafc;padding:10px;text-align:center;">${updated.npk}</h3>
              <p>Tipe Kehadiran: <strong>${updated.attendanceType}</strong></p>
              <p>Silakan unduh Kartu Access Pass (QR Code) dari halaman Sukses, lalu tunjukkan saat acara berlangsung.</p>
              <p style="color:#64748b;font-size:12px;margin-top:20px;">Sistem Yudisium - Harap tidak membalas email ini.</p>
            </div>`
          })
        });
      } catch (e) {
        console.error('Failed to trigger email send', e);
      }
    }

    return updated;
  },
  
  async verifyAttendeeAdmin(id: string) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('attendees').update({ status: 'VERIFIED' }).eq('id', id).select().single();
        if (!error && data) return data as AttendeeData;
      } catch (e) {
        console.error('Supabase exception:', e);
      }
    }
    
    // Fallback
    try {
      const all = await this.getAllAttendees();
      if (all[id]) {
        all[id].status = 'VERIFIED';
        await fetch('/api/attendees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(all[id])
        });
        return all[id];
      }
    } catch(e) {}
    
    return null;
  },
  
  async updateAttendeeAdmin(id: string, data: Partial<AttendeeData>) {
    if (supabase) {
      try {
        const { data: updatedData, error } = await supabase.from('attendees').update(data).eq('id', id).select().single();
        if (!error && updatedData) return updatedData as AttendeeData;
      } catch (e) {
        console.error('Supabase exception:', e);
      }
    }
    
    try {
      const all = await this.getAllAttendees();
      if (all[id]) {
        all[id] = { ...all[id], ...data } as AttendeeData;
        await fetch('/api/attendees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(all[id])
        });
        return all[id];
      }
    } catch (e) {}
    
    return null;
  },
  
  async deleteAttendeeAdmin(id: string) {
    if (supabase) {
      try {
        await supabase.from('attendees').delete().eq('id', id);
        return true;
      } catch (e) {
        console.error('Supabase exception:', e);
      }
    }
    
    try {
      await fetch('/api/attendees/' + id, { method: 'DELETE' });
      return true;
    } catch (e) {}

    return false;
  },
  
  async syncLocalDataToSupabase() {
    if (!supabase) return { success: false, message: 'Supabase tidak terhubung/tidak dikonfigurasi' };
    
    try {
      const localDb = getLocalDb();
      const currentAttendee = this.getAttendee();
      
      const toSync: AttendeeData[] = [];
      
      // Ambil data dari local database
      Object.values(localDb).forEach(item => {
        if (item && item.isRegistered) {
          toSync.push(item);
        }
      });
      
      // Ambil data dari sesi pendaftaran aktif jika ada dan sudah register
      if (currentAttendee && currentAttendee.isRegistered) {
        if (!toSync.some(item => item.id === currentAttendee.id)) {
          toSync.push(currentAttendee);
        }
      }
      
      if (toSync.length === 0) {
        return { success: false, message: 'Tidak menemukan data pendaftaran lokal di browser ini untuk disinkronkan.' };
      }
      
      const { error } = await supabase.from('attendees').upsert(toSync);
      if (error) {
        throw error;
      }
      
      return { success: true, count: toSync.length };
    } catch (e: any) {
      console.error('Failed to sync local data:', e);
      return { success: false, message: e.message || 'Gagal melakukan sinkronisasi ke server.' };
    }
  },
  
  clear() {
    memoryAttendee = null;
    try {
      localStorage.removeItem('yudisium_attendee');
    } catch (e) {}
  }
};
