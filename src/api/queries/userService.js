// queries: src/api/queries
// 데이터를 가져오는 함수들을 관리
import { instance } from '../axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 로그인한 현재 사용자 정보 가져오기
export const getCurrentUser = async () => {
  const memberId = await AsyncStorage.getItem("memberId");
  const token = await AsyncStorage.getItem("accessToken");

  console.log("memberId, token =============", memberId, token)

  if (!token || !memberId) return null;

  try {
    const response = await instance.get(`/users/${memberId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data.data;
  } catch (error) {
    console.error("Failed to get current user:", error);

    // 401(Unauthorized)일 때만 AsyncStorage 초기화
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(["memberId", "memberEmail", "accessToken"]);
    }
    return null;
  }
};
