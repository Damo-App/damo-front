import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { fetchCategories } from '../../api/queries/categoryService';
import CategoryIcons from '../../components/calendar/CategoryIcons';
import ScheduleCalendar from './ScheduleCalendar';
import { instance } from '../../api/axiosInstance';
import { BLACK_COLOR, PINK_DARK_COLOR, PINK_LIGHT_COLOR, PRIMARY_BACK_COLOR, WHITE_COLOR, YELLOW_LIGHT_COLOR } from '../../constants/colors';
import { borderStyles, commonShadow } from '../../constants/styles';

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
    <SafeAreaView style={{ paddingTop: 30 ,flex: 1 , backgroundColor:PRIMARY_BACK_COLOR}}>
        <CategoryIcons
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
        />
        {selectedCategory && (
          <ScheduleCalendar categoryId={selectedCategory} token={token} />
        )}
        <View style={[styles.infoContainer]}>
          <View style={[styles.infoBox, styles.info1, commonShadow.btnShadow]}><Text style={styles.infoText}>단일 일정 표시</Text></View>
          <View style={[styles.infoBox, styles.info2, commonShadow.btnShadow]}><Text style={styles.infoText}>정기 일정 표시</Text></View>
          <View style={[styles.infoBox, styles.info3, commonShadow.btnShadow]}><Text style={styles.infoText}>연속 일정 표시</Text></View>
        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  infoContainer:{
    // backgroundColor: BLACK_COLOR,
    display: 'flex',
    flexDirection: 'row',
    gap: 8,
    alignItems:'center',
    justifyContent:'center',
    marginTop: 80
  },
  infoBox:{
    width: 'auto',
    backgroundColor: WHITE_COLOR,
    borderRadius:4, 
    paddingHorizontal: 10,
    paddingVertical: 3 ,
    
  },
  info1:{backgroundColor: '#FECBD8'},
  info2:{backgroundColor: '#FFEAB1'},
  info3:{backgroundColor: '#DFC9FA'},
  infoText:{
    fontSize: 12,
    fontWeight: 'bold'
  }
})

export default MainScreen;
