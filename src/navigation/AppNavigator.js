import React, { useContext, useState , useEffect} from 'react';
import { TouchableOpacity, Text, Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/loginBefore/HomeScreen';
import LoginScreen from '../screens/loginBefore/LoginScreen';
import RegisterScreen from '../screens/loginBefore/RegisterScreen';
import MainScreen from '../screens/loginAfter/MainScreen';
import ProfileScreen from '../screens/loginAfter/ProfileScreen';
import SelectCategories from '../screens/loginBefore/SelectCategories';
import { AuthContext } from '../contexts/AuthProvider';
import { commonStyles } from '../constants/styles';
import IconButton from '../components/IconButton';
import { BORDER_COLOR } from '../constants/colors';
import CustomTabBar from './CustomTabBar';
import { FindIdScreen } from '../screens/loginBefore/FindIdScreen';
import { SuccessFindIdScreen } from '../screens/loginBefore/SuccessFindId';
import MyPageScreen from '../screens/loginAfter/MyPageScreen';
import ChatScreen from '../screens/loginAfter/ChatScreen';
import ChatRoomsScreen from '../screens/loginAfter/ChatRoomsScreen';
import MyGroupsScreen from '../screens/loginAfter/MyGroupsScreen';
import ChangePWScreen from '../screens/loginAfter/ChangePWScreen';
import AdminScreen from '../screens/admin/AdminScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UserListScreen from '../screens/admin/UserListScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import GroupListScreen from '../screens/loginAfter/GroupListScreen';
import CreateGroupScreen from '../screens/loginAfter/CreateGroupScreen';
import GroupDetailScreen from '../screens/loginAfter/GroupDetailScreen';
import { useNavigation } from '@react-navigation/native';
import QuitMemberScreen from '../screens/loginAfter/QuitMemberScreen';
import BoardScreen from '../screens/loginAfter/BoardScreen';
import BoardPostScreen from '../screens/loginAfter/BoardPostScreen';
import SchedulePost from '../screens/loginAfter/SchedulePost';
import BoardDetailsScreen from '../screens/loginAfter/BoardDetailsScreen';
import ScheduleDetails from '../screens/loginAfter/ScheduleDetails';
import BoardUpdateScreen from '../screens/loginAfter/BoardUpdateScreen';
import UpdateCategories from '../screens/loginAfter/UpdateCategories';
import MyBoardScreen from '../screens/loginAfter/MyBoardScreen';
import UpdateGroupScreen from '../screens/loginAfter/UpdateGroupScreen';
import { instance } from '../api/axiosInstance';
import AdminChangePWScreen from '../screens/admin/AdminChangePWScreen';

// 뒤로가기 버튼을 표시하지 않을 화면들
const NO_BACK_BUTTON_SCREENS = [
  'MainTabs', 
  'Home', 
  'Main',
  'Admin',
  'SelectCategories',
  '모임 리스트',
  'Chat',
  'MyPage'
];

const shouldShowBackButton = (routeName) => {
  return !NO_BACK_BUTTON_SCREENS.includes(routeName);
};

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
 // 로그인 여부에 따라서 다른 화면을 탭으로 전환해줌
  // isLoggedIn 값이 true 일경우 로그인후 화면 -> loginAfter
  // isLoggedIn 값이 false 면 로그인 전 화면 -> loginBefore
  function TabNavigator() {
    // const {navigation} = useNavigation();
    // const { isLoggedIn } = useContext(AuthContext);
    const { isLoggedIn, setIsLoggedIn, setUser } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const checkedAutoLogin = async () => {
        try {
          const refreshToken = await AsyncStorage.getItem('refreshToken');
          const email = await AsyncStorage.getItem('email');

          console.log('refreshToken 확인', refreshToken);
          console.log('email 확인', email);
  
          if(email && refreshToken) {
            const res = await instance.post(
            '/auth/token/refresh',
            null,
            {
              headers: {
                Refresh: `Bearer ${refreshToken}`,
              },
            }
          );
          const newAccessToken =
            res.headers['authorization']
            ? res.headers['authorization'].replace('Bearer ', '').trim()
            : null;

            console.log('확인 newAccessToken', newAccessToken)
            if (!newAccessToken) throw new Error('No access token in refresh response');
            if(newAccessToken) {
              await AsyncStorage.setItem('accessToken', newAccessToken);
              instance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
              setIsLoggedIn(true);
              setUser({ refreshToken, email, accessToken: newAccessToken })
            }
          } else {
            setIsLoggedIn(false);
            setUser(null);
          }
        } catch(error) {
          await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'email']);
          setUser(null);
          setIsLoggedIn(false);
          console.log('자동 로그인 실패', error);
        } finally {
          setIsLoading(false);
        }
      };
      checkedAutoLogin();
    }, [setIsLoggedIn, setUser]);

    if(isLoading) return null;
  
    return (
      <Tab.Navigator
        initialRouteName={isLoggedIn ? 'Main' : 'Home'}
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={({ route, navigation }) => ({
          headerShown: true,
          headerStyle: commonStyles.header,
          headerTitleAlign: 'center',
          headerTitle: () => (
            <Text style={commonStyles.headerTitle}>{route.name}</Text>
          ),
          headerLeft: () => {
            // route가 undefined인 경우 처리
            if (!route || !route.name) {
              return null;
            }
            
            // 뒤로가기 버튼을 표시하지 않을 화면들
            if (!shouldShowBackButton(route.name)) {
              return null;
            }
            
            return (
              <IconButton 
                onPress={() => navigation.goBack()} 
                name={"arrow-back"} 
                size={30} 
                color={BORDER_COLOR}
              />
            );
          },
          tabBarShowLabel: false, // 레이블(텍스트) 숨기고 이미지만!
        })}
      >
        {isLoggedIn ? (
          <>
          {/* options={{ headerShown: false }}  */}
            <Tab.Screen name="Main" component={MainScreen} options={{ headerShown: false }}/>
            <Tab.Screen name="모임 리스트" component={GroupListScreen} />
            <Tab.Screen name="채팅" component={ChatScreen} />
            <Tab.Screen name="마이 페이지" component={MyPageScreen} />
          </>
        ) : (
          <>
            <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Tab.Screen name="로그인" component={LoginScreen} />
            <Tab.Screen name="회원가입" component={RegisterScreen} />
          </>
        )}
      </Tab.Navigator>
    );
  }

  export default function AppNavigator() {
    const { isLoggedIn, isCategorySelected } = useContext(AuthContext);
    const [isAdmin, setIsAdmin] = useState(false);
  
    useEffect(() => {
      const checkAdmin = async () => {
        const email = await AsyncStorage.getItem('email');
        if (email === 'admin123@gmail.com') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false); // Reset admin state if email does not match
        }
      };
      checkAdmin();
    }, [isLoggedIn]);
  
    return (
      <Stack.Navigator
        initialRouteName={
          isAdmin ? 'Admin' : !isLoggedIn ? 'MainTabs' : isCategorySelected ? 'MainTabs' : 'SelectCategories'
        }
        screenOptions={({ route, navigation }) => ({
          headerShown: true,
          headerStyle: commonStyles.header,
          headerTitleAlign: 'center',
          headerTitle: () => (
            <Text style={commonStyles.headerTitle}>{route.name}</Text>
          ),
          headerLeft: () => {
            // route가 undefined인 경우 처리
            if (!route || !route.name) {
              return null;
            }
            
            // 뒤로가기 버튼을 표시하지 않을 화면들
            if (!shouldShowBackButton(route.name)) {
              return null;
            }
            
            return (
              <IconButton 
                onPress={() => navigation.goBack()} 
                name={"arrow-back"} 
                size={30} 
                color={BORDER_COLOR}
              />
            );
          },
        })}
      >
        {isAdmin ? (
          <>
          {/* <Stack.Screen name="MainTabs" component={TabNavigator} options={{ headerShown: false }} /> */}
          <Stack.Screen name="Admin" component={AdminScreen} options={{ headerShown: false }} />
          <Stack.Screen name="회원 리스트" component={UserListScreen} />
          <Stack.Screen name="회원 관리" component={UserManagementScreen} />
          <Stack.Screen name="관리자 비밀번호 변경" component={AdminChangePWScreen} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen
            name="GroupDetail"
            component={GroupDetailScreen}
            options={{
              headerTitle: '모임 상세',
              headerStyle: commonStyles.header,
              headerTitleAlign: 'center',
            }}
          />
          <Stack.Screen
            name="BoardDetailsScreen"
            component={BoardDetailsScreen}
            options={{
              headerTitle: '게시물 상세',
              headerStyle: commonStyles.header,
              headerTitleAlign: 'center',
            }}
          />
          </>
        ) : (
          <>
            {!isLoggedIn ? (
              <>
                <Stack.Screen name="MainTabs" component={TabNavigator} options={{ headerShown: false }} />
                <Stack.Screen name="회원가입" component={RegisterScreen} />
                <Stack.Screen name="아이디 찾기" component={FindIdScreen} />
                <Stack.Screen name="SuccessFindId" component={SuccessFindIdScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="카테고리 선택" component={SelectCategories} />
              </>
            ) : (
              <>
                <Stack.Screen name="카테고리 수정" component={UpdateCategories} />
                <Stack.Screen name="내 게시글 조회" component={MyBoardScreen} />
                <Stack.Screen name="MainTabs" component={TabNavigator} options={{ headerShown: false }} />
                <Stack.Screen name="채팅" component={ChatScreen} />
                <Stack.Screen name="ChatRooms" component={ChatRoomsScreen} />
                <Stack.Screen name="내 모임 조회" component={MyGroupsScreen} />
                <Stack.Screen name="비밀번호 변경" component={ChangePWScreen} />
                <Stack.Screen name="회원탈퇴" component={QuitMemberScreen} />
                <Stack.Screen 
                name="BoardScreen" 
                component={BoardScreen} 
                options={{
                  headerTitle: '게시판',
                  headerStyle: commonStyles.header,
                  headerTitleAlign: 'center',
                }}
                />
                <Stack.Screen 
                name="BoardPostScreen" 
                component={BoardPostScreen} 
                options={{
                  headerTitle: '게시판 작성',
                  headerStyle: commonStyles.header,
                  headerTitleAlign: 'center',
                }}
                />
                <Stack.Screen
                name="GroupDetail"
                component={GroupDetailScreen}
                options={{
                  headerTitle: '모임 상세',
                  headerStyle: commonStyles.header,
                  headerTitleAlign: 'center',
                }}
              />
              <Stack.Screen
                name="CreateGroupScreen"
                component={CreateGroupScreen}
                options={{
                  headerTitle: '모임 생성',
                  headerStyle: commonStyles.header,
                  headerTitleAlign: 'center',
                }}
              />
              <Stack.Screen
                name="UpdateGroupScreen"
                component={UpdateGroupScreen}
                options={{
                  headerTitle: '모임 수정',
                  headerStyle: commonStyles.header,
                  headerTitleAlign: 'center',
                }}
              />
              <Stack.Screen
                name="SchedulePost"
                component={SchedulePost}
                options={{
                  headerTitle: '일정 생성',
                  headerStyle: commonStyles.header,
                  headerTitleAlign: 'center',
                }}
              />
              <Stack.Screen
                name="BoardDetailsScreen"
                component={BoardDetailsScreen}
                options={{
                  headerTitle: '게시물 상세',
                  headerStyle: commonStyles.header,
                  headerTitleAlign: 'center',
                }}
              />
              <Stack.Screen
                name="BoardUpdateScreen"
                component={BoardUpdateScreen}
                options={{
                  headerTitle: '게시물 수정',
                  headerStyle: commonStyles.header,
                  headerTitleAlign: 'center',
                }}
              />
              <Stack.Screen
                name="ScheduleDetails"
                component={ScheduleDetails}
                options={{
                  headerTitle: '일정 상세',
                  headerStyle: commonStyles.header,
                  headerTitleAlign: 'center',
                }}
              />
              <Stack.Screen
                name="모임 리스트"
                component={GroupListScreen}
                // options={{
                //   headerTitle: '모임 리스트',
                //   // headerStyle: commonStyles.header,
                //   // headerTitleAlign: 'center',
                // }}
              />
              </>
            )}
          </>
        )}
      </Stack.Navigator>
    );
  }
  
