// 모임 상세 조회
import { instance } from '../axiosInstance';

export const fetchGroupDetail = async (groupId) => {
  try {
    const response = await instance.get(`/groups/${groupId}`);
    console.log(response.data.data);
    return response.data.data || null
  } catch (error) {
    console.error('Error fetching categories:', error.response?.data || error.message);
    return [];
  }
};

export const updateGroup = (groupId, groupData) => {
  return instance.patch(`/groups/${groupId}`, groupData);
};