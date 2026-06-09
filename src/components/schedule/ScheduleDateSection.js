import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BLACK_COLOR, PRIMARY_BTN_COLOR, WHITE_COLOR } from '../../constants/colors';

/**
 *   ScheduleDateSection
 * - 일정 등록 시 사용되는 날짜 및 시간 선택 UI 컴포넌트
 * - 일정 유형(단일/연속/정기)에 따라 다른 형태의 UI를 렌더링
 * - 날짜, 시간 드롭다운 버튼 클릭 시 setShowDropdown 호출
 * - 정기 일정의 경우 요일 선택 기능 포함
 */

const ScheduleDateSection = ({ 
  selectedOption, 
  dates, 
  times,
  selectedDays,
  toggleDaySelection,
  setShowDropdown,
  dayOfWeekOptions
}) => {
  const { 
    startMonth, startDay, endMonth, endDay,
    startHour, startMinute, endHour, endMinute 
  } = { ...dates, ...times };

  // 단일 일정 렌더링
  const renderSingleSchedule = () => (
    <View>
      <View style={styles.dateSection}>
        <Text style={styles.label}>일자</Text>
        <View style={[styles.dateRow, styles.singleDateRow]}>
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => setShowDropdown('startMonth')}
          >
            <Text style={styles.dropdownText}>{startMonth}</Text>
            <Icon name="arrow-drop-down" size={20} color={BLACK_COLOR} />
          </TouchableOpacity>
          
          <Text style={styles.dateSeparator}>:</Text>
          
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => setShowDropdown('startDay')}
          >
            <Text style={styles.dropdownText}>{startDay}</Text>
            <Icon name="arrow-drop-down" size={20} color={BLACK_COLOR} />
          </TouchableOpacity>
          
          {/* 시작시간과 같은 레이아웃을 위한 공간 */}
          <Text style={styles.emptyTilde}></Text>
          
          {/* 나머지 공간을 채웁니다 */}
          <View style={styles.spaceFiller}></View>
        </View>
      </View>
      
      {/* 시간 UI */}
      {renderTimeSection()}
    </View>
  );

  // 연속 일정 렌더링
  const renderContinuousSchedule = () => (
    <View>
      <View style={styles.dateSection}>
        <View style={styles.dateLabels}>
          <View style={styles.startDateLabel}>
            <Text style={styles.label}>시작 일자</Text>
          </View>
          <View style={styles.endDateLabel}>
            <Text style={styles.label}>종료 일자</Text>
          </View>
        </View>
        <View style={styles.dateRow}>
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => setShowDropdown('startMonth')}
          >
            <Text style={styles.dropdownText}>{startMonth}</Text>
            <Icon name="arrow-drop-down" size={20} color={BLACK_COLOR} />
          </TouchableOpacity>
          
          <Text style={styles.colon}>:</Text>
          
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => setShowDropdown('startDay')}
          >
            <Text style={styles.dropdownText}>{startDay}</Text>
            <Icon name="arrow-drop-down" size={20} color={BLACK_COLOR} />
          </TouchableOpacity>
          
          <Text style={styles.tilde}>~</Text>
          
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => setShowDropdown('endMonth')}
          >
            <Text style={styles.dropdownText}>{endMonth}</Text>
            <Icon name="arrow-drop-down" size={20} color={BLACK_COLOR} />
          </TouchableOpacity>
          
          <Text style={styles.colon}>:</Text>
          
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => setShowDropdown('endDay')}
          >
            <Text style={styles.dropdownText}>{endDay}</Text>
            <Icon name="arrow-drop-down" size={20} color={BLACK_COLOR} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* 시간 UI */}
      {renderTimeSection()}
    </View>
  );

  // 정기 일정 렌더링
  const renderRegularSchedule = () => (
    <View>
      <View style={styles.dateSection}>
        <View style={styles.dateLabels}>
          <View style={styles.startDateLabel}>
            <Text style={styles.label}>시작 일자</Text>
          </View>
          <View style={styles.endDateLabel}>
            <Text style={styles.label}>종료 일자</Text>
          </View>
        </View>
        <View style={styles.dateRow}>
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => setShowDropdown('startMonth')}
          >
            <Text style={styles.dropdownText}>{startMonth}</Text>
            <Icon name="arrow-drop-down" size={20} color={BLACK_COLOR} />
          </TouchableOpacity>
          
          <Text style={styles.colon}>:</Text>
          
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => setShowDropdown('startDay')}
          >
            <Text style={styles.dropdownText}>{startDay}</Text>
            <Icon name="arrow-drop-down" size={20} color={BLACK_COLOR} />
          </TouchableOpacity>
          
          <Text style={styles.tilde}>~</Text>
          
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => setShowDropdown('endMonth')}
          >
            <Text style={styles.dropdownText}>{endMonth}</Text>
            <Icon name="arrow-drop-down" size={20} color={BLACK_COLOR} />
          </TouchableOpacity>
          
          <Text style={styles.colon}>:</Text>
          
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => setShowDropdown('endDay')}
          >
            <Text style={styles.dropdownText}>{endDay}</Text>
            <Icon name="arrow-drop-down" size={20} color={BLACK_COLOR} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 정기모임 요일 선택 UI */}
      <View style={styles.dateSection}>
        <Text style={styles.label}>정기모임 요일</Text>
        <View style={styles.weekdaysContainer}>
          {dayOfWeekOptions.map(day => (
            <TouchableOpacity
              key={day.id}
              style={[
                styles.dayButton,
                selectedDays.includes(day.id) && styles.selectedDayButton
              ]}
              onPress={() => toggleDaySelection(day.id)}
            >
              <Text 
                style={[
                  styles.dayText,
                  selectedDays.includes(day.id) && styles.selectedDayText
                ]}
              >
                {day.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 시간 UI */}
      {renderTimeSection()}
    </View>
  );

  // 시간 UI 공통 부분
  const renderTimeSection = () => (
    <View style={styles.dateSection}>
      <View style={styles.timeLabels}>
        <View style={styles.startTimeLabel}>
          <Text style={styles.label}>시작시간</Text>
        </View>
        <View style={styles.endTimeLabel}>
          <Text style={styles.label}>종료시간</Text>
        </View>
      </View>
      <View style={styles.dateRow}>
        <TouchableOpacity 
          style={styles.dropdownButton}
          onPress={() => setShowDropdown('startHour')}
        >
          <Text style={styles.dropdownText}>{startHour}</Text>
          <Icon name="arrow-drop-down" size={20} color={BLACK_COLOR} />
        </TouchableOpacity>
        
        <Text style={styles.colon}>:</Text>
        
        <TouchableOpacity 
          style={styles.dropdownButton}
          onPress={() => setShowDropdown('startMinute')}
        >
          <Text style={styles.dropdownText}>{startMinute}</Text>
          <Icon name="arrow-drop-down" size={20} color={BLACK_COLOR} />
        </TouchableOpacity>
        
        <Text style={styles.tilde}>~</Text>
        
        <TouchableOpacity 
          style={styles.dropdownButton}
          onPress={() => setShowDropdown('endHour')}
        >
          <Text style={styles.dropdownText}>{endHour}</Text>
          <Icon name="arrow-drop-down" size={20} color={BLACK_COLOR} />
        </TouchableOpacity>
        
        <Text style={styles.colon}>:</Text>
        
        <TouchableOpacity 
          style={styles.dropdownButton}
          onPress={() => setShowDropdown('endMinute')}
        >
          <Text style={styles.dropdownText}>{endMinute}</Text>
          <Icon name="arrow-drop-down" size={20} color={BLACK_COLOR} />
        </TouchableOpacity>
      </View>
    </View>
  );

  // 일정 유형에 따라 적절한 일자 컴포넌트 렌더링
  const renderDateSection = () => {
    switch(selectedOption) {
      case '단일일정':
        return renderSingleSchedule();
      case '연속일정':
        return renderContinuousSchedule();
      case '정기일정':
        return renderRegularSchedule();
      default:
        return null;
    }
  };

  return renderDateSection();
};

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: BLACK_COLOR,
  },
  dateSection: {
    marginBottom: 16,
  },
  dateLabels: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  startDateLabel: {
    width: '41%',
    paddingLeft: 2,
  },
  endDateLabel: {
    width: '41%',
    marginLeft: 45,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
    padding: 8,
    borderWidth: 1,
    borderColor: BLACK_COLOR,
    borderRadius: 8,
    backgroundColor: WHITE_COLOR,
    width: '20%',
  },
  dropdownText: {
    color: BLACK_COLOR,
    fontSize: 14,
  },
  tilde: {
    marginHorizontal: 5,
    fontSize: 16,
  },
  colon: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 2,
    color: BLACK_COLOR,
  },
  timeLabels: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  startTimeLabel: {
    width: '41%',
    paddingLeft: 2,
  },
  endTimeLabel: {
    width: '41%',
    marginLeft: 45,
  },
  weekdaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  dayButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BLACK_COLOR,
    backgroundColor: WHITE_COLOR,
  },
  selectedDayButton: {
    backgroundColor: PRIMARY_BTN_COLOR,
    borderColor: BLACK_COLOR,
  },
  dayText: {
    fontSize: 14,
    color: BLACK_COLOR,
  },
  selectedDayText: {
    color: WHITE_COLOR,
    fontWeight: '500',
  },
  singleDateRow: {
    justifyContent: 'flex-start',
  },
  dateSeparator: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 7,
    color: BLACK_COLOR,
  },
  emptyTilde: {
    width: 20,
    marginHorizontal: 5,
  },
  spaceFiller: {
    flex: 1,
  },
});

export default ScheduleDateSection; 