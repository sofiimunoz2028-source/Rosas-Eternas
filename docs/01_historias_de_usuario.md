# Rosas Eternas: Historias de usuario

PWA para promocionar y vender regalos duraderos hechos con cinta fantasía (rosas eternas, ramos, cajas y detalles personalizados).

## Actores

| Actor | Descripción |
|---|---|
| **Visitante** | Persona que navega la PWA sin iniciar sesión. |
| **Cliente** | Usuario registrado que personaliza y pide productos. |
| **Administrador** | Dueño o equipo del proyecto que gestiona catálogo, pedidos y eventos. |

## Prioridad (MoSCoW)

**Must** = indispensable para el MVP · **Should** = importante · **Could** = deseable

---

## Épica 1. Catálogo y promoción

**HU-01 · Ver catálogo** (Must)
Como **visitante** quiero ver los productos con foto, nombre y precio para conocer lo que ofrece Rosas Eternas.
- Se listan solo productos activos, con su imagen principal.
- El catálogo carga paginado (12 productos por página).
- Si un producto tiene promoción vigente, se muestra el precio original tachado y el precio final.

**HU-02 · Buscar y filtrar** (Must)
Como **visitante** quiero buscar por nombre y filtrar por categoría y rango de precio para encontrar rápido un regalo.
- La búsqueda responde por nombre y descripción.
- Los filtros se pueden combinar y limpiar con un solo botón.
- Si no hay resultados, la app lo dice y sugiere quitar filtros.

**HU-03 · Ver detalle de producto** (Must)
Como **visitante** quiero ver la descripción, la galería de fotos, las opciones disponibles y las reseñas de un producto para decidir mi compra.
- El detalle muestra galería, precio, disponibilidad y calificación promedio.
- Se listan las opciones de personalización disponibles para ese producto.
- Cada producto tiene una URL propia que se puede compartir.

**HU-04 · Ver promociones** (Should)
Como **visitante** quiero ver una sección de promociones vigentes para aprovechar descuentos.
- Solo aparecen promociones activas dentro de su rango de fechas.
- Cada promoción muestra su porcentaje y los productos incluidos.

**HU-05 · Compartir producto** (Could)
Como **visitante** quiero compartir un producto por WhatsApp o redes para recomendarlo a alguien.
- El botón usa la función de compartir del dispositivo cuando existe.

## Épica 2. Personalización

**HU-06 · Personalizar mi regalo** (Must)
Como **cliente** quiero elegir color de cinta, empaque, tamaño y extras para que el regalo refleje mis gustos.
- Solo se ofrecen las opciones habilitadas para ese producto.
- El precio se actualiza al instante al elegir opciones con costo extra.
- Mi selección queda guardada en el pedido.

**HU-07 · Escribir dedicatoria** (Must)
Como **cliente** quiero escribir un mensaje para la tarjeta para que el regalo sea más personal.
- La dedicatoria admite hasta 255 caracteres, con contador visible.

## Épica 3. Pedidos

**HU-08 · Agregar al carrito** (Must)
Como **cliente** quiero agregar productos personalizados al carrito y cambiar cantidades para armar mi pedido.
- El carrito conserva mis productos aunque cierre la app.
- Puedo editar cantidad, cambiar opciones o eliminar un ítem.
- Se muestra el total actualizado.

**HU-09 · Realizar pedido** (Must)
Como **cliente** quiero confirmar mi pedido indicando entrega (recogida o domicilio), fecha deseada y método de pago para recibir mi regalo a tiempo.
- No se puede pedir más cantidad que el stock disponible.
- Al confirmar, el pedido queda en estado *pendiente* y veo un resumen.
- Si elijo domicilio, la dirección es obligatoria.

**HU-10 · Consultar mis pedidos** (Must)
Como **cliente** quiero ver el historial y el estado de mis pedidos para saber cuándo estará listo mi regalo.
- Estados visibles: pendiente, confirmado, en producción, listo, entregado, cancelado.

**HU-11 · Cancelar pedido** (Should)
Como **cliente** quiero cancelar un pedido pendiente para corregir un error.
- Solo se puede cancelar mientras esté en estado *pendiente* o *confirmado*.
- Al cancelar, el stock se devuelve.

