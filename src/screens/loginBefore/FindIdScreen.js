import React, { useState, useEffect } from 'react';
import { View,Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import * as userService from '../../api/mutations/userService';
import InputWithLabel from '../../components/InputWithLabel';
import { CustomButton } from '../../components/CustomButton';
// import { formatPhoneNumber } from '../../utils/formatters'; // 전화번호 포맷팅 함수가 별도 파일에 있다면 가져옵니다.
import { commonStyles } from '../../constants/styles';
import Toast from 'react-native-toast-message';

// 닉네임과 전화번호 유효성 검사 함수
const isValidNickname = (name) => name.length >= 2 && name.length <= 8;
const isValidPhoneNumber = (phone) => /^\d{10,11}$/.test(phone.replace(/-/g, ''));
// 전화번호 포맷팅 함수
const formatPhoneNumber = (number) => {
  const cleaned = number.replace(/\D/g, '');
  if (cleaned.length < 4) return cleaned;
  if (cleaned.length < 7) return cleaned.slice(0, 3) + '-' + cleaned.slice(3);
  return cleaned.slice(0, 3) + '-' + cleaned.slice(3, 7) + '-' + cleaned.slice(7, 11);
};
export const FindIdScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);


  // 아이디 찾기 API 호출 로직
  const findIdMutation = useMutation({
    mutationFn: userService.findUserId,
    onSuccess: (data) => {
      // 성공 시 이메일 정보를 다음 화면으로 전달
      navigation.navigate('SuccessFindId', { email: data.data.email });
    },
    onError: (error) => {
      // console.error('아이디 찾기에 실패했습니다:', error.response?.data || error.message);
      // alert('아이디 찾기에 실패했습니다.');
      Toast.show({
        type: 'error',
        text1: '아이디 찾기 실패!',
        position:'bottom'
      });
    },
  });

  const handleNameChange = async (text) => {
    setName(text);
    if (!isValidNickname(text)) {
      setErrors((prev) => ({ ...prev, name: "닉네임은 2~8자 사이여야 합니다." }));
      // setIsNameDuplicate(false);
      return;
    }
    setErrors((prev) => ({ ...prev, name: null }));
    }

     // 전화번호 입력 핸들러
  const handlePhoneChange = async (text) => {
    const formattedPhone = formatPhoneNumber(text);
    setPhone(formattedPhone);
    if (!isValidPhone(formattedPhone)) {
      setErrors((prev) => ({ ...prev, phone: "올바른 전화번호를 입력하세요." }));
      // setIsPhoneDuplicate(false);
      return;
    }
    setErrors((prev) => ({ ...prev, phone: null }));
  };

  useEffect(() => {
    // 폼 유효성 검사
    setIsFormValid(isValidNickname(name) && isValidPhoneNumber(phone));
  }, [name, phone]);

  const handleSubmit = () => {
    if (!isFormValid) return;

    const requestData = {
      name,
      phoneNumber: phone, 
    };

    findIdMutation.mutate(requestData); // API 호출
  };

  // const handlePhoneChange = (text) => {
  //   const formattedPhone = formatPhoneNumber(text);
  //   setPhone(formattedPhone);
  // };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={[styles.container, commonStyles.container]} keyboardShouldPersistTaps="handled">
        <InputWithLabel 
        label="닉네임" 
        value={name} 
        onChangeText={handleNameChange}
        error={errors.name}
        description={errors.name ? <Text>{errors.name}</Text> : ''}
        />
        <InputWithLabel label="전화번호" value={phone} onChangeText={handlePhoneChange} keyboardType="phone-pad" />
        <CustomButton title="아이디 찾기" onPress={handleSubmit} disabled={!isFormValid || findIdMutation.isLoading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
});
