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

// 서버가 반환하는 이미지 경로는 "/images/..." 같은 상대경로다.
// React Native <Image> 는 절대 URL(https://...)이 필요하므로 항상 이 헬퍼로 변환한다.
// - 값이 없으면 기본 이미지로 폴백
// - 이미 http(s) 절대 URL이면 그대로 사용
export const getImageUrl = (path) => {
  if (!path) return `${API_BASE_URL}/images/noImage.png`;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

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
