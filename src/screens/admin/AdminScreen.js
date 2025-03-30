import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import MenuBar from '../../components/MenuBar';
import { BLACK_COLOR, GREEN_LIGHT_COLOR, NAV_BAR_COLOR, PINK_DARK_COLOR, PINK_LIGHT_COLOR, PRIMARY_BACK_COLOR, WHITE_COLOR } from '../../constants/colors';
import { commonShadow, commonStyles } from '../../constants/styles';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../hooks/useUser';
import { instance } from '../../api/axiosInstance';

const AdminScreen = () => {
  const navigation = useNavigation();
  const { logout } = useUser();

  // const handleLogout = async () => {
  //   try {
  //     await logout(); 
  //     navigation.reset({
  //       index: 0,
  //       routes: [{ name: 'Login' }],
  //     });
  //   } catch (error) {
  //     console.error('Logout failed:', error);
  //   }
  // };
  const handleLogout = async () => {
    try {
      await logout(); // 로그아웃 실행
      // navigation.navigate('Login'); // 로그아웃 후 로그인 화면으로 이동
      navigation.navigate('Admin', { screen: 'Login' });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <View style={[styles.container, commonStyles.container]}>
      {/* 메뉴 항목 */}
      <View style={styles.menuContainer}>
        <MenuBar
          image={require('../../../assets/images/mypage/mypageIcon1.png')}
          text="회원관리"
          style={[styles.menuBar, commonShadow.btnNoBdShadow]}
          iconWrapperStyle={{ backgroundColor: '#FFE1E1', borderRadius: 10 }}
          onPress={() => navigation.navigate('UserList')}
        />
        <MenuBar
          image={require('../../../assets/images/mypage/mypageIcon4.png')}
          text="비밀번호 변경"
          style={[styles.menuBar, commonShadow.btnNoBdShadow]}
          iconWrapperStyle={{ backgroundColor: PRIMARY_BACK_COLOR }}
        />
        <MenuBar
          image={require('../../../assets/images/mypage/mypageIcon6.png')}
          text="로그아웃"
          style={[styles.menuBar, commonShadow.btnNoBdShadow]}
          iconWrapperStyle={{ backgroundColor: GREEN_LIGHT_COLOR }}
          onPress={handleLogout}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  menuBar: {
    width: '100%',
    marginBottom: 12,
  },
  userInfo: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: WHITE_COLOR,
    borderRadius: 15,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BLACK_COLOR,
  },
  userDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  menuContainer: {
    width: '100%',
    flexGrow: 1,
    paddingTop: 20,
    justifyContent: 'flex-start',
  },
});

export default AdminScreen; 