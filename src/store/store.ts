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
  paymentSashText?: string;
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
let cachedColumnsToSelect: string | null = null;

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

// Resilient wrapper to write arrays data to Supabase by omitting columns not found in the schema dynamically
async function safeUpsertSupabaseArray(table: string, payloadArray: any[]) {
  if (!supabase) return { error: { message: "Supabase not connected" } };
  const CHUNK_SIZE = 50; // Use small chunks since each item might have ~300KB in base64 images
  let finalError = null;

  for (let i = 0; i < payloadArray.length; i += CHUNK_SIZE) {
    const chunkArray = payloadArray.slice(i, i + CHUNK_SIZE).map(item => ({ ...item }));
    let retryCount = 0;
    const maxRetries = 15;
    let chunkSuccess = false;

    while (retryCount < maxRetries) {
      const { error } = await supabase.from(table).upsert(chunkArray);
      if (error) {
        console.warn(`Supabase upsert array error (chunk ${i}):`, error);
        const match = error.message.match(/Could not find the '([^']+)' column/i);
        if (match && match[1]) {
          const missingColumn = match[1];
          console.warn(`[Auto-Clean] Suppressing missing column '${missingColumn}'`);
          chunkArray.forEach(item => {
            delete item[missingColumn];
          });
          retryCount++;
          continue;
        }
        finalError = error;
        break; // Other error, exit loop
      } else {
        chunkSuccess = true;
        break;
      }
    }
    
    if (finalError) break; // If a chunk critically failed, stop processing altogether
  }
  
  if (finalError) return { error: finalError };
  return { error: null };
}

