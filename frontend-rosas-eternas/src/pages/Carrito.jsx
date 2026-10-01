import { Link } from 'react-router-dom';
import { money } from '../api';
import { useCart } from '../context/CartContext';

export default function Carrito() {
  const { items, total, actualizar, quitar } = useCart();
  if (!items.length) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center">
        <h1 className="font-display text-3xl text-wine">Tu carrito está vacío</h1>
        <Link to="/catalogo" className="mt-4 inline-block text-rose">Ir al catálogo</Link>
      </div>
    );
  }
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div className="grid gap-4">
        <h1 className="font-display text-4xl text-wine">Carrito</h1>
        {items.map((item) => (
          <article key={item.id_linea} className="flex flex-col gap-3 rounded-3xl bg-white p-4 sm:flex-row">
            <img src={item.imagen} alt="" className="h-28 w-28 rounded-2xl object-cover" />
            <div className="flex-1">
              <h2 className="font-display text-xl text-wine">{item.nombre}</h2>
              <p className="text-sm text-ink/70">{item.opciones_nombres?.join(', ')}</p>
              {item.dedicatoria && <p className="text-sm italic">“{item.dedicatoria}”</p>}
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  value={item.cantidad}
                  onChange={(e) => actualizar(item.id_linea, { cantidad: Math.max(1, Number(e.target.value) || 1) })}
                  className="w-20 rounded-xl border border-wine/15 px-2 py-1"
                />
                <span className="font-medium">{money(item.precio_unitario * item.cantidad)}</span>
                <button type="button" className="text-sm text-rose" onClick={() => quitar(item.id_linea)}>Quitar</button>
              </div>
            </div>
          </article>
        ))}
      </div>
      <aside className="h-fit rounded-3xl bg-wine p-6 text-cream">
        <p className="text-sm opacity-80">Total</p>
        <p className="font-display text-3xl">{money(total)}</p>
        <Link to="/checkout" className="mt-4 block rounded-full bg-cream py-3 text-center font-medium text-wine">Confirmar pedido</Link>
      </aside>
    </div>
  );
}
