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

//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////

// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
// import { Calendar } from 'react-native-calendars';
// import { instance } from '../../api/axiosInstance';
// import { PRIMARY_BACK_COLOR } from '../../constants/colors';

// const ScheduleCalendar = ({ categoryId, token }) => {
//   const [schedules, setSchedules] = useState([]);
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [modalData, setModalData] = useState([]);

//   useEffect(() => {
//     if (categoryId) fetchSchedules();
//   }, [categoryId]);

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

//   console.log("schedules === ??? " , schedules)

//   const markedDates = {};
//   const dayOfWeekToIndex = {
//   SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3,
//   THURSDAY: 4, FRIDAY: 5, SATURDAY: 6
// };
//   schedules.forEach((schedule) => {
//     const { startSchedule, endSchedule, scheduleStatus } = schedule;
//     let color;

//     if (scheduleStatus === 'SINGLE') {
//       color = '#FECBD8';
//       markedDates[startSchedule] = {
//         customStyles: {
//           container: { backgroundColor: color, borderRadius: 5 },
//           text: { color: 'black', fontWeight: 'bold' },
//         },
//       };
//     } else if (scheduleStatus === 'CONTINUOUS') {
//       color = '#DFC9FA';
//       let currentDate = new Date(startSchedule);
//       const endDate = new Date(endSchedule);
//       while (currentDate <= endDate) {
//         const formattedDate = currentDate.toISOString().split('T')[0];
//         markedDates[formattedDate] = {
//           customStyles: {
//             container: { backgroundColor: color, borderRadius: 5 },
//             text: { color: 'black' },
//           },
//           markedDates: {marked : true},
//         };
//         currentDate.setDate(currentDate.getDate() + 1);
//       }
//     } else if (scheduleStatus === 'RECURRING') {
//       color = '#FFEAB1';
//       const daysOfWeek = schedule.daysOfWeek || []; // ["MONDAY", ...]
//       const weekIndexes = daysOfWeek.map(day => dayOfWeekToIndex[day]);
//       let currentDate = new Date(startSchedule);
//       const endDate = new Date(endSchedule);

//       while (currentDate <= endDate) {
//         if (weekIndexes.includes(currentDate.getDay())) {
//           const formattedDate = currentDate.toISOString().split('T')[0];
//           markedDates[formattedDate] = {
//             customStyles: {
//               container: { backgroundColor: color, borderRadius: 5 },
//               text: { color: 'black', fontWeight: 'bold' },
//             },
//           };
//         }
//         currentDate.setDate(currentDate.getDate() + 1);
//       }
//     }
//     // else if (scheduleStatus === 'RECURRING') {
//     //   color = '#FFEAB1';
//     //   markedDates[startSchedule] = {
//     //     customStyles: {
//     //       container: { backgroundColor: color, borderRadius: 5 },
//     //       text: { color: 'black', fontWeight: 'bold' },
//     //     },
//     //   };
//     // }
//   });

//   const handleDayPress = (day) => {
//     const filteredSchedules = schedules.filter(
//       (schedule) =>
//         schedule.startSchedule === day.dateString ||
//         schedule.endSchedule === day.dateString
//     );
//     if (filteredSchedules.length > 0) {
//       setModalData(filteredSchedules);
//       setModalVisible(true);
//     }
//     setSelectedDate(day.dateString);
//   };

//   return (
//     <View style={styles.container}>
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
//           textSectionTitleColor: 'black',
//           todayTextColor: '#FF5722',
//           arrowColor: '#FFC107',
//           monthTextColor: 'black',
//           textDayFontWeight: 'bold',
//         }}
//       />

