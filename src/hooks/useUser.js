import React, { useContext, useCallback } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import * as getUserService from '../api/queries/userService';
import * as userService from '../api/mutations/userService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../contexts/AuthProvider';
import { instance } from '../api/axiosInstance';

export const useUser = () => {
  const queryClient = useQueryClient();
  const { setIsLoggedIn } = useContext(AuthContext);

  // user 상태를 useQuery로 관리
  const { data: user, isLoading } = useQuery({
    
    queryKey: ["user"],
    queryFn: getUserService.getCurrentUser,
    staleTime: Infinity,
  });

  console.log("console.log(user)================= ",user);

  const loginMutation = useMutation({
    mutationFn: userService.loginUser,
    onSuccess: async (data) => {
      console.log("useUser = ", data);
      await AsyncStorage.setItem("accessToken", data.accessToken);
      queryClient.setQueryData(["user"], data.users);
      queryClient.invalidateQueries(["user"]);
      setIsLoggedIn(true); // 로그인 성공 시 상태 업데이트
    },
    onError: () => {
      setIsLoggedIn(false); // 로그인 실패 시 상태 초기화
    },
  });

  const login = useCallback(
    async (loginData) => {
      console.log(loginData);
      await loginMutation.mutateAsync(loginData);
    },
    [loginMutation]
  );

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'memberId', 'email']);
      delete instance.defaults.headers.common['Authorization']; 
      queryClient.invalidateQueries(['user']); 
      queryClient.setQueryData(['user'], null);
      setIsLoggedIn(false);
  
      // 네비게이션 스택 초기화 및 로그인 화면으로 이동
      const navigation = useNavigation();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }, [queryClient]);
  

  return { user, login, logout, isLoading };
};
