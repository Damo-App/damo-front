import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BLACK_COLOR, WHITE_COLOR } from '../../constants/colors';

/**
 *   AddressInput 컴포넌트
 * - 사용자가 주소(장소)를 입력하는 대신 "검색" 버튼을 눌러 주소 검색을 유도하는 컴포넌트
 * - 아이콘과 텍스트가 함께 표시되는 터치 가능한 영역
 */
const AddressInput = ({ address, onPress }) => {
  return (
    // 사용자가 터치할 수 있는 입력 박스
    <TouchableOpacity 
      style={styles.addressInputContainer}
      onPress={onPress}
    >
    {/* 검색 아이콘 */}
      <Icon name="search" size={20} color="#888" style={styles.searchIcon} />
    {/* 주소가 있으면 주소 텍스트 표시, 없으면 플레이스홀더 표시 */}  
      <Text style={address ? styles.addressText : styles.addressPlaceholder}>
        {address ? address : "장소를 검색해주세요."}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  addressInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: BLACK_COLOR,
    borderRadius: 8,
    backgroundColor: WHITE_COLOR,
    height: 48,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  addressPlaceholder: {
    color: '#888',
    fontSize: 14,
  },
  addressText: {
    color: BLACK_COLOR,
    fontSize: 14,
  },
});

export default AddressInput; 