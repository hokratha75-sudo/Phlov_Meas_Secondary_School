import axios from 'axios';

const getBaseUrl = () => {
  const url = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '';
  if (url && !url.endsWith('/api')) {
    return `${url}/api`;
  }
  return url || '/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 30000,
  withCredentials: true, // Important for cookies (session)
});

// CSRF Token storage (in memory only, not localStorage)
let csrfToken: string | null = null;
let isFetchingCsrf = false;
let csrfPromise: Promise<string | null> | null = null;

// Fetch CSRF token from server
export const fetchCsrfToken = async (): Promise<string | null> => {
  if (isFetchingCsrf && csrfPromise) {
    return csrfPromise;
  }
  
  isFetchingCsrf = true;
  csrfPromise = (async () => {
    try {
      const response = await api.get('/csrf-token');
      csrfToken = response.data.csrfToken;
      return csrfToken;
    } catch (e) {
      return null;
    } finally {
      isFetchingCsrf = false;
      csrfPromise = null;
    }
  })();
  
  return csrfPromise;
};

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    // Add CSRF token for state-changing methods
    if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
      if (!csrfToken) {
        await fetchCsrfToken();
      }
      if (config.headers && csrfToken) {
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
    
    // Handle CSRF token expiry (403) - ONLY RETRY ONCE to prevent infinite loop
    if (error.response?.status === 403 && error.response?.data?.code === 'EBADCSRFTOKEN' && !originalRequest._csrfRetry) {
      originalRequest._csrfRetry = true;
      csrfToken = null;
      await fetchCsrfToken();
      
      if (csrfToken && originalRequest.headers) {
        originalRequest.headers['x-csrf-token'] = csrfToken;
        return api(originalRequest);
      }
      // If we still don't have a token, let it fail to avoid loops
      return Promise.reject(error);
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
