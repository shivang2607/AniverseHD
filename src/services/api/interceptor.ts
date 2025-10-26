import axios, { type AxiosResponse, AxiosError } from 'axios';
import apiClient from './client';
import { auth } from "../../app/firebase/utils/firebaseinit"

// Request interceptor - Add auth token for Next.js proxy
apiClient.interceptors.request.use(
 async (config) => {
    const token = await auth?.currentUser?.getIdToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor - Handle proxy errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Handle authentication errors from proxy
    if (error.response?.status === 401) {
      console.error('Authentication failed at proxy level:', error.response.data);
    }
    return Promise.reject(error);
  }
);

export default apiClient;