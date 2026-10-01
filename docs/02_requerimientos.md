# Rosas Eternas: Requerimientos

## 1. Alcance y supuestos

- La PWA **promociona y vende** regalos duraderos hechos con cinta fantasía, con foco en la personalización.
- Los pagos en línea quedan fuera del MVP: el pedido se registra y el pago se acuerda por efectivo, transferencia o contraentrega.
- El carrito vive en el dispositivo del cliente (almacenamiento local) hasta que confirma el pedido.
- Stack: **React + Tailwind** (frontend), **Node.js + Express** (API REST), **MySQL en Clever Cloud** (base de datos).

---

## 2. Requerimientos funcionales

### Catálogo y promoción
| ID | Requerimiento | Historia |
|---|---|---|
| RF-01 | El sistema debe listar productos activos con imagen principal, nombre, precio y descuento vigente, con paginación. | HU-01 |
| RF-02 | El sistema debe permitir buscar por texto y filtrar por categoría y rango de precio. | HU-02 |
| RF-03 | El sistema debe mostrar el detalle del producto: galería, descripción, disponibilidad, opciones y reseñas aprobadas. | HU-03 |
| RF-04 | El sistema debe mostrar las promociones vigentes y sus productos. | HU-04 |
| RF-05 | El sistema debe ofrecer un botón de compartir producto y un enlace a WhatsApp con el mensaje prellenado. | HU-05, 12 |

### Personalización y pedidos
| ID | Requerimiento | Historia |
|---|---|---|
| RF-06 | El sistema debe permitir elegir opciones de personalización (color de cinta, empaque, tamaño, extras) y recalcular el precio. | HU-06 |
| RF-07 | El sistema debe permitir escribir una dedicatoria de hasta 255 caracteres por ítem. | HU-07 |
| RF-08 | El sistema debe gestionar un carrito (agregar, editar cantidad, cambiar opciones, eliminar) que persista en el dispositivo. | HU-08 |
| RF-09 | El sistema debe registrar pedidos con tipo de entrega, dirección, fecha deseada, método de pago y notas. | HU-09 |
| RF-10 | El sistema debe validar el stock antes de confirmar y descontarlo al registrar el pedido, dentro de una transacción. | HU-09 |
| RF-11 | El sistema debe mostrar al cliente el historial y el estado de sus pedidos. | HU-10 |
| RF-12 | El sistema debe permitir cancelar pedidos en estado *pendiente* o *confirmado* y devolver el stock. | HU-11 |

### Cuenta y comunidad
| ID | Requerimiento | Historia |
|---|---|---|
| RF-13 | El sistema debe permitir el registro con correo único y contraseña cifrada. | HU-13 |
| RF-14 | El sistema debe autenticar usuarios con token (JWT) y diferenciar roles *cliente* y *administrador*. | HU-14 |
| RF-15 | El sistema debe permitir marcar y desmarcar favoritos. | HU-15 |
| RF-16 | El sistema debe permitir reseñar (1 a 5 y comentario) solo productos de pedidos entregados, una reseña por producto y usuario, sujeta a aprobación. | HU-16 |
| RF-17 | El sistema debe ofrecer un formulario de contacto que guarde el mensaje. | HU-17 |

### Eventos y talleres
| ID | Requerimiento | Historia |
|---|---|---|
| RF-18 | El sistema debe listar eventos publicados con fecha, lugar, tipo y cupos disponibles. | HU-18 |
| RF-19 | El sistema debe permitir la inscripción a un evento validando cupo y evitando duplicados. | HU-19 |

### PWA
| ID | Requerimiento | Historia |
|---|---|---|
| RF-20 | El sistema debe ser instalable (manifiesto web con nombre, íconos y colores). | HU-20 |
| RF-21 | El sistema debe funcionar sin conexión para el catálogo visitado, mediante service worker, e informar cuando no hay red. | HU-21 |
| RF-22 | El sistema debe permitir activar y desactivar notificaciones push de promociones y estado de pedidos. | HU-22 |

