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
  paymentBank?: string;
  paymentAccountName?: string;
  paymentAccountNumber?: string;
  paymentProofUrl?: string | null;
  isRegistered: boolean;
  status: 'PENDING' | 'VERIFIED';
};

// Internal Local Storage helper
const getLocalDb = (): Record<string, AttendeeData> => {
  const db = localStorage.getItem('yudisium_db');
  return db ? JSON.parse(db) : {};
};
const setLocalDb = (data: Record<string, AttendeeData>) => {
  localStorage.setItem('yudisium_db', JSON.stringify(data));
};

export const store = {
  getAttendee(): AttendeeData | null {
    const data = localStorage.getItem('yudisium_attendee');
    if (data) return JSON.parse(data);
    return null;
  },
  
  // NOTE: Keep saveAttendee synchronous for draft session forms
  saveAttendee(data: Partial<AttendeeData>) {
    const current = this.getAttendee() || { 
      id: Math.random().toString(36).substring(2, 9),
      status: 'PENDING',
      isRegistered: false
    };
    const updated = { ...current, ...data };
    localStorage.setItem('yudisium_attendee', JSON.stringify(updated));
    return updated;
  },
  
  async getAllAttendees(): Promise<Record<string, AttendeeData>> {
    if (supabase) {
      const { data, error } = await supabase.from('attendees').select('*');
      if (!error && data) {
        const dict: Record<string, AttendeeData> = {};
        for (const item of data) { dict[item.id] = item; }
        return dict;
      }
    }
    return getLocalDb();
  },
  
  async submitFinalRegistration(data: Partial<AttendeeData>) {
    // 1. Save to local session
    const updated = this.saveAttendee({ ...data, isRegistered: true });
    
    // 2. Upsert to Supabase if available
    if (supabase) {
      // NOTE: For real upsert, you must match columns with your DB structure. 
      // If table doesnt match perfectly, this will error in Supabase but for now it sends what it has.
      await supabase.from('attendees').upsert([updated]);
    }

    // 3. Keep local db fallback
    const all = getLocalDb();
    all[updated.id] = updated as AttendeeData;
    setLocalDb(all);

    return updated;
  },
  
  async verifyAttendeeAdmin(id: string) {
    if (supabase) {
      const { data, error } = await supabase.from('attendees').update({ status: 'VERIFIED' }).eq('id', id).select().single();
      if (!error && data) return data as AttendeeData;
    }
    
    const all = getLocalDb();
    if (all[id]) {
      all[id].status = 'VERIFIED';
      setLocalDb(all);
      return all[id];
    }
    return null;
  },
  
  async updateAttendeeAdmin(id: string, data: Partial<AttendeeData>) {
    if (supabase) {
      const { data: updatedData, error } = await supabase.from('attendees').update(data).eq('id', id).select().single();
      if (!error && updatedData) return updatedData as AttendeeData;
    }
    
    const all = getLocalDb();
    if (all[id]) {
      all[id] = { ...all[id], ...data } as AttendeeData;
      setLocalDb(all);
      return all[id];
    }
    return null;
  },
  
  async deleteAttendeeAdmin(id: string) {
    if (supabase) {
      await supabase.from('attendees').delete().eq('id', id);
    }
    const all = getLocalDb();
    if (all[id]) {
      delete all[id];
      setLocalDb(all);
      return true;
    }
    return false;
  },
  
  clear() {
    localStorage.removeItem('yudisium_attendee');
  }
};
