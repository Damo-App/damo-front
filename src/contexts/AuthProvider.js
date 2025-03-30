import React, { createContext, useState, useEffect } from 'react';
import { View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isCategorySelected, setIsCategorySelected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [memberId, setMemberId] = useState(null); // Add memberId
  const [token, setToken] = useState(null); // Add token

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const accessToken = await AsyncStorage.getItem('accessToken');
        if (accessToken) {
          const userDataString = await AsyncStorage.getItem('user');
          const userData = userDataString ? JSON.parse(userDataString) : null;
          const categoryStatus = await AsyncStorage.getItem('isCategorySelected');

          if (userData) {
            setUser(userData);
            setIsLoggedIn(true);
            setIsCategorySelected(categoryStatus === 'true');
            setMemberId(userData.memberId); 
            setToken(accessToken); 
          } else {
            await AsyncStorage.multiRemove([
              'accessToken',
              'refreshToken',
              'user',
              'isCategorySelected',
            ]);
          }
        }
      } catch (error) {
        console.error('Error checking login status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  const checkStoredToken = async () => {
    const storedToken = await AsyncStorage.getItem("accessToken");
    console.log("저장된 토큰: ", storedToken);
  };
  useEffect(() => {
      checkStoredToken();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        user,
        setUser,
        isCategorySelected,
        setIsCategorySelected,
        memberId,
        token,
      }}
    >
      <View style={{ flex: 1 }}>{children}</View>
    </AuthContext.Provider>
  );
};


// import React, { createContext, useState, useEffect } from 'react';
// import { View } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [user, setUser] = useState(null);
//   const [isCategorySelected, setIsCategorySelected] = useState(false); // 추가
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const checkLoginStatus = async () => {
//       try {
//         const token = await AsyncStorage.getItem('accessToken');
//         if (token) {
//           const userDataString = await AsyncStorage.getItem('user');
//           const userData = userDataString ? JSON.parse(userDataString) : null;
//           const categoryStatus = await AsyncStorage.getItem('isCategorySelected');

//           if (userData) {
//             setUser(userData);
//             setIsLoggedIn(true);
//             setIsCategorySelected(categoryStatus === 'true'); // 불러와서 상태 업데이트
//           } else {
//             await AsyncStorage.multiRemove([
//               'accessToken',
//               'refreshToken',
//               'user',
//               'isCategorySelected', // 카테고리 상태도 초기화
//             ]);
//           }
//         }
//       } catch (error) {
//         console.error('Error checking login status:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     checkLoginStatus();
//   }, []);

//   return (
//     <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, user, setUser, isCategorySelected, setIsCategorySelected }}>
//       <View style={{ flex: 1 }}>{children}</View>
//     </AuthContext.Provider>
//   );
// };
