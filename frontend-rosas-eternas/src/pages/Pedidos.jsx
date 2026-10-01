import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, money } from '../api';

const nombres = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  en_produccion: 'En producción',
  listo: 'Listo',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

export default function Pedidos() {
  const [list, setList] = useState([]);
  useEffect(() => {
    api('/pedidos').then(setList).catch(() => setList([]));
  }, []);
  return (
    <div className="grid gap-4">
      <h1 className="font-display text-4xl text-wine">Mis pedidos</h1>
      <Link to="/cuenta/favoritos" className="text-sm text-rose">Ver favoritos</Link>
      {!list.length && <p>Aún no tienes pedidos.</p>}
      {list.map((p) => (
        <Link key={p.id_pedido} to={`/cuenta/pedidos/${p.id_pedido}`} className="flex items-center justify-between rounded-3xl bg-white p-5">
          <div>
            <p className="font-display text-xl text-wine">Pedido #{p.id_pedido}</p>
            <p className="text-sm text-ink/70">{nombres[p.estado]} · {new Date(p.creado_en).toLocaleDateString('es-CO')}</p>
          </div>
          <p className="font-semibold">{money(p.total)}</p>
        </Link>
      ))}
    </div>
  );
}
