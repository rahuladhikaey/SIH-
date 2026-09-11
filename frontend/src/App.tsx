import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PatientPortal } from './pages/PatientPortal';
import { DoctorPortal } from './pages/DoctorPortal';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Marketing Homepage */}
          <Route path="/" element={<HomePage />} />

          {/* Public Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Patient Routes */}
          <Route element={<ProtectedRoute allowedRoles={['patient', 'admin']} />}>
            <Route path="/patient" element={<PatientPortal />} />
          </Route>

          {/* Protected Doctor Routes */}
          <Route element={<ProtectedRoute allowedRoles={['doctor', 'admin']} />}>
            <Route path="/doctor" element={<DoctorPortal />} />
          </Route>

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
