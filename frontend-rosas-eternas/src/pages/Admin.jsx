import { useEffect, useState } from 'react';
import { api, money } from '../api';

const tabs = ['Resumen', 'Pedidos', 'Productos', 'Categorías', 'Opciones', 'Promociones', 'Eventos', 'Reseñas', 'Mensajes'];

export default function Admin() {
  const [tab, setTab] = useState('Resumen');
  return (
    <div className="grid gap-6">
      <h1 className="font-display text-4xl text-wine">Administración</h1>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} className={`whitespace-nowrap rounded-full px-4 py-2 ${tab === t ? 'bg-wine text-cream' : 'bg-white'}`}>
            {t}
          </button>
        ))}
      </div>
      {tab === 'Resumen' && <Resumen />}
      {tab === 'Pedidos' && <PedidosAdmin />}
      {tab === 'Productos' && <ProductosAdmin />}
      {tab === 'Categorías' && <CategoriasAdmin />}
      {tab === 'Opciones' && <OpcionesAdmin />}
      {tab === 'Promociones' && <PromosAdmin />}
      {tab === 'Eventos' && <EventosAdmin />}
      {tab === 'Reseñas' && <ResenasAdmin />}
      {tab === 'Mensajes' && <MensajesAdmin />}
    </div>
  );
}

function Resumen() {
  const [d, setD] = useState(null);
  useEffect(() => { api('/admin/reportes').then(setD).catch(() => {}); }, []);
  if (!d) return <p>Cargando…</p>;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <article className="rounded-3xl bg-white p-5">
        <h2 className="font-display text-2xl text-wine">Pendientes</h2>
        <p>Reseñas: {d.reseñas_pendientes}</p>
        <p>Mensajes: {d.mensajes_pendientes}</p>
      </article>
      <article className="rounded-3xl bg-white p-5">
        <h2 className="font-display text-2xl text-wine">Stock bajo</h2>
        {d.stock_bajo.map((p) => <p key={p.id_producto}>{p.nombre}: {p.stock}</p>)}
        {!d.stock_bajo.length && <p>Todo en orden</p>}
      </article>
      <article className="rounded-3xl bg-white p-5 md:col-span-2">
        <h2 className="font-display text-2xl text-wine">Más vendidos</h2>
        {d.mas_vendidos.map((p) => <p key={p.id_producto}>{p.nombre} · {p.unidades} und · {money(p.ingresos)}</p>)}
      </article>
    </div>
  );
}

function PedidosAdmin() {
  const [estado, setEstado] = useState('');
  const [rows, setRows] = useState([]);
  function load() {
    api(`/admin/pedidos${estado ? `?estado=${estado}` : ''}`).then(setRows).catch(() => setRows([]));
  }
  useEffect(load, [estado]);
  async function cambiar(id, nuevo) {
    await api(`/admin/pedidos/${id}`, { method: 'PATCH', body: { estado: nuevo } });
    load();
  }
  return (
    <div className="grid gap-3">
      <select value={estado} onChange={(e) => setEstado(e.target.value)} className="max-w-xs rounded-2xl border px-3 py-2">
        <option value="">Todos</option>
        {['pendiente', 'confirmado', 'en_produccion', 'listo', 'entregado', 'cancelado'].map((s) => <option key={s}>{s}</option>)}
      </select>
      {rows.map((p) => (
        <article key={p.id_pedido} className="flex flex-col gap-2 rounded-3xl bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-xl">#{p.id_pedido} · {p.cliente}</p>
            <p className="text-sm">{p.estado} · {money(p.total)}</p>
          </div>
          <select defaultValue={p.estado} onChange={(e) => cambiar(p.id_pedido, e.target.value)} className="rounded-xl border px-2 py-1">
            {['pendiente', 'confirmado', 'en_produccion', 'listo', 'entregado', 'cancelado'].map((s) => <option key={s}>{s}</option>)}
          </select>
        </article>
      ))}
    </div>
  );
}

