# Rosas Eternas

Tienda de flores hechas a mano con limpiapipas. El catálogo muestra fotos y precios, cada arreglo se puede personalizar y el pedido se envía por WhatsApp al +57 321 547 1953.

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
- Número de WhatsApp: `WHATSAPP_PHONE` en `src/lib/order.ts`
- Fotos: `public/flores/`

El pedido no se cobra en la página. El botón abre WhatsApp con el detalle, el total y los datos de entrega. El pago (efectivo, transferencia o contraentrega) y el domicilio se confirman en el chat.
