import { supabase } from '../lib/supabase';

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
    const current = this.getAttendee() || { 
      id: Math.random().toString(36).substring(2, 9),
      status: 'PENDING',
      isRegistered: false
    };
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
      try {
        const { error } = await supabase.from('attendees').upsert([updated]);
        if (error) console.error('Supabase error:', error);
        else savedToSupabase = true;
      } catch (e) {
        console.error('Supabase exception:', e);
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
  
  clear() {
    memoryAttendee = null;
    try {
      localStorage.removeItem('yudisium_attendee');
    } catch (e) {}
  }
};
