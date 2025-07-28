import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { instance } from '../../api/axiosInstance';
import { PRIMARY_BACK_COLOR } from '../../constants/colors';
import Dot from 'react-native-calendars/src/calendar/day/dot';
import { color } from 'framer-motion';
// import { opacity } from 'react-native-reanimated/lib/typescript/Colors';

// 일정 유형별 색상/마킹 타입 설정
const SCHEDULE_TYPE_META = {
  SINGLE: {
    color: '#bf0000ff', 
    markingType: 'custom'
  },
  CONTINUOUS: {
    color: '#7300ffff', // period
    markingType: 'multi-period' // react-native-calendars 지원
  },
  RECURRING: {
    color: '#6ac1ffff', // recur
    markingType: 'dot'
  }
};

const dayOfWeekToIndex = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6
};

const ScheduleCalendar = ({ categoryId, token }) => {
  const [schedules, setSchedules] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState([]);

  useEffect(() => {
    if (categoryId) fetchSchedules();
    // eslint-disable-next-line
  }, [categoryId]);

  const fetchSchedules = async () => {
    try {
      const response = await instance.get(`/schedules`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: 1, size: 10, categoryId }
      });
      setSchedules(response.data.data);
    } catch (error) {
      console.error('Error fetching schedules:', error.response?.data || error.message);
    }
  };

  // 달력에 표시 데이터 만들기 (성능 최적화를 위해 useMemo 사용)

const markedDates = useMemo(() => {
  let result = {};

  schedules.forEach((schedule, idx) => {
    const { startSchedule, endSchedule, scheduleStatus } = schedule;
    const meta = SCHEDULE_TYPE_META[scheduleStatus] || { color: '#CCC', markingType: 'custom' };

    // --- SINGLE 일정
    if (scheduleStatus === 'SINGLE') {
    result[startSchedule] = {
      ...(result[startSchedule] || {}),
      marked: true,
      dots: [
        ...(result[startSchedule]?.dots || []),
        { key: `single-${idx}`, color: meta.color }, // idx 등 고유한 값!
      ],
    };
  }
    // --- CONTINUOUS 일정: 기간 모든 날짜에 dot 추가
    else if (scheduleStatus === 'CONTINUOUS') {
      let current = new Date(startSchedule);
      const end = new Date(endSchedule);

      while (current <= end) {
        const key = current.toISOString().split('T')[0];
        result[key] = {
          ...(result[key] || {}),
          marked: true,
          dots: [
            ...(result[key]?.dots || []),
            { key: `c-${idx}`, color: meta.color },
          ],
        };
        current.setDate(current.getDate() + 1);
      }
    }
    // --- RECURRING 일정: 요일마다 dot 추가
    else if (scheduleStatus === 'RECURRING') {
      const daysOfWeek = schedule.daysOfWeek || [];
      const weekIndexes = daysOfWeek.map(day => dayOfWeekToIndex[day]);
      let currentDate = new Date(startSchedule);
      const endDate = new Date(endSchedule);

      while (currentDate <= endDate) {
        if (weekIndexes.includes(currentDate.getDay())) {
          const formattedDate = currentDate.toISOString().split('T')[0];
          result[formattedDate] = {
            ...(result[formattedDate] || {}),
            marked: true,
            dots: [
              ...(result[formattedDate]?.dots || []),
              { key: `r-${idx}`, color: meta.color },
            ],
          };
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
  });

  if (selectedDate) {
    result[selectedDate] = {
      ...(result[selectedDate] || {}),
      selected: true,
      selectedColor: '#b4bcffff'
    };
  }

  return result;
}, [schedules, selectedDate]);



  // 날짜 터치시(press)
  const handleDayPress = (day) => {
    const filteredSchedules = schedules.filter(
      (schedule) => {
        // 단일, 주기 반복일 때도 스케줄 날짜 전체 포함하도록 수정 필요
        if (schedule.scheduleStatus === 'SINGLE' && schedule.startSchedule === day.dateString) return true;
        if (schedule.scheduleStatus === 'CONTINUOUS') {
          return (
            day.dateString >= schedule.startSchedule &&
            day.dateString <= schedule.endSchedule
          );
        }
        if (schedule.scheduleStatus === 'RECURRING') {
          // 반복 스케줄도 주기에 해당하는지 체크
          const daysOfWeek = schedule.daysOfWeek || [];
          const weekIndexes = daysOfWeek.map(d => dayOfWeekToIndex[d]);
          const target = new Date(day.dateString);
          return (
            day.dateString >= schedule.startSchedule &&
            day.dateString <= schedule.endSchedule &&
            weekIndexes.includes(target.getDay())
          );
        }
        return false;
      }
    );
    if (filteredSchedules.length > 0) {
      setModalData(filteredSchedules);
      setModalVisible(true);
    }
    setSelectedDate(day.dateString);
  };

  console.log("...schedules",schedules)
  const statuses = schedules.map(schedule => schedule.scheduleStatus);
  console.log("statuses = ", statuses);

  // 캘린더 컨트롤
  return (
    <View style={styles.container}>
     <Calendar
        markingType="multi-dot"
        markedDates={markedDates}
        onDayPress={handleDayPress}
        theme={{
          backgroundColor: '#F8F8F8',
          calendarBackground: '#F8F8F8',
          textSectionTitleColor: 'black',
          todayTextColor: '#FF5722',
          arrowColor: '#FFC107',
          monthTextColor: 'black',
          textDayFontWeight: 'bold',
        }}
      />


      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>일정 정보</Text>
            {modalData.map((schedule, index) => (
              <View key={index} style={styles.scheduleItem}>
                <Text>시작: {schedule.startSchedule}</Text>
                <Text>종료: {schedule.endSchedule}</Text>
                <Text>유형: {schedule.scheduleStatus}</Text>
              </View>
            ))}
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButton}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PRIMARY_BACK_COLOR,
    paddingTop: 20,
    paddingHorizontal: 10,
    
    
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  scheduleItem: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 5,
  },
  closeButton: {
    color: '#FF5722',
    marginTop: 20,
    fontWeight: 'bold',
  },
});

export default ScheduleCalendar;  
