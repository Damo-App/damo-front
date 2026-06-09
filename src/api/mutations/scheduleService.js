import { instance } from '../axiosInstance';

/**
 * 모임 일정 생성 API
 * POST 요청을 통해 새로운 일정을 생성합니다.
 * 
 * @param {string} groupId - 모임 ID
 * @param {object} scheduleData - 일정 데이터 객체
 * @param {string} scheduleData.scheduleName - 일정 이름
 * @param {string} scheduleData.scheduleContent - 일정 소개글
 * @param {string} scheduleData.scheduleStatus - 일정 유형 (SINGLE, CONTINUOUS, RECURRING)
 * @param {string} scheduleData.startSchedule - 시작 일시 (ISO 형식)
 * @param {string} scheduleData.endSchedule - 종료 일시 (ISO 형식)
 * @param {Array<string>} [scheduleData.daysOfWeek] - 반복 요일 (정기일정인 경우만)
 * @param {string} scheduleData.address - 장소 주소
 * @param {string} [scheduleData.subAddress] - 상세 주소
 * @param {number} scheduleData.maxMemberCount - 최대 참여 인원
 * @returns {Promise} - API 응답 Promise
 */
export const createSchedule = async (groupId, scheduleData) => {
  try {
    const response = await instance.post(`/groups/${groupId}/schedules`, scheduleData);
    return response.data; // API 응답 데이터 반환
  } catch (error) {
    // console.error('일정 생성 오류:', error);
    throw error; // 오류 전파
  }
};

export const getScheduleParticipants = async (scheduleId, keyword = '') => {
  try {
    const response = await instance.get(`/schedules/${scheduleId}/participation`, {
      params: keyword ? { keyword } : {},
    });
    return response.data;
  } catch (error) {
    console.error('참여자 목록 조회 오류:', error);
    throw error;
  }
};

/**
 * 일정 유형에 따른 scheduleStatus 변환 함수
 * UI에 표시되는 한글 일정 유형을 API 요청용 영문 코드로 변환합니다.
 * 
 * @param {string} selectedOption - 선택된 일정 유형 ('단일일정', '연속일정', '정기일정')
 * @returns {string} - API 요청용 일정 상태값 ('SINGLE', 'CONTINUOUS', 'RECURRING')
 */
export const getScheduleStatus = (selectedOption) => {
  switch (selectedOption) {
    case '단일일정':
      return 'SINGLE'; // 단일 일정
    case '연속일정':
      return 'CONTINUOUS'; // 연속 일정
    case '정기일정':
      return 'RECURRING'; // 정기 일정
    default:
      return 'SINGLE'; // 기본값은 단일 일정
  }
};

/**
 * 요일 ID를 API 요청 형식으로 변환하는 함수
 * UI에서 사용하는 요일 ID를 API 요청에 필요한 형식으로 변환합니다.
 * 
 * @param {Array<string>} selectedDays - 선택된 요일 ID 배열 (ex: ['mon', 'wed', 'fri'])
 * @returns {Array<string>} - API 요청용 요일 배열 (ex: ['MONDAY', 'WEDNESDAY', 'FRIDAY'])
 */
export const convertDaysOfWeek = (selectedDays) => {
  const dayMapping = {
    'mon': 'MONDAY',    // 월요일
    'tue': 'TUESDAY',   // 화요일
    'wed': 'WEDNESDAY', // 수요일
    'thu': 'THURSDAY',  // 목요일
    'fri': 'FRIDAY',    // 금요일
    'sat': 'SATURDAY',  // 토요일
    'sun': 'SUNDAY'     // 일요일
  };
  
  // 선택된 요일 ID 배열을 API 요청용 형식으로 변환
  return selectedDays.map(day => dayMapping[day]);
};

/**
 * 날짜 및 시간 정보를 ISO 형식으로 변환하는 함수
 * 별도로 입력받은 년, 월, 일, 시, 분 정보를 ISO 8601 형식 문자열로 변환합니다.
 * 
 * @param {string} year - 년도 (4자리)
 * @param {string} month - 월 (2자리, 01-12)
 * @param {string} day - 일 (2자리, 01-31)
 * @param {string} hour - 시간 (2자리, 00-23)
 * @param {string} minute - 분 (2자리, 00-59)
 * @returns {string} - ISO 형식 문자열 (ex: '2025-04-15T10:00:00')
 */
export const formatDateTime = (year, month, day, hour, minute) => {
  // 현재 년도를 기본값으로 사용
  const currentYear = year || new Date().getFullYear();
  
  // 월, 일, 시, 분이 한 자리 수일 경우 앞에 0 붙이기
  const formattedMonth = month.padStart(2, '0');
  const formattedDay = day.padStart(2, '0');
  const formattedHour = hour.padStart(2, '0');
  const formattedMinute = minute.padStart(2, '0');
  
  // ISO 8601 형식으로 날짜와 시간 조합 (YYYY-MM-DDTHH:MM:SS)
  return `${currentYear}-${formattedMonth}-${formattedDay}T${formattedHour}:${formattedMinute}:00`;
}; 