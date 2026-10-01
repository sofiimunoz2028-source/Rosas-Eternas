import { useEffect, useState } from 'react';
import { api } from '../api';
import ProductCard from '../components/ProductCard';

export default function Favoritos() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    api('/favoritos').then(setItems).catch(() => setItems([]));
  }, []);
  return (
    <div className="grid gap-6">
      <h1 className="font-display text-4xl text-wine">Favoritos</h1>
      {!items.length && <p>Aún no guardas productos.</p>}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => <ProductCard key={p.id_producto} producto={{ ...p, categoria: 'Favorito' }} />)}
      </div>
    </div>
  );
}