function ProductosAdmin() {
  const [rows, setRows] = useState([]);
  const [cats, setCats] = useState([]);
  const [form, setForm] = useState({
    nombre: '', id_categoria: '', precio: '', stock: 0, descripcion: '', imagen_url: '/img/productos/ramo-12.svg', destacado: false, activo: true,
  });
  function load() {
    api('/admin/productos').then(setRows);
    api('/admin/categorias').then(setCats);
  }
  useEffect(load, []);
  async function crear(e) {
    e.preventDefault();
    await api('/admin/productos', { method: 'POST', body: { ...form, precio: Number(form.precio), stock: Number(form.stock), es_personalizable: true } });
    setForm((f) => ({ ...f, nombre: '', precio: '', descripcion: '' }));
    load();
  }
  async function toggle(p) {
    await api(`/admin/productos/${p.id_producto}`, { method: 'PATCH', body: { activo: !p.activo } });
    load();
  }
  return (
    <div className="grid gap-6">
      <form onSubmit={crear} className="grid gap-2 rounded-3xl bg-white p-4 md:grid-cols-2">
        <input required placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="rounded-xl border px-3 py-2" />
        <select required value={form.id_categoria} onChange={(e) => setForm({ ...form, id_categoria: Number(e.target.value) })} className="rounded-xl border px-3 py-2">
          <option value="">Categoría</option>
          {cats.map((c) => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
        </select>
        <input required type="number" placeholder="Precio" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} className="rounded-xl border px-3 py-2" />
        <input type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="rounded-xl border px-3 py-2" />
        <input placeholder="URL imagen" value={form.imagen_url} onChange={(e) => setForm({ ...form, imagen_url: e.target.value })} className="rounded-xl border px-3 py-2 md:col-span-2" />
        <textarea placeholder="Descripción" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className="rounded-xl border p-3 md:col-span-2" />
        <button className="rounded-full bg-wine py-2 text-cream md:col-span-2">Crear producto</button>
      </form>
      {rows.map((p) => (
        <article key={p.id_producto} className="flex items-center justify-between rounded-3xl bg-white p-4">
          <div>
            <p className="font-medium">{p.nombre}</p>
            <p className="text-sm">{money(p.precio)} · stock {p.stock} · {p.activo ? 'activo' : 'oculto'}</p>
          </div>
          <button type="button" onClick={() => toggle(p)} className="text-sm text-rose">{p.activo ? 'Desactivar' : 'Activar'}</button>
        </article>
      ))}
    </div>
  );
}

function CategoriasAdmin() {
  const [rows, setRows] = useState([]);
  const [nombre, setNombre] = useState('');
  function load() { api('/admin/categorias').then(setRows); }
  useEffect(load, []);
  async function crear(e) {
    e.preventDefault();
    await api('/admin/categorias', { method: 'POST', body: { nombre } });
    setNombre('');
    load();
  }
  return (
    <div className="grid gap-3">
      <form onSubmit={crear} className="flex gap-2">
        <input required value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nueva categoría" className="flex-1 rounded-2xl border px-3 py-2" />
        <button className="rounded-full bg-wine px-4 text-cream">Agregar</button>
      </form>
      {rows.map((c) => <p key={c.id_categoria} className="rounded-2xl bg-white p-3">{c.nombre}</p>)}
    </div>
  );
}

function OpcionesAdmin() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ tipo: 'color_cinta', nombre: '', valor_hex: '#C0182E', costo_extra: 0 });
  function load() { api('/admin/opciones').then(setRows); }
  useEffect(load, []);
  async function crear(e) {
    e.preventDefault();
    await api('/admin/opciones', { method: 'POST', body: form });
    load();
  }
  return (
    <div className="grid gap-3">
      <form onSubmit={crear} className="grid gap-2 rounded-3xl bg-white p-4 md:grid-cols-4">
        <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className="rounded-xl border px-2 py-2">
          {['color_cinta', 'empaque', 'tarjeta', 'tamano', 'extra'].map((t) => <option key={t}>{t}</option>)}
        </select>
        <input required placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="rounded-xl border px-3 py-2" />
        <input placeholder="#hex" value={form.valor_hex} onChange={(e) => setForm({ ...form, valor_hex: e.target.value })} className="rounded-xl border px-3 py-2" />
        <input type="number" value={form.costo_extra} onChange={(e) => setForm({ ...form, costo_extra: Number(e.target.value) })} className="rounded-xl border px-3 py-2" />
        <button className="rounded-full bg-wine py-2 text-cream md:col-span-4">Guardar opción</button>
      </form>
      {rows.map((o) => <p key={o.id_opcion} className="rounded-2xl bg-white p-3">{o.tipo} · {o.nombre} · +{money(o.costo_extra)}</p>)}
    </div>
  );
}

