import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { BLACK_COLOR, BORDER_COLOR, G_DARK_COLOR, G_LIGHT_COLOR, PRIMARY_BACK_COLOR, WHITE_COLOR } from '../constants/colors';
import CommonTag from './CommonTag';
import { commonShadow } from '../constants/styles';

const GroupListBox = ({ image, title, text, currentCount, maxCount, subCategory, tags = [], onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.card, commonShadow.mainShadow]}>
        {/* 이미지 섹션 */}
        <Image source={image} style={styles.image} />
        {/* 텍스트 섹션 */}
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <View style={styles.leftSection}>
              <View style={styles.circle}></View>
              <Text style={styles.title}>{title}</Text>
            </View>
            <Text style={styles.count}>
              {currentCount}/{maxCount}
            </Text>
          </View>
          <Text style={styles.description} numberOfLines={2} ellipsizeMode="tail">
            {text}
          </Text>
          <View style={styles.tagContainer}>
            {subCategory && (
              <CommonTag
                name={`#${subCategory}`}
                size={10}
                color={BLACK_COLOR}
                customTagStyle={true}
                showCloseButton={false}
                containerStyle={{ backgroundColor: '#EEE333', borderColor: BLACK_COLOR, borderWidth: 0.8, marginLeft: -2}}
              />
            )}
            {tags && tags.map((tag, index) => (
              <CommonTag
                key={index}
                name={tag}
                size={10}
                color={BLACK_COLOR}
                showCloseButton={false}
                containerStyle={{ backgroundColor: '#E6E6FA', marginLeft: 0 }}
              />
            ))}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: WHITE_COLOR,
    borderRadius: 15,
    padding: 10,
    marginVertical: 8,
    width: '100%',
    paddingBottom: 5, // Reduced bottom padding to decrease internal space
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 35, // 원형 이미지
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  circle: {
    width: 10, // 동그라미 크기
    height: 10,
    borderRadius: 5, // 원형으로 만들기 위해 너비/높이의 절반 설정
    backgroundColor: '#66D3A5', // 동그라미 색상 일단 초록색으로 해뒀고 원 안에 원 말고 원 하나만 해뒀습니다 ~
    marginHorizontal: 1, 
    marginTop: 4,
    marginRight: 4,
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    color: BLACK_COLOR,
    flex: 1,
  },
  count: {
    fontSize: 10,
    color: BLACK_COLOR,
    marginLeft: 0,
  },
  description: {
    fontSize: 11,
    color: BLACK_COLOR,
    marginBottom: 8,
    lineHeight: 16,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  subCategoryTag: {
    backgroundColor: '#EEE333',
    borderColor: BLACK_COLOR,
    borderWidth: 1,
  },
  tag: {
    backgroundColor: '#E6E6FA',
  },
});

export default GroupListBox;
