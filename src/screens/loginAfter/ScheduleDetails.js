import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MapView, { Marker } from 'react-native-maps';
import { PRIMARY_BACK_COLOR, BLACK_COLOR, WHITE_COLOR, PRIMARY_BTN_COLOR } from '../../constants/colors';
import { CustomButton } from '../../components/CustomButton';
import ParticipantListModal from '../../components/schedule/ParticipantListModal';

/**
 * 모임 일정 상세 정보 화면 컴포넌트
 * 일정의 제목, 소개글, 일자, 시간, 참여자 정보, 장소 등을 표시하고
 * 지도 위에 장소를 마커로 표시합니다.
 * 
 * @returns {JSX.Element} 일정 상세 정보 화면
 */
const ScheduleDetails = () => {
  // 임시 데이터 (실제 구현에서는 API에서 가져올 예정)
  const [scheduleData] = useState({
    title: '열정열정', // 일정 제목
    description: '소개글 작성해야징 ~~~오늘날씨날씨너무너무더워요피피피피피피', // 일정 소개글
    startDate: '2025. 03. 18', // 시작 일자
    endDate: '2025. 03. 21', // 종료 일자
    startTime: '18:00', // 시작 시간
    endTime: '20:00', // 종료 시간
    currentParticipants: 18, // 현재 참여자 수
    maxParticipants: 20, // 최대 참여자 수
    location: '경기도 광주시 경안동 106', // 장소 주소
    detailAddress: '나무앞 3층 302호', // 상세 주소
  });

  // 참여자 목록 모달 표시 여부 상태
  const [showParticipantModal, setShowParticipantModal] = useState(false);
  
  // 예시 참여자 리스트 (실제 구현에서는 API에서 가져올 예정)
  const [participants, setParticipants] = useState([
    { id: 1, nickname: 'test1', profileImage: null },
    { id: 2, nickname: 'test2', profileImage: null },
    { id: 3, nickname: 'test3', profileImage: null },
    { id: 4, nickname: 'test4', profileImage: null },
  ]);

  // 지도 좌표 상태 (지오코딩 API 호출 결과로 설정됨)
  const [coords, setCoords] = useState(null);

  /**
   * 참여 회원 조회 버튼 클릭 핸들러
   * 참여자 목록 모달을 표시합니다.
   */
  const handleJoin = () => {
    setShowParticipantModal(true);
  };

  /**
   * 참여자 목록 모달 닫기 핸들러
   */
  const handleCloseModal = () => {
    setShowParticipantModal(false);
  };

  /**
   * 위치 복사 버튼 클릭 핸들러
   * 현재는 콘솔에 로그만 출력 (클립보드 기능 구현 필요)
   */
  const handleCopyLocation = () => {
    console.log('위치 복사: ', scheduleData.location);
    // 실제 구현에서는 클립보드에 복사하는 기능 추가 필요
  };

  /**
   * 주소를 좌표(위도, 경도)로 변환하는 함수
   * Kakao 지도 API를 사용하여 주소 검색 후 좌표 정보를 반환
   * 
   * @param {string} address - 변환할 주소
   * @returns {Promise<{latitude: number, longitude: number} | null>} 좌표 정보 또는 null
   */
  const getCoordsByAddress = async (address) => {
    try {
      // Kakao 지도 API 호출
      const response = await fetch(`https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`, {
        headers: {
          Authorization: 'KakaoAK 19546b453ac3c8043f8f8f7696100f59', // Kakao API 키
        },
      });
      const json = await response.json();
      
      // 검색 결과가 있으면 첫 번째 결과의 좌표를 반환
      if (json.documents.length > 0) {
        const { x, y } = json.documents[0]; // x=경도, y=위도
        return { latitude: parseFloat(y), longitude: parseFloat(x) };
      } else {
        Alert.alert('위치 오류', '주소를 찾을 수 없습니다.');
        return null;
      }
    } catch (error) {
      console.error('주소 변환 실패:', error);
      Alert.alert('에러', '주소 좌표 변환 중 오류 발생');
      return null;
    }
  };

  // 컴포넌트 마운트 시 주소 -> 좌표 변환 실행
  useEffect(() => {
    (async () => {
      const result = await getCoordsByAddress(scheduleData.location);
      if (result) setCoords(result); // 좌표 정보가 있으면 상태 업데이트
    })();
  }, []); // 빈 의존성 배열로 컴포넌트 마운트 시 한 번만 실행

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* 일정 이름 섹션 */}
        <View style={styles.section}>
          <Text style={styles.label}>일정 이름</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.value}>{scheduleData.title}</Text>
          </View>
        </View>

        {/* 일정 소개글 섹션 */}
        <View style={styles.section}>
          <Text style={styles.label}>일정 소개글</Text>
          <View style={styles.descriptionContainer}>
            <Text style={styles.value}>{scheduleData.description}</Text>
          </View>
        </View>

        {/* 일자 섹션 - 시작일과 종료일 */}
        <View style={styles.dateTimeSection}>
          <View style={styles.dateColumn}>
            <Text style={styles.label}>일자</Text>
            <View style={styles.valueContainer}>
              <Text style={styles.value}>{scheduleData.startDate}</Text>
            </View>
          </View>
          <Text style={styles.dateSeparator}>~</Text>
          <View style={styles.dateColumn}>
            <Text style={styles.label}>일자</Text>
            <View style={styles.valueContainer}>
              <Text style={styles.value}>{scheduleData.endDate}</Text>
            </View>
          </View>
        </View>

        {/* 시간 섹션 - 시작시간과 종료시간 */}
        <View style={styles.dateTimeSection}>
          <View style={styles.dateColumn}>
            <Text style={styles.label}>시간</Text>
            <View style={styles.valueContainer}>
              <Text style={styles.value}>{scheduleData.startTime}</Text>
            </View>
          </View>
          <Text style={styles.dateSeparator}>~</Text>
          <View style={styles.dateColumn}>
            <Text style={styles.label}>시간</Text>
            <View style={styles.valueContainer}>
              <Text style={styles.value}>{scheduleData.endTime}</Text>
            </View>
          </View>
        </View>

        {/* 참여 인원수 및 참여 회원 조회 버튼 섹션 */}
        <View style={styles.participantsSection}>
          <View style={styles.participantsContainer}>
            <Text style={styles.label}>참여 인원수</Text>
            <View style={styles.participantsValue}>
              <Text style={styles.participantsText}>
                {scheduleData.currentParticipants} / {scheduleData.maxParticipants}
              </Text>
            </View>
          </View>

          <View style={styles.buttonWrapper}>
            <CustomButton
              title="참여 회원 조회하기"
              onPress={handleJoin}
              style={styles.customButton}
              textStyle={styles.customButtonText}
            />
          </View>
        </View>

        {/* 장소 섹션 - 주소, 상세주소, 지도 */}
        <View style={styles.section}>
          <Text style={styles.label}>장소</Text>
          {/* 주소 표시 및 복사 버튼 */}
          <View style={styles.locationContainer}>
            <Text style={styles.locationText}>{scheduleData.location}</Text>
            <TouchableOpacity onPress={handleCopyLocation}>
              <Icon name="content-copy" size={24} color={BLACK_COLOR} />
            </TouchableOpacity>
          </View>
          
          {/* 상세 주소 - 있을 경우만 표시 */}
          {scheduleData.detailAddress && scheduleData.detailAddress.trim() !== '' ? (
            <View style={styles.locationContainer}>
              <Text style={styles.locationText}>{scheduleData.detailAddress}</Text>
            </View>
          ) : null}

          {/* 지도 - 좌표가 있을 경우만 표시 */}
          {coords && (
            <MapView
              style={styles.mapContainer}
              initialRegion={{
                latitude: coords.latitude,
                longitude: coords.longitude,
                latitudeDelta: 0.005, // 줌 레벨 설정
                longitudeDelta: 0.005, // 줌 레벨 설정
              }}
            >
              {/* 위치 마커 */}
              <Marker coordinate={coords} />
            </MapView>
          )}
        </View>
      </View>
      
      {/* 참여자 목록 모달 컴포넌트 */}
      <ParticipantListModal 
        visible={showParticipantModal} 
        onClose={handleCloseModal} 
        participants={participants} 
      />
    </ScrollView>
  );
};

