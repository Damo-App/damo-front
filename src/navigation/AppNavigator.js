import React, { useContext, useState , useEffect} from 'react';
import { TouchableOpacity, Text } from 'react-native';
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
import GroupListScreen from '../screens/loginBefore/GroupListScreen';
import CreateGroupScreen from '../screens/loginAfter/CreateGroupScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
 // 로그인 여부에 따라서 다른 화면을 탭으로 전환해줌
  // isLoggedIn 값이 true 일경우 로그인후 화면 -> loginAfter
  // isLoggedIn 값이 false 면 로그인 전 화면 -> loginBefore
  function TabNavigator() {
    const { isLoggedIn } = useContext(AuthContext);
  
    return (
      <Tab.Navigator
        initialRouteName={isLoggedIn ? 'Main' : 'Home'}
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: true,
          headerStyle: commonStyles.header,
          headerTitleAlign: 'center',
        }}
      >
        {isLoggedIn ? (
          <>
          {/* options={{ headerShown: false }}  */}
            <Tab.Screen name="Main" component={MainScreen} />
            <Tab.Screen name="모임 리스트" component={GroupListScreen} />
            <Tab.Screen name="Chat" component={ChatScreen} />
            <Tab.Screen name="MyPage" component={MyPageScreen} />
          </>
        ) : (
          <>
            <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Tab.Screen name="Login" component={LoginScreen} />
            <Tab.Screen name="Register" component={RegisterScreen} />
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
        if (email === 'h4@gmail.com') {
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
      >
        {isAdmin ? (
          <>
          {/* <Stack.Screen name="MainTabs" component={TabNavigator} options={{ headerShown: false }} /> */}
          <Stack.Screen name="Admin" component={AdminScreen} options={{ headerShown: false }} />
          <Stack.Screen name="UserList" component={UserListScreen} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          </>
        ) : (
          <>
            {!isLoggedIn ? (
              <>
                <Stack.Screen name="MainTabs" component={TabNavigator} options={{ headerShown: false }} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="FindId" component={FindIdScreen} />
                <Stack.Screen name="SuccessFindId" component={SuccessFindIdScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="SelectCategories" component={SelectCategories} />
              </>
            ) : (
              <>
                <Stack.Screen name="카테고리 수정" component={SelectCategories} />
                <Stack.Screen name="MainTabs" component={TabNavigator} options={{ headerShown: false }} />
                <Stack.Screen name="Chat" component={ChatScreen} />
                <Stack.Screen name="ChatRooms" component={ChatRoomsScreen} />
                <Stack.Screen name="내 모임 조회" component={MyGroupsScreen} />
                <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
                <Stack.Screen name="비밀번호 변경" component={ChangePWScreen} />
              </>
            )}
          </>
        )}
      </Stack.Navigator>
    );
  }
  
  // 로그인 후에 카테고리 선택 창이 자꾸 뜨는거 방지 하기 위해 만듬
  // 로그인 후에 카테고리 선택 했는지 여부에 따라서 카테고리 창 뜨고 안뜨고 근데 로그인 후에 뜨는게 말이 안되긴함
  // 위에를 해결 못해서 일단 수동으로 막음

  //isLoggedIn = 로그인 상태
  //isCategorySelected = 로그인 후 유저가 카테고리를 선택했는지 여부
  // export default function AppNavigator() {
  //   const { isLoggedIn, isCategorySelected } = useContext(AuthContext);
  
  //   return (
  //     <Stack.Navigator
  //       initialRouteName={
  //         !isLoggedIn ? 'MainTabs' : isCategorySelected ? 'MainTabs' : 'SelectCategories'
  //       }
  //       screenOptions={({ navigation }) => ({
  //         headerShown: true,
  //         headerStyle: commonStyles.header,
  //         headerTitleAlign: 'center',
  //         headerTitle: ({ children }) => (
  //           <Text style={commonStyles.headerTitle}>{children}</Text>
  //         ),
  //         headerLeft: () =>
  //           navigation.canGoBack() ? (
  //             <TouchableOpacity style={commonStyles.backButton}>
  //               <IconButton
  //                 onPress={() => navigation.goBack()}
  //                 name="arrow-back"
  //                 size={30}
  //                 color={BORDER_COLOR}
  //               />
  //             </TouchableOpacity>
  //           ) : null,
  //       })}
  //     >
  //       {/* 로그인 전 */}
  //       {!isLoggedIn ? (
  //         <>
  //           <Stack.Screen name="MainTabs" component={TabNavigator} options={{ headerShown: false }} />
  //           <Stack.Screen name="Register" component={RegisterScreen} />
  //           <Stack.Screen name="FindId" component={FindIdScreen} />
  //           <Stack.Screen name="SuccessFindId" component={SuccessFindIdScreen} />
  //           <Stack.Screen name="Login" component={LoginScreen} />
  //           <Stack.Screen name="SelectCategories" component={SelectCategories} />
  //         </>
  //       ) : (
  //         <>
  //           {/* 로그인 후 + 카테고리 선택 안 했을 때는 SelectCategories로 이동 */}
  //           <Stack.Screen name="카테고리 수정" component={SelectCategories} />
  //           {/* options={{ headerShown: false }}  */}
  //           <Stack.Screen name="MainTabs" component={TabNavigator}  options={{ headerShown: false }}/>
  //           <Stack.Screen name="Chat" component={ChatScreen} />
  //           <Stack.Screen name="ChatRooms" component={ChatRoomsScreen} />
  //           <Stack.Screen name="내 모임 조회" component={MyGroupsScreen} />
  //           <Stack.Screen name="비밀번호 변경" component={ChangePWScreen} />
  //         </>
  //       )}
  //     </Stack.Navigator>
  //   );
  // }
  
