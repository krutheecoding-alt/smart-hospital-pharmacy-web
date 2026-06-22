import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingOverlay } from './LoadingOverlay';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth();
  if (loading) return <LoadingOverlay show />;
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
