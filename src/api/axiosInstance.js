import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 백엔드 API 주소. EAS Build / 로컬 실행 시 환경변수(EXPO_PUBLIC_API_BASE_URL)로 주입한다.
// 미설정 시 로컬 개발용 주소로 폴백.
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  'https://damoback-production.up.railway.app';

export const instance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// instance.interceptors.request.use(async (config) => {
//   const token = await AsyncStorage.getItem("accessToken");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// }, (error) => {
//   return Promise.reject(error);
// });

instance.interceptors.request.use(
  async (config) => {
    const accessToken = await AsyncStorage.getItem('accessToken'); // 토큰 가져오기
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


// instance.interceptors.response.use(
//   (response) => response, 
//   async (error) => {
//     const originalRequest = error.config;
    
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       try {
//         const refreshToken = await AsyncStorage.getItem("refreshToken");
//         if (!refreshToken) {
//           throw new Error("No refresh token available");
//         }

//         const refreshResponse = await axios.post("https://your-api.com/auth/refresh", { refreshToken });
//         const newAccessToken = refreshResponse.data.accessToken;

//         await AsyncStorage.setItem("accessToken", `Bearer ${newAccessToken}`);
//         originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

//         return instance(originalRequest);
//       } catch (refreshError) {
//         await AsyncStorage.multiRemove(["accessToken", "refreshToken", "userId", "userEmail"]);
//         return Promise.reject(refreshError);
//       }
//     }

//     return Promise.reject(error);
//   }
// );
