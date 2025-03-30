import React, {useState} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppNavigator from './src/navigation/AppNavigator';
import {  AuthProvider } from './src/contexts/AuthProvider';
import { View, Text, LogBox } from 'react-native';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';

// defaultProps 관련 경고 메시지 무시
LogBox.ignoreLogs([
  'Support for defaultProps will be removed from function components',
]);

// 커스텀 토스트 구성
const toastConfig = {
  success: (props) => (
    <View style={{ flexDirection: 'row', backgroundColor: 'green', padding: 10, borderRadius: 8 }}>
      <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>{props.text1}</Text>
      <Text style={{ color: 'white', fontSize: 14 }}>{props.text2}</Text>
    </View>
  ),
  error: (props) => (
    <View style={{ flexDirection: 'row', backgroundColor: 'red', padding: 10, borderRadius: 8 }}>
      <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>{props.text1}</Text>
      <Text style={{ color: 'white', fontSize: 14 }}>{props.text2}</Text>
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

function App() {

  // const [layout, setLayout] = useState({ width: 0, height: 0 });

  // const handleLayout = (event) => {
  //   const { width, height } = event.nativeEvent.layout;
  //   setLayout({ width, height });
  // };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
          <Toast config={toastConfig} />
          {/* <View onLayout={handleLayout} style={{ flex: 1 }}>
            <Text>Width: {layout.width}</Text>
            <Text>Height: {layout.height}</Text>
          </View> */}
          {/* <Stack.Screen name="Register" component={RegisterScreen} /> */}
        </NavigationContainer>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
