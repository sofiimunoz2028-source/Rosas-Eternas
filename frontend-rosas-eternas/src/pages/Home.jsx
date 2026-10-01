import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import ProductCard from '../components/ProductCard';

const wa = import.meta.env.VITE_WHATSAPP || '573000000000';

export default function Home() {
  const [destacados, setDestacados] = useState([]);
  const [promos, setPromos] = useState([]);

  useEffect(() => {
    api('/productos?destacados=1').then((d) => setDestacados(d.items || [])).catch(() => {});
    api('/promociones').then(setPromos).catch(() => {});
  }, []);

  return (
    <div className="grid gap-12">
      <section className="grid items-center gap-8 overflow-hidden rounded-[2rem] bg-wine px-6 py-12 text-cream md:grid-cols-2 md:px-12">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-gold">Cinta fantasía</p>
          <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl lg:text-6xl">
            Rosas que duran más que el instante
          </h1>
          <p className="mt-4 max-w-md text-cream/80">
            Ramos, cajas y detalles personalizados hechos a mano. Elige color, empaque y dedicatoria.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/catalogo" className="rounded-full bg-cream px-5 py-3 font-medium text-wine">Ver catálogo</Link>
            <a
              href={`https://wa.me/${wa}?text=${encodeURIComponent('Hola, quiero un detalle de Rosas Eternas')}`}
              className="rounded-full border border-cream/40 px-5 py-3"
              target="_blank"
              rel="noreferrer"
            >
              Pedir por WhatsApp
            </a>
          </div>
        </div>
        <img src="/img/productos/ramo-12.svg" alt="Ramo eterno de cinta" className="mx-auto w-full max-w-md" />
      </section>

      {promos[0] && (
        <section className="rounded-3xl border border-gold/30 bg-gold/10 p-6 md:p-8">
          <p className="text-sm uppercase tracking-wide text-gold">{promos[0].nombre}</p>
          <h2 className="font-display text-3xl text-wine">{promos[0].porcentaje_descuento}% de descuento</h2>
          <p className="mt-2 text-ink/70">{promos[0].descripcion}</p>
          <Link to="/promociones" className="mt-4 inline-block text-sm font-semibold text-rose">Ver promociones</Link>
        </section>
      )}

      <section>
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-display text-3xl text-wine">Destacados</h2>
          <Link to="/catalogo" className="text-sm text-rose">Ver todo</Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {destacados.map((p) => <ProductCard key={p.id_producto} producto={p} />)}
        </div>
      </section>
    </div>
  );
}
