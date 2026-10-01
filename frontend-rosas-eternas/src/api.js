const API = import.meta.env.VITE_API_URL || '/api';

export function money(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export async function api(path, { method = 'GET', body, token } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const auth = token || localStorage.getItem('re_token');
  if (auth) headers.Authorization = `Bearer ${auth}`;

  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.error || 'No se pudo completar la solicitud');
    error.status = res.status;
    throw error;
  }
  return data;
}
