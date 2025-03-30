import React, { createContext, useState, useEffect } from 'react';
import { View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { instance } from '../api/axiosInstance';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isCategorySelected, setIsCategorySelected] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [memberId, setMemberId] = useState(null); 
  const [token, setToken] = useState(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (refreshToken) {
          // Refresh 토큰을 사용하여 새로운 Access 토큰 발급
          const response = await instance.post('/auth/token/refresh', null, {
            headers: { Refresh: refreshToken },
          });
  
          const newAccessToken = response.data.accessToken;
          if (newAccessToken) {
            await AsyncStorage.setItem('accessToken', newAccessToken);
            instance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
  
            const userDataString = await AsyncStorage.getItem('user');
            const userData = userDataString ? JSON.parse(userDataString) : null;
  
            if (userData) {
              setUser(userData);
              setIsLoggedIn(true);
              setIsAdmin(userData.role === 'admin');
            }
          } else {
            throw new Error('Failed to refresh token');
          }
        } else {
          setIsLoggedIn(false); // Refresh 토큰이 없으면 로그아웃 상태로 설정
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        await AsyncStorage.multiRemove([
          'accessToken',
          'refreshToken',
          'user',
          'isCategorySelected',
        ]);
        setIsLoggedIn(false);
        setIsAdmin(false);
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
        isAdmin,
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
