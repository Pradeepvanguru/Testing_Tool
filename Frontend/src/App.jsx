import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import MainAppPage from '@/pages/MainAppPage';
import AuthPage from '@/pages/AuthPage';
import UserProfilePage from '@/pages/UserProfilePage';
import ProtectedRoute from '@/components/ProtectedRoute';

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="vs-code-theme h-screen flex items-center justify-center text-white text-lg">
        Initializing Application...
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <AuthPage mode="login" />} />
      <Route path="/signup" element={user ? <Navigate to="/" /> : <AuthPage mode="signup" />} />

      <Route path="/" element={<MainAppPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<UserProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
    </AuthProvider>
  );
}

export default App;
