# Rosas Eternas: Modelo entidad-relación

Base de datos relacional en **MySQL 8 (Clever Cloud)**. El diagrama usa Mermaid; se visualiza en GitHub, VS Code (extensión Markdown Preview Mermaid) o en https://mermaid.live.

## Diagrama

```mermaid
erDiagram
    roles ||--o{ usuarios : "asigna"
    usuarios ||--o{ pedidos : "realiza"
    usuarios ||--o{ favoritos : "marca"
    usuarios ||--o{ resenas : "escribe"
    usuarios ||--o{ inscripciones_evento : "se inscribe"
    usuarios |o--o{ suscripciones_push : "recibe"
    usuarios |o--o{ historial_estado_pedido : "registra cambio"

    categorias ||--o{ productos : "clasifica"
    productos ||--o{ imagenes_producto : "tiene"
    productos ||--o{ producto_opciones : "ofrece"
    opciones_personalizacion ||--o{ producto_opciones : "aplica a"
    productos ||--o{ promocion_productos : "participa"
    promociones ||--o{ promocion_productos : "incluye"
    productos ||--o{ favoritos : "es marcado"
    productos ||--o{ resenas : "recibe"

    pedidos ||--|{ detalle_pedido : "contiene"
    productos ||--o{ detalle_pedido : "se vende en"
    detalle_pedido ||--o{ detalle_pedido_opciones : "personaliza con"
    opciones_personalizacion ||--o{ detalle_pedido_opciones : "se elige en"
    pedidos ||--o{ historial_estado_pedido : "cambia de estado"

    eventos ||--o{ inscripciones_evento : "recibe"

    proveedores ||--o{ materiales : "suministra"
    materiales ||--o{ producto_materiales : "se usa en"
    productos ||--o{ producto_materiales : "se fabrica con"

    roles {
        tinyint id_rol PK
        varchar nombre UK
        varchar descripcion
    }
    usuarios {
        int id_usuario PK
        tinyint id_rol FK
        varchar nombre
        varchar apellido
        varchar email UK
        varchar password_hash
        varchar telefono
        boolean activo
        timestamp creado_en
    }
    categorias {
        smallint id_categoria PK
        varchar nombre UK
        varchar descripcion
        varchar imagen_url
        boolean activa
    }
    productos {
        int id_producto PK
        smallint id_categoria FK
        varchar nombre
        varchar slug UK
        text descripcion
        decimal precio
        int stock
        boolean es_personalizable
        boolean destacado
        boolean activo
    }
    imagenes_producto {
        int id_imagen PK
        int id_producto FK
        varchar url
        varchar texto_alternativo
        boolean es_principal
        tinyint orden
    }
    opciones_personalizacion {
        int id_opcion PK
        enum tipo
        varchar nombre
        char valor_hex
        decimal costo_extra
        boolean activa
    }
    producto_opciones {
        int id_producto PK, FK
        int id_opcion PK, FK
    }
    promociones {
        int id_promocion PK
        varchar nombre
        varchar descripcion
        decimal porcentaje_descuento
        date fecha_inicio
        date fecha_fin
        boolean activa
    }
    promocion_productos {
        int id_promocion PK, FK
        int id_producto PK, FK
    }
    pedidos {
        int id_pedido PK
        int id_usuario FK
        enum estado
        decimal total
        enum metodo_pago
        enum tipo_entrega
        varchar direccion_entrega
        date fecha_entrega_deseada
        varchar notas
        timestamp creado_en
    }
    detalle_pedido {
        int id_detalle PK
        int id_pedido FK
        int id_producto FK
        smallint cantidad
        decimal precio_unitario
        decimal subtotal
        varchar dedicatoria
    }
    detalle_pedido_opciones {
        int id_detalle PK, FK
        int id_opcion PK, FK
        decimal costo_extra_aplicado
    }
    historial_estado_pedido {
        int id_historial PK
        int id_pedido FK
        enum estado_anterior
        enum estado_nuevo
        int id_usuario FK
        timestamp cambiado_en
    }
    favoritos {
        int id_usuario PK, FK
        int id_producto PK, FK
        timestamp creado_en
    }
    resenas {
        int id_resena PK
        int id_usuario FK
        int id_producto FK
        tinyint calificacion
        varchar comentario
        boolean aprobada
        timestamp creado_en
    }
    eventos {
        int id_evento PK
        varchar titulo
        text descripcion
        enum tipo
        varchar lugar
        datetime fecha_inicio
        datetime fecha_fin
        smallint cupo_maximo
        boolean publicado
    }
    inscripciones_evento {
        int id_inscripcion PK
        int id_evento FK
        int id_usuario FK
        enum estado
        timestamp creado_en
    }
    proveedores {
        int id_proveedor PK
        varchar nombre
        varchar contacto
        varchar telefono
        varchar email
        varchar ciudad
        boolean activo
    }
    materiales {
        int id_material PK
        int id_proveedor FK
        varchar nombre
        varchar unidad
        decimal costo_unitario
        decimal stock
    }
    producto_materiales {
        int id_producto PK, FK
        int id_material PK, FK
        decimal cantidad
    }
    mensajes_contacto {
        int id_mensaje PK
        varchar nombre
        varchar email
        varchar asunto
        text mensaje
        boolean atendido
        timestamp creado_en
    }
    suscripciones_push {
        int id_suscripcion PK
        int id_usuario FK
        varchar endpoint UK
        varchar p256dh
        varchar auth
        timestamp creado_en
    }
```

