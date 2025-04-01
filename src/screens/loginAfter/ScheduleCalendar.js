// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
// import { Calendar } from 'react-native-calendars';
// import { instance } from '../../api/axiosInstance';

// const ScheduleCalendar = ({ categoryId, token }) => {
//   const [schedules, setSchedules] = useState([]);
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [modalData, setModalData] = useState([]);

//   // 일정 조회 API 호출
//   const fetchSchedules = async () => {
//     try {
//       const response = await instance.get(`/schedules`, {
//         headers: { Authorization: `Bearer ${token}` },
//         params: { page: 1, size: 10, categoryId },
//       });
//       setSchedules(response.data.data);
//     } catch (error) {
//       console.error('Error fetching schedules:', error.response?.data || error.message);
//     }
//   };

//   useEffect(() => {
//     if (categoryId) fetchSchedules();
//   }, [categoryId]);

//   // 날짜 표시 스타일 생성
//   const markedDates = {};
//   schedules.forEach((schedule) => {
//     const { startSchedule, endSchedule, scheduleStatus } = schedule;

//     if (scheduleStatus === 'SINGLE') {
//       // 단일 일정
//       markedDates[startSchedule] = {
//         customStyles: {
//           container: { backgroundColor: '#FECBD8', borderRadius: 5 },
//           text: { color: '#333333', fontWeight: 'bold' },
//         },
//       };
//     } else if (scheduleStatus === 'CONTINUOUS') {
//       // 연속 일정
//       let currentDate = new Date(startSchedule);
//       const endDate = new Date(endSchedule);

//       while (currentDate <= endDate) {
//         const formattedDate = currentDate.toISOString().split('T')[0];
//         markedDates[formattedDate] = {
//           customStyles: {
//             container: { backgroundColor: '#DFC9FA', borderRadius: 5 },
//             text: { color: 'black' },
//           },
//         };
//         currentDate.setDate(currentDate.getDate() + 1);
//       }
//     } else if (scheduleStatus === 'RECURRING') {
//       // 정기 일정
//       markedDates[startSchedule] = markedDates[startSchedule] || { customStyles: {} };
//       markedDates[startSchedule].customStyles.container = { backgroundColor: '#FFEAB1', borderRadius: 5 };
//       markedDates[startSchedule].customStyles.text = { color: 'black', fontWeight: 'bold' };
//     }
//   });

//   // 날짜 클릭 핸들러
//   const handleDayPress = (day) => {
//     const filteredSchedules = schedules.filter(
//       (schedule) =>
//         schedule.startSchedule === day.dateString ||
//         schedule.endSchedule === day.dateString ||
//         (new Date(schedule.startSchedule) <= new Date(day.dateString) &&
//           new Date(schedule.endSchedule) >= new Date(day.dateString))
//     );

//     if (filteredSchedules.length > 0) {
//       setModalData(filteredSchedules);
//       setModalVisible(true);
//     }
//     setSelectedDate(day.dateString);
//   };

//   return (
//     <View style={styles.container}>
//       {/* 캘린더 */}
//       <Calendar
//         markingType="custom"
//         markedDates={{
//           ...markedDates,
//           [selectedDate]: { selected: true, selectedColor: '#FFC107' },
//         }}
//         onDayPress={handleDayPress}
//         theme={{
//           backgroundColor: '#F8F8F8',
//           calendarBackground: '#F8F8F8',
//           textSectionTitleColor: '#333333',
//           todayTextColor: '#FF5722',
//           arrowColor: '#FFC107',
//           monthTextColor: 'black',
//           textDayFontWeight: 'bold',
//         }}
//         style={{ borderRadius: 18 }}
//       />

//       {/* 모달 */}
//       <Modal visible={modalVisible} transparent animationType="slide">
//         <View style={styles.modalContainer}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>일정 정보</Text>
//             {modalData.map((schedule, index) => (
//               <View key={index} style={styles.scheduleItem}>
//                 <Text>시작 날짜: {schedule.startSchedule}</Text>
//                 <Text>종료 날짜: {schedule.endSchedule}</Text>
//                 <Text>유형: {schedule.scheduleStatus}</Text>
//               </View>
//             ))}
//             <TouchableOpacity onPress={() => setModalVisible(false)}>
//               <Text style={styles.closeButton}>닫기</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#EDEDED',
//     paddingTop: 20,
//     paddingHorizontal: 10,
//   },
//   modalContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.5)',
//   },
//   modalContent: {
//     backgroundColor: '#FFF',
//     paddingHorizontal: 20,
//     paddingVertical: 30,
//     borderRadius: 10,
//     width: '80%',
//     alignItems: 'center',
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 20,
//   },
//   scheduleItem: {
//     marginBottom: 10,
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     backgroundColor: '#F0F0F0',
//     borderRadius: 5,
//     width: '100%',
//   },
//   closeButton: {
//     color: '#FF5722',
//     marginTop: 20,
//     fontWeight: 'bold',
//   },
// });

// export default ScheduleCalendar;

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { instance } from '../../api/axiosInstance';
import { PRIMARY_BACK_COLOR } from '../../constants/colors';

const ScheduleCalendar = ({ categoryId, token }) => {
  const [schedules, setSchedules] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState([]);

  useEffect(() => {
    if (categoryId) fetchSchedules();
  }, [categoryId]);

  const fetchSchedules = async () => {
    try {
      const response = await instance.get(`/schedules`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: 1, size: 10, categoryId },
      });
      setSchedules(response.data.data);
    } catch (error) {
      console.error('Error fetching schedules:', error.response?.data || error.message);
    }
  };

  const markedDates = {};
  schedules.forEach((schedule) => {
    const { startSchedule, endSchedule, scheduleStatus } = schedule;
    let color;

    if (scheduleStatus === 'SINGLE') {
      color = '#FECBD8';
      markedDates[startSchedule] = {
        customStyles: {
          container: { backgroundColor: color, borderRadius: 5 },
          text: { color: 'black', fontWeight: 'bold' },
        },
      };
    } else if (scheduleStatus === 'CONTINUOUS') {
      color = '#DFC9FA';
      let currentDate = new Date(startSchedule);
      const endDate = new Date(endSchedule);
      while (currentDate <= endDate) {
        const formattedDate = currentDate.toISOString().split('T')[0];
        markedDates[formattedDate] = {
          customStyles: {
            container: { backgroundColor: color, borderRadius: 5 },
            text: { color: 'black' },
          },
        };
        currentDate.setDate(currentDate.getDate() + 1);
      }
    } else if (scheduleStatus === 'RECURRING') {
      color = '#FFEAB1';
      markedDates[startSchedule] = {
        customStyles: {
          container: { backgroundColor: color, borderRadius: 5 },
          text: { color: 'black', fontWeight: 'bold' },
        },
      };
    }
  });

  const handleDayPress = (day) => {
    const filteredSchedules = schedules.filter(
      (schedule) =>
        schedule.startSchedule === day.dateString ||
        schedule.endSchedule === day.dateString
    );
    if (filteredSchedules.length > 0) {
      setModalData(filteredSchedules);
      setModalVisible(true);
    }
    setSelectedDate(day.dateString);
  };

  return (
    <View style={styles.container}>
      <Calendar
        markingType="custom"
        markedDates={{
          ...markedDates,
          [selectedDate]: { selected: true, selectedColor: '#FFC107' },
        }}
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