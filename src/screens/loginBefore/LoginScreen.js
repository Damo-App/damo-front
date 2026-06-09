import React, { useState, useContext } from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import InputWithLabel from '../../components/InputWithLabel';
import PasswordInput from '../../components/PasswordInput';
import { CustomButton } from '../../components/CustomButton';
import { AuthContext } from '../../contexts/AuthProvider';
import { useUser } from '../../hooks/useUser';
import { commonBtn, commonStyles } from '../../constants/styles';
import { BLACK_COLOR } from '../../constants/colors';
import { Link, useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { ScrollView } from 'react-native-gesture-handler';
import commons from 'react-native-ui-lib/src/commons';


const isValidUsername = (username) => /\S+@\S+\.\S+/.test(username);

export const LoginScreen = () => {

  const navigation = useNavigation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userError, setUserError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const { login } = useUser();

  const handleSubmit = async () => {
    let hasError = false;

    if (!isValidUsername(username)) {
      setUserError(true);
      hasError = true;
    }

    if (password.length < 8 || password.length > 21) {
      setPasswordError(true);
      hasError = true;
    }

    if (hasError) return;

    try {
      await login({ username, password });
      Toast.show({
        type: 'success',
        text1: '로그인 완료!',
        position: 'bottom',
      });
    } catch (error) {
      console.log(error.response?.data);
      Toast.show({
        type: 'error',
        text1: '로그인 실패!',
        text2: error.message,
        position: 'bottom',
      });
      // alert(error.message || '로그인 실패!');
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, commonStyles.container, commonStyles.paddingX]} keyboardShouldPersistTaps="handled">
    <View style={[commonStyles.centerContainer, styles.loginBox]}>
    {/* <View style={[commonStyles.container, styles.container]}> */}
      <Image source={require('../../../assets/images/loginLogo.png')} style={styles.image} />
      
      <View style={styles.inputBox}>
        <InputWithLabel
          label="아이디"
          placeholder="이메일 형식으로 입력해주세요."
          value={username === '' ? "qwe1@test.co" : username}
          onChangeText={(text) => setUsername(text)}
          error={userError}
          description={userError ? '이메일 형식을 잘못 입력했습니다.' : ''}
        />
        <PasswordInput
          label="비밀번호"
          placeholder="비밀번호를 입력해주세요"
          value={password}
          onChangeText={(text) => setPassword(text)}
          error={passwordError}
          description={passwordError ? '비밀번호 형식이 잘못되었습니다.' : ''}
        />
      </View>

      <View style={styles.btnLinkBox}>
       <CustomButton 
          title="로그인"
          onPress={handleSubmit}
          disabled={username.length < 1 || password.length < 8 || password.length > 21} // 7 → 8 수정
        />
        <View style={styles.linkBox}>
        <Text onPress={() => navigation.navigate('회원가입')} style={styles.linkText}>
          회원가입
        </Text>
        <Text onPress={() => navigation.navigate('아이디 찾기')} style={styles.linkText}>
          아이디 찾기
        </Text>
        </View>
      </View>
    </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    // borderStyle: 'solid',
    // borderColor: BLACK_COLOR,
    // borderWidth: 1,
    fontFamily: 'NotoSansKR-Regular',
    flex: 1,
    justifyContent: 'center',
    // paddingHorizontal: 20,
    display:'flex',
    flexDirection:'column',
    gap: 30,
  },
  loginBox:{
    gap: 30
  },
  inputBox:{
    width:'100%',
    display:'flex',
    flexDirection:'column',
    gap: 8,
  },
  image: {
    width: '100%',
    height: 129,
    resizeMode: 'contain',
  },
  btnLinkBox:{
    width:'100%',
    display: 'flex',
    flexDirection:'column',
    justifyContent:'center',
    gap: 12
  },
  linkBox:{
    width: 'auto',
    display:'flex',
    justifyContent:'center',
    flexDirection:'row',
    gap: 60,
    
  },
  linkText:{
    fontSize: 14,
    fontWeight:500,
    color: BLACK_COLOR, 
    textDecorationLine: 'underline' 
  }
});

export default LoginScreen;
