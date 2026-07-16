import axios from 'axios';

let rawBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// Strip trailing slash
rawBaseURL = rawBaseURL.replace(/\/$/, '');
// Ensure `/api` prefix unless already present
if (!rawBaseURL.endsWith('/api') && !rawBaseURL.includes('localhost:5000')) {
  rawBaseURL += '/api';
}

const API = axios.create({
  baseURL: rawBaseURL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 — only clear token, don't force-redirect (guests don't need login)
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(err);
  }
);

// ─── Auth ─────────────────────────────────────────────────
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  adminLogin: (data) => API.post('/auth/admin/login', data),
  getMe: () => API.get('/auth/me'),
};

// ─── Hotels / Rooms ───────────────────────────────────────
export const hotelAPI = {
  getAll: () => API.get('/hotels'),
  getOne: (id) => API.get(`/hotels/${id}`),
  getRooms: (params) => API.get('/rooms', { params }),
  getRoom: (id) => API.get(`/rooms/${id}`),
};

// ─── Bookings ─────────────────────────────────────────────
export const bookingAPI = {
  create: (data) => API.post('/bookings', data),
  lookup: (ref, email) => API.get('/bookings/lookup', { params: { ref, email } }),
  getMy: () => API.get('/bookings/my'),
  getOne: (id) => API.get(`/bookings/${id}`),
  cancel: (id) => API.put(`/bookings/${id}/cancel`),
};

// ─── Payments ─────────────────────────────────────────────
export const paymentAPI = {
  process: (data) => API.post('/payments', data),
  getByBooking: (bookingId) => API.get(`/payments/${bookingId}`),
};

// ─── Admin ────────────────────────────────────────────────
export const adminAPI = {
  getStats: () => API.get('/admin/stats'),
  getBookings: (params) => API.get('/admin/bookings', { params }),
  updateBookingStatus: (id, status) => API.put(`/admin/bookings/${id}/status`, { bookingStatus: status }),
  getCustomers: () => API.get('/admin/customers'),
  getRooms: () => API.get('/admin/rooms'),
  createRoom: (data) => API.post('/admin/rooms', data),
  updateRoom: (id, data) => API.put(`/admin/rooms/${id}`, data),
  deleteRoom: (id) => API.delete(`/admin/rooms/${id}`),
};

export default API;
