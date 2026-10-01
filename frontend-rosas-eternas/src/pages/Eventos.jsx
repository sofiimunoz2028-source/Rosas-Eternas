import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Eventos() {
  const { usuario } = useAuth();
  const [eventos, setEventos] = useState([]);
  const [aviso, setAviso] = useState('');

  useEffect(() => {
    api('/eventos').then(setEventos).catch(() => setEventos([]));
  }, []);

  async function inscribir(id) {
    setAviso('');
    try {
      await api(`/eventos/${id}/inscripciones`, { method: 'POST' });
      setAviso('Inscripción lista');
      setEventos(await api('/eventos'));
    } catch (e) {
      setAviso(e.message);
    }
  }

  return (
    <div className="grid gap-4">
      <h1 className="font-display text-4xl text-wine">Eventos y talleres</h1>
      {aviso && <p className="text-sm text-leaf">{aviso}</p>}
      {eventos.map((e) => (
        <article key={e.id_evento} className="rounded-3xl bg-white p-6">
          <p className="text-xs uppercase tracking-wide text-gold">{e.tipo}</p>
          <h2 className="font-display text-2xl text-wine">{e.titulo}</h2>
          <p className="mt-1 text-ink/70">{e.descripcion}</p>
          <p className="mt-2 text-sm">{e.lugar} · {new Date(e.fecha_inicio).toLocaleString('es-CO')}</p>
          <p className="text-sm">
            {e.cupo_maximo == null ? 'Cupos abiertos' : (e.cupos_disponibles > 0 ? `${e.cupos_disponibles} cupos` : 'Cupo lleno')}
          </p>
          {usuario && e.cupos_disponibles !== 0 && (
            <button type="button" onClick={() => inscribir(e.id_evento)} className="mt-3 rounded-full bg-wine px-4 py-2 text-cream">
              Inscribirme
            </button>
          )}
        </article>
      ))}
    </div>
  );
}
