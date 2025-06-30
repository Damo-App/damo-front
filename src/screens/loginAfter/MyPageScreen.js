import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import MenuBar from '../../components/MenuBar';
import { BLACK_COLOR, GREEN_LIGHT_COLOR, NAV_BAR_COLOR, PINK_DARK_COLOR, PINK_LIGHT_COLOR, PRIMARY_BACK_COLOR, WHITE_COLOR, YELLOW_DARK_COLOR } from '../../constants/colors';
import { commonShadow, commonStyles } from '../../constants/styles';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../hooks/useUser';
import { memberInfo } from '../../api/queries/userService';
 // MenuBar 컴포넌트 import

const MyPageScreen = () => {
  const navigation = useNavigation();
  const { logout } = useUser(); // 로그아웃 함수 가져오기
  const [currentMember, setCurrentMember] = useState([]);

  const fetchMember = async () => {
    try {
      const data = await memberInfo();
      setCurrentMember(data)
    } catch(error) {
      console.log('회원 정보 불러오기 실패!!!', error)
    }
  }

  useEffect(() => {
      fetchMember();
  }, []);
  
    const handleLogout = async () => {
      try {
        await logout(); // 로그아웃 실행
        // navigation.navigate('Login'); // 로그아웃 후 로그인 화면으로 이동
        navigation.navigate('MainTabs', { screen: 'Login' });
      } catch (error) {
        console.error('Logout failed:', error);
      }
    };

  return (
    <ScrollView contentContainerStyle={[styles.container,commonStyles.container]} keyboardShouldPersistTaps="handled">
      {/* 유저 정보 */}
      <View style={[styles.userInfo, commonShadow.mainShadow]}>
        <Image
          source={require('../../../assets/images/mypage/user.png')}
          style={styles.profileImage}
        />
        <View>
          <Text style={styles.userName}>{currentMember.name}</Text>
          <Text style={styles.userDetails}>{currentMember.email}</Text>
          <Text style={styles.userDetails}>{currentMember.phoneNumber}</Text>
        </View>
      </View>

      {/* 메뉴 항목 */}
      <View style={styles.menuContainer}>
        <MenuBar
          image={require('../../../assets/images/mypage/mypageIcon1.png')}
          text="내 모임 조회"
          style={[styles.menuBar, commonShadow.btnNoBdShadow]}
          iconWrapperStyle={{ backgroundColor: YELLOW_DARK_COLOR }}
          onPress={() => {navigation.navigate('내 모임 조회')}}
        />
        <MenuBar
          image={require('../../../assets/images/mypage/mypageIcon2.png')}
          text="내 게시글 조회"
          style={[styles.menuBar, commonShadow.btnNoBdShadow]}
          iconWrapperStyle={{ backgroundColor: NAV_BAR_COLOR }}
        />
        <MenuBar
          image={require('../../../assets/images/mypage/mypageIcon3.png')}
          text="카테고리 수정"
          style={[styles.menuBar, commonShadow.btnNoBdShadow]}
          iconWrapperStyle={{ backgroundColor: PINK_LIGHT_COLOR }}
          onPress={() => {navigation.navigate('카테고리 수정')}}
        />
        <MenuBar
          image={require('../../../assets/images/mypage/mypageIcon4.png')}
          text="비밀번호 변경"
          style={[styles.menuBar, commonShadow.btnNoBdShadow]}
          iconWrapperStyle={{ backgroundColor: PRIMARY_BACK_COLOR }}
          onPress={() => {navigation.navigate('비밀번호 변경')}}
        />
        <MenuBar
          image={require('../../../assets/images/mypage/mypageIcon5.png')}
          text="회원탈퇴"
          style={[styles.menuBar, commonShadow.btnNoBdShadow]}
          iconWrapperStyle={{ backgroundColor: PINK_DARK_COLOR }}
          onPress={() => {navigation.navigate('회원탈퇴')}}
        />
        <MenuBar
          image={require('../../../assets/images/mypage/mypageIcon6.png')}
          text="로그아웃"
          style={[styles.menuBar, commonShadow.btnNoBdShadow]}
          iconWrapperStyle={{ backgroundColor: GREEN_LIGHT_COLOR }}
          onPress={handleLogout}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    width:'100%',

    // backgroundColor: '#F7F3FF',
    // paddingHorizontal: 20,
    // paddingVertical: 30,
  },
  menuBar:{
    width:'100%',
  },
  userInfo: {
    width:'100%',
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
    color: '#333',
  },
  userDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  menuContainer: {
    width:'100%',
    flexGrow: 1,
    justifyContent: 'space-between',
  },
});

export default MyPageScreen;
