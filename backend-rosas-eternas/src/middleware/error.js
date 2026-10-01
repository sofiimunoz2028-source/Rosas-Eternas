function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

function notFound(req, res) {
  res.status(404).json({ error: 'Ruta no encontrada' });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  const status = err.status || 500;
  const message = status === 500 && process.env.NODE_ENV === 'production'
    ? 'Error interno del servidor'
    : err.message || 'Error interno del servidor';
  if (status >= 500) console.error(err);
  res.status(status).json({ error: message });
}

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

module.exports = { asyncHandler, notFound, errorHandler, httpError };
