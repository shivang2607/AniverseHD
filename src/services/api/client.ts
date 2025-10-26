import axios, { type AxiosInstance } from 'axios';

// Use Next.js proxy instead of direct Cloudflare Worker calls
const API_BASE_URL = '/api/v2/cloudflare';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Increased timeout for proxy + Cloudflare Workers
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;