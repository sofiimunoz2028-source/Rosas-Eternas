import { useEffect, useState } from 'react';
import { api } from '../api';
import ProductCard from '../components/ProductCard';

export default function Catalogo() {
  const [categorias, setCategorias] = useState([]);
  const [data, setData] = useState({ items: [], page: 1, pages: 1, total: 0 });
  const [filtros, setFiltros] = useState({ q: '', categoria: '', min: '', max: '', page: 1 });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api('/categorias').then(setCategorias).catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filtros.q) params.set('q', filtros.q);
    if (filtros.categoria) params.set('categoria', filtros.categoria);
    if (filtros.min) params.set('min', filtros.min);
    if (filtros.max) params.set('max', filtros.max);
    params.set('page', String(filtros.page));
    setCargando(true);
    api(`/productos?${params}`)
      .then((d) => {
        setData(d);
        setError('');
      })
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, [filtros]);

  function setField(name, value) {
    setFiltros((f) => ({ ...f, [name]: value, page: name === 'page' ? value : 1 }));
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-display text-4xl text-wine">Catálogo</h1>
        <p className="mt-1 text-ink/70">Busca por nombre y filtra por categoría o precio.</p>
      </div>
      <form className="grid gap-3 rounded-3xl bg-white p-4 shadow-sm md:grid-cols-5" onSubmit={(e) => e.preventDefault()}>
        <input
          className="rounded-2xl border border-wine/15 px-3 py-2 md:col-span-2"
          placeholder="Buscar ramo, caja, rosa…"
          value={filtros.q}
          onChange={(e) => setField('q', e.target.value)}
        />
        <select className="rounded-2xl border border-wine/15 px-3 py-2" value={filtros.categoria} onChange={(e) => setField('categoria', e.target.value)}>
          <option value="">Todas las categorías</option>
          {categorias.map((c) => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
        </select>
        <input className="rounded-2xl border border-wine/15 px-3 py-2" type="number" min="0" placeholder="Precio mín." value={filtros.min} onChange={(e) => setField('min', e.target.value)} />
        <input className="rounded-2xl border border-wine/15 px-3 py-2" type="number" min="0" placeholder="Precio máx." value={filtros.max} onChange={(e) => setField('max', e.target.value)} />
        <button type="button" className="rounded-2xl border border-wine/20 px-3 py-2 text-sm md:col-span-5" onClick={() => setFiltros({ q: '', categoria: '', min: '', max: '', page: 1 })}>
          Limpiar filtros
        </button>
      </form>
      {cargando && <p>Cargando catálogo…</p>}
      {error && <p className="text-rose">{error}</p>}
      {!cargando && data.items.length === 0 && (
        <p className="rounded-3xl bg-white p-8 text-center text-ink/70">
          No hay resultados. Prueba a quitar filtros o buscar con otras palabras.
        </p>
      )}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {data.items.map((p) => <ProductCard key={p.id_producto} producto={p} />)}
      </div>
      {data.pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: data.pages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setField('page', n)}
              className={`h-10 w-10 rounded-full ${n === data.page ? 'bg-wine text-cream' : 'bg-white'}`}
            >
              {n}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
