import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Registro() {
  const { registro } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: '', apellido: '', email: '', password: '', telefono: '', acepta_privacidad: false,
  });
  const [error, setError] = useState('');

  function set(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function enviar(e) {
    e.preventDefault();
    setError('');
    try {
      await registro(form);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={enviar} className="mx-auto grid max-w-md gap-4 rounded-3xl bg-white p-8">
      <h1 className="font-display text-3xl text-wine">Crear cuenta</h1>
      <input required placeholder="Nombre" value={form.nombre} onChange={(e) => set('nombre', e.target.value)} className="rounded-2xl border border-wine/15 px-3 py-2" />
      <input placeholder="Apellido" value={form.apellido} onChange={(e) => set('apellido', e.target.value)} className="rounded-2xl border border-wine/15 px-3 py-2" />
      <input type="email" required placeholder="Correo" value={form.email} onChange={(e) => set('email', e.target.value)} className="rounded-2xl border border-wine/15 px-3 py-2" />
      <input type="tel" placeholder="Teléfono" value={form.telefono} onChange={(e) => set('telefono', e.target.value)} className="rounded-2xl border border-wine/15 px-3 py-2" />
      <input type="password" required minLength={8} placeholder="Contraseña (mínimo 8)" value={form.password} onChange={(e) => set('password', e.target.value)} className="rounded-2xl border border-wine/15 px-3 py-2" />
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" checked={form.acepta_privacidad} onChange={(e) => set('acepta_privacidad', e.target.checked)} />
        Acepto el aviso de privacidad: mis datos se usan para atender pedidos y mensajes.
      </label>
      {error && <p className="text-rose">{error}</p>}
      <button className="rounded-full bg-wine py-3 text-cream" type="submit">Registrarme</button>
      <p className="text-sm">¿Ya tienes cuenta? <Link className="text-rose" to="/ingresar">Ingresa</Link></p>
    </form>
  );
}
