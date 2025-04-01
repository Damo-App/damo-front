import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native';
import { fetchCategories } from '../../api/queries/categoryService';
import CategoryIcons from '../../components/calendar/CategoryIcons';
import ScheduleCalendar from './ScheduleCalendar';
import { instance } from '../../api/axiosInstance';
import { PRIMARY_BACK_COLOR } from '../../constants/colors';

function MainScreen({ memberId, token }) {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // 카테고리 데이터 로드
  useEffect(() => {
    const loadCategories = async () => {
      const data = await fetchCategories(memberId, token);
      setCategories(data);

      if (data.length > 0) {
        setSelectedCategory(data[0].categoryId); // 첫 번째 카테고리를 기본값으로 설정
      }
    };

    loadCategories();
  }, []);

  const handleSelectCategory = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  return (
    <SafeAreaView style={{ flex: 1 , backgroundColor:PRIMARY_BACK_COLOR}}>
      <CategoryIcons
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
      />
      {selectedCategory && (
        <ScheduleCalendar categoryId={selectedCategory} token={token} />
      )}
    </SafeAreaView>
  );
}

export default MainScreen;
