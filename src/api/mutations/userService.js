import Toast from 'react-native-toast-message';
import { instance } from '../axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 사용자 등록
export const registerUser = async (userData) => {
  const response = await instance.post('/members', userData);
  console.log('사용자 등록 response ================', response);
  return response.data;
};

// 아이디 찾기
export const findUserId = async (userData) => {
  const response = await instance.post('/members/id', userData);
  return response.data;
};




// 로그dls
// 아이디, 비밀번호 : credentials
export const loginUser = async (credentials) => {
  try {
    await AsyncStorage.setItem("loginInfo", JSON.stringify(credentials))
    const userData =  await AsyncStorage.getItem('loginInfo')
    console.log('loginInfo>>>>>', userData);
    console.log("📤 Sending Login Request:", credentials);

    // 로그인 요청
    //백에서 지금 post 요청 내용 부분이 비어 있어서 제대로 작동 안하고 오류터짐 500
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
    // if(error.response?.data.status === 401){
    //   Toast.show({
    //       type: 'error',
    //       text1: '회원가입 실패!',
    //       text2: '이미 존재하는 이메일입니다.',
    //   })
    // }
    // console.error('❌ Login failed:', error.response?.data || error.message);
    throw error;
  }
};

//비밀번호 변경
// 비밀번호 변경 API 호출
export const patchUserPw = async (data, accessToken) => {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken')
    console.log('newToken', accessToken)
    console.log('data>>', data, accessToken)
    const response = await instance.patch('/members/password', data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log("비밀번호 변경 완료:", response.data);
    return response.data;
  } catch (error) {
    console.error("비밀번호 변경 실패(Service):", error.message);
    
    Toast.show({
      type: 'error',
      text1: '비밀번호 변경 실패!',
      text2: error.message,
      position:'bottom'
    });

    throw error; // Re-throw error for handling in mutation
  }
};

// 회원 탈퇴 API 호출
export const deleteUser = async (email, password, token) => {
 const response = await instance.delete('/members', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: { email, password },
  });
  return response.data;
};
