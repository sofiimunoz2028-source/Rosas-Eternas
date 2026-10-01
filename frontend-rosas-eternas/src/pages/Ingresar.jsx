import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Ingresar() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function enviar(e) {
    e.preventDefault();
    setError('');
    try {
      const user = await login(email, password);
      const dest = location.state?.from || (user.rol === 'administrador' ? '/admin' : '/');
      navigate(dest);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={enviar} className="mx-auto grid max-w-md gap-4 rounded-3xl bg-white p-8">
      <h1 className="font-display text-3xl text-wine">Ingresar</h1>
      <input type="email" required placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-2xl border border-wine/15 px-3 py-2" />
      <input type="password" required placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-2xl border border-wine/15 px-3 py-2" />
      {error && <p className="text-rose">{error}</p>}
      <button className="rounded-full bg-wine py-3 text-cream" type="submit">Entrar</button>
      <p className="text-sm">¿No tienes cuenta? <Link className="text-rose" to="/registro">Regístrate</Link></p>
    </form>
  );
}
