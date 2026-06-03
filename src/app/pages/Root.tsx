import { Outlet } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { Toaster } from 'sonner';

export default function Root() {
  return (
    <AuthProvider>
      <Outlet />
      {/* Toast Notifications */}
      <Toaster position="top-right" theme="dark" />
    </AuthProvider>
  );
}