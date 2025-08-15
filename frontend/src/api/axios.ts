import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { restApiBaseURL } from '@/config';

const api: AxiosInstance = axios.create({
	baseURL: restApiBaseURL,
	headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		const token = localStorage.getItem('token');
		if (token) {
			const url = config.url || '';
			const isAuthEndpoint = url.includes('/auth/jwt/login') || url.includes('/auth/jwt/refresh');
			if (!isAuthEndpoint) {
				const headersAny = (config.headers || {}) as any
				if (typeof headersAny.set === 'function') {
					// AxiosHeaders instance
					if (!headersAny.get?.('Authorization')) {
						headersAny.set('Authorization', `Bearer ${token}`);
					}
				} else {
					// Plain object headers
					if (!config.headers) config.headers = {} as any;
					const writable = config.headers as any
					if (!writable.Authorization) {
						writable.Authorization = `Bearer ${token}`;
					}
				}
			}
		}
		return config;
	},
	(error) => Promise.reject(error)
);

export default api;

