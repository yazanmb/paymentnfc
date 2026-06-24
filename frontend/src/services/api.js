import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Merchants API
export const merchantsAPI = {
  create: (data) => api.post('/merchants', data),
  getAll: () => api.get('/merchants'),
  getById: (id) => api.get(`/merchants/${id}`),
  update: (id, data) => api.put(`/merchants/${id}`, data),
  delete: (id) => api.delete(`/merchants/${id}`),
};

// Branches API
export const branchesAPI = {
  create: (data) => api.post('/branches', data),
  getAll: () => api.get('/branches'),
  getById: (id) => api.get(`/branches/${id}`),
  getByMerchantId: (merchantId) => api.get(`/branches/merchant/${merchantId}`),
  update: (id, data) => api.put(`/branches/${id}`, data),
  delete: (id) => api.delete(`/branches/${id}`),
};

// Devices API
export const devicesAPI = {
  activate: (data) => api.post('/devices/activate', data),
  getAll: () => api.get('/devices'),
  getById: (id) => api.get(`/devices/${id}`),
  getByBranchId: (branchId) => api.get(`/devices/branch/${branchId}`),
  update: (id, data) => api.put(`/devices/${id}`, data),
  delete: (id) => api.delete(`/devices/${id}`),
};

// Transactions API
export const transactionsAPI = {
  create: (data) => api.post('/create-payment', data),
  checkPayment: (uid) => api.get(`/check-payment/${uid}`),
  getAll: () => api.get('/transactions'),
  getByDeviceId: (deviceId) => api.get(`/transactions/device/${deviceId}`),
  getByMerchantId: (merchantId) => api.get(`/transactions/merchant/${merchantId}`),
  getById: (id) => api.get(`/transactions/${id}`),
};

export default api;
