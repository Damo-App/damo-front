import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { commonShadow, commonStyles } from '../../constants/styles';
import MenuBar from '../../components/MenuBar';
import { YELLOW_DARK_COLOR } from '../../constants/colors';
import { instance } from '../../api/axiosInstance';

import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../contexts/AuthProvider';


const validateImages = () => {
  try {
    //Category 이미지 유효성 검사 (null, undefined, false 등 falsy값이면 강제로 Error thorw)
    Object.values(categoryImages).forEach(image => {
      if (!image) {
        throw new Error('Missing image file');
      }
    });
    return true;
  } catch (error) {
    console.error('Image validation failed:', error);
    return false;
  }
};

const categoryImages = {
  1: require('../../../assets/images/category/Sports.png'),
  2: require('../../../assets/images/category/Languages.png'), 
  3: require('../../../assets/images/category/MusicInstrument.png'),
  4: require('../../../assets/images/category/Dance.png'),
  5: require('../../../assets/images/category/Pets.png'),
  6: require('../../../assets/images/category/Society.png'),
  7: require('../../../assets/images/category/Cook.png'),
  8: require('../../../assets/images/category/Game.png'),
  9: require('../../../assets/images/category/Photo.png'),
  10: require('../../../assets/images/category/Books.png'),
  11: require('../../../assets/images/category/Music.png'),
  12: require('../../../assets/images/category/Car.png'),
  13: require('../../../assets/images/category/Travel.png')
};

const getCategoryImage = (categoryId) => {
  return categoryImages[categoryId] || categoryImages[1]; // 기본값으로 category1.png 사용
};

const getCategoryName = (categoryId) => {
  const categoryNames = {
    1: "스포츠",
    2: "언어",
    3: "악기",
    4: "댄스",
    5: "반려동물",
    6: "사교",
    7: "요리/레시피",
    8: "게임/오락",
    9: "사진/영상",
    10: "독서",
    11: "노래",
    12: "자동차",
    13: "여행"
  };
  return categoryNames[categoryId] || "기타";
};

function ChatScreen({ navigation }) {
  const [memberCategories, setMemberCategories] = useState([]);

  useEffect(() => {
    const isValid = validateImages();
    if (!isValid) {
      console.warn('Some category images are missing. Please check the assets folder.');
    }
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await instance.get('/chatrooms'); 
        setMemberCategories(res.data.data); 
      } catch (err) {
        console.error('채팅방 접속 에러(카테고리 불러오기 실패):', err);
      }
    };
    fetchCategories();
  }, []);

  return (
    <View style={commonStyles.container}>
      {memberCategories.map((category, index) => (
        <MenuBar
          key={category.chatroomId || index} // Ensure unique keys
          image={getCategoryImage(category.categoryId)}
          text={getCategoryName(category.categoryId)}
          style={[styles.menuBar, commonShadow.btnNoBdShadow]}
          iconWrapperStyle={{ backgroundColor: YELLOW_DARK_COLOR }}
          onPress={() =>
            navigation.navigate('ChatRooms', {
              chatroomId: category.categoryId,
              categoryId: category.categoryId,
              categoryName: getCategoryName(category.categoryId),
            })
          }
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  menuBar: {
    width: '100%',
  },
});

export default ChatScreen;
