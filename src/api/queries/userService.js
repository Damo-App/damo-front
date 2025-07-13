// queries: src/api/queries
// 데이터를 가져오는 함수들을 관리
import { instance } from '../axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 로그인한 현재 사용자 정보 가져오기
export const getCurrentUser = async () => {
  const memberId = await AsyncStorage.getItem("memberId");
  const token = await AsyncStorage.getItem("accessToken");

  console.log("memberId:", memberId);
  console.log("token:", token);

  if (!token || !memberId) {
    // console.error("Missing token or memberId");
    return null;
  }

  try {
    const response = await instance.get(`/members/${memberId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const user = {
      token,
      memberId,
      ...response.data.data
    };

    await AsyncStorage.setItem('user', JSON.stringify(user));

    console.log("Current User Data:", response.data.data);
    return response.data.data;
  } catch (error) {
    if (error.response?.status === 404) {
      console.error(`User with ID ${memberId} not found.`);
      return null; 
    } else if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(["memberId", "accessToken"]);
      console.error("Unauthorized access, clearing storage.");
      return null;
    } else {
      console.error("Failed to get current user:", error.message || error.response?.data);
      throw error; 
    }
  }
};

// 현재 사용자 name, email, phoneNumber, image 가져오기
export const memberInfo = async () => {
  try {
    const response = await instance.get(`/mypage`);
    console.log("현재 회원정보임####", response.data.data)
    return response.data.data
  } catch(error) {
    console.log('회원 정보 불러오기 실패', error)
  }
}

