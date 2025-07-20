import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import * as userService from '../../api/mutations/userService';
import InputWithLabel from '../../components/InputWithLabel';
import PasswordInput from '../../components/PasswordInput';
import { CustomButton } from '../../components/CustomButton';
import { BLACK_COLOR, WHITE_COLOR } from '../../constants/colors';
import RNPickerSelect from 'react-native-picker-select';
import { commonRadio, commonStyles } from '../../constants/styles';
import { CommonRadio } from '../../components/CommonRadio';
import { instance } from '../../api/axiosInstance';
import CommonCheckBox from '../../components/CommonCheckBox';
import { style } from 'framer-motion/client';

// 이메일 유효성 검사 정규식
const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);
// 비밀번호 유효성 검사 (영문+숫자+특수문자 조합, 8~20자)
const isValidPassword = (password) => 
  /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[%,\$,#,@,!].*[%,\$,#,@,!])[A-Za-z\d%,\$,#,@,!]{8,20}$/.test(password);// 전화번호 포맷팅 함수
const isValidNickname = (name) => name.length >= 2 && name.length <= 8;
const isValidPhone = (phone) => /^\d{10,11}$/.test(phone.replace(/-/g, ""));

const formatPhoneNumber = (phoneNumber) => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  if (cleaned.length < 4) return cleaned;
  if (cleaned.length < 7) return cleaned.slice(0, 3) + '-' + cleaned.slice(3);
  return cleaned.slice(0, 3) + '-' + cleaned.slice(3, 7) + '-' + cleaned.slice(7, 11);
};

// 중복 검사 API 요청
const checkDuplicate = async (type, value) => {
  try {
    const url = `/members/${type}`;
    const requestData = type === 'phone' ? { phoneNumber: value } : { [type]: value };
    const response = await instance.post(url, requestData);

    // 상태 코드로 중복 여부 판단
    if (response.status === 200) {
      return false; // 중복 아님
    } else if (response.status === 409) {
      return true; // 중복됨
    } else {
      throw new Error('Unexpected API response.');
    }
  } catch (error) {
    if (error.response && error.response.status === 409) {
      return true; // 중복됨
    } else if (error.response && error.response.status === 400) {
      throw new Error('Invalid input data.');
    } else {
      throw new Error('Network error occurred. Please try again later.');
    }
  }
};

