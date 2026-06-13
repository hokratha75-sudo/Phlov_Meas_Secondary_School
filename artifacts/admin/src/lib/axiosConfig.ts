import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  withCredentials: true, // Important for cookies (CSRF, session)
});

// CSRF Token storage (in memory only, not localStorage)
let csrfToken: string | null = null;
let isFetchingCsrf = false;
let csrfPromise: Promise<string | null> | null = null;

// Fetch CSRF token from server
export const fetchCsrfToken = async (): Promise<string | null> => {
  // If already fetching, wait for that promise
  if (isFetchingCsrf && csrfPromise) {
    return csrfPromise;
  }
  
  isFetchingCsrf = true;
  csrfPromise = (async () => {
    try {
      const response = await axios.get('/api/csrf-token', { withCredentials: true });
      csrfToken = response.data.csrfToken;
      return csrfToken;
    } finally {
      isFetchingCsrf = false;
      csrfPromise = null;
    }
  })();
  
  return csrfPromise;
};

// Request interceptor - Add CSRF token
api.interceptors.request.use(
  async (config) => {
    // Add CSRF token for state-changing methods
    if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
      if (!csrfToken) {
        await fetchCsrfToken();
      }
      if (config.headers) {
        config.headers['x-csrf-token'] = csrfToken;
      }
    }
    
    // Add auth token if exists
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: any) => Promise.reject(error)
);

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
};

// Response interceptor - Handle auth errors
api.interceptors.response.use(
  (response: any) => response,
  async (error: any) => {
    const originalRequest = error.config;
    
    // Handle CSRF token expiry (403)
    if (error.response?.status === 403 && error.response?.data?.code === 'EBADCSRFTOKEN') {
      csrfToken = null;
      await fetchCsrfToken();
      originalRequest.headers['x-csrf-token'] = csrfToken;
      return api(originalRequest);
    }
    
    // Handle token expiry (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Wait for refresh to complete
        return new Promise((resolve) => {
          refreshSubscribers.push((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        const response = await api.post('/auth/refresh-token');
        const { accessToken } = response.data;
        localStorage.setItem('token', accessToken);
        onRefreshed(accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('admin_user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

export const setupAxiosInterceptors = () => {
  // Initialize CSRF token on app start (only once)
  fetchCsrfToken().catch(console.error);
};

export default api;
