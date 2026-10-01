import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import OfflineBanner from './OfflineBanner';
import PWABadge from '../PWABadge.jsx';

const links = [
  { to: '/', label: 'Inicio' },
  { to: '/catalogo', label: 'Catálogo' },
  { to: '/promociones', label: 'Promociones' },
  { to: '/eventos', label: 'Eventos' },
  { to: '/contacto', label: 'Contacto' },
];

export default function Layout() {
  const { usuario, logout, esAdmin } = useAuth();
  const { cantidad } = useCart();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  function salir() {
    logout();
    setOpen(false);
    navigate('/');
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream text-ink">
      <OfflineBanner />
      <header className="sticky top-0 z-40 border-b border-wine/10 bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <img src="/favicon.svg" alt="" className="h-10 w-10" />
            <span className="font-display text-xl text-wine sm:text-2xl">Rosas Eternas</span>
          </Link>
          <nav className="hidden items-center gap-6 lg:flex">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  `text-sm ${isActive ? 'font-semibold text-wine' : 'text-ink/70 hover:text-wine'}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/carrito" className="relative rounded-full px-3 py-2 text-sm hover:bg-wine/5">
              Carrito
              {cantidad > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-rose px-1 text-[11px] text-white">
                  {cantidad}
                </span>
              )}
            </Link>
            {usuario ? (
              <div className="hidden items-center gap-2 sm:flex">
                {esAdmin && (
                  <Link to="/admin" className="rounded-full bg-wine px-3 py-1.5 text-sm text-cream">Admin</Link>
                )}
                <Link to="/cuenta/pedidos" className="text-sm text-wine">{usuario.nombre}</Link>
                <button type="button" onClick={salir} className="text-sm text-ink/60">Salir</button>
              </div>
            ) : (
              <Link to="/ingresar" className="hidden rounded-full bg-wine px-4 py-2 text-sm text-cream sm:inline-flex">
                Ingresar
              </Link>
            )}
            <button
              type="button"
              className="rounded-full border border-wine/20 px-3 py-2 text-sm lg:hidden"
              aria-expanded={open}
              aria-controls="menu-movil"
              onClick={() => setOpen((v) => !v)}
            >
              Menú
            </button>
          </div>
        </div>
        {open && (
          <nav id="menu-movil" className="grid gap-1 border-t border-wine/10 px-4 py-3 lg:hidden">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className="rounded-xl px-3 py-2 hover:bg-wine/5">
                {l.label}
              </NavLink>
            ))}
            {usuario ? (
              <>
                <Link to="/cuenta/pedidos" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2">Mis pedidos</Link>
                <Link to="/cuenta/favoritos" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2">Favoritos</Link>
                {esAdmin && <Link to="/admin" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2">Administración</Link>}
                <button type="button" onClick={salir} className="rounded-xl px-3 py-2 text-left">Cerrar sesión</button>
              </>
            ) : (
              <>
                <Link to="/ingresar" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2">Ingresar</Link>
                <Link to="/registro" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2">Crear cuenta</Link>
              </>
            )}
          </nav>
        )}
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-10">
        <Outlet />
      </main>
      <footer className="mt-8 border-t border-wine/10 bg-wine text-cream">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-3">
          <div>
            <p className="font-display text-2xl">Rosas Eternas</p>
            <p className="mt-2 text-sm text-cream/80">Detalles de cinta fantasía que no se marchitan.</p>
          </div>
          <div className="text-sm">
            <p className="font-semibold">Explorar</p>
            <div className="mt-2 grid gap-1 text-cream/80">
              <Link to="/catalogo">Catálogo</Link>
              <Link to="/eventos">Talleres y ferias</Link>
              <Link to="/contacto">Hablar con nosotras</Link>
            </div>
          </div>
          <p className="text-sm text-cream/70">
            Los pagos se coordinan por efectivo, transferencia o contraentrega. Tus datos se usan solo para atender pedidos.
          </p>
        </div>
      </footer>
      <PWABadge />
    </div>
  );
}