export const RegisterScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [birth, setBirth] = useState('2000');
  const [gender, setGender] = useState('MAN');
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false); // 폼 유효성 상태 추가

  const [isNameDuplicate, setIsNameDuplicate] = useState(false);
  const [isEmailDuplicate, setIsEmailDuplicate] = useState(false);
  const [isPhoneDuplicate, setIsPhoneDuplicate] = useState(false);

  useEffect(() => {
    if (confirmPassword && password !== confirmPassword) {
      setPasswordError('비밀번호가 일치하지 않습니다.');
    } else {
      setPasswordError('');
    }
  }, [password, confirmPassword]);

  // useEffect(() => {
  //   if (confirmPassword && password !== confirmPassword) {
  //     setErrors((prev) => ({ ...prev, password: "비밀번호가 일치하지 않습니다." }));
  //   } else {
  //     setErrors((prev) => ({ ...prev, password: null }));
  //   }
  // }, [password, confirmPassword]);

  ///////////////////////////////
   // 닉네임 입력 핸들러
   const handleNameChange = async (text) => {
    setName(text);
    if (!isValidNickname(text)) {
      setErrors((prev) => ({ ...prev, name: "닉네임은 2~8자 사이여야 합니다." }));
      setIsNameDuplicate(false);
      return;
    }
  
    try {
      const isDuplicate = await checkDuplicate("name", text);
      setIsNameDuplicate(isDuplicate);
      setErrors((prev) => ({
        ...prev,
        name: isDuplicate ? "이미 사용 중인 닉네임입니다." : null,
      }));
    } catch (error) {
      setErrors((prev) => ({ ...prev, name: error.message }));
    }
  };

  // 이메일 입력 핸들러
  const handleEmailChange = async (text) => {
    setEmail(text);
    if (!isValidEmail(text)) {
      setErrors((prev) => ({ ...prev, email: "올바른 이메일 형식이 아닙니다." }));
      setIsEmailDuplicate(false);
      return;
    }
    setErrors((prev) => ({ ...prev, email: null }));

    // 중복 검사 실행
    const isDuplicate = await checkDuplicate("email", text);
    setIsEmailDuplicate(isDuplicate);
    if (isDuplicate) {
      setErrors((prev) => ({ ...prev, email: "이미 가입된 이메일입니다." }));
    }
  };

  // 전화번호 입력 핸들러
  const handlePhoneChange = async (text) => {
    const formattedPhone = formatPhoneNumber(text);
    setPhone(formattedPhone);
    if (!isValidPhone(formattedPhone)) {
      setErrors((prev) => ({ ...prev, phone: "올바른 전화번호를 입력하세요." }));
      setIsPhoneDuplicate(false);
      return;
    }
    setErrors((prev) => ({ ...prev, phone: null }));

    // 중복 검사 실행
    const isDuplicate = await checkDuplicate("phone", formattedPhone);
    setIsPhoneDuplicate(isDuplicate);
    if (isDuplicate) {
      setErrors((prev) => ({ ...prev, phone: "이미 가입된 전화번호입니다." }));
    }
  };
  ///////////////////////////////

  useEffect(() => {
    const isValid =
      isValidEmail(email) &&
      isValidPassword(password) &&
      password === confirmPassword &&
      isValidNickname(name) &&
      isValidPhone(phone) &&
      agreed &&
      !isNameDuplicate && // 닉네임 중복 여부 확인
      !isEmailDuplicate && // 이메일 중복 여부 확인
      !isPhoneDuplicate; // 전화번호 중복 여부 확인
  
    setIsFormValid(isValid); // 유효성 상태 업데이트
  }, [
    email,
    password,
    confirmPassword,
    name,
    phone,
    agreed,
    isNameDuplicate,
    isEmailDuplicate,
    isPhoneDuplicate,
  ]);

  const genderOptions = [
    { label: "남성", value: "MALE" },
    { label: "여성", value: "FEMALE" },
  ];

  const registerMutation = useMutation({
    mutationFn: userService.registerUser,
    onSuccess: () => navigation.navigate('SelectCategories'),
    onError: (error) => setErrors({ server: error.response?.data || '회원가입에 실패했습니다.' }),
  });

  const handleSubmit = () => {
    if (!isFormValid) return;
  
    const initialData = {
      email,
      password,
      name,
      phoneNumber: phone,
      birth,
      gender,
      memberCategories: [], 
    };
    navigation.navigate('SelectCategories', { initialData });
  };
  
  // 비밀번호 입력 핸들러
  const handlePasswordChange = (text) => {
    setPassword(text);
    
    if (!isValidPassword(text)) {
      setErrors((prev) => ({
        ...prev,
        password: "비밀번호는 8~20자, 영문, 숫자, 특수문자 2개 이상 포함해야 합니다.",
      }));
    } else {
      setErrors((prev) => ({ ...prev, password: null })); // 오류 해제
    }
  };
  
  // const handlePhoneChange = (text) => {
  //   const formattedPhone = formatPhoneNumber(text);
  //   setPhone(formattedPhone);
  // };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={[styles.container, commonStyles.container, commonStyles.paddingX]} keyboardShouldPersistTaps="handled">
        <View style={commonStyles.boxContainer}>
        <View style={styles.topBox}>
          <InputWithLabel
            label="닉네임"
            value={name}
            onChangeText={handleNameChange}
            error={errors.name}
            description={errors.name ? <Text>{errors.name}</Text> : ''}
          />
          <InputWithLabel
            label="이메일"
            value={email}
            onChangeText={handleEmailChange}
            error={errors.email}
            description={errors.email ? <Text>{errors.email}</Text> : ''}
          />
          <PasswordInput
            label="비밀번호"
            value={password}
            onChangeText={handlePasswordChange} // 입력 핸들러 연결
            error={errors.password}
            description={errors.password ? <Text>{errors.password}</Text> : ''}
          />
          <PasswordInput
            label="비밀번호 확인"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={passwordError}
            description={passwordError}
          />
          <InputWithLabel
            label="전화번호"
            value={phone}
            onChangeText={handlePhoneChange}
            keyboardType="phone-pad"
            error={errors.phone}
            description={errors.phone ? <Text>{errors.phone}</Text> : ''}
          />

          <View style={styles.selectBox}>
            <View style={commonRadio.container}>
              <CommonRadio value={gender} onChange={setGender} options={genderOptions} />
            </View>
            <RNPickerSelect
              onValueChange={setBirth}
              value={birth}
              style={pickerStyle}
              items={[...Array(35)].map((_, i) => {
                const year = 1990 + i;
                return { label: String(year), value: String(year) };
              })}
            />
          </View>
        </View>

          <View style={styles.botBox}>
            <CommonCheckBox
              label="개인정보 동의"
              value={agreed}
              onValueChange={setAgreed}
              error={errors.agreed}
              errorMessage={errors.errorMessage}
            />
            
            <CustomButton title="회원가입 완료" onPress={handleSubmit} disabled={!isFormValid || registerMutation.isLoading} />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const pickerStyle = StyleSheet.create({
  viewContainer: {
    borderWidth: 1,
    borderColor: BLACK_COLOR,
    borderRadius: 12,
    backgroundColor: 'white',
    width: 140,
  },
  inputAndroid: {
    height: 50,
    color: '#333',
    fontSize: 14,
    paddingLeft: 10,
    paddingRight: 10,
  },
  inputIOS: {
    height: 50,
    color: '#333',
    fontSize: 14,
    paddingLeft: 10,
    paddingRight: 10,
  },
  iconContainer: {
    top: 12,
    right: 12,
  },
});

const styles = StyleSheet.create({
  container: { 
    paddingVertical: 32, 
  },
  
  topBox:{
    display: 'flex', 
    flexDirection: 'column', 
    gap: 16,
  },
  botBox:{
    display: 'flex', 
    flexDirection: 'column', 
    gap: 16,
  },
  checkboxContainer: {  
    width:'100%',
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 10 
  },
  checkboxLabel: {
    marginLeft: 8, 
    fontSize: 14 
  },
  errorText: { 
    color: 'red', 
    fontSize: 12, 
    marginTop: 5 
  },
  selectBox: { 
    width:'100%', 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
});

export default RegisterScreen;
