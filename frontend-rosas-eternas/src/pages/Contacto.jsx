import { useState } from 'react';
import { api } from '../api';

export default function Contacto() {
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', asunto: '', mensaje: '' });
  const [ok, setOk] = useState('');
  const [error, setError] = useState('');

  async function enviar(e) {
    e.preventDefault();
    setError('');
    setOk('');
    try {
      const data = await api('/contacto', { method: 'POST', body: form });
      setOk(data.mensaje);
      setForm({ nombre: '', email: '', telefono: '', asunto: '', mensaje: '' });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={enviar} className="mx-auto grid max-w-xl gap-4 rounded-3xl bg-white p-8">
      <h1 className="font-display text-4xl text-wine">Contacto</h1>
      <p className="text-ink/70">Cuéntanos tu idea o pide una cotización especial.</p>
      <input required placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="rounded-2xl border border-wine/15 px-3 py-2" />
      <input type="email" required placeholder="Correo" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-2xl border border-wine/15 px-3 py-2" />
      <input placeholder="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="rounded-2xl border border-wine/15 px-3 py-2" />
      <input placeholder="Asunto" value={form.asunto} onChange={(e) => setForm({ ...form, asunto: e.target.value })} className="rounded-2xl border border-wine/15 px-3 py-2" />
      <textarea required placeholder="Mensaje" value={form.mensaje} onChange={(e) => setForm({ ...form, mensaje: e.target.value })} className="rounded-2xl border border-wine/15 p-3" rows={5} />
      {ok && <p className="text-leaf">{ok}</p>}
      {error && <p className="text-rose">{error}</p>}
      <button className="rounded-full bg-wine py-3 text-cream" type="submit">Enviar</button>
    </form>
  );
}