function PromosAdmin() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({
    nombre: '', descripcion: '', porcentaje_descuento: 10, fecha_inicio: '', fecha_fin: '', productos: [],
  });
  function load() { api('/admin/promociones').then(setRows); }
  useEffect(load, []);
  async function crear(e) {
    e.preventDefault();
    await api('/admin/promociones', { method: 'POST', body: form });
    load();
  }
  return (
    <div className="grid gap-3">
      <form onSubmit={crear} className="grid gap-2 rounded-3xl bg-white p-4">
        <input required placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="rounded-xl border px-3 py-2" />
        <input type="number" required value={form.porcentaje_descuento} onChange={(e) => setForm({ ...form, porcentaje_descuento: Number(e.target.value) })} className="rounded-xl border px-3 py-2" />
        <input type="date" required value={form.fecha_inicio} onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })} className="rounded-xl border px-3 py-2" />
        <input type="date" required value={form.fecha_fin} onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })} className="rounded-xl border px-3 py-2" />
        <button className="rounded-full bg-wine py-2 text-cream">Crear promoción</button>
      </form>
      {rows.map((p) => <p key={p.id_promocion} className="rounded-2xl bg-white p-3">{p.nombre} {p.porcentaje_descuento}%</p>)}
    </div>
  );
}

function EventosAdmin() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({
    titulo: '', tipo: 'taller', lugar: '', fecha_inicio: '', cupo_maximo: 20, descripcion: '',
  });
  function load() { api('/admin/eventos').then(setRows); }
  useEffect(load, []);
  async function crear(e) {
    e.preventDefault();
    await api('/admin/eventos', { method: 'POST', body: form });
    load();
  }
  return (
    <div className="grid gap-3">
      <form onSubmit={crear} className="grid gap-2 rounded-3xl bg-white p-4">
        <input required placeholder="Título" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} className="rounded-xl border px-3 py-2" />
        <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className="rounded-xl border px-3 py-2">
          {['feria', 'taller', 'bazar', 'comunitario'].map((t) => <option key={t}>{t}</option>)}
        </select>
        <input placeholder="Lugar" value={form.lugar} onChange={(e) => setForm({ ...form, lugar: e.target.value })} className="rounded-xl border px-3 py-2" />
        <input required type="datetime-local" value={form.fecha_inicio} onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })} className="rounded-xl border px-3 py-2" />
        <button className="rounded-full bg-wine py-2 text-cream">Publicar evento</button>
      </form>
      {rows.map((e) => <p key={e.id_evento} className="rounded-2xl bg-white p-3">{e.titulo} · {e.tipo}</p>)}
    </div>
  );
}

function ResenasAdmin() {
  const [rows, setRows] = useState([]);
  function load() { api('/admin/resenas').then(setRows); }
  useEffect(load, []);
  async function aprobar(id, aprobada) {
    await api(`/admin/resenas/${id}`, { method: 'PATCH', body: { aprobada } });
    load();
  }
  return (
    <div className="grid gap-3">
      {rows.map((r) => (
        <article key={r.id_resena} className="rounded-3xl bg-white p-4">
          <p>{r.producto} · {r.cliente} · {r.calificacion}/5 {r.aprobada ? '(visible)' : '(pendiente)'}</p>
          <p className="text-sm">{r.comentario}</p>
          <button type="button" className="mt-2 text-sm text-leaf" onClick={() => aprobar(r.id_resena, !r.aprobada)}>
            {r.aprobada ? 'Ocultar' : 'Aprobar'}
          </button>
        </article>
      ))}
    </div>
  );
}

function MensajesAdmin() {
  const [rows, setRows] = useState([]);
  function load() { api('/admin/mensajes').then(setRows); }
  useEffect(load, []);
  async function atender(id) {
    await api(`/admin/mensajes/${id}`, { method: 'PATCH' });
    load();
  }
  return (
    <div className="grid gap-3">
      {rows.map((m) => (
        <article key={m.id_mensaje} className="rounded-3xl bg-white p-4">
          <p className="font-medium">{m.nombre} · {m.email} {m.atendido ? '✓' : ''}</p>
          <p className="text-sm">{m.asunto}</p>
          <p>{m.mensaje}</p>
          {!m.atendido && <button type="button" className="mt-2 text-sm text-leaf" onClick={() => atender(m.id_mensaje)}>Marcar atendido</button>}
        </article>
      ))}
    </div>
  );
}
