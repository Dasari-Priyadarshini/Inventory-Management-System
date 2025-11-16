const API_BASE = 'http://localhost:4000/api';

async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Request failed');
  return res.json();
}

const ProductsAPI = {
  list: (q) => api(`/products${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  get: (id) => api(`/products/${id}`),
  create: (data) => api('/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => api(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => api(`/products/${id}`, { method: 'DELETE' }),
  low: () => api('/products/alerts/low'),
};

const SalesAPI = {
  create: (payload) => api('/sales', { method: 'POST', body: JSON.stringify(payload) }),
  get: (id) => api(`/sales/${id}`),
};

const StockAPI = {
  list: () => api('/stock-movements'),
  adjust: (payload) => api('/stock-movements', { method: 'POST', body: JSON.stringify(payload) }),
};
