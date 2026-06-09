import React from 'react';
import { View, TouchableOpacity, Image, Text } from 'react-native';
import { BLACK_COLOR, NAV_BAR_COLOR } from '../constants/colors';

const TAB_ICONS = {
  Main: {
    on: require('../../assets/images/tab/calendar_on.png'),
    off: require('../../assets/images/tab/calendar_off.png'),
  },
  '모임 리스트': {
    on: require('../../assets/images/tab/groupList_on.png'),
    off: require('../../assets/images/tab/groupList_off.png'),
  },
  '채팅': {
    on: require('../../assets/images/tab/chat_on.png'),
    off: require('../../assets/images/tab/chat_off.png'),
  },
  '마이 페이지': {
    on: require('../../assets/images/tab/mypage_on.png'),
    off: require('../../assets/images/tab/mypage_off.png'),
  },
  Home: {
    on: require('../../assets/images/tab/main_on.png'),
    off: require('../../assets/images/tab/main_off.png'),
  },
  '로그인': {
    on: require('../../assets/images/tab/login_on.png'),
    off: require('../../assets/images/tab/login_off.png'),
  },
  '회원가입': {
    on: require('../../assets/images/tab/register_on.png'),
    off: require('../../assets/images/tab/register_off.png'),
  },
};

export default function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View style={{ flexDirection: 'row', backgroundColor: NAV_BAR_COLOR, height: 60 }}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // 탭 이름으로 아이콘 매칭 (없으면 기본 off 아이콘으로 fallback)
        const icons = TAB_ICONS[route.name];
        const iconSource = isFocused
          ? icons?.on
          : icons?.off;

        return (
          <TouchableOpacity
            key={index}
            onPress={onPress}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
          >
            {iconSource ? (
              <Image source={iconSource} style={{ width: 33, height: 27 }} />
            ) : (
              // 아이콘 없으면 탭 이름 텍스트 표시 (디버그용)
              <Text style={{ color: isFocused ? BLACK_COLOR : 'gray' }}>{route.name}</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}


// import { View, TouchableOpacity, Text } from "react-native";
// import { BLACK_COLOR, NAV_BAR_COLOR } from "../constants/colors";

// export default function CustomTabBar({ state, descriptors, navigation }) {
//     return (
//       <View style={{ flexDirection: 'row', backgroundColor: NAV_BAR_COLOR, height: 60 }}>
//         {state.routes.map((route, index) => {
//           const isFocused = state.index === index;
  
//           const onPress = () => {
//             const event = navigation.emit({
//               type: 'tabPress',
//               target: route.key,
//             });
//             if (!isFocused && !event.defaultPrevented) {
//               navigation.navigate(route.name);
//             }
//           };
  
//           return (
//             <TouchableOpacity
//               key={index}
//               onPress={onPress}
//               style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
//             >
//               <Text style={{ color: isFocused ? BLACK_COLOR : 'gray' }}>
//                 {route.name}
//               </Text>
//             </TouchableOpacity>
//           );
//         })}
//       </View>
//     );
//   }
  

  