## Entidades

| Entidad | Propósito |
|---|---|
| `roles` | Perfiles de acceso (administrador, cliente). |
| `usuarios` | Cuentas de clientes y administradores. |
| `categorias` | Agrupan productos (ramos, rosas individuales, cajas, etc.). |
| `productos` | Catálogo de regalos. |
| `imagenes_producto` | Galería de fotos de cada producto. |
| `opciones_personalizacion` | Colores de cinta, empaques, tamaños y extras, con costo adicional. |
| `producto_opciones` | Qué opciones admite cada producto (N:M). |
| `promociones` / `promocion_productos` | Descuentos por fechas y productos incluidos (N:M). |
| `pedidos` | Encabezado del pedido: cliente, estado, entrega, pago y total. |
| `detalle_pedido` | Productos del pedido con cantidad, precio al momento de la compra y dedicatoria. |
| `detalle_pedido_opciones` | Opciones elegidas en cada ítem, con el costo extra aplicado en ese momento. |
| `historial_estado_pedido` | Bitácora de cambios de estado de cada pedido. |
| `favoritos` | Productos guardados por un usuario (N:M). |
| `resenas` | Calificaciones y comentarios, con aprobación del administrador. |
| `eventos` / `inscripciones_evento` | Ferias, talleres y bazares, con inscripción de usuarios. |
| `proveedores` / `materiales` | Aliados locales y los insumos que suministran. |
| `producto_materiales` | Receta: cantidad de cada material por producto (N:M), para calcular costos. |
| `mensajes_contacto` | Mensajes del formulario de contacto. |
| `suscripciones_push` | Dispositivos suscritos a notificaciones push de la PWA. |

## Decisiones de diseño

- **Precio histórico:** `detalle_pedido.precio_unitario` y `detalle_pedido_opciones.costo_extra_aplicado` guardan el valor del momento de la compra, así un cambio de precio posterior no altera pedidos antiguos.
- **Relaciones N:M** resueltas con tablas puente de llave primaria compuesta.
- **Borrado:** las imágenes, opciones y detalles se eliminan en cascada con su padre; los productos con ventas no se borran, se **desactivan** (`activo = 0`).
- **Carrito:** no tiene tabla; vive en el dispositivo hasta confirmar el pedido.
- **Normalización:** el modelo cumple 3FN. Los valores cerrados (estados, tipos) se modelan con `ENUM` por simplicidad.