// 스타일 정의
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PRIMARY_BACK_COLOR }, // 전체 컨테이너
  content: { padding: 16 }, // 내용 패딩
  section: { marginBottom: 16 }, // 각 섹션 간 마진
  label: { fontSize: 14, fontWeight: '500', marginBottom: 8, color: BLACK_COLOR }, // 레이블 텍스트
  valueContainer: { // 값 컨테이너 (테두리가 있는 박스)
    backgroundColor: WHITE_COLOR,
    borderWidth: 1,
    borderColor: BLACK_COLOR,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  value: { fontSize: 14, color: BLACK_COLOR }, // 값 텍스트
  descriptionContainer: { // 소개글 컨테이너 (더 높이가 큼)
    backgroundColor: WHITE_COLOR,
    borderWidth: 1,
    borderColor: BLACK_COLOR,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    minHeight: 100,
  },
  dateTimeSection: { // 날짜/시간 섹션 레이아웃
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  dateColumn: { flex: 2 }, // 날짜/시간 컬럼
  dateSeparator: { // ~ 구분자
    fontSize: 16,
    marginBottom: 14,
    marginHorizontal: 10,
    color: BLACK_COLOR,
  },
  participantsSection: { // 참여자 섹션 레이아웃
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  participantsContainer: { flex: 1, marginRight: 10 }, // 참여자 수 컨테이너
  participantsValue: { // 참여자 수 값 컨테이너
    backgroundColor: WHITE_COLOR,
    borderWidth: 1,
    borderColor: BLACK_COLOR,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  participantsText: { fontSize: 14, color: BLACK_COLOR }, // 참여자 수 텍스트
  buttonWrapper: { flex: 1 }, // 버튼 래퍼
  customButton: { // 참여 회원 조회 버튼 스타일
    backgroundColor: PRIMARY_BTN_COLOR,
    width: '100%',
    height: 48,
    borderRadius: 8,
  },
  customButtonText: { color: WHITE_COLOR, fontSize: 14, fontWeight: 'bold' }, // 버튼 텍스트 스타일
  locationContainer: { // 위치 정보 컨테이너
    backgroundColor: WHITE_COLOR,
    borderWidth: 1,
    borderColor: BLACK_COLOR,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: { fontSize: 14, color: BLACK_COLOR, flex: 1 }, // 위치 텍스트
  mapContainer: { // 지도 컨테이너
    width: '100%',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
  },
});

export default ScheduleDetails;
