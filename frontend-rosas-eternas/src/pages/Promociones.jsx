import { useEffect, useState } from 'react';
import { api } from '../api';
import ProductCard from '../components/ProductCard';

export default function Promociones() {
  const [promos, setPromos] = useState([]);
  useEffect(() => {
    api('/promociones').then(setPromos).catch(() => setPromos([]));
  }, []);
  return (
    <div className="grid gap-8">
      <h1 className="font-display text-4xl text-wine">Promociones</h1>
      {promos.length === 0 && <p>No hay promociones vigentes en este momento.</p>}
      {promos.map((pr) => (
        <section key={pr.id_promocion} className="grid gap-4">
          <div className="rounded-3xl bg-gold/10 p-6">
            <h2 className="font-display text-3xl text-wine">{pr.nombre} · {pr.porcentaje_descuento}%</h2>
            <p className="text-ink/70">{pr.descripcion}</p>
            <p className="mt-1 text-sm">Hasta el {new Date(pr.fecha_fin).toLocaleDateString('es-CO')}</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pr.productos.map((p) => <ProductCard key={p.id_producto} producto={{ ...p, categoria: 'Promoción' }} />)}
          </div>
        </section>
      ))}
    </div>
  );
}
