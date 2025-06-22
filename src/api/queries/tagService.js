import { instance } from "../axiosInstance";

export const getTags = async () => {
    try {
      const response = await instance.get(`/categories/${categoryId}/tags`);
      console.log("Tag 응답 들어오냐", response);
      // 응답 데이터 검증
      if (!response || !response.data) {
        throw new Error("No data returned from API");
      }
      return response.data.tags; // 태그 목록 반환
    } catch (error) {
      console.error("Error fetching tags:", error.message);
      throw error;
    }
  };
  