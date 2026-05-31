import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, UserCog } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate admin authentication
    if (password === 'admin123' || password === 'petugas') {
      sessionStorage.setItem('yudisium_admin_logged_in', 'true');
      navigate('/admin');
    } else {
      setError(true);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className="p-8 flex flex-col items-center justify-center min-h-[400px]"
    >
      <div className="max-w-sm w-full space-y-8 bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <UserCog className="w-8 h-8 text-[#d4af37]" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Login Petugas</h2>
          <p className="text-slate-500 mt-2 text-sm">
            Masuk ke panel administrator untuk kelola data dan verifikasi kehadiran.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Passcode Akses</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                className={`w-full pl-10 pr-4 py-3 rounded-md border ${error ? 'border-red-500 focus:ring-red-500 text-red-600' : 'border-slate-300 focus:border-[#1e3a8a] focus:ring-[#1e3a8a]'} focus:outline-none focus:ring-1 transition-all`}
                placeholder="Masukkan passcode..."
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-xs mt-2 font-medium">Passcode salah. Coba: admin123</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-[#1e3a8a] hover:bg-[#0f172a] text-white font-bold py-3 px-4 rounded-md transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
          >
            Masuk Panel Admin
          </button>
        </form>
      </div>
    </motion.div>
  );
}
