import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const skipRefresh = [
  '/auth/refresh',
  '/auth/login',
  '/auth/register',
  '/auth/logout',
  '/auth/verify-email',
  '/auth/resend-verification',
  '/auth/forgot-password',
  '/auth/reset-password',
];

const hasCookie = (name) =>
  typeof document !== 'undefined' && document.cookie.split('; ').some((item) => item.startsWith(`${name}=`));

let refreshPromise = null;

const refreshSession = () => {
  if (!hasCookie('refreshToken')) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth:session-expired'));
    }
    return Promise.reject(new Error('NO_REFRESH_TOKEN'));
  }

  if (!refreshPromise) {
    refreshPromise = api.post('/auth/refresh').finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const url = original?.url || '';
    const shouldRefresh =
      status === 401 && original && !original._retry && !skipRefresh.some((path) => url.includes(path));

    if (!shouldRefresh) return Promise.reject(error);

    original._retry = true;

    try {
      await refreshSession();
      return api(original);
    } catch (refreshError) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth:session-expired'));
      }
      return Promise.reject(error);
    }
  }
);

export const getApiError = (error) => ({
  message:
    error.response?.data?.message ||
    (error.code === 'ERR_NETWORK'
      ? 'Cannot reach the server. Please check your connection and try again.'
      : 'Something went wrong. Please try again.'),
  code: error.response?.data?.code,
  fields: Array.isArray(error.response?.data?.errors) ? error.response.data.errors : [],
});

export default api;
