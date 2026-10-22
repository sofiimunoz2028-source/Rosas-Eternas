# Rosas Eternas

Tienda de flores hechas a mano con limpiapipas. El catálogo muestra fotos y precios, cada arreglo se puede personalizar y el pedido pide el celular de quien compra. El aviso llega al +57 321 547 1953.

## Cómo correrlo

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

```bash
npm test
npm run lint
npm run build
```

## Qué se puede cambiar

- Precios, flores y textos del catálogo: `src/lib/catalog.ts`
- Número que recibe los pedidos: `SHOP_PHONE` en `src/lib/order.ts`
- Fotos: `public/flores/`

El pedido no se cobra en la página. Quien compra deja su celular y el botón abre WhatsApp con el detalle, el total y ese número, dirigido al +57 321 547 1953. Solo falta pulsar enviar. El pago (efectivo, transferencia o contraentrega) y el domicilio se confirman en ese chat.
