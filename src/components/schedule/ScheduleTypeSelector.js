import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BLACK_COLOR } from '../../constants/colors';
import { commonRadio } from '../../constants/styles';

/**
 *   ScheduleTypeSelector
 * - 일정 유형(단일일정 / 연속일정 / 정기일정)을 선택하는 라디오 버튼 UI 컴포넌트
 * - 선택된 항목은 selectedOption으로 관리되며, 선택 시 setSelectedOption 호출
 */
const ScheduleTypeSelector = ({ selectedOption, setSelectedOption }) => {
  return (
    <View style={[commonRadio.container, styles.radioGroupContainer]}>
      <View style={[commonRadio.radioGroup, styles.customRadioGroup]}>
        {/* 단일일정 선택 */}
        <View style={styles.radioItemContainer}>
          <TouchableOpacity
            style={styles.radioButtonTouchable}
            onPress={() => setSelectedOption('단일일정')}
          >
            <View style={styles.radioButton}>
              {selectedOption === '단일일정' && <View style={styles.radioSelected} />}
            </View>
          </TouchableOpacity>
          <Text style={commonRadio.radioLabel}>단일일정</Text>
        </View>
        
        {/* 연속일정 선택 */}
        <View style={styles.radioItemContainer}>
          <TouchableOpacity
            style={styles.radioButtonTouchable}
            onPress={() => setSelectedOption('연속일정')}
          >
            <View style={styles.radioButton}>
              {selectedOption === '연속일정' && <View style={styles.radioSelected} />}
            </View>
          </TouchableOpacity>
          <Text style={commonRadio.radioLabel}>연속일정</Text>
        </View>
        
        {/* 정기일정 선택 */}
        <View style={styles.radioItemContainer}>
          <TouchableOpacity
            style={styles.radioButtonTouchable}
            onPress={() => setSelectedOption('정기일정')}
          >
            <View style={styles.radioButton}>
              {selectedOption === '정기일정' && <View style={styles.radioSelected} />}
            </View>
          </TouchableOpacity>
          <Text style={commonRadio.radioLabel}>정기일정</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  radioGroupContainer: {
    marginBottom: 20,
    marginTop: 8,
  },
  customRadioGroup: {
    justifyContent: 'space-between',
    width: '100%',
  },
  radioItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  radioButtonTouchable: {
    padding: 2,
  },
  radioButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BLACK_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BLACK_COLOR,
  },
});

export default ScheduleTypeSelector; 