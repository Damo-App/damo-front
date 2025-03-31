import React from 'react';
import { View, Text, StyleSheet, Clipboard } from 'react-native';
import Toast from 'react-native-toast-message'; // Toast를 사용하기 위해 추가
import { commonStyles } from '../../constants/styles';
import IconButton from '../../components/IconButton'; // IconButton 컴포넌트 임포트
import { BLACK_COLOR } from '../../constants/colors';
import { CustomButton } from '../../components/CustomButton';

export const SuccessFindIdScreen = ({ route }) => {
  const { email } = route.params; // 이전 화면에서 전달된 이메일 정보

  // 이메일 복사 함수
  const handleCopyEmail = () => {
    Clipboard.setString(email); // 이메일을 클립보드에 복사
    Toast.show({
      type: 'success',
      text1: '아이디가 복사되었습니다.',
      position: 'bottom',
    });
  };

  const handleGoToLogin = () => {
    console.log('로그인 화면으로 이동'); // 실제 네비게이션 로직 추가 필요
  };

  return (
    <View style={commonStyles.container}>
      <Text style={styles.title}>회원님의 아이디는</Text>
      <View style={styles.emailContainer}>
        <Text style={styles.emailValue}>{email}</Text>
        <IconButton 
          name="content-copy" 
          size={24} 
          color="#007BFF" 
          onPress={handleCopyEmail} 
        />
      </View>
      <Text style={styles.subtitle}>입니다.</Text>

      {/* 로그인 하러 가기 버튼 */}
      <CustomButton 
        title="로그인 하러 가기" 
        onPress={handleGoToLogin} 
        style={styles.loginButton} 
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#F8F8F8', // 배경색 설정
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10
  },
  emailContainer: {
    flexDirection: 'row', // 텍스트와 아이콘을 가로로 배치
    alignItems: 'center',
    marginBottom: 10,
  },
  emailValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BLACK_COLOR,
    marginRight: 8, // 텍스트와 아이콘 간격
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 30
  },
});
