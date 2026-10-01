import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const KEY = 're_carrito';
const CartContext = createContext(null);

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(load);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo(() => {
    const total = items.reduce((sum, item) => sum + item.precio_unitario * item.cantidad, 0);
    const cantidad = items.reduce((sum, item) => sum + item.cantidad, 0);
    return {
      items,
      total,
      cantidad,
      agregar(item) {
        setItems((prev) => {
          const key = JSON.stringify({
            id: item.id_producto,
            ops: [...(item.opciones || [])].sort(),
            ded: item.dedicatoria || '',
          });
          const idx = prev.findIndex((p) => JSON.stringify({
            id: p.id_producto,
            ops: [...(p.opciones || [])].sort(),
            ded: p.dedicatoria || '',
          }) === key);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = { ...next[idx], cantidad: next[idx].cantidad + item.cantidad };
            return next;
          }
          return [...prev, { ...item, id_linea: crypto.randomUUID() }];
        });
      },
      actualizar(idLinea, patch) {
        setItems((prev) => prev.map((p) => (p.id_linea === idLinea ? { ...p, ...patch } : p)));
      },
      quitar(idLinea) {
        setItems((prev) => prev.filter((p) => p.id_linea !== idLinea));
      },
      vaciar() {
        setItems([]);
      },
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
