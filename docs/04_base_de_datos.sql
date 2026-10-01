-- =====================================================================
-- Rosas Eternas: Base de datos MySQL 8.0.16+ (Clever Cloud)
-- Contenido:
--   1. Esquema (tablas)
--   2. Vista del catálogo
--   3. Datos de ejemplo
--   4. Consultas para la API
-- Clever Cloud ya entrega una base creada: no se usa CREATE DATABASE.
-- Ejecuta este script sobre la base asignada a tu add-on.
-- =====================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS suscripciones_push, mensajes_contacto, producto_materiales, materiales,
  proveedores, inscripciones_evento, eventos, resenas, favoritos, historial_estado_pedido,
  detalle_pedido_opciones, detalle_pedido, pedidos, promocion_productos, promociones,
  producto_opciones, opciones_personalizacion, imagenes_producto, productos, categorias,
  usuarios, roles;
DROP VIEW IF EXISTS v_catalogo;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- 1. ESQUEMA
-- =====================================================================

CREATE TABLE roles (
  id_rol       TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre       VARCHAR(30)  NOT NULL,
  descripcion  VARCHAR(150) NULL,
  PRIMARY KEY (id_rol),
  UNIQUE KEY uq_roles_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE usuarios (
  id_usuario      INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_rol          TINYINT UNSIGNED NOT NULL,
  nombre          VARCHAR(80)  NOT NULL,
  apellido        VARCHAR(80)  NULL,
  email           VARCHAR(120) NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  telefono        VARCHAR(20)  NULL,
  activo          TINYINT(1)   NOT NULL DEFAULT 1,
  creado_en       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_usuario),
  UNIQUE KEY uq_usuarios_email (email),
  CONSTRAINT fk_usuarios_rol FOREIGN KEY (id_rol) REFERENCES roles (id_rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE categorias (
  id_categoria  SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre        VARCHAR(80)  NOT NULL,
  descripcion   VARCHAR(255) NULL,
  imagen_url    VARCHAR(255) NULL,
  activa        TINYINT(1)   NOT NULL DEFAULT 1,
  PRIMARY KEY (id_categoria),
  UNIQUE KEY uq_categorias_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE productos (
  id_producto        INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_categoria       SMALLINT UNSIGNED NOT NULL,
  nombre             VARCHAR(120) NOT NULL,
  slug               VARCHAR(140) NOT NULL,
  descripcion        TEXT NULL,
  precio             DECIMAL(10,2) NOT NULL,
  stock              INT NOT NULL DEFAULT 0,
  es_personalizable  TINYINT(1) NOT NULL DEFAULT 1,
  destacado          TINYINT(1) NOT NULL DEFAULT 0,
  activo             TINYINT(1) NOT NULL DEFAULT 1,
  creado_en          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_producto),
  UNIQUE KEY uq_productos_slug (slug),
  KEY idx_productos_categoria (id_categoria),
  FULLTEXT KEY ft_productos_busqueda (nombre, descripcion),
  CONSTRAINT fk_productos_categoria FOREIGN KEY (id_categoria) REFERENCES categorias (id_categoria),
  CONSTRAINT ck_productos_precio CHECK (precio >= 0),
  CONSTRAINT ck_productos_stock  CHECK (stock >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE imagenes_producto (
  id_imagen          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_producto        INT UNSIGNED NOT NULL,
  url                VARCHAR(255) NOT NULL,
  texto_alternativo  VARCHAR(150) NULL,
  es_principal       TINYINT(1) NOT NULL DEFAULT 0,
  orden              TINYINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id_imagen),
  KEY idx_imagenes_producto (id_producto),
  CONSTRAINT fk_imagenes_producto FOREIGN KEY (id_producto) REFERENCES productos (id_producto) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE opciones_personalizacion (
  id_opcion    INT UNSIGNED NOT NULL AUTO_INCREMENT,
  tipo         ENUM('color_cinta','empaque','tarjeta','tamano','extra') NOT NULL,
  nombre       VARCHAR(80) NOT NULL,
  valor_hex    CHAR(7) NULL,
  costo_extra  DECIMAL(10,2) NOT NULL DEFAULT 0,
  activa       TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (id_opcion),
  UNIQUE KEY uq_opciones_tipo_nombre (tipo, nombre),
  CONSTRAINT ck_opciones_costo CHECK (costo_extra >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE producto_opciones (
  id_producto  INT UNSIGNED NOT NULL,
  id_opcion    INT UNSIGNED NOT NULL,
  PRIMARY KEY (id_producto, id_opcion),
  CONSTRAINT fk_prodop_producto FOREIGN KEY (id_producto) REFERENCES productos (id_producto) ON DELETE CASCADE,
  CONSTRAINT fk_prodop_opcion   FOREIGN KEY (id_opcion)   REFERENCES opciones_personalizacion (id_opcion) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE promociones (
  id_promocion         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre               VARCHAR(100) NOT NULL,
  descripcion          VARCHAR(255) NULL,
  porcentaje_descuento DECIMAL(5,2) NOT NULL,
  fecha_inicio         DATE NOT NULL,
  fecha_fin            DATE NOT NULL,
  activa               TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (id_promocion),
  CONSTRAINT ck_promo_porcentaje CHECK (porcentaje_descuento > 0 AND porcentaje_descuento <= 100),
  CONSTRAINT ck_promo_fechas     CHECK (fecha_fin >= fecha_inicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE promocion_productos (
  id_promocion  INT UNSIGNED NOT NULL,
  id_producto   INT UNSIGNED NOT NULL,
  PRIMARY KEY (id_promocion, id_producto),
  CONSTRAINT fk_promprod_promocion FOREIGN KEY (id_promocion) REFERENCES promociones (id_promocion) ON DELETE CASCADE,
  CONSTRAINT fk_promprod_producto  FOREIGN KEY (id_producto)  REFERENCES productos (id_producto) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE pedidos (
  id_pedido              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_usuario             INT UNSIGNED NOT NULL,
  estado                 ENUM('pendiente','confirmado','en_produccion','listo','entregado','cancelado')
                         NOT NULL DEFAULT 'pendiente',
  total                  DECIMAL(12,2) NOT NULL DEFAULT 0,
  metodo_pago            ENUM('efectivo','transferencia','contraentrega') NOT NULL DEFAULT 'efectivo',
  tipo_entrega           ENUM('recogida','domicilio') NOT NULL DEFAULT 'recogida',
  direccion_entrega      VARCHAR(200) NULL,
  fecha_entrega_deseada  DATE NULL,
  notas                  VARCHAR(255) NULL,
  creado_en              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_pedido),
  KEY idx_pedidos_usuario (id_usuario),
  KEY idx_pedidos_estado (estado),
  CONSTRAINT fk_pedidos_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario),
  CONSTRAINT ck_pedidos_total CHECK (total >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE detalle_pedido (
  id_detalle       INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_pedido        INT UNSIGNED NOT NULL,
  id_producto      INT UNSIGNED NOT NULL,
  cantidad         SMALLINT UNSIGNED NOT NULL,
  precio_unitario  DECIMAL(10,2) NOT NULL,
  subtotal         DECIMAL(12,2) NOT NULL,
  dedicatoria      VARCHAR(255) NULL,
  PRIMARY KEY (id_detalle),
  KEY idx_detalle_pedido (id_pedido),
  KEY idx_detalle_producto (id_producto),
  CONSTRAINT fk_detalle_pedido   FOREIGN KEY (id_pedido)   REFERENCES pedidos (id_pedido) ON DELETE CASCADE,
  CONSTRAINT fk_detalle_producto FOREIGN KEY (id_producto) REFERENCES productos (id_producto),
  CONSTRAINT ck_detalle_cantidad CHECK (cantidad > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE detalle_pedido_opciones (
  id_detalle            INT UNSIGNED NOT NULL,
  id_opcion             INT UNSIGNED NOT NULL,
  costo_extra_aplicado  DECIMAL(10,2) NOT NULL DEFAULT 0,
  PRIMARY KEY (id_detalle, id_opcion),
  CONSTRAINT fk_detop_detalle FOREIGN KEY (id_detalle) REFERENCES detalle_pedido (id_detalle) ON DELETE CASCADE,
  CONSTRAINT fk_detop_opcion  FOREIGN KEY (id_opcion)  REFERENCES opciones_personalizacion (id_opcion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE historial_estado_pedido (
  id_historial     INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_pedido        INT UNSIGNED NOT NULL,
  estado_anterior  ENUM('pendiente','confirmado','en_produccion','listo','entregado','cancelado') NULL,
  estado_nuevo     ENUM('pendiente','confirmado','en_produccion','listo','entregado','cancelado') NOT NULL,
  id_usuario       INT UNSIGNED NULL,
  cambiado_en      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_historial),
  KEY idx_historial_pedido (id_pedido),
  CONSTRAINT fk_historial_pedido  FOREIGN KEY (id_pedido)  REFERENCES pedidos (id_pedido) ON DELETE CASCADE,
  CONSTRAINT fk_historial_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE favoritos (
  id_usuario   INT UNSIGNED NOT NULL,
  id_producto  INT UNSIGNED NOT NULL,
  creado_en    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_usuario, id_producto),
  CONSTRAINT fk_fav_usuario  FOREIGN KEY (id_usuario)  REFERENCES usuarios (id_usuario) ON DELETE CASCADE,
  CONSTRAINT fk_fav_producto FOREIGN KEY (id_producto) REFERENCES productos (id_producto) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE resenas (
  id_resena     INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_usuario    INT UNSIGNED NOT NULL,
  id_producto   INT UNSIGNED NOT NULL,
  calificacion  TINYINT UNSIGNED NOT NULL,
  comentario    VARCHAR(500) NULL,
  aprobada      TINYINT(1) NOT NULL DEFAULT 0,
  creado_en     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_resena),
  UNIQUE KEY uq_resena_usuario_producto (id_usuario, id_producto),
  KEY idx_resenas_producto (id_producto),
  CONSTRAINT fk_resenas_usuario  FOREIGN KEY (id_usuario)  REFERENCES usuarios (id_usuario) ON DELETE CASCADE,
  CONSTRAINT fk_resenas_producto FOREIGN KEY (id_producto) REFERENCES productos (id_producto) ON DELETE CASCADE,
  CONSTRAINT ck_resenas_calificacion CHECK (calificacion BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE eventos (
  id_evento     INT UNSIGNED NOT NULL AUTO_INCREMENT,
  titulo        VARCHAR(150) NOT NULL,
  descripcion   TEXT NULL,
  tipo          ENUM('feria','taller','bazar','comunitario') NOT NULL,
  lugar         VARCHAR(150) NULL,
  fecha_inicio  DATETIME NOT NULL,
  fecha_fin     DATETIME NULL,
  cupo_maximo   SMALLINT UNSIGNED NULL,
  publicado     TINYINT(1) NOT NULL DEFAULT 1,
  creado_en     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_evento),
  KEY idx_eventos_fecha (fecha_inicio),
  CONSTRAINT ck_eventos_fechas CHECK (fecha_fin IS NULL OR fecha_fin >= fecha_inicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE inscripciones_evento (
  id_inscripcion  INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_evento       INT UNSIGNED NOT NULL,
  id_usuario      INT UNSIGNED NOT NULL,
  estado          ENUM('inscrito','asistio','cancelado') NOT NULL DEFAULT 'inscrito',
  creado_en       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_inscripcion),
  UNIQUE KEY uq_inscripcion_evento_usuario (id_evento, id_usuario),
  CONSTRAINT fk_insc_evento  FOREIGN KEY (id_evento)  REFERENCES eventos (id_evento) ON DELETE CASCADE,
  CONSTRAINT fk_insc_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE proveedores (
  id_proveedor  INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre        VARCHAR(120) NOT NULL,
  contacto      VARCHAR(100) NULL,
  telefono      VARCHAR(20)  NULL,
  email         VARCHAR(120) NULL,
  ciudad        VARCHAR(80)  NULL,
  activo        TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (id_proveedor)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE materiales (
  id_material     INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_proveedor    INT UNSIGNED NOT NULL,
  nombre          VARCHAR(100) NOT NULL,
  unidad          VARCHAR(20)  NOT NULL,
  costo_unitario  DECIMAL(10,2) NOT NULL,
  stock           DECIMAL(10,2) NOT NULL DEFAULT 0,
  PRIMARY KEY (id_material),
  KEY idx_materiales_proveedor (id_proveedor),
  CONSTRAINT fk_materiales_proveedor FOREIGN KEY (id_proveedor) REFERENCES proveedores (id_proveedor)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE producto_materiales (
  id_producto  INT UNSIGNED NOT NULL,
  id_material  INT UNSIGNED NOT NULL,
  cantidad     DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (id_producto, id_material),
  CONSTRAINT fk_prodmat_producto FOREIGN KEY (id_producto) REFERENCES productos (id_producto) ON DELETE CASCADE,
  CONSTRAINT fk_prodmat_material FOREIGN KEY (id_material) REFERENCES materiales (id_material),
  CONSTRAINT ck_prodmat_cantidad CHECK (cantidad > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE mensajes_contacto (
  id_mensaje  INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre      VARCHAR(100) NOT NULL,
  email       VARCHAR(120) NOT NULL,
  telefono    VARCHAR(20)  NULL,
  asunto      VARCHAR(150) NULL,
  mensaje     TEXT NOT NULL,
  atendido    TINYINT(1) NOT NULL DEFAULT 0,
  creado_en   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_mensaje)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE suscripciones_push (
  id_suscripcion  INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_usuario      INT UNSIGNED NULL,
  endpoint        VARCHAR(500) NOT NULL,
  p256dh          VARCHAR(255) NOT NULL,
  auth            VARCHAR(255) NOT NULL,
  creado_en       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_suscripcion),
  UNIQUE KEY uq_push_endpoint (endpoint),
  CONSTRAINT fk_push_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- 2. VISTA DEL CATÁLOGO (imagen principal, descuento vigente, calificación)
-- =====================================================================

CREATE VIEW v_catalogo AS
SELECT t.*,
       ROUND(t.precio * (1 - t.descuento_pct / 100), 2) AS precio_final
FROM (
  SELECT p.id_producto, p.nombre, p.slug, p.descripcion, p.precio, p.stock,
         p.es_personalizable, p.destacado,
         c.id_categoria, c.nombre AS categoria,
         (SELECT i.url FROM imagenes_producto i
           WHERE i.id_producto = p.id_producto
           ORDER BY i.es_principal DESC, i.orden ASC LIMIT 1) AS imagen_principal,
         (SELECT COALESCE(MAX(pr.porcentaje_descuento), 0)
            FROM promocion_productos pp
            JOIN promociones pr ON pr.id_promocion = pp.id_promocion
           WHERE pp.id_producto = p.id_producto
             AND pr.activa = 1
             AND CURDATE() BETWEEN pr.fecha_inicio AND pr.fecha_fin) AS descuento_pct,
         (SELECT ROUND(AVG(r.calificacion), 1) FROM resenas r
           WHERE r.id_producto = p.id_producto AND r.aprobada = 1) AS calificacion_promedio,
         (SELECT COUNT(*) FROM resenas r
           WHERE r.id_producto = p.id_producto AND r.aprobada = 1) AS total_resenas
  FROM productos p
  JOIN categorias c ON c.id_categoria = p.id_categoria
  WHERE p.activo = 1 AND c.activa = 1
) t;

-- =====================================================================
-- 3. DATOS DE EJEMPLO
-- (El hash es solo de relleno: genera uno real con bcrypt desde Node.)
-- =====================================================================

INSERT INTO roles (id_rol, nombre, descripcion) VALUES
  (1, 'administrador', 'Gestiona catálogo, pedidos, eventos y reportes'),
  (2, 'cliente',       'Personaliza y realiza pedidos');

INSERT INTO usuarios (id_usuario, id_rol, nombre, apellido, email, password_hash, telefono) VALUES
  (1, 1, 'Admin',   'Rosas Eternas', 'admin@rosaseternas.test',   '$2b$10$REEMPLAZAR_CON_HASH_BCRYPT_REAL_ADMIN', '3000000001'),
  (2, 2, 'Cliente', 'Demo',          'cliente@rosaseternas.test', '$2b$10$REEMPLAZAR_CON_HASH_BCRYPT_REAL_CLIENTE', '3000000002');

INSERT INTO categorias (id_categoria, nombre, descripcion) VALUES
  (1, 'Ramos de rosas',          'Ramos de rosas de cinta fantasía que no se marchitan'),
  (2, 'Rosas individuales',      'Una sola rosa eterna para un detalle sencillo'),
  (3, 'Cajas y arreglos',        'Cajas de regalo y arreglos florales de larga duración'),
  (4, 'Detalles por ocasión',    'Regalos para graduaciones, cumpleaños y fechas especiales'),
  (5, 'Diseños personalizados',  'Creaciones hechas a la medida del cliente');

INSERT INTO opciones_personalizacion (id_opcion, tipo, nombre, valor_hex, costo_extra) VALUES
  (1,  'color_cinta', 'Rojo pasión',     '#C0182E', 0),
  (2,  'color_cinta', 'Rosa pastel',     '#F7B7CB', 0),
  (3,  'color_cinta', 'Blanco perla',    '#F8F4EE', 0),
  (4,  'color_cinta', 'Negro elegante',  '#1C1C1C', 0),
  (5,  'color_cinta', 'Azul rey',        '#1F3FA6', 0),
  (6,  'color_cinta', 'Dorado',          '#C9A227', 2000),
  (7,  'empaque',     'Papel celofán',   NULL,      0),
  (8,  'empaque',     'Caja kraft',      NULL,      5000),
  (9,  'empaque',     'Caja acrílica',   NULL,      12000),
  (10, 'tarjeta',     'Tarjeta con dedicatoria', NULL, 1500),
  (11, 'extra',       'Peluche pequeño', NULL,      9000),
  (12, 'extra',       'Luces LED',       NULL,      6000);

INSERT INTO productos (id_producto, id_categoria, nombre, slug, descripcion, precio, stock, es_personalizable, destacado) VALUES
  (1, 1, 'Ramo Eterno de 12 rosas',  'ramo-eterno-12-rosas',  'Doce rosas de cinta fantasía en el color que elijas, listas para durar años.', 85000, 10, 1, 1),
  (2, 1, 'Ramo Mini de 6 rosas',     'ramo-mini-6-rosas',     'Seis rosas de cinta en un ramo compacto, ideal para un detalle.',               45000, 15, 1, 0),
  (3, 2, 'Rosa Eterna con tallo',    'rosa-eterna-tallo',     'Una rosa de cinta fantasía con tallo y hojas.',                                 12000, 40, 1, 1),
  (4, 3, 'Caja Amor Duradero',       'caja-amor-duradero',    'Caja de regalo con rosas de cinta y espacio para tu dedicatoria.',              65000,  8, 1, 1),
  (5, 4, 'Detalle de Graduación',    'detalle-graduacion',    'Ramo de cinta con los colores de la institución.',                              55000,  6, 1, 0),
  (6, 5, 'Diseño a la medida',       'diseno-a-la-medida',    'Cuéntanos tu idea y la hacemos realidad con cinta fantasía.',                   70000,  5, 1, 0);

INSERT INTO imagenes_producto (id_producto, url, texto_alternativo, es_principal, orden) VALUES
  (1, '/img/productos/ramo-12.svg', 'Ramo de 12 rosas de cinta rojas', 1, 0),
  (2, '/img/productos/ramo-6.svg', 'Ramo pequeño de 6 rosas de cinta rosadas', 1, 0),
  (3, '/img/productos/rosa.svg', 'Rosa de cinta con tallo', 1, 0),
  (4, '/img/productos/caja.svg', 'Caja de regalo con rosas de cinta', 1, 0),
  (5, '/img/productos/graduacion.svg', 'Ramo de cinta para graduación', 1, 0),
  (6, '/img/productos/personalizado.svg', 'Diseño personalizado en cinta fantasía', 1, 0);

-- Todos los productos admiten colores de cinta (1-6) y empaque de celofán (7)
INSERT INTO producto_opciones (id_producto, id_opcion)
SELECT p.id_producto, o.id_opcion
FROM productos p
JOIN opciones_personalizacion o ON o.tipo = 'color_cinta' OR o.id_opcion = 7;

-- Los ramos, cajas y diseños admiten además cajas, tarjeta y extras
INSERT INTO producto_opciones (id_producto, id_opcion)
SELECT p.id_producto, o.id_opcion
FROM productos p
JOIN opciones_personalizacion o ON o.id_opcion IN (8, 9, 10, 11, 12)
WHERE p.id_producto IN (1, 2, 4, 5, 6);

INSERT INTO promociones (id_promocion, nombre, descripcion, porcentaje_descuento, fecha_inicio, fecha_fin) VALUES
  (1, 'Amor y amistad', 'Descuento en ramos y cajas', 10.00, '2026-09-01', '2026-12-31');

INSERT INTO promocion_productos (id_promocion, id_producto) VALUES (1, 1), (1, 2), (1, 4);

INSERT INTO eventos (titulo, descripcion, tipo, lugar, fecha_inicio, fecha_fin, cupo_maximo) VALUES
  ('Taller: tu primera rosa de cinta', 'Aprende a armar una rosa de cinta fantasía paso a paso.', 'taller', 'Institución educativa aliada', '2026-11-14 14:00:00', '2026-11-14 17:00:00', 25),
  ('Feria de emprendedores',           'Stand de Rosas Eternas con productos y pedidos especiales.',  'feria',  'Parque principal',           '2026-12-05 09:00:00', '2026-12-05 18:00:00', NULL);

INSERT INTO proveedores (id_proveedor, nombre, contacto, telefono, ciudad) VALUES
  (1, 'Cintas y Detalles del Centro', 'Ventas', '3000000010', 'Ciudad local'),
  (2, 'Insumos Manualidades',         'Ventas', '3000000011', 'Ciudad local');

INSERT INTO materiales (id_material, id_proveedor, nombre, unidad, costo_unitario, stock) VALUES
  (1, 1, 'Cinta fantasía (rollo)', 'rollo',   4500, 40),
  (2, 1, 'Alambre floral',         'metro',    300, 200),
  (3, 2, 'Papel celofán',          'pliego',   900, 100),
  (4, 2, 'Pegamento caliente',     'barra',    400, 150);

INSERT INTO producto_materiales (id_producto, id_material, cantidad) VALUES
  (1, 1, 6),   (1, 2, 12), (1, 3, 2), (1, 4, 4),
  (3, 1, 0.5), (3, 2, 1),  (3, 4, 1);

-- =====================================================================
-- 4. CONSULTAS PARA LA API
-- Los signos ? son parámetros (consultas parametrizadas con mysql2).
-- =====================================================================

-- 4.1 Catálogo paginado (HU-01)
SELECT id_producto, nombre, slug, categoria, imagen_principal, precio, descuento_pct, precio_final,
       calificacion_promedio, total_resenas
FROM v_catalogo
ORDER BY destacado DESC, nombre ASC
LIMIT 12 OFFSET 0;

-- 4.2 Búsqueda con filtros por texto, categoría y rango de precio (HU-02)
SELECT id_producto, nombre, slug, categoria, imagen_principal, precio, precio_final
FROM v_catalogo
WHERE (? IS NULL OR MATCH(nombre, descripcion) AGAINST (? IN NATURAL LANGUAGE MODE))
  AND (? IS NULL OR id_categoria = ?)
  AND (? IS NULL OR precio_final >= ?)
  AND (? IS NULL OR precio_final <= ?)
ORDER BY nombre
LIMIT 12 OFFSET 0;

-- 4.3 Detalle de un producto por slug (HU-03)
SELECT * FROM v_catalogo WHERE slug = ?;

-- 4.3.1 Galería del producto
SELECT url, texto_alternativo, es_principal
FROM imagenes_producto WHERE id_producto = ? ORDER BY es_principal DESC, orden;

-- 4.3.2 Opciones de personalización del producto (HU-06)
SELECT o.id_opcion, o.tipo, o.nombre, o.valor_hex, o.costo_extra
FROM producto_opciones po
JOIN opciones_personalizacion o ON o.id_opcion = po.id_opcion
WHERE po.id_producto = ? AND o.activa = 1
ORDER BY o.tipo, o.nombre;

-- 4.3.3 Reseñas aprobadas del producto
SELECT r.calificacion, r.comentario, r.creado_en, u.nombre
FROM resenas r JOIN usuarios u ON u.id_usuario = r.id_usuario
WHERE r.id_producto = ? AND r.aprobada = 1
ORDER BY r.creado_en DESC;

-- 4.4 Promociones vigentes (HU-04)
SELECT pr.id_promocion, pr.nombre, pr.descripcion, pr.porcentaje_descuento, pr.fecha_fin
FROM promociones pr
WHERE pr.activa = 1 AND CURDATE() BETWEEN pr.fecha_inicio AND pr.fecha_fin;

-- 4.5 Registro y acceso (HU-13, HU-14)
INSERT INTO usuarios (id_rol, nombre, apellido, email, password_hash, telefono)
VALUES (2, ?, ?, ?, ?, ?);

SELECT id_usuario, id_rol, nombre, email, password_hash
FROM usuarios WHERE email = ? AND activo = 1;

-- 4.6 Crear un pedido completo (HU-08, HU-09). Se ejecuta en una sola transacción.
START TRANSACTION;

  INSERT INTO pedidos (id_usuario, metodo_pago, tipo_entrega, direccion_entrega, fecha_entrega_deseada, notas)
  VALUES (2, 'transferencia', 'domicilio', 'Dirección de ejemplo', '2026-10-20', 'Llamar antes de llegar');
  SET @id_pedido = LAST_INSERT_ID();

  -- Ítem: 2 unidades del ramo 1 con cinta dorada (6) y caja kraft (8): 85000 + 2000 + 5000 = 92000
  INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario, subtotal, dedicatoria)
  VALUES (@id_pedido, 1, 2, 92000.00, 184000.00, 'Para siempre contigo');
  SET @id_detalle = LAST_INSERT_ID();

  INSERT INTO detalle_pedido_opciones (id_detalle, id_opcion, costo_extra_aplicado)
  SELECT @id_detalle, id_opcion, costo_extra
  FROM opciones_personalizacion WHERE id_opcion IN (6, 8);

  -- Descuenta stock solo si alcanza (si afecta 0 filas, la API debe hacer ROLLBACK)
  UPDATE productos SET stock = stock - 2 WHERE id_producto = 1 AND stock >= 2;

  UPDATE pedidos
     SET total = (SELECT SUM(subtotal) FROM detalle_pedido WHERE id_pedido = @id_pedido)
   WHERE id_pedido = @id_pedido;

  INSERT INTO historial_estado_pedido (id_pedido, estado_anterior, estado_nuevo, id_usuario)
  VALUES (@id_pedido, NULL, 'pendiente', 2);

COMMIT;

-- 4.7 Historial de pedidos de un cliente (HU-10)
SELECT p.id_pedido, p.estado, p.total, p.tipo_entrega, p.fecha_entrega_deseada, p.creado_en
FROM pedidos p
WHERE p.id_usuario = ?
ORDER BY p.creado_en DESC;

-- 4.7.1 Detalle de un pedido con sus opciones
SELECT dp.id_detalle, pr.nombre AS producto, dp.cantidad, dp.precio_unitario, dp.subtotal, dp.dedicatoria,
       GROUP_CONCAT(o.nombre ORDER BY o.tipo SEPARATOR ', ') AS opciones
FROM detalle_pedido dp
JOIN productos pr ON pr.id_producto = dp.id_producto
LEFT JOIN detalle_pedido_opciones dpo ON dpo.id_detalle = dp.id_detalle
LEFT JOIN opciones_personalizacion o ON o.id_opcion = dpo.id_opcion
WHERE dp.id_pedido = ?
GROUP BY dp.id_detalle, pr.nombre, dp.cantidad, dp.precio_unitario, dp.subtotal, dp.dedicatoria;

-- 4.8 Cancelar un pedido y devolver stock (HU-11)
START TRANSACTION;
  UPDATE pedidos SET estado = 'cancelado'
   WHERE id_pedido = ? AND id_usuario = ? AND estado IN ('pendiente', 'confirmado');

  UPDATE productos p
  JOIN detalle_pedido dp ON dp.id_producto = p.id_producto
     SET p.stock = p.stock + dp.cantidad
   WHERE dp.id_pedido = ?;

  INSERT INTO historial_estado_pedido (id_pedido, estado_anterior, estado_nuevo, id_usuario)
  VALUES (?, 'pendiente', 'cancelado', ?);
COMMIT;

-- 4.9 Favoritos (HU-15)
INSERT IGNORE INTO favoritos (id_usuario, id_producto) VALUES (?, ?);
DELETE FROM favoritos WHERE id_usuario = ? AND id_producto = ?;

SELECT c.id_producto, c.nombre, c.slug, c.imagen_principal, c.precio_final
FROM favoritos f JOIN v_catalogo c ON c.id_producto = f.id_producto
WHERE f.id_usuario = ?;

-- 4.10 Reseña solo si el cliente recibió el producto (HU-16)
INSERT INTO resenas (id_usuario, id_producto, calificacion, comentario)
SELECT ?, ?, ?, ?
WHERE EXISTS (
  SELECT 1 FROM pedidos pe
  JOIN detalle_pedido dp ON dp.id_pedido = pe.id_pedido
  WHERE pe.id_usuario = ? AND dp.id_producto = ? AND pe.estado = 'entregado'
);

-- 4.11 Eventos próximos con cupos disponibles (HU-18)
SELECT e.id_evento, e.titulo, e.tipo, e.lugar, e.fecha_inicio, e.cupo_maximo,
       CASE WHEN e.cupo_maximo IS NULL THEN NULL
            ELSE e.cupo_maximo - COUNT(i.id_inscripcion) END AS cupos_disponibles
FROM eventos e
LEFT JOIN inscripciones_evento i ON i.id_evento = e.id_evento AND i.estado <> 'cancelado'
WHERE e.publicado = 1 AND e.fecha_inicio >= NOW()
GROUP BY e.id_evento, e.titulo, e.tipo, e.lugar, e.fecha_inicio, e.cupo_maximo
ORDER BY e.fecha_inicio;

-- 4.12 Inscripción a un evento validando cupo (HU-19)
INSERT INTO inscripciones_evento (id_evento, id_usuario)
SELECT e.id_evento, ?
FROM eventos e
WHERE e.id_evento = ? AND e.publicado = 1
  AND (e.cupo_maximo IS NULL OR e.cupo_maximo >
       (SELECT COUNT(*) FROM inscripciones_evento i
         WHERE i.id_evento = e.id_evento AND i.estado <> 'cancelado'));

-- 4.13 Mensaje de contacto (HU-17)
INSERT INTO mensajes_contacto (nombre, email, telefono, asunto, mensaje) VALUES (?, ?, ?, ?, ?);

-- =====================================================================
-- 5. CONSULTAS DE ADMINISTRACIÓN Y REPORTES
-- =====================================================================

-- 5.1 Pedidos por estado (HU-25)
SELECT p.id_pedido, CONCAT(u.nombre, ' ', COALESCE(u.apellido, '')) AS cliente, p.estado, p.total,
       p.fecha_entrega_deseada, p.creado_en
FROM pedidos p JOIN usuarios u ON u.id_usuario = p.id_usuario
WHERE (? IS NULL OR p.estado = ?)
ORDER BY p.fecha_entrega_deseada, p.creado_en;

-- 5.2 Cambiar estado de un pedido con bitácora (HU-25)
START TRANSACTION;
  SELECT estado INTO @estado_actual FROM pedidos WHERE id_pedido = ? FOR UPDATE;
  UPDATE pedidos SET estado = ? WHERE id_pedido = ?;
  INSERT INTO historial_estado_pedido (id_pedido, estado_anterior, estado_nuevo, id_usuario)
  VALUES (?, @estado_actual, ?, ?);
COMMIT;

-- 5.3 Ventas por mes (HU-29)
SELECT DATE_FORMAT(creado_en, '%Y-%m') AS mes, COUNT(*) AS pedidos, SUM(total) AS ventas
FROM pedidos
WHERE estado IN ('confirmado', 'en_produccion', 'listo', 'entregado')
GROUP BY DATE_FORMAT(creado_en, '%Y-%m')
ORDER BY mes DESC;

-- 5.4 Productos más vendidos (HU-29)
SELECT pr.id_producto, pr.nombre, SUM(dp.cantidad) AS unidades, SUM(dp.subtotal) AS ingresos
FROM detalle_pedido dp
JOIN pedidos pe ON pe.id_pedido = dp.id_pedido AND pe.estado <> 'cancelado'
JOIN productos pr ON pr.id_producto = dp.id_producto
GROUP BY pr.id_producto, pr.nombre
ORDER BY unidades DESC
LIMIT 10;

-- 5.5 Productos con stock bajo (HU-29)
SELECT id_producto, nombre, stock FROM productos WHERE activo = 1 AND stock <= 5 ORDER BY stock;

-- 5.6 Costo de producción y margen por producto (HU-28)
SELECT p.id_producto, p.nombre, p.precio,
       SUM(pm.cantidad * m.costo_unitario) AS costo_materiales,
       ROUND(p.precio - SUM(pm.cantidad * m.costo_unitario), 2) AS margen
FROM productos p
JOIN producto_materiales pm ON pm.id_producto = p.id_producto
JOIN materiales m ON m.id_material = pm.id_material
GROUP BY p.id_producto, p.nombre, p.precio;

-- 5.7 Materiales con poco inventario y su proveedor
SELECT m.nombre, m.stock, m.unidad, pv.nombre AS proveedor, pv.telefono
FROM materiales m JOIN proveedores pv ON pv.id_proveedor = m.id_proveedor
WHERE m.stock < 20
ORDER BY m.stock;

-- 5.8 Reseñas pendientes de aprobar y mensajes sin atender (HU-30)
SELECT r.id_resena, pr.nombre AS producto, r.calificacion, r.comentario
FROM resenas r JOIN productos pr ON pr.id_producto = r.id_producto
WHERE r.aprobada = 0;

SELECT id_mensaje, nombre, email, asunto, creado_en
FROM mensajes_contacto WHERE atendido = 0 ORDER BY creado_en;
