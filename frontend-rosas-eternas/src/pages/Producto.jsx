import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, money } from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const wa = import.meta.env.VITE_WHATSAPP || '573000000000';
const labels = {
  color_cinta: 'Color de cinta',
  empaque: 'Empaque',
  tarjeta: 'Tarjeta',
  tamano: 'Tamaño',
  extra: 'Extras',
};

export default function Producto() {
  const { slug } = useParams();
  const { agregar } = useCart();
  const { usuario } = useAuth();
  const [p, setP] = useState(null);
  const [error, setError] = useState('');
  const [sel, setSel] = useState({});
  const [extras, setExtras] = useState([]);
  const [dedicatoria, setDedicatoria] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [aviso, setAviso] = useState('');

  useEffect(() => {
    api(`/productos/${slug}`)
      .then((data) => {
        setP(data);
        const next = {};
        for (const tipo of ['color_cinta', 'empaque', 'tarjeta', 'tamano']) {
          const first = data.opciones.find((o) => o.tipo === tipo);
          if (first) next[tipo] = first.id_opcion;
        }
        setSel(next);
      })
      .catch((e) => setError(e.message));
  }, [slug]);

  const grupos = useMemo(() => {
    const g = {};
    (p?.opciones || []).forEach((o) => {
      g[o.tipo] = g[o.tipo] || [];
      g[o.tipo].push(o);
    });
    return g;
  }, [p]);

  const precio = useMemo(() => {
    if (!p) return 0;
    const ids = [...Object.values(sel), ...extras].map(Number);
    const extra = (p.opciones || [])
      .filter((o) => ids.includes(o.id_opcion))
      .reduce((s, o) => s + Number(o.costo_extra), 0);
    return Number(p.precio_final) + extra;
  }, [p, sel, extras]);

  if (error) return <p className="text-rose">{error}</p>;
  if (!p) return <p>Cargando producto…</p>;

  const idsOpciones = [...Object.values(sel), ...extras].map(Number);
  const nombres = p.opciones.filter((o) => idsOpciones.includes(o.id_opcion)).map((o) => o.nombre);
  const mensajeWa = `Hola, me interesa ${p.nombre} (${money(precio)}). Opciones: ${nombres.join(', ') || 'sin extras'}.`;

  async function compartir() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: p.nombre, text: p.descripcion, url });
    } else {
      await navigator.clipboard.writeText(url);
      setAviso('Enlace copiado');
    }
  }

  async function fav() {
    if (!usuario) {
      setAviso('Inicia sesión para guardar favoritos');
      return;
    }
    await api('/favoritos', { method: 'POST', body: { id_producto: p.id_producto } });
    setAviso('Guardado en favoritos');
  }

  function add() {
    agregar({
      id_producto: p.id_producto,
      nombre: p.nombre,
      slug: p.slug,
      imagen: p.imagen_principal,
      cantidad,
      opciones: idsOpciones,
      opciones_nombres: nombres,
      dedicatoria,
      precio_unitario: precio,
    });
    setAviso('Agregado al carrito');
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="overflow-hidden rounded-[2rem] bg-white">
        <img src={p.imagenes?.[0]?.url || p.imagen_principal} alt={p.nombre} className="w-full object-cover" />
      </div>
      <div>
        <p className="text-sm uppercase tracking-wide text-gold">{p.categoria}</p>
        <h1 className="font-display text-4xl text-wine">{p.nombre}</h1>
        <div className="mt-3 flex items-center gap-3">
          {Number(p.descuento_pct) > 0 && <span className="text-ink/50 line-through">{money(p.precio)}</span>}
          <span className="text-2xl font-semibold text-rose">{money(precio)}</span>
        </div>
        <p className="mt-4 text-ink/80">{p.descripcion}</p>
        <p className="mt-2 text-sm">{p.stock > 0 ? `${p.stock} disponibles` : 'Agotado'}</p>

        {Object.entries(grupos).map(([tipo, ops]) => (
          tipo === 'extra' ? (
            <fieldset key={tipo} className="mt-5">
              <legend className="mb-2 font-medium">{labels[tipo] || tipo}</legend>
              <div className="grid gap-2">
                {ops.map((o) => (
                  <label key={o.id_opcion} className="flex items-center justify-between rounded-2xl bg-white px-3 py-2">
                    <span>
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={extras.includes(o.id_opcion)}
                        onChange={(e) => setExtras((prev) => e.target.checked ? [...prev, o.id_opcion] : prev.filter((id) => id !== o.id_opcion))}
                      />
                      {o.nombre}
                    </span>
                    {Number(o.costo_extra) > 0 && <span className="text-sm text-gold">+{money(o.costo_extra)}</span>}
                  </label>
                ))}
              </div>
            </fieldset>
          ) : (
            <fieldset key={tipo} className="mt-5">
              <legend className="mb-2 font-medium">{labels[tipo] || tipo}</legend>
              <div className="flex flex-wrap gap-2">
                {ops.map((o) => (
                  <button
                    key={o.id_opcion}
                    type="button"
                    onClick={() => setSel((s) => ({ ...s, [tipo]: o.id_opcion }))}
                    className={`rounded-full border px-3 py-2 text-sm ${sel[tipo] === o.id_opcion ? 'border-wine bg-wine text-cream' : 'border-wine/20 bg-white'}`}
                  >
                    {o.valor_hex && <span className="mr-2 inline-block h-3 w-3 rounded-full align-middle" style={{ background: o.valor_hex }} />}
                    {o.nombre}
                    {Number(o.costo_extra) > 0 ? ` +${money(o.costo_extra)}` : ''}
                  </button>
                ))}
              </div>
            </fieldset>
          )
        ))}

        <label className="mt-5 block">
          Dedicatoria ({dedicatoria.length}/255)
          <textarea
            maxLength={255}
            value={dedicatoria}
            onChange={(e) => setDedicatoria(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-wine/15 p-3"
            rows={3}
            placeholder="Escribe un mensaje para la tarjeta"
          />
        </label>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <input type="number" min="1" max={p.stock} value={cantidad} onChange={(e) => setCantidad(Number(e.target.value) || 1)} className="w-20 rounded-2xl border border-wine/15 px-3 py-2" />
          <button type="button" disabled={p.stock < 1} onClick={add} className="rounded-full bg-wine px-5 py-3 text-cream disabled:opacity-50">
            Agregar al carrito
          </button>
          <button type="button" onClick={fav} className="rounded-full border border-wine/20 px-4 py-3">Favorito</button>
          <button type="button" onClick={compartir} className="rounded-full border border-wine/20 px-4 py-3">Compartir</button>
          <a className="rounded-full border border-leaf px-4 py-3 text-leaf" target="_blank" rel="noreferrer" href={`https://wa.me/${wa}?text=${encodeURIComponent(mensajeWa)}`}>
            WhatsApp
          </a>
        </div>
        {aviso && <p className="mt-3 text-sm text-leaf">{aviso}</p>}
        <Link to="/carrito" className="mt-4 inline-block text-sm text-rose">Ir al carrito</Link>

        <section className="mt-10">
          <h2 className="font-display text-2xl text-wine">Reseñas</h2>
          {p.resenas?.length ? p.resenas.map((r, i) => (
            <article key={i} className="mt-3 rounded-2xl bg-white p-4">
              <p className="font-medium">{r.nombre} · {r.calificacion}/5</p>
              <p className="text-sm text-ink/70">{r.comentario}</p>
            </article>
          )) : <p className="mt-2 text-sm text-ink/60">Aún no hay reseñas aprobadas.</p>}
        </section>
      </div>
    </div>
  );
}
