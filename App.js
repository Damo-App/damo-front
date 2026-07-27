import React, {useState} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppNavigator from './src/navigation/AppNavigator';
import {  AuthProvider } from './src/contexts/AuthProvider';
import { View, Text, LogBox, Platform, StyleSheet } from 'react-native';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { commonShadow, commonStyles } from './src/constants/styles';
import IconButton from './src/components/IconButton';
import close from 'react-native-vector-icons/MaterialIcons';
import { BLACK_COLOR, WHITE_COLOR } from './src/constants/colors';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';


// defaultProps 관련 경고 메시지 무시
LogBox.ignoreLogs([
  'Support for defaultProps will be removed from function components',
]);

// 커스텀 토스트 구성
const toastConfig = {
  success: (props) => (
    <View style={[commonStyles.toastBox, commonShadow.mainShadow, {backgroundColor:WHITE_COLOR}] }>
      <Text style={commonStyles.toastText}>{props.text1}</Text>
      <IconButton name='close' size={20} color={BLACK_COLOR} onPress={() => props.hide()}/>
    </View>
  ),
  error: (props) => (
    <View style={[commonStyles.toastBox, commonShadow.mainShadow]}>
      <Text style={commonStyles.toastText}>{props.text1}</Text>
      <IconButton name='close' size={20} color={BLACK_COLOR} onPress={() => props.hide()}/>
    </View>
  ),
};

// //성공 메세지
// Toast.show({
//   type: 'success',
//   text1: '회원가입 성공!',
//   text2: '환영합니다!',
// });

// // 오류 메시지
// Toast.show({
//   type: 'error',
//   text1: '회원가입 실패!',
//   text2: '이미 존재하는 이메일입니다.',
// });

const queryClient = new QueryClient();

// 이 앱은 모바일 기준으로 만들어졌기 때문에, 웹에서 열면 화면이 넓게 늘어나 깨진다.
// 웹에서는 화면 가운데에 360px 고정 폭의 "모바일 프레임"으로 렌더링한다.
const isWeb = Platform.OS === 'web';
const MOBILE_WIDTH = 360;

const frameStyles = StyleSheet.create({
  outer: {
    flex: 1,
    ...(isWeb
      ? {
          alignItems: 'center',
          backgroundColor: '#e5e5e5', // 프레임 양옆 여백 배경
        }
      : {}),
  },
  frame: {
    flex: 1,
    width: '100%',
    ...(isWeb
      ? {
          width: MOBILE_WIDTH,
          maxWidth: '100%',
          backgroundColor: '#ffffff',
          overflow: 'hidden',
          // 양옆 경계선 살짝
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderColor: '#d0d0d0',
        }
      : {}),
  },
});

function AppFrame({ children }) {
  return (
    <View style={frameStyles.outer}>
      <View style={frameStyles.frame}>{children}</View>
    </View>
  );
}

function App() {

  // const [layout, setLayout] = useState({ width: 0, height: 0 });

  // const handleLayout = (event) => {
  //   const { width, height } = event.nativeEvent.layout;
  //   setLayout({ width, height });
  // };

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppFrame>
            <SafeAreaView style={{ flex: 1 }}>
              <NavigationContainer>
                <AppNavigator />
              </NavigationContainer>
              <Toast config={toastConfig} />
            </SafeAreaView>
          </AppFrame>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
    // <QueryClientProvider client={queryClient}>
    //   <AuthProvider>
    //     <NavigationContainer>
    //       <AppNavigator />         
    //     </NavigationContainer>
    //     <Toast config={toastConfig}/>
    //   </AuthProvider>
    // </QueryClientProvider>
  );
}

export default App;
