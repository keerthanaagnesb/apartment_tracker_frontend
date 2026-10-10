import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Resident from './pages/Resident';
import Admin from './pages/Admin';
import Technician from './pages/Technician';
import Chat from './pages/Chat';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/resident" element={<Navigate to="/resident/dashboard" replace />} />
      <Route path="/resident/:view" element={<ProtectedRoute role="RESIDENT"><Resident /></ProtectedRoute>} />

      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/:view" element={<ProtectedRoute role="ADMIN"><Admin /></ProtectedRoute>} />

      <Route path="/technician" element={<ProtectedRoute role="TECHNICIAN"><Technician /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
