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
- Clave para enviar el aviso: variable `CALLMEBOT_APIKEY`
- Fotos: `public/flores/`

El pedido no se cobra en la página y no abre WhatsApp. Quien compra deja su celular; el aviso, con el detalle y el total, se envía al número de la tienda. El pago (efectivo, transferencia o contraentrega) y el domicilio se confirman a ese celular.

Para que el aviso llegue, el +57 321 547 1953 tiene que autorizar el envío una vez: agregar el contacto de CallMeBot, enviar `I allow callmebot to send me messages` y guardar la apikey en `CALLMEBOT_APIKEY`.
