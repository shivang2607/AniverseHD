import axios, { type AxiosResponse, AxiosError } from 'axios';
import apiClient from './client';
import { auth } from "../../app/firebase/utils/firebaseinit"

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
 async (config) => {
    const token =await auth?.currentUser?.getIdToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

export default apiClient;