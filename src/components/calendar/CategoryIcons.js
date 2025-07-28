import React from 'react';
import { View, Image, StyleSheet, TouchableWithoutFeedback, Text } from 'react-native';
import { BLACK_COLOR, PRIMARY_COLOR } from '../../constants/colors';
import { commonShadow } from '../../constants/styles';

const categoryIcons = {
  1: require('../../../assets/images/loopimg/left/1.png'),
  2: require('../../../assets/images/loopimg/left/2.png'),
  3: require('../../../assets/images/loopimg/left/3.png'),
  4: require('../../../assets/images/loopimg/left/4.png'),
  5: require('../../../assets/images/loopimg/left/5.png'),
  6: require('../../../assets/images/loopimg/left/6.png'),
  7: require('../../../assets/images/loopimg/left/7.png'),
  8: require('../../../assets/images/loopimg/left/8.png'),
  9: require('../../../assets/images/loopimg/left/9.png'),
  10: require('../../../assets/images/loopimg/left/10.png'),
  11: require('../../../assets/images/loopimg/left/11.png'),
  12: require('../../../assets/images/loopimg/left/12.png'),
  13: require('../../../assets/images/loopimg/left/13.png'),
};

const CategoryIcons = ({ categories, selectedCategory, onSelectCategory }) => {
  return (
    <View style={styles.iconContainer}>
      {categories.map((category) => (
        <TouchableWithoutFeedback
          key={category.categoryId}
          onPress={() => onSelectCategory(category.categoryId)}
        >
          <View
            style={[
              styles.iconBox,
              commonShadow.btnShadow,
              selectedCategory === category.categoryId && styles.selectedIconBox,
            ]}
          >
            <Image source={categoryIcons[category.categoryId]} style={styles.icon} />
            {/* <Text style={styles.categoryText}>{category.categoryName}</Text> */}
          </View>
        </TouchableWithoutFeedback>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 10,
    gap: 10,
  },
  iconBox: {
    padding: 10,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: BLACK_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF', // 기본 배경색
    width: 80,
    height: 80,
  },
  selectedIconBox: {
    backgroundColor: PRIMARY_COLOR, // 선택된 카테고리의 배경색
    // borderColor: '#FF5722',
    // borderWidth: 2,
  },
  icon: {
    width: 40,
    height: 40,
  },
  categoryText: {
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
    color: BLACK_COLOR,
  },
});

export default CategoryIcons;
