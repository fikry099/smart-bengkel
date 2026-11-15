import axios from 'axios';

const createApiClient = (
  tokenKey: 'token' | 'customer_token',
  userKey: 'user' | 'customer_user',
  protectedPath: '/admin' | '/customer',
  loginPath: '/login-admin' | '/auth',
) => {
  const client = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem(tokenKey);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem(tokenKey);
        localStorage.removeItem(userKey);

        if (window.location.pathname.startsWith(protectedPath)) {
          window.location.href = loginPath;
        }
      }
      return Promise.reject(error);
    },
  );

  return client;
};

const API = createApiClient('token', 'user', '/admin', '/login-admin');
export const CustomerAPI = createApiClient('customer_token', 'customer_user', '/customer', '/auth');

export default API;