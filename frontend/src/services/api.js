// src/services/api.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

export const authAPI = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
};
export const customerAPI = {
  getAll: () => api.get("/customers"),
  getById: (id) => api.get(`/customers/${id}`),
  search: (q) => api.get("/customers/search", { params: { q } }),
  create: (data) => api.post("/customers", data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
};
export const vehicleAPI = {
  getAll: () => api.get("/vehicles"),
  getById: (id) => api.get(`/vehicles/${id}`),
  getMy: () => api.get("/vehicles/my"),
  create: (data) => api.post("/vehicles", data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  delete: (id) => api.delete(`/vehicles/${id}`),
  search: (q) => api.get(`/vehicles/search?q=${q}`),
};
export const serviceOrderAPI = {
  getAll: () => api.get("/service-orders"),
  getById: (id) => api.get(`/service-orders/${id}`),
  getByCustomer: (cid) => api.get(`/service-orders/customer/${cid}`),
  getByVehicle: (vid) => api.get(`/service-orders/vehicle/${vid}`),
  getByStatus: (status) => api.get(`/service-orders/status/${status}`),
  create: (data) => api.post("/service-orders", data),
  update: (id, data) => api.put(`/service-orders/${id}`, data),
  delete: (id) => api.delete(`/service-orders/${id}`),
};

// ── Parts API — uses multipart/form-data for create/update (supports image) ──
export const partAPI = {
  getAll: () => api.get("/parts"),
  getById: (id) => api.get(`/parts/${id}`),
  search: (q) => api.get("/parts/search", { params: { q } }),
  getLowStock: () => api.get("/parts/low-stock"),

  create: (partData, imageFile) => {
    const form = new FormData();
    form.append(
      "part",
      new Blob([JSON.stringify(partData)], { type: "application/json" }),
    );
    if (imageFile) form.append("image", imageFile);
    return api.post("/parts", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  update: (id, partData, imageFile) => {
    const form = new FormData();
    form.append(
      "part",
      new Blob([JSON.stringify(partData)], { type: "application/json" }),
    );
    if (imageFile) form.append("image", imageFile);
    return api.put(`/parts/${id}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  adjustStock: (id, qty) =>
    api.patch(`/parts/${id}/stock`, null, { params: { quantity: qty } }),
  delete: (id) => api.delete(`/parts/${id}`),
};

export const invoiceAPI = {
  getAll: () => api.get("/invoices"),
  getById: (id) => api.get(`/invoices/${id}`),
  getByOrder: (orderId) => api.get(`/invoices/order/${orderId}`),
  generateFromOrder: (orderId) => api.post(`/invoices/generate/${orderId}`),
  recordPayment: (id, amt, meth) =>
    api.post(`/invoices/${id}/payment`, null, {
      params: { amount: amt, method: meth },
    }),
};
export const userAPI = {
  getAll: () => api.get("/users"),
  getMechanics: () => api.get("/users/mechanics"),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};
export const dashboardAPI = {
  getStats: () => api.get("/dashboard/stats"),
};
export const loyaltyAPI = {
  getStatus: () => api.get("/bookings/loyalty-status"),
};
export const bookingAPI = {
  getAll: () => api.get("/bookings"),
  getUpcoming: () => api.get("/bookings/upcoming"),
  getByVehicle: (vid) => api.get(`/bookings/vehicle/${vid}`),
  getByDate: (date) => api.get(`/bookings/date/${date}`),
  create: (data) => api.post("/bookings", data),
  update: (id, data) => api.put(`/bookings/${id}`, data),
  cancel: (id) => api.patch(`/bookings/${id}/cancel`),
  delete: (id) => api.delete(`/bookings/${id}`),
};
export default api;
