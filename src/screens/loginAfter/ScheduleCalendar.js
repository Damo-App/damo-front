import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { instance } from '../../api/axiosInstance';
import { G_DARKER_COLOR, GREEN_LIGHT_COLOR, PINK_DARK_COLOR, PINK_LIGHT_COLOR, PRIMARY_BACK_COLOR } from '../../constants/colors';
import Dot from 'react-native-calendars/src/calendar/day/dot';
import { color } from 'framer-motion';
import { borderStyles, commonShadow, flexStyles } from '../../constants/styles';
// import { opacity } from 'react-native-reanimated/lib/typescript/Colors';

// 일정 유형별 색상/마킹 타입 설정
const SCHEDULE_TYPE_META = {
  SINGLE: {
    color: '#ff6a8fff', 
    backColor: '#FECBD8', 
    markingType: 'custom'
  },
  CONTINUOUS: {
    color: '#ab65ffff', // period
    backColor: '#DFC9FA', // period
    markingType: 'multi-period' // react-native-calendars 지원
  },
  RECURRING: {
    color: '#eab31bff', // recur
    backColor: '#FFEAB1', // recur
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
  const [scheduleDetail, setScheduleDetail] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState([]);

  useEffect(() => {
    if (categoryId) {
      fetchSchedules();
      // fetchScheduleDetail();
    };
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

  const fetchScheduleDetail = async (groupsId, schedulesId) => {
    try{
      const response = await instance.get(`/groups/${groupsId}/schedules/${schedulesId}`);
      setScheduleDetail(response.data.data);
      return response.data.data;
    }catch(error){
      console.error('fetchScheduleDetail Error : ', error.response?.data || error.message);
    }
  }

  console.log("fetchScheduleDetail response ::::: ",scheduleDetail)

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
const handleDayPress = async (day) => {
  const filteredSchedules = schedules.filter((schedule) => {
    if (schedule.scheduleStatus === 'SINGLE' && schedule.startSchedule === day.dateString) return true;
    if (schedule.scheduleStatus === 'CONTINUOUS') {
      return (day.dateString >= schedule.startSchedule && day.dateString <= schedule.endSchedule);
    }
    if (schedule.scheduleStatus === 'RECURRING') {
      const daysOfWeek = schedule.daysOfWeek || [];
      const weekIndexes = daysOfWeek.map(d => dayOfWeekToIndex[d]);
      const target = new Date(day.dateString);
      return (day.dateString >= schedule.startSchedule &&
              day.dateString <= schedule.endSchedule &&
              weekIndexes.includes(target.getDay()));
    }
    return false;
  });

  if (filteredSchedules.length > 0) {
    try {
      // 모든 상세 데이터를 병렬적으로 fetch
      const detailsArray = await Promise.all(
        filteredSchedules.map(sch => fetchScheduleDetail(sch.groupId, sch.groupScheduleId))
      );

      // filteredSchedules와 detailsArray 병합 (예: sch + detail)
      const mergedData = filteredSchedules.map((sch, idx) => {
        return { ...sch, detail: detailsArray[idx] };
      });

      setModalData(mergedData);
      setModalVisible(true);
      console.log("modalData",modalData);
    } catch(error) {
      console.error("fetchScheduleDetail error", error);
    }
  }

  setSelectedDate(day.dateString);
};

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  // 처음 5글자만 취함 -> "10:00:00" => "10:00"
  return timeStr.slice(0, 5);
};

const formatMonthDay = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-'); // ["2025", "07", "31"]
  if (parts.length !== 3) return dateStr;
  const month = parts[1];
  const day = parts[2];
  return `${month}.${day}`;
};

const scheduleStatusText = (status) => {
  if(status === 'SINGLE') {
    return '단일 일정'
  }else if(status === 'RECURRING'){
    return '정기 일정'
  }else if(status === 'CONTINUOUS'){
    return '연속 일정'
  }
}



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
          todayTextColor: '#0793ffff',
          arrowColor: '#FFC107',
          monthTextColor: 'black',
          textDayFontWeight: 'bold',
        }}
      />


      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, commonShadow.mainShadow]}>
            <Text style={styles.modalTitle}>{formatMonthDay(selectedDate)}</Text>
             <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Image source={require('../../../assets/images/icon/close.png')}/>
            </TouchableOpacity>
            {modalData.map((schedule, index) => (
              <View key={index} style={[styles.scheduleItem, borderStyles.border]}>
                {/* 위 */}
                <View style={[flexStyles.spaceBetweenRow]}>
                  <View style={[flexStyles.flexRow, {gap: 8, alignItems:'center'}] }>
                    <View style={{width: 10, height:10, borderRadius: 100, backgroundColor: SCHEDULE_TYPE_META[schedule.scheduleStatus]?.backColor}}>
                      {/* 동그라미 색상 */}
                    </View>
                    <Text style={{paddingBottom:2, fontWeight: 'bold'}}>{schedule.groupName}</Text>
                    <Text style={{fontSize: 10, color: G_DARKER_COLOR}}>{scheduleStatusText(schedule.scheduleStatus)}</Text>
                  </View>
                  <View>
                    <Text>{schedule.detail.memberCount} / {schedule.detail.maxMemberCount}</Text>
                  </View>
                </View>

                {/* 아래 정보 */}
                <View style={[flexStyles.spaceBetweenRow]}>
                  <View>
                    <Text style={{fontSize: 12}}>장소 : {schedule.detail.address}</Text>
                    <Text style={{fontSize: 12}}>시간 : {formatTime(schedule.detail?.startTime) + "~" + formatTime(schedule.detail?.endTime)}</Text>
                  </View>
                  <View style={[styles.goBtn, flexStyles.center, commonShadow.btnShadow, {backgroundColor:SCHEDULE_TYPE_META[schedule.scheduleStatus]?.backColor}]}>
                    <Image source={require('../../../assets/images/icon/right.png')}/>
                  </View>
                </View>
              </View>
            ))}
           
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
  //모달 배경
  modalContainer: {
    // width:'100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  //모달
  modalContent: {
    position:'relative',
    width:'90%',
    backgroundColor: '#FFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  //안에 내용
  scheduleItem: {
    width: '100%',
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
    display:'flex',
    flexDirection:'column',
    gap: 15
  },
  goBtn:{
    width:32,
    height:32,
    borderRadius:8
  },
  closeButton: {
    position:'absolute',
    top: 18,
    right: 20,
    width:'auto',
    height:'auto',
    color: '#FF5722',
    // marginTop: 20,
    fontWeight: 'bold',
  },
});

export default ScheduleCalendar;  