**HU-12 · Pedir por WhatsApp** (Should)
Como **visitante** quiero enviar mi consulta o pedido por WhatsApp con el producto ya escrito en el mensaje para hablar directo con el vendedor.

## Épica 4. Cuenta y comunidad

**HU-13 · Registrarme** (Must)
Como **visitante** quiero crear una cuenta con correo y contraseña para poder hacer pedidos.
- El correo no puede estar repetido.
- La contraseña se guarda cifrada.

**HU-14 · Iniciar y cerrar sesión** (Must)
Como **cliente** quiero iniciar sesión de forma segura para acceder a mis pedidos y favoritos.
- Los errores de acceso no revelan si falló el correo o la contraseña.

**HU-15 · Guardar favoritos** (Should)
Como **cliente** quiero marcar productos como favoritos para encontrarlos después.

**HU-16 · Dejar reseña** (Could)
Como **cliente** quiero calificar de 1 a 5 y comentar un producto que compré para ayudar a otros.
- Solo puedo reseñar productos de pedidos entregados.
- La reseña se publica cuando el administrador la aprueba.

**HU-17 · Contactar al negocio** (Should)
Como **visitante** quiero enviar un mensaje desde un formulario para resolver dudas o pedir cotizaciones especiales.

## Épica 5. Eventos y talleres

**HU-18 · Ver eventos y talleres** (Should)
Como **visitante** quiero ver próximos eventos, ferias y talleres de manualidades para participar o encontrar al equipo.
- Se muestran fecha, lugar, tipo y cupos disponibles.

**HU-19 · Inscribirme a un taller** (Could)
Como **cliente** quiero inscribirme a un taller para aprender a hacer flores de cinta.
- No puedo inscribirme dos veces al mismo evento.
- Si no hay cupos, se muestra *Cupo lleno*.

## Épica 6. Experiencia PWA

**HU-20 · Instalar la app** (Must)
Como **visitante** quiero instalar Rosas Eternas en mi celular como una app para abrirla desde la pantalla de inicio.

**HU-21 · Ver catálogo sin conexión** (Must)
Como **visitante** quiero seguir viendo el catálogo ya visitado sin internet para consultarlo en cualquier lugar.
- Se muestra un aviso claro cuando no hay conexión.

**HU-22 · Recibir notificaciones** (Could)
Como **cliente** quiero recibir avisos de promociones, fechas especiales (Día de la Madre, Amor y Amistad) y cambios de estado de mi pedido.
- Puedo activar o desactivar las notificaciones cuando quiera.

## Épica 7. Administración

**HU-23 · Gestionar productos** (Must)
Como **administrador** quiero crear, editar, desactivar y subir fotos de productos para mantener el catálogo al día.

**HU-24 · Gestionar categorías y opciones de personalización** (Must)
Como **administrador** quiero administrar categorías, colores de cinta, empaques y extras con su costo para ofrecer más variedad.

**HU-25 · Gestionar pedidos** (Must)
Como **administrador** quiero ver los pedidos, filtrarlos por estado y cambiarlo para organizar la producción.
- Cada cambio de estado queda registrado con fecha.

**HU-26 · Gestionar promociones** (Should)
Como **administrador** quiero crear promociones con porcentaje, fechas y productos para impulsar las ventas.

**HU-27 · Gestionar eventos y talleres** (Should)
Como **administrador** quiero publicar eventos, definir cupos y ver los inscritos para organizar las actividades comunitarias.

**HU-28 · Gestionar proveedores y materiales** (Could)
Como **administrador** quiero registrar proveedores y materiales con su costo para calcular el costo de producción de cada producto.

**HU-29 · Ver reportes** (Should)
Como **administrador** quiero ver ventas por mes, productos más vendidos y stock bajo para tomar decisiones.

**HU-30 · Moderar reseñas y atender mensajes** (Could)
Como **administrador** quiero aprobar reseñas y marcar mensajes como atendidos para mantener una buena imagen y atención.

---

## Resumen por prioridad

| Prioridad | Historias |
|---|---|
| Must | HU-01, 02, 03, 06, 07, 08, 09, 10, 13, 14, 20, 21, 23, 24, 25 |
| Should | HU-04, 11, 12, 15, 17, 18, 26, 27, 29 |
| Could | HU-05, 16, 19, 22, 28, 30 |
