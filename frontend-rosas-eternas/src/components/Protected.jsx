import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Protected({ children, admin = false }) {
  const { usuario, cargando, esAdmin } = useAuth();
  const location = useLocation();
  if (cargando) return <p className="py-16 text-center text-ink/60">Cargando…</p>;
  if (!usuario) return <Navigate to="/ingresar" replace state={{ from: location.pathname }} />;
  if (admin && !esAdmin) return <Navigate to="/" replace />;
  return children;
}
