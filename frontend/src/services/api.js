import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('rewear_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const hadToken = localStorage.getItem('rewear_token');
      localStorage.removeItem('rewear_token');
      localStorage.removeItem('rewear_user');
      // Only redirect to login if the user was previously authenticated
      // (token expired/invalid). Guests hitting protected endpoints should not be redirected.
      if (hadToken && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth Services ─────────────────────────────────────────────────────────
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// ─── Item Services ─────────────────────────────────────────────────────────
export const itemService = {
  getItems: (params) => api.get('/items', { params }),
  getItem: (id) => api.get(`/items/${id}`),
  getFeatured: () => api.get('/items/featured'),
  getMyItems: () => api.get('/items/user/my'),
  createItem: (formData) =>
    api.post('/items', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateItem: (id, data) => api.put(`/items/${id}`, data),
  deleteItem: (id) => api.delete(`/items/${id}`),
  updateStatus: (id, status) => api.patch(`/items/${id}/status`, { status }),
};

// ─── Swap Services ─────────────────────────────────────────────────────────
export const swapService = {
  createSwap: (data) => api.post('/swaps', data),
  getMySwaps: () => api.get('/swaps/my'),
  getSwap: (id) => api.get(`/swaps/${id}`),
  updateStatus: (id, status) => api.patch(`/swaps/${id}/status`, { status }),
  getAllSwaps: (params) => api.get('/swaps/admin/all', { params }),
};

// ─── Review Services ───────────────────────────────────────────────────────
export const reviewService = {
  getItemReviews: (itemId) => api.get(`/reviews/item/${itemId}`),
  createReview: (itemId, data) => api.post(`/reviews/item/${itemId}`, data),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
};

// ─── Message Services ──────────────────────────────────────────────────────
export const messageService = {
  getMessages: (swapId) => api.get(`/messages/swap/${swapId}`),
  sendMessage: (swapId, content) => api.post(`/messages/swap/${swapId}`, { content }),
};

// ─── Public Stats Service ────────────────────────────────────────────────
export const statsService = {
  getSustainabilityStats: () => api.get('/items/stats/sustainability'),
};

// ─── Admin Services ────────────────────────────────────────────────────────
export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleBan: (id) => api.patch(`/admin/users/${id}/ban`),
  getItems: (params) => api.get('/admin/items', { params }),
  getPendingItems: () => api.get('/admin/items/pending'),
  approveItem: (id, status) => api.patch(`/admin/items/${id}/status`, { status }),
  getSustainabilityStats: () => api.get('/admin/sustainability'),
};

export default api;
