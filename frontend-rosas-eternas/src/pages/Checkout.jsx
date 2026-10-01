import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, money } from '../api';
import { useCart } from '../context/CartContext';

export default function Checkout() {
  const { items, total, vaciar } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    tipo_entrega: 'recogida',
    direccion_entrega: '',
    fecha_entrega_deseada: '',
    metodo_pago: 'transferencia',
    notas: '',
  });
  const [error, setError] = useState('');
  const [ok, setOk] = useState(null);

  function set(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function enviar(e) {
    e.preventDefault();
    setError('');
    try {
      const pedido = await api('/pedidos', {
        method: 'POST',
        body: {
          ...form,
          items: items.map((i) => ({
            id_producto: i.id_producto,
            cantidad: i.cantidad,
            opciones: i.opciones,
            dedicatoria: i.dedicatoria,
          })),
        },
      });
      vaciar();
      setOk(pedido);
    } catch (err) {
      setError(err.message);
    }
  }

  if (!items.length && !ok) {
    return <p>No hay productos para confirmar.</p>;
  }

  if (ok) {
    return (
      <div className="rounded-3xl bg-white p-8">
        <h1 className="font-display text-4xl text-wine">Pedido #{ok.id_pedido} registrado</h1>
        <p className="mt-3">Estado: pendiente. Coordinaremos el pago por {ok.metodo_pago}.</p>
        <p className="mt-1 font-semibold">Total {money(ok.total)}</p>
        <button type="button" className="mt-6 rounded-full bg-wine px-5 py-3 text-cream" onClick={() => navigate('/cuenta/pedidos')}>
          Ver mis pedidos
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div className="grid gap-4 rounded-3xl bg-white p-6">
        <h1 className="font-display text-4xl text-wine">Confirmar pedido</h1>
        <label className="grid gap-1">
          Entrega
          <select value={form.tipo_entrega} onChange={(e) => set('tipo_entrega', e.target.value)} className="rounded-2xl border border-wine/15 px-3 py-2">
            <option value="recogida">Recogida</option>
            <option value="domicilio">Domicilio</option>
          </select>
        </label>
        {form.tipo_entrega === 'domicilio' && (
          <label className="grid gap-1">
            Dirección
            <input required value={form.direccion_entrega} onChange={(e) => set('direccion_entrega', e.target.value)} className="rounded-2xl border border-wine/15 px-3 py-2" />
          </label>
        )}
        <label className="grid gap-1">
          Fecha deseada
          <input type="date" value={form.fecha_entrega_deseada} onChange={(e) => set('fecha_entrega_deseada', e.target.value)} className="rounded-2xl border border-wine/15 px-3 py-2" />
        </label>
        <label className="grid gap-1">
          Pago
          <select value={form.metodo_pago} onChange={(e) => set('metodo_pago', e.target.value)} className="rounded-2xl border border-wine/15 px-3 py-2">
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
            <option value="contraentrega">Contraentrega</option>
          </select>
        </label>
        <label className="grid gap-1">
          Notas
          <textarea value={form.notas} onChange={(e) => set('notas', e.target.value)} className="rounded-2xl border border-wine/15 p-3" rows={3} />
        </label>
        {error && <p className="text-rose">{error}</p>}
      </div>
      <aside className="h-fit rounded-3xl bg-wine p-6 text-cream">
        <p>{items.length} producto(s)</p>
        <p className="font-display text-3xl">{money(total)}</p>
        <button type="submit" className="mt-4 w-full rounded-full bg-cream py-3 font-medium text-wine">Registrar pedido</button>
      </aside>
    </form>
  );
}
