import { Link } from 'react-router-dom';
import { money } from '../api';

export default function ProductCard({ producto }) {
  const enPromo = Number(producto.descuento_pct) > 0;
  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-wine/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link to={`/catalogo/${producto.slug}`} className="block aspect-[4/5] overflow-hidden bg-petal/20">
        <img
          src={producto.imagen_principal || '/favicon.svg'}
          alt={producto.nombre}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs uppercase tracking-wide text-gold">{producto.categoria}</p>
        <h3 className="font-display text-lg text-wine">
          <Link to={`/catalogo/${producto.slug}`}>{producto.nombre}</Link>
        </h3>
        <div className="mt-auto flex items-end justify-between gap-2">
          <div>
            {enPromo && (
              <p className="text-sm text-ink/50 line-through">{money(producto.precio)}</p>
            )}
            <p className="text-lg font-semibold text-rose">{money(producto.precio_final)}</p>
          </div>
          {enPromo && (
            <span className="rounded-full bg-gold/15 px-2 py-1 text-xs font-medium text-gold">
              -{Number(producto.descuento_pct)}%
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