### Administración
| ID | Requerimiento | Historia |
|---|---|---|
| RF-23 | El administrador debe poder crear, editar y desactivar productos, con carga de imágenes. | HU-23 |
| RF-24 | El administrador debe poder gestionar categorías y opciones de personalización con su costo extra. | HU-24 |
| RF-25 | El administrador debe poder listar pedidos, filtrarlos por estado y cambiar su estado. | HU-25 |
| RF-26 | El administrador debe poder crear promociones con porcentaje, fechas y productos asociados. | HU-26 |
| RF-27 | El administrador debe poder crear eventos, definir cupos y ver inscritos. | HU-27 |
| RF-28 | El administrador debe poder registrar proveedores, materiales y la receta de materiales de cada producto. | HU-28 |
| RF-29 | El administrador debe ver reportes de ventas por mes, productos más vendidos y alertas de stock bajo. | HU-29 |
| RF-30 | El administrador debe poder aprobar reseñas y marcar mensajes de contacto como atendidos. | HU-30 |

---

## 3. Requerimientos no funcionales

### Rendimiento
| ID | Requerimiento |
|---|---|
| RNF-01 | La primera carga en red móvil 4G debe ser menor a 3 segundos (LCP ≤ 2,5 s). |
| RNF-02 | Las respuestas de la API para consultas del catálogo deben tardar menos de 500 ms en condiciones normales. |
| RNF-03 | Las imágenes deben comprimirse y servirse en formato WebP con carga diferida (*lazy loading*). |

### Seguridad
| ID | Requerimiento |
|---|---|
| RNF-04 | Toda la comunicación debe ir por HTTPS (requisito además para PWA). |
| RNF-05 | Las contraseñas deben almacenarse con hash seguro (bcrypt) y nunca en texto plano. |
| RNF-06 | La API debe validar y sanear todas las entradas y usar consultas parametrizadas para evitar inyección SQL. |
| RNF-07 | Las rutas de administración deben exigir token válido y rol de administrador. |
| RNF-08 | Las credenciales y llaves (base de datos, JWT) deben ir en variables de entorno, nunca en el repositorio. |
| RNF-09 | Debe aplicarse limitación de intentos (*rate limiting*) en inicio de sesión y formulario de contacto. |
| RNF-10 | El tratamiento de datos personales debe cumplir la normativa local de protección de datos, con aviso de privacidad y consentimiento en el registro. |

### Usabilidad y accesibilidad
| ID | Requerimiento |
|---|---|
| RNF-11 | El diseño debe ser *mobile first* y adaptarse a pantallas desde 360 px hasta escritorio. |
| RNF-12 | La interfaz debe cumplir pautas WCAG 2.1 nivel AA: contraste suficiente, navegación por teclado y textos alternativos en imágenes. |
| RNF-13 | Un cliente debe poder completar un pedido en máximo 5 pasos desde el catálogo. |
| RNF-14 | La interfaz y los mensajes de error deben estar en español, con lenguaje claro. |

### Disponibilidad y compatibilidad
| ID | Requerimiento |
|---|---|
| RNF-15 | El sistema debe estar disponible al menos el 99 % del tiempo mensual (según el plan del hosting). |
| RNF-16 | Debe funcionar en las dos últimas versiones de Chrome, Edge, Firefox y Safari, y en Android e iOS. |
| RNF-17 | Debe obtener una puntuación de Lighthouse PWA de 90 o más. |

### Mantenibilidad y datos
| ID | Requerimiento |
|---|---|
| RNF-18 | El código debe separarse en capas (rutas, controladores, servicios, acceso a datos) con convenciones documentadas. |
| RNF-19 | La API debe seguir principios REST y estar documentada (por ejemplo con OpenAPI). |
| RNF-20 | La base de datos debe estar normalizada (3FN), usar InnoDB y `utf8mb4`, y tener respaldos periódicos. |
| RNF-21 | Los cambios de estructura de la base deben versionarse con scripts de migración. |
| RNF-22 | El sistema debe escalar a un catálogo de al menos 500 productos sin cambios de arquitectura. |
