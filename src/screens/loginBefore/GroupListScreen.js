import React from 'react';
import { View, FlatList, StyleSheet, Text, Image } from 'react-native';
import { CustomButton } from '../../components/CustomButton';
import { commonStyles } from '../../constants/styles';
import GroupListBox from '../../components/GroupListBox';
import { CategoryIcon } from '../../components/CategoryIcon';
import { commonShadow } from '../../constants/styles';
import { useNavigation } from '@react-navigation/native';

function GroupListScreen({navigation}) {

  // const navigation = useNavigation();

  const groups = [
    {
      id: '1',
      image: require('../../../assets/images/groups/tennis.png'),
      title: '테니스 모임',
      text: '안녕하세요! 테니스 모임입니다! 매주 테니스 치는 모임!! 테니스 초보도 환영합니다.',
      isLeader: true,
      currentCount: 15,
      maxCount: 20,
      subCategory: '운동/스포츠',
      tags: ['초보환영', '주 2회', '실내']
    },
    {
      id: '2',
      image: require('../../../assets/images/groups/baseball.png'),
      title: '야구방',
      text: '안녕하세요! 야구방입니다! 매주 야구를 즐기는 모임입니다!',
      isLeader: false,
      currentCount: 15,
      maxCount: 20,
      subCategory: '운동/스포츠',
      tags: ['야구관람', '주말모임', '직장인']
    },
    {
      id: '3',
      image: require('../../../assets/images/groups/food.png'),
      title: '맛집탐방',
      text: '안녕하세요! 맛집탐방 모임입니다! 다양한 맛집을 함께 탐방해요!',
      isLeader: false,
      currentCount: 12,
      maxCount: 15,
      subCategory: '맛집/요리',
      tags: ['맛집투어', '월 1회', '미식가']
    },
    {
      id: '4',
      image: require('../../../assets/images/groups/basketball.png'),
      title: '농구광농구',
      text: '안녕하세요! 농구광농구 모임입니다! 농구를 좋아하는 분들 환영합니다!',
      isLeader: true,
      currentCount: 8,
      maxCount: 40,
      subCategory: '운동/스포츠',
      tags: ['농구', '주 3회', '실외']
    },
    {
      id: '5',
      image: require('../../../assets/images/groups/tennis.png'),
      title: '농친놈들들',
      text: '아마추어 농구팀 모집합니다!',
      isLeader: true,
      currentCount: 8,
      maxCount: 40,
      subCategory: '운동/스포츠',
      tags: ['초보환영', '주 2회', '실내']
    },
    {
      id: '6',
      image: require('../../../assets/images/groups/baseball.png'),
      title: '야살자!',
      text: '야구에 살고 야구에 미치자!',
      isLeader: true,
      currentCount: 8,
      maxCount: 40,
      subCategory: '운동/스포츠',
      tags: ['초보환영', '주 2회', '실내']
    },
    {
      id: '7',
      image: require('../../../assets/images/groups/tennis.png'),
      title: '발로 차는 테니스 모임',
      text: '발로 테니스를 찰 수 있는 사람들만 와라라',
      isLeader: true,
      currentCount: 1,
      maxCount: 100,
      subCategory: '운동/스포츠',
      tags: ['초보환영', '주 2회', '실내']
    },
  ];
  
  return (
    <View style={commonStyles.container}>
      {/* 카테고리 아이콘 */}
      <View style={styles.categoryContainer}>
        <CategoryIcon 
          imageName="Sports"
          style={[styles.categoryIcon, commonShadow.mainShadow]}
          onPress={() => {}}
        />
        <CategoryIcon 
          imageName="Cook"
          style={[styles.categoryIcon, commonShadow.mainShadow]} 
          onPress={() => {}}
        />
        <CategoryIcon 
          imageName="Books"
          style={[styles.categoryIcon, commonShadow.mainShadow]}
          onPress={() => {}}
        />
      </View>
   
      {/* 모임 생성 버튼 */}
      <CustomButton style={styles.createButton} 
        title="모임 생성하기"
        onPress={()=>{navigation.navigate('CreateGroup')}}
      />
      {/* 그룹 리스트 */}
      <FlatList 
        style={{width: '100%', height: '90%'}}
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
        <GroupListBox
            image={item.image}
            title={item.title}
            text={item.text}
            isLeader={item.isLeader}
            currentCount={item.currentCount}
            maxCount={item.maxCount}
            subCategory={item.subCategory}
            tags={item.tags}
          />
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={<View style={{ height: 20 }}/>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F7F7', // 전체 배경색
    paddingHorizontal: 10, // 좌우 여백 추가
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
    gap: 30
  },
  categoryIcon: {
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    padding: 20,
    container: {
      marginHorizontal: 10,
    },
  },
  listContainer: {
    paddingVertical: 10, // 상하 여백 추가
    paddingHorizontal: 10, // FlatList 내부 항목 좌우 패딩 추가 (잘림 방지)
  },
  flatList: {
    width: '100%',
  },
  createButton: {
    marginBottom: 10,
    width: '95%',
  },
});

export default GroupListScreen;