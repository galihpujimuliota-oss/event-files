import { Outlet } from 'react-router-dom';
import { Building2 } from 'lucide-react';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header aligned with Ascent Hotel style (Dark Blue, Gold accents) */}
      <header className="bg-[#0f172a] shadow-md border-b-4 border-[#d4af37]">
        <div className="max-w-4xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 text-white">
            <Building2 className="w-8 h-8 text-[#d4af37]" />
            <div>
              <h1 className="font-bold text-lg tracking-wide uppercase">Ascent Premiere</h1>
              <p className="text-xs text-slate-400 font-medium">HOTEL AND CONVENTION</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px]">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 text-center text-sm border-t border-slate-800">
        <p>&copy; {new Date().getFullYear()} Ascent Premiere Hotel and Convention Malang.</p>
        <p className="mb-2">Bekerja sama dengan Prodi PPG UIN Maulana Malik Ibrahim Malang.</p>
        <p><a href="/admin-login" className="text-slate-500 hover:text-slate-300 underline text-xs transition-colors">Admin / Petugas Login</a></p>
      </footer>
    </div>
  );
}
