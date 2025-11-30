// src/utils/axiosInstance.js

import axios from 'axios';

// const axiosInstance = axios.create({
//     baseURL: 'http://localhost:5000/api',
//     headers: { 'Content-Type': 'application/json' },
//     withCredentials: true,
// });
const axiosInstance = axios.create({
    baseURL: 'https://gracious-enchantment-production.up.railway.app/api',
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
});

// === Antrian Permintaan Gagal (Failed Queue Logic) ===
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// === INTERCEPTOR REQUEST (Melampirkan Access Token) ===
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            // Melampirkan Access Token ke setiap permintaan
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// === INTERCEPTOR RESPONSE (Menangani 401 dan Refresh) ===
axiosInstance.interceptors.response.use(
    (response) => response, 
    async (error) => {
        const originalRequest = error.config;
        
        // Kondisi 1: Status 401, permintaan bukan refresh, dan belum dicoba lagi
        if (error.response?.status === 401 && originalRequest.url !== '/auth/refresh' && !originalRequest._retry) {
            
            originalRequest._retry = true; 
            
            // 1. Jika proses refresh sedang berjalan, masukkan permintaan ke antrian
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers['Authorization'] = 'Bearer ' + token;
                    return axiosInstance(originalRequest);
                });
            }

            // 2. Memulai proses refresh
            isRefreshing = true;
            
            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (!refreshToken) {
                    throw new Error("Refresh Token not found.");
                }

                // Panggil endpoint refresh token (Menggunakan Refresh Token di Header)
                const refreshResponse = await axios.post('http://localhost:5000/api/auth/refresh', {}, {
                    headers: {
                        'Authorization': `Bearer ${refreshToken}`
                    }
                });
                
                const newAccessToken = refreshResponse.data.access_token;

                // 3. Simpan access token yang baru
                localStorage.setItem('access_token', newAccessToken);

                // 4. Proses semua permintaan di antrian
                processQueue(null, newAccessToken);
                
                // 5. Coba lagi permintaan asli dengan token baru
                originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
                return axiosInstance(originalRequest);

            } catch (refreshError) {
                // Refresh gagal (Refresh Token kedaluwarsa atau tidak valid)
                processQueue(refreshError, null);
                
                // Logout otomatis dan arahkan ke halaman login
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                // Ganti dengan logic navigasi/redirect framework Anda (misal useNavigate())
                window.location.href = '/login'; 
                return Promise.reject(refreshError);

            } finally {
                isRefreshing = false;
            }
        }
        
        return Promise.reject(error);
    }
);

export default axiosInstance;