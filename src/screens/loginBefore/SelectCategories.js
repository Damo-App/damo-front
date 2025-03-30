import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useNavigation } from '@react-navigation/native';
import CategoryTag from '../../components/CategoryTag';
import { CustomButton } from '../../components/CustomButton';
import * as userService from '../../api/mutations/userService';
import * as categoryService from '../../api/queries/categoryService';
import { commonCircle, commonStyles } from '../../constants/styles';
import { AuthContext } from '../../contexts/AuthProvider'; 
import { BLACK_COLOR, G_DARK_COLOR, G_DARKER_COLOR } from '../../constants/colors';

const SelectCategories = () => {
  const [categories, setCategories] = useState([]); // 전체 카테고리 목록
  const [selectedCategories, setSelectedCategories] = useState([]); // 선택된 카테고리
  const { width } = Dimensions.get('window');
  const BUTTON_WIDTH = (width - 48) / 3 - 8;

  const route = useRoute();
  const navigation = useNavigation();
  const { user, setIsCategorySelected } = useContext(AuthContext);

  const initialData = route.params?.initialData || {}; // 회원가입 데이터 (회원가입 시에만 사용)

  // 회원가입 여부를 판단 (initialData가 있는 경우 회원가입)
  const isRegisteringUser = Object.keys(initialData).length > 0;

  // 전체 카테고리 및 유저의 선택된 카테고리 가져오기
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // 전체 카테고리 조회
        const allCategories = await categoryService.categoriesList();
        setCategories(allCategories);

        // 로그인한 유저의 선택된 카테고리 조회 (회원가입이 아닌 경우에만)
        if (!isRegisteringUser && user) {
          const userCategories = await categoryService.fetchCategories();
          setSelectedCategories(userCategories.map((item) => item.categoryName));
        }
      } catch (error) {
        console.error('Error fetching categories:', error.message);
      }
    };

    fetchInitialData();
  }, [user]);

  // 카테고리 선택 토글
  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : prev.length < 3 ? [...prev, category] : prev
    );
  };

  // 회원가입 시 선택 완료 처리
  const handleCompleteSelectionForRegistration = async () => {
    const memberCategories = selectedCategories.map((categoryName) => {
      const categoryId = categories.indexOf(categoryName) + 1;
      return { categoryId };
    });

    const finalData = { ...initialData, memberCategories };

    try {
      await userService.registerUser(finalData); // 회원가입 API 호출
      console.log('회원가입 성공!', finalData);

      navigation.navigate('MainTabs', { screen: 'Login' }); // 로그인 화면으로 이동
    } catch (error) {
      console.error('회원가입 실패:', error.message);
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
      <View style={commonStyles.boxContainer}>
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

        {/* 버튼 */}
        <CustomButton
          title="선택 완료"
          onPress={
            isRegisteringUser
              ? handleCompleteSelectionForRegistration // 회원가입 처리
              : handleCompleteSelectionForUpdate // 수정 처리
          }
          disabled={selectedCategories.length === 0}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  categoryGrid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-start',
    marginBottom: 16,
    width: '100%',
  },
  noticeContainer: {
    marginBottom: 16,
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

export default SelectCategories;