// Resilient wrapper to update data in Supabase by omitting columns not found in the schema dynamically
async function safeUpdateSupabase(table: string, id: string, payload: any) {
  if (!supabase) return { error: { message: "Supabase not connected" }, data: null };
  const currentPayload = { ...payload };
  let retryCount = 0;
  const maxRetries = 15;
  
  while (retryCount < maxRetries) {
    const { error, data } = await supabase.from(table).update(currentPayload).eq('id', id).select().single();
    if (error) {
      console.warn("Supabase update error:", error);
      const match = error.message.match(/Could not find the '([^']+)' column/i);
      if (match && match[1]) {
        const missingColumn = match[1];
        console.warn(`[Auto-Clean] Suppressing and deleting missing column '${missingColumn}' from update payload`);
        delete currentPayload[missingColumn];
        retryCount++;
        continue;
      }
      return { error, data: null };
    }
    return { error: null, data };
  }
  return { error: { message: "Exceeded max retries cleaning non-existent columns from table schema" }, data: null };
}

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
    let result: Record<string, AttendeeData> = {};

    // 1. Fetch from Local Node API first (fallback database and local cache)
    try {
      const res = await fetch('/api/attendees');
      if (res.ok) {
        result = await res.json();
      } else {
        result = getLocalDb();
      }
    } catch(e) {
      console.error('Local API exception:', e);
      result = getLocalDb();
    }

    // 2. Fetch from Supabase and MERGE with local result (Supabase data takes precedence)
    if (supabase) {
      try {
        let columnsToSelect = cachedColumnsToSelect;
        
        if (!columnsToSelect) {
          // Exclude bulk base64 image data dynamically to handle both schema mismatch and OOM.
          const { data: sampleData, error: sampleError } = await supabase.from('attendees').select('*').limit(1);
          if (!sampleError) {
            columnsToSelect = '*';
            if (sampleData && sampleData.length > 0) {
              const availableColumns = Object.keys(sampleData[0]);
              const excludeColumns = new Set(['photoUrl', 'paymentHotelProofUrl', 'paymentLegalisirProofUrl', 'paymentSashProofUrl']);
              columnsToSelect = availableColumns.filter(c => !excludeColumns.has(c)).join(',');
            }
            cachedColumnsToSelect = columnsToSelect;
          } else {
             console.error('Supabase sample error:', sampleError);
             columnsToSelect = '*'; // fallback
          }
        }

        let allData: any[] = [];
        let from = 0;
        let to = 999;
        let hasMore = true;
        
        while (hasMore) {
          const { data, error } = await supabase
            .from('attendees')
            .select(columnsToSelect)
            .range(from, to);
          
          if (error) {
            console.error('Supabase get all error inside range loop:', error);
            break;
          }
          
          if (data && data.length > 0) {
            allData = [...allData, ...data];
            if (data.length < 1000) {
              hasMore = false;
            } else {
              from += 1000;
              to += 1000;
              // Safety fallback: limit to 20,000 entries max to prevent excessive loops
              if (from > 20000) hasMore = false;
            }
          } else {
            hasMore = false;
          }
        }

        if (allData.length > 0) {
          for (const item of allData) {
             const att = item as any;
             // Polyfill properties so that AdminScanner can still count them
             if (att.paymentHotelBank) att.paymentHotelProofUrl = 'yes';
             if (att.paymentLegalisirBank) att.paymentLegalisirProofUrl = 'yes';
             if (att.paymentSashBank) att.paymentSashProofUrl = 'yes';
             if (att.fullName) att.photoUrl = 'yes'; // best approximation without url for list view
             
             // SMART MERGE: Keep existing richer local data (especially if Supabase doesn't have the sash columns)
             const existing = (result[item.id] || {}) as any;
             result[item.id] = {
               ...existing,
               ...att,
               // Explicitly preserve sash fields if they exist in local memory/DB but are missing or falsy in Supabase item
               wantsSash: att.wantsSash !== undefined && att.wantsSash !== null ? att.wantsSash : existing.wantsSash,
               paymentSashBank: att.paymentSashBank || existing.paymentSashBank,
               paymentSashAccountName: att.paymentSashAccountName || existing.paymentSashAccountName,
               paymentSashAccountNumber: att.paymentSashAccountNumber || existing.paymentSashAccountNumber,
               paymentSashProofUrl: att.paymentSashProofUrl && att.paymentSashProofUrl !== 'yes' ? att.paymentSashProofUrl : (existing.paymentSashProofUrl || att.paymentSashProofUrl)
             };
          }
        }
      } catch (e) {
        console.error('Supabase get all exception:', e);
      }
    }
    
    return result;
  },

  async getAttendeeById(id: string): Promise<AttendeeData | null> {
    let localItem: any = null;
    try {
      const res = await fetch('/api/attendees/' + id);
      if (res.ok) {
        localItem = await res.json();
      }
    } catch (e) {
      console.error(e);
    }
    if (!localItem) {
      const all = getLocalDb();
      if (all[id]) localItem = all[id];
    }

    if (supabase) {
      try {
        const { data, error } = await supabase.from('attendees').select('*').eq('id', id).single();
        if (!error && data) {
          // SMART MERGE for single attendee
          return {
            ...localItem,
            ...data,
            wantsSash: data.wantsSash !== undefined && data.wantsSash !== null ? data.wantsSash : localItem?.wantsSash,
            paymentSashBank: data.paymentSashBank || localItem?.paymentSashBank,
            paymentSashAccountName: data.paymentSashAccountName || localItem?.paymentSashAccountName,
            paymentSashAccountNumber: data.paymentSashAccountNumber || localItem?.paymentSashAccountNumber,
            paymentSashProofUrl: data.paymentSashProofUrl || localItem?.paymentSashProofUrl
          } as AttendeeData;
        }
      } catch (e) {
        console.error('Supabase get id exception:', e);
      }
    }
    return localItem;
  },
  
  async submitFinalRegistration(data: Partial<AttendeeData>) {
    // 1. Save to local session (localStorage)
    const updated = this.saveAttendee({ ...data, isRegistered: true });
    
    // 2. ALWAYS save to local Node express API backup (db.json) first
    try {
      await fetch('/api/attendees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch (e) {
      console.error('Local Node API backup post failed:', e);
      // Fallback local memory
      const all = getLocalDb();
      all[updated.id] = updated as AttendeeData;
      setLocalDb(all);
    }
    
    // 3. Upsert to Supabase if available (this may omit a few new columns if user hasn't run sql schema additions)
    if (supabase) {
      const { error } = await safeUpsertSupabaseArray('attendees', [updated]);
      if (error) {
        console.error('Supabase error:', error);
        
        let customMessage = "Gagal menyimpan ke Supabase: " + error.message;
        
        if (error.message.includes("Invalid path specified in request URL") || error.message.includes("Failed to fetch")) {
           customMessage = `Error URL Supabase: Pastikan 'VITE_SUPABASE_URL' di menu rahasia (Settings -> API/Secrets) formatnya benar. Contoh yang benar: https://[PROYEK-ID].supabase.co (Jangan ada tambahan /rest/v1 di belakang, dan hapus tanda petik bila ada). Error Asli: ${error.message}`;
        }

        throw new Error(customMessage);
      }
    }

    // Attempt to send email (non-blocking fire-and-forget)
    if (updated.email) {
      fetch('/api/sendemail', {
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
      }).catch(e => {
        console.error('Failed to trigger email send in background:', e);
      });
    }

    return updated;
  },
  
  async verifyAttendeeAdmin(id: string) {
    // 1. Update local Node express API fallback first
    let localResult: AttendeeData | null = null;
    try {
      const full = await this.getAttendeeById(id);
      if (full) {
        full.status = 'VERIFIED';
        await fetch('/api/attendees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(full)
        });
        localResult = full;
      }
    } catch(e) {
      console.error('Local verify API failed:', e);
    }

    // 2. Update Supabase
    if (supabase) {
      try {
        const { data, error } = await supabase.from('attendees').update({ status: 'VERIFIED' }).eq('id', id).select().single();
        if (!error && data) {
          return { ...localResult, ...data } as AttendeeData;
        }
      } catch (e) {
        console.error('Supabase exception:', e);
      }
    }
    
    return localResult;
  },
  
  async updateAttendeeAdmin(id: string, data: Partial<AttendeeData>) {
    // 1. ALWAYS write to Local API first
    let localResult: AttendeeData | null = null;
    try {
      const full = await this.getAttendeeById(id);
      if (full) {
        localResult = { ...full, ...data };
        await fetch('/api/attendees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(localResult)
        });
      }
    } catch (e) {
      console.error('Local API update failed:', e);
    }

    // 2. Write to Supabase
    if (supabase) {
      try {
        const { data: updatedData, error } = await safeUpdateSupabase('attendees', id, data);
        if (!error && updatedData) {
          return { ...localResult, ...updatedData } as AttendeeData;
        }
      } catch (e) {
        console.error('Supabase exception:', e);
      }
    }
    
    return localResult;
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
      
      const { error } = await safeUpsertSupabaseArray('attendees', toSync);
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
