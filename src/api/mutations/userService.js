import { instance } from '../axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 사용자 등록
export const registerUser = async (userData) => {
  const response = await instance.post('/members', userData);
  return response.data;
};

// 아이디 찾기
export const findUserId = async (userData) => {
  const response = await instance.post('/members/id', userData);
  return response.data;
};

// 로그dls
export const loginUser = async (credentials) => {
  try {
    console.log("📤 Sending Login Request:", credentials);

    // 로그인 요청
    const loginResponse = await instance.post('/auth/login', credentials);
    console.log("📥 Login Response:", loginResponse.data);

    // 헤더에서 토큰 및 memberId 추출
    const accessToken = loginResponse.headers?.authorization?.split(" ")[1] || null;
    const refreshToken = loginResponse.headers?.refresh || null;
    const memberId = loginResponse.headers?.memberid || null;

    if (!accessToken || !refreshToken || !memberId) {
      throw new Error('로그인 응답에 유효한 정보가 없습니다.');
    }

    // memberId를 이용해 회원 정보 조회
    const memberResponse = await instance.get(`/members/${memberId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    console.log("📥 Member Response:", memberResponse.data.data);

    const email = memberResponse.data.data?.email || null;
 
    if (!email) {
      throw new Error('회원 정보 조회에 실패하였습니다.');
    }

    // 저장
    await AsyncStorage.setItem('accessToken', accessToken);
    await AsyncStorage.setItem('refreshToken', refreshToken); 
    await AsyncStorage.setItem('memberId', memberId);
    await AsyncStorage.setItem('email', email);

    console.log("✅ Login Success:", { accessToken, refreshToken, memberId, email });

    return { accessToken, refreshToken, memberId, email };
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    throw error;
  }
};

//비밀번호 변경
// 비밀번호 변경 API 호출
export const patchUserPw = async (data) => {
  try {
    const response = await instance.patch('/members/password', data);
    console.log("비밀번호 변경 완료:", response.data);
    return response.data;
  } catch (error) {
    console.error("비밀번호 변경 실패:", error.message);
    
    Toast.show({
      type: 'error',
      text1: '비밀번호 변경 실패!',
      text2: error.message,
    });

    throw error; // Re-throw error for handling in mutation
  }
};
