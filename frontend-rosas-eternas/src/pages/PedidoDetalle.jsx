import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, money } from '../api';

export default function PedidoDetalle() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [error, setError] = useState('');
  const [resena, setResena] = useState({ calificacion: 5, comentario: '' });

  function cargar() {
    api(`/pedidos/${id}`).then(setP).catch((e) => setError(e.message));
  }
  useEffect(cargar, [id]);

  async function cancelar() {
    try {
      setP(await api(`/pedidos/${id}/cancelar`, { method: 'POST' }));
    } catch (e) {
      setError(e.message);
    }
  }

  async function enviarResena(idProducto) {
    try {
      await api('/resenas', { method: 'POST', body: { id_producto: idProducto, ...resena } });
      setError('');
      alert('Reseña enviada. Se publicará cuando la aprueben.');
    } catch (e) {
      setError(e.message);
    }
  }

  if (error && !p) return <p className="text-rose">{error}</p>;
  if (!p) return <p>Cargando…</p>;

  const cancelable = ['pendiente', 'confirmado'].includes(p.estado);

  return (
    <div className="grid gap-4">
      <h1 className="font-display text-4xl text-wine">Pedido #{p.id_pedido}</h1>
      <p>Estado: {p.estado} · Total {money(p.total)}</p>
      <p className="text-sm text-ink/70">{p.tipo_entrega} · {p.metodo_pago}</p>
      {error && <p className="text-rose">{error}</p>}
      {p.items.map((item) => (
        <article key={item.id_detalle} className="rounded-3xl bg-white p-5">
          <h2 className="font-display text-xl">{item.producto}</h2>
          <p>{item.cantidad} × {money(item.precio_unitario)}</p>
          <p className="text-sm">{item.opciones}</p>
          {item.dedicatoria && <p className="italic">“{item.dedicatoria}”</p>}
          {p.estado === 'entregado' && (
            <form className="mt-3 grid gap-2" onSubmit={(e) => { e.preventDefault(); enviarResena(item.id_producto); }}>
              <label>Calificación
                <select value={resena.calificacion} onChange={(e) => setResena((r) => ({ ...r, calificacion: Number(e.target.value) }))} className="ml-2 rounded-xl border px-2 py-1">
                  {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>
              <input value={resena.comentario} onChange={(e) => setResena((r) => ({ ...r, comentario: e.target.value }))} placeholder="Comentario" className="rounded-xl border px-3 py-2" />
              <button className="justify-self-start rounded-full bg-wine px-4 py-2 text-cream" type="submit">Enviar reseña</button>
            </form>
          )}
        </article>
      ))}
      {cancelable && (
        <button type="button" onClick={cancelar} className="justify-self-start rounded-full border border-rose px-4 py-2 text-rose">
          Cancelar pedido
        </button>
      )}
    </div>
  );
}
