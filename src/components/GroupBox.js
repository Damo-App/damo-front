import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { BLACK_COLOR, WHITE_COLOR } from '../constants/colors';
import { commonShadow, commonStyles } from '../constants/styles';

const GroupBox = ({ image, title, text, isLeader, currentCount, maxCount, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={[styles.card, commonShadow.mainShadow]}>
        {/* Image section */}
        {image ? (
          <Image source={{ uri: image }} style={styles.image} onError={(error) => console.log('Image loading error:', error)} />
        ) : (
          <Text style={styles.noImageText}>이미지를 불러올 수 없습니다.</Text>
        )}

        {/* Text section */}
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <View style={styles.leftSection}>
              <View style={styles.circle}></View>
              <Text style={styles.title}>{title}</Text>
              {isLeader && <Text style={styles.leaderTag}>모임장</Text>}
            </View>
            <Text style={styles.count}>
              {currentCount}/{maxCount}
            </Text>
          </View>
          <Text style={styles.description} numberOfLines={2} ellipsizeMode="tail">
            {text}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE_COLOR,
    borderRadius: 15,
    padding: 15,
    marginTop: 15,
    width: '100%',
    alignSelf: 'center',
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#66D3A5',
    marginRight: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: BLACK_COLOR,
    marginRight: 8,
  },
  leaderTag: {
    fontSize: 12,
    color: '#666',
    marginLeft: 'auto',
  },
  count: {
    fontSize: 12,
    color: BLACK_COLOR,
  },
  description: {
    fontSize: 12,
    color: BLACK_COLOR,
    marginTop: -5,
    overflow:'hidden', 
   ellipsizeMode:'tail'
},
});

export default GroupBox;
