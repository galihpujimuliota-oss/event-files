import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import IdentityForm from './pages/IdentityForm';
import AttendanceForm from './pages/AttendanceForm';
import PaymentForm from './pages/PaymentForm';
import SuccessCard from './pages/SuccessCard';
import AdminScanner from './pages/AdminScanner';
import AdminLogin from './pages/AdminLogin';
import Layout from './components/Layout';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<LandingPage />} />
        <Route path="login" element={<LoginPage />} />
        
        {/* Registration Flow */}
        <Route path="form-identitas" element={<IdentityForm />} />
        <Route path="form-kehadiran" element={<AttendanceForm />} />
        <Route path="form-pembayaran" element={<PaymentForm />} />
        <Route path="success" element={<SuccessCard />} />
      </Route>

      {/* Admin Route (Out of Layout) */}
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminScanner />} />
      
      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
