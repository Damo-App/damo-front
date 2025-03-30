import { instance } from '../axiosInstance';

/**
 * 모임 일정 상세 정보 조회 API
 * 
 * @param {string} groupId - 모임 ID
 * @param {string} scheduleId - 일정 ID
 * @returns {Promise} - API 응답
 */
export const getScheduleDetails = async (groupId, scheduleId) => {
  try {
    console.log(`일정 조회 요청: /groups/${groupId}/schedules/${scheduleId}`);
    const response = await instance.get(`/groups/${groupId}/schedules/${scheduleId}`);
    console.log('일정 조회 응답 구조:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('일정 조회 오류:', error);
    console.error('오류 응답:', error.response?.data);
    throw error;
  }
};


/**
 * 일정 참여자 목록 조회 API
 * 
 * @param {string} groupId - 모임 ID
 * @param {string} scheduleId - 일정 ID
 * @returns {Promise} - API 응답
 */
export const getScheduleParticipants = async (scheduleId) => {
  try {
    const response = await instance.get(`/schedules/${scheduleId}/participation`);
    return response.data;
  } catch (error) {
    console.error('참여자 목록 조회 오류:', error);
    throw error;
  }
}; 