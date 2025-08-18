import React, {useState} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppNavigator from './src/navigation/AppNavigator';
import {  AuthProvider } from './src/contexts/AuthProvider';
import { View, Text, LogBox } from 'react-native';
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
      <IconButton name='close' size={20} color={BLACK_COLOR} onPress={() => Toast.hide()}/>
    </View>
  ),
  error: (props) => (
    <View style={[commonStyles.toastBox, commonShadow.mainShadow]}>
      <Text style={commonStyles.toastText}>{props.text1}</Text>
      <IconButton name='close' size={20} color={BLACK_COLOR} onPress={() => Toast.hide()}/>
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
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SafeAreaView style={{ flex: 1 }}>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
            <Toast config={toastConfig} />
          </SafeAreaView>
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
