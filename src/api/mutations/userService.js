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



// export const loginUser = async (credentials) => {
//   try {
//     console.log("📤 Sending Login Request:", credentials);

//     const response = await instance.post('/auth/login', credentials, {
//       headers: { 'Content-Type': 'application/json' },
//     });

//     // 헤더에서 토큰 추출
//     const accessToken = response.headers?.authorization?.split(" ")[1] || null;
//     const refreshToken = response.headers?.refresh || null;

//     if (!accessToken || !refreshToken) {
//       throw new Error('로그인 응답에 유효한 토큰이 없습니다.');
//     }

//     // 토큰을 먼저 AsyncStorage에 저장 (API 요청에 필요)
//     await AsyncStorage.setItem('accessToken', accessToken);
//     await AsyncStorage.setItem('refreshToken', refreshToken);

//     console.log("accessToken ===", accessToken);

//     // 사용자 정보 조회 (필수 쿼리 파라미터 추가)
//     // const usersResponse = await instance.get("/members", {
//     //   headers: {
//     //     Authorization: `Bearer ${accessToken}`,
//     //   },
//     //   params: {
//     //     page: 1,  // 기본값 설정
//     //     size: 10, // 기본값 설정
//     //   },
//     // });

//     // console.log("📥 Users Response Data:", usersResponse.data);
//     // const users = usersResponse.data?.content || []; // content 배열을 가져옴

//     // if (!users.length) {
//     //   throw new Error('사용자 정보를 가져오는 데 실패했습니다.');
//     // }

//     // console.log("👤 Retrieved Users:", users);

//     // 사용자 정보 저장
//     // await AsyncStorage.setItem('user', JSON.stringify(users));

//     return { accessToken, refreshToken };
//   } catch (error) {
//     // console.error('❌ Login failed:', error.response?.data || error.message);
//     throw error;
//   }
// };

