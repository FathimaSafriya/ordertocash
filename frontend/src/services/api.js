import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Response interceptor for consistent error extraction
client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorData = error.response?.data?.error || {
      code: 'NETWORK_ERROR',
      message: error.message || 'Unable to connect to credit release backend service.',
    };
    return Promise.reject(errorData);
  }
);

export const api = {
  getHealth: () => client.get('/health'),
  getKpis: () => client.get('/dashboard/kpis'),
  getOrders: (params) => client.get('/orders', { params }),
  getOrderById: (id) => client.get(`/orders/${id}`),
  getOrderRisk: (id) => client.get(`/orders/${id}/risk`),
  getAiAssessment: (id) => client.post(`/orders/${id}/ai-assessment`),
  releaseOrder: (id, data) => client.post(`/orders/${id}/release`, data),
  holdOrder: (id, data) => client.post(`/orders/${id}/hold`, data),
  escalateOrder: (id, data) => client.post(`/orders/${id}/escalate`, data),
  getCustomerById: (id) => client.get(`/customers/${id}`),
  login: (credentials) => client.post('/auth/login', credentials),
  getDemoCredentials: () => client.get('/auth/demo-credentials'),
};

export default api;
