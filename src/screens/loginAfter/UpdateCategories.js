import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useNavigation } from '@react-navigation/native';
import CategoryTag from '../../components/CategoryTag';
import { CustomButton } from '../../components/CustomButton';
import * as categoryService from '../../api/queries/categoryService';
import { commonCircle, commonStyles } from '../../constants/styles';
import { AuthContext } from '../../contexts/AuthProvider'; 
import { G_DARKER_COLOR } from '../../constants/colors';
import { instance } from '../../api/axiosInstance';

const UpdateCategories = () => {
  const [categories, setCategories] = useState([]); // 전체 카테고리 목록
  const [selectedCategories, setSelectedCategories] = useState([]); // 선택된 카테고리
  const { width } = Dimensions.get('window');
  const BUTTON_WIDTH = (width - 48) / 3 - 8;

  const navigation = useNavigation();
  const { user, setIsCategorySelected, token } = useContext(AuthContext);

  // 전체 카테고리 및 유저의 선택된 카테고리 가져오기
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // 전체 카테고리 조회
        const allCategories = await categoryService.categoriesList();
        setCategories(allCategories);
        // 로그인한 유저의 선택된 카테고리 조회 (회원가입이 아닌 경우에만) 
        const userInfo = await AsyncStorage.getItem('user');
        if (userInfo) {
          const userCategories = await categoryService.fetchCategories();
          setSelectedCategories(userCategories.map((item) => item.categoryName));
        }
      } catch (error) {
        console.error('Error fetching categories:', error.message);
      }
    };
    fetchInitialData();
  }, [user]);
  
  const toggleCategory = async (category) => {
    if (selectedCategories.includes(category)) {
      let categoryId;
      if(typeof categories[0] === 'object') {
        const found = categories.find((c) => c.categoryName === category);
        categoryId = found?.categoryId;
      } else {
        categoryId = categories.indexOf(category) + 1;
      }

      if(!categoryId) {
        Alert.alert('오류', '카테고리 정보가 올바르지 않습니다.')
        return;
      }

    try {
      const res = await instance.get(`/mypage/groups`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: 1,
          size: 1,
          categoryId: categoryId
        }
      });

      const myGroups = res.data?.data || [];

      if (myGroups.length > 0) {
        Alert.alert('알림', '해당 카테고리에 모임이 존재합니다. 모임 탈퇴 후 수정해주세요.')
        return;
      }

      setSelectedCategories(prev => 
        prev.filter(item => item !== category)
      );
    } catch (e) {
      console.log('e', e)
      Alert.alert('모임 조회 중 오류가 발생하였습니다.')
    }
    return;
  }
    if (selectedCategories.length < 3) {
      setSelectedCategories(prev => [...prev, category]);
    }
  };

  // 수정 시 선택 완료 처리
  const handleCompleteSelectionForUpdate = async () => {
    try {
      if (selectedCategories.length === 0) {
        console.error('No categories selected.');
        return;
      }
  
      const memberCategories = selectedCategories.map((categoryName, index) => {
        const categoryId = categories.indexOf(categoryName) + 1;
        return { categoryId, priority: index + 1 }; 
      });
  
      await categoryService.updateUserCategories({ memberCategories });
      console.log('카테고리 수정 성공:', memberCategories);
  
      await AsyncStorage.setItem('isCategorySelected', 'true');
      setIsCategorySelected(true);
      navigation.replace('MainTabs');
    } catch (error) {
      console.error('카테고리 수정 실패:', error.response?.data || error.message);
    }
  };


  return (
    <ScrollView contentContainerStyle={[styles.container, commonStyles.container]}>
      <View style={[commonStyles.boxContainer]}>
        {/* 카테고리 리스트 */}
        <View style={styles.categoryGrid}>
          {categories.map((category, index) => (
            <CategoryTag
              key={index}
              name={category}
              size={14}
              color="black"
              onSelect={() => toggleCategory(category)}
              selectedOrder={
                selectedCategories.includes(category)
                  ? selectedCategories.indexOf(category) + 1
                  : null
              }
              isDisabled={
                selectedCategories.length >= 3 &&
                !selectedCategories.includes(category)
              }
              buttonWidth={BUTTON_WIDTH}
            />
          ))}
        </View>
        {/* 안내사항 */}
        <View style={styles.noticeContainer}>
          <View style={commonCircle.outer}>
            <View style={commonCircle.inner}></View>
          </View>
          <Text style={styles.noticeText}>
            안내사항{'\n'}
            - 관심사는 최소 1개 최대 3개 선택 가능합니다.{'\n'}
            - 처음 선택한 관심사가 1순위로 지정됩니다.{'\n'}
            - 카테고리는 마이페이지에서 수정이 가능합니다.
          </Text>
        </View>

        {/* 버튼 */}
        <CustomButton
          title="선택 완료"
          onPress={ handleCompleteSelectionForUpdate }
          disabled={selectedCategories.length === 0}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  categoryGrid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-start',
    width: '100%',
  },
  noticeContainer: {
    width: '100%',
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 4,
  },
  noticeText: {
    fontSize: 14,
    color: G_DARKER_COLOR,
    lineHeight: 18,
    textAlign: 'left',
  },
});

export default UpdateCategories;
