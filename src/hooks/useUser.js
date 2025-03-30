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
  const { setIsLoggedIn, setIsAdmin } = useContext(AuthContext);

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

  const logout = async (navigation) => {
    try {
      // AsyncStorage 초기화
      await AsyncStorage.clear();
  
      // AuthContext 상태 초기화
      setIsLoggedIn(false);
      setIsAdmin(false);
  
      // 네비게이션 스택 리셋
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }], // 로그인 화면으로 이동
      });
    } catch (error) {
      // console.error('Logout error:', error);
    }
  };
  
  

  return { user, login, logout, isLoading };
};