//       <Modal visible={modalVisible} transparent animationType="slide">
//         <View style={styles.modalContainer}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>일정 정보</Text>
//             {modalData.map((schedule, index) => (
//               <View key={index} style={styles.scheduleItem}>
//                 <Text>시작: {schedule.startSchedule}</Text>
//                 <Text>종료: {schedule.endSchedule}</Text>
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
//     backgroundColor: PRIMARY_BACK_COLOR,
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
//     padding: 20,
//     borderRadius: 10,
//     alignItems: 'center',
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   scheduleItem: {
//     marginBottom: 10,
//     padding: 10,
//     backgroundColor: '#F0F0F0',
//     borderRadius: 5,
//   },
//   closeButton: {
//     color: '#FF5722',
//     marginTop: 20,
//     fontWeight: 'bold',
//   },
// });

// export default ScheduleCalendar;



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
    // color: '#FECBD8', // one day
    color: '#FECBD8', // one day
    markingType: 'custom'
  },
  CONTINUOUS: {
    color: '#DFC9FA', // period
    markingType: 'multi-period' // react-native-calendars 지원
  },
  RECURRING: {
    color: '#FFEAB1', // recur
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
  //1
  // const markedDates = useMemo(() => {
  //   let result = {};

  //   schedules.forEach((schedule) => {
  //     const { startSchedule, endSchedule, scheduleStatus } = schedule;
  //     const meta = SCHEDULE_TYPE_META[scheduleStatus] || { color: '#CCC', markingType: 'custom' };

  //     // ========== SINGLE ==========
  //     if (scheduleStatus === 'SINGLE') {
  //       result[startSchedule] = {
  //         customStyles: {
  //           container: {
  //             backgroundColor: meta.color,
  //             borderRadius: 0,
  //           },
  //           text: { color: 'black', fontWeight: 'bold' }
  //         }
  //       };
  //     }

  //     // ========== CONTINUOUS (기간 표시: period marking type 사용) ==========
  //     else if (scheduleStatus === 'CONTINUOUS') {
        

  //       let current = new Date(startSchedule);
  //       const end = new Date(endSchedule);

  //       while (current <= end) {
  //         const key = current.toISOString().split('T')[0];
  //         if (!result[key]) result[key] = { periods: [] };

  //         let period = { color: meta.color };
  //         if (key === startSchedule) period.startingDay = true;
  //         if (key === endSchedule) period.endingDay = true;
  //         result[key]={
             
  //             period: [{ key: 'yellow', color: '#000' }],
  //             marked: true,
  //             customStyles: {
  //               container: {
  //                 backgroundColor: meta.color
  //             },
  //             text: { color: 'black', fontWeight: 'bold' },
              
  //             }
           
  //         };

  //         current.setDate(current.getDate() + 1);
  //       }

  //       // let currentDate = new Date(startSchedule);
  //       // const endDate = new Date(endSchedule);

  //       // while (currentDate <= endDate) {
  //       //   const formattedDate = currentDate.toISOString().split('T')[0];
  //       //   // period타입에는 color, startingDay, endingDay 정보 필요
  //       //   result[formattedDate] = {
  //       //     startingDay: formattedDate === currentDate && true,
  //       //     endingDay: formattedDate === endDate,
  //       //     customStyles: {
  //       //     container: {
  //       //       backgroundColor: meta.color,
  //       //       borderRadius: 0,
  //       //     },
  //       //     text: { color: 'black', fontWeight: 'bold' }
  //       //   }
  //       //   };
  //       //   currentDate.setDate(currentDate.getDate() + 1);
  //       // }
  //     }

  //     // ========== RECURRING (날짜 계산) ==========
  //     else if (scheduleStatus === 'RECURRING') {
  //       const daysOfWeek = schedule.daysOfWeek || []; // ["MONDAY", ...]
  //       const weekIndexes = daysOfWeek.map(day => dayOfWeekToIndex[day]);
  //       let currentDate = new Date(startSchedule);
  //       const endDate = new Date(endSchedule);

  //       while (currentDate <= endDate) {
  //         if (weekIndexes.includes(currentDate.getDay())) {
  //           const formattedDate = currentDate.toISOString().split('T')[0];
  //           result[formattedDate] = {
  //             dots: [{ key: 'yellow', color: '#ff9d00ff' }],
  //             marked: true,
  //             customStyles: {
  //               container: {
  //               borderRadius: 0,
  //               position: 'relative',
  //             },
  //             text: { color: 'black', fontWeight: 'bold' },
              
  //             }
  //           };
  //         }
  //         currentDate.setDate(currentDate.getDate() + 1);
  //       }
  //     }
  //   });

  //   if (selectedDate) {
  //     result[selectedDate] = {
  //       ...(result[selectedDate] || {}),
  //       selected: true,
  //       selectedColor: '#FFC107'
  //     };
  //   }

  //   return result;

  // }, [schedules, selectedDate]); 
  // schedules나 선택이 바뀌면 다시 계산


   //   if (key === startSchedule) {
      //     result[key] = {
      //       startingDay : true,
      //       selected: true,
      //       customStyles: {
      //         container: { borderRadius:0, borderBottomLeftRadius:20,borderTopLeftRadius:20, backgroundColor: meta.color },
      //         text: { color: 'black', fontWeight: 'bold' },
      //       }
      //     }
      //   }
      //   else if (key === endSchedule) {
      //     result[key] = {
      //       endingDay : true,
      //       selected: true,
      //       customStyles: {
      //         container: { borderRadius:0, borderBottomRightRadius:20,borderTopRightRadius:20, backgroundColor: meta.color },
      //         text: { color: 'black', fontWeight: 'bold' },
      //       }
      //     }
      //   } else{
      //     result[key] = {
      //       disabled: false,
      //       disableTouchEvent: false,
      //       selected: false,
      //       customStyles: {
      //         container: { borderRadius: 0, backgroundColor: meta.color, width: '134%' },
      //         text: { color: 'black', fontWeight: 'bold' },
      //       }
      //     }

  //2
  const markedDates = useMemo(() => {
  let result = {};

  schedules.forEach((schedule) => {
    const { startSchedule, endSchedule, scheduleStatus } = schedule;
    const meta = SCHEDULE_TYPE_META[scheduleStatus] || { color: '#CCC', markingType: 'custom' };

    // SINGLE
    if (scheduleStatus === 'SINGLE') {
      result[startSchedule] = {
      customStyles: {
      container: {
        backgroundColor: meta.color,
        borderRadius: 0,
      },
      text: { color: 'black', fontWeight: 'bold' }
        }
      };
    }

    // CONTINUOUS (multi-period)
    else if (scheduleStatus === 'CONTINUOUS') {
      let current = new Date(startSchedule);
      const end = new Date(endSchedule);

      while (current <= end) {
        const formattedDate = current.toISOString().split('T')[0];
        result[formattedDate] = {
          dots: [{ key: 'blue', color: '#0400ffff' }],
            marked: true,
            // customStyles: {
            //   container: { borderRadius: 0, backgroundColor: '#ffffff' },
            //   text: { color: 'black', fontWeight: 'bold' },
            // }
        }
     
          current.setDate(current.getDate() + 1);
        };
        // result[key].periods.push(period);
      }
    // RECURRING
    else if (scheduleStatus === 'RECURRING') {
      const daysOfWeek = schedule.daysOfWeek || [];
      const weekIndexes = daysOfWeek.map(day => dayOfWeekToIndex[day]);
      let currentDate = new Date(startSchedule);
      const endDate = new Date(endSchedule);

      while (currentDate <= endDate) {
        if (weekIndexes.includes(currentDate.getDay())) {
          const formattedDate = currentDate.toISOString().split('T')[0];
          result[formattedDate] = {
            dots: [{ key: 'yellow', color: '#ff9d00ff' }],
            marked: true,
            customStyles: {
              container: { borderRadius: 0, backgroundColor: '#ffffff' },
              text: { color: 'black', fontWeight: 'bold' },
            }
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
      selectedColor: '#FFC107'
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

  console.log(...schedules)

  // 캘린더 컨트롤
  return (
    <View style={styles.container}>
      <Calendar
        // markingType="multi-dot" 
        // markingType="multi-period" 
        markingType="custom" 
        markedDates={markedDates}
        onDayPress={handleDayPress}
        theme={{
          // dotColor:'#FF5722',
          // selectedDotColor: '#FF5722',
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
