const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const auth = require('../controllers/auth.controller');
const catalogo = require('../controllers/catalogo.controller');
const pedidos = require('../controllers/pedidos.controller');
const favoritos = require('../controllers/favoritos.controller');
const resenas = require('../controllers/resenas.controller');
const contacto = require('../controllers/contacto.controller');
const eventos = require('../controllers/eventos.controller');
const admin = require('../controllers/admin.controller');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const api = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Espera unos minutos.' },
});

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Ya enviaste varios mensajes. Inténtalo más tarde.' },
});

api.post('/auth/registro', authLimiter, auth.register);
api.post('/auth/login', authLimiter, auth.login);
api.get('/auth/me', requireAuth, auth.me);

api.get('/categorias', catalogo.listCategorias);
api.get('/promociones', catalogo.listPromociones);
api.get('/productos', catalogo.listProductos);
api.get('/productos/:slug', catalogo.getProducto);

api.post('/contacto', contactLimiter, contacto.enviar);

api.get('/eventos', eventos.listar);
api.post('/eventos/:id/inscripciones', requireAuth, eventos.inscribir);

api.post('/pedidos', requireAuth, pedidos.crear);
api.get('/pedidos', requireAuth, pedidos.mios);
api.get('/pedidos/:id', requireAuth, pedidos.detalle);
api.post('/pedidos/:id/cancelar', requireAuth, pedidos.cancelar);

api.get('/favoritos', requireAuth, favoritos.listar);
api.post('/favoritos', requireAuth, favoritos.agregar);
api.delete('/favoritos/:id', requireAuth, favoritos.quitar);

api.post('/resenas', requireAuth, resenas.crear);

api.use('/admin', requireAuth, requireAdmin);
api.get('/admin/reportes', admin.reportes);
api.get('/admin/pedidos', admin.listarPedidos);
api.get('/admin/pedidos/:id', admin.detallePedidoAdmin);
api.patch('/admin/pedidos/:id', admin.cambiarEstadoPedido);
api.get('/admin/productos', admin.listarProductosAdmin);
api.post('/admin/productos', admin.crearProducto);
api.patch('/admin/productos/:id', admin.actualizarProducto);
api.get('/admin/categorias', admin.listarCategoriasAdmin);
api.post('/admin/categorias', admin.guardarCategoria);
api.get('/admin/opciones', admin.listarOpciones);
api.post('/admin/opciones', admin.guardarOpcion);
api.get('/admin/promociones', admin.listarPromociones);
api.post('/admin/promociones', admin.guardarPromocion);
api.get('/admin/eventos', admin.listarEventosAdmin);
api.post('/admin/eventos', admin.guardarEvento);
api.get('/admin/eventos/:id/inscritos', admin.inscritosEvento);
api.get('/admin/resenas', admin.listarResenas);
api.patch('/admin/resenas/:id', admin.aprobarResena);
api.get('/admin/mensajes', admin.listarMensajes);
api.patch('/admin/mensajes/:id', admin.atenderMensaje);

module.exports = api;
