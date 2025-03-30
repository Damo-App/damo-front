import React from 'react';
import { Modal, View, TouchableOpacity, Text, FlatList, StyleSheet } from 'react-native';
import { BLACK_COLOR, WHITE_COLOR } from '../../constants/colors';

/**
 *   DropdownModal
 * - 드롭다운 선택지(예: 월, 일, 시간, 분 등)를 모달 형태로 보여주는 컴포넌트
 * - 드롭다운 옵션을 FlatList로 렌더링하고, 사용자가 선택 시 값을 상위 컴포넌트로 전달
 */

const DropdownModal = ({ 
  showDropdown, 
  setShowDropdown, 
  options, 
  handleSelectOption 
}) => {
  if (showDropdown === '') return null;
  
  return (
    <Modal
      visible={showDropdown !== ''}
      transparent={true}
      animationType="fade"
    >
    {/* 모달 뒷배경 (누르면 닫힘) */}
      <TouchableOpacity 
        style={styles.modalOverlay}
        onPress={() => setShowDropdown('')}
      >
        {/* 드롭다운 컨테이너 */}
        <View style={styles.dropdownContainer}>
          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => handleSelectOption(item, showDropdown)}
              >
                <Text style={styles.optionText}>{item.label}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dropdownContainer: {
    width: '80%',
    maxHeight: 300,
    backgroundColor: WHITE_COLOR,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BLACK_COLOR,
    overflow: 'hidden',
  },
  optionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    fontSize: 16,
    color: BLACK_COLOR,
  },
});

export default DropdownModal; 