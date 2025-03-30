import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MapView, { Marker } from 'react-native-maps';
import { PRIMARY_BACK_COLOR, BLACK_COLOR, WHITE_COLOR, PRIMARY_BTN_COLOR } from '../../constants/colors';
import { CustomButton } from '../../components/CustomButton';
import ParticipantListModal from '../../components/schedule/ParticipantListModal';

const ScheduleDetails = () => {
  const [scheduleData] = useState({
    title: '열정열정',
    description: '소개글 작성해야징 ~~~오늘날씨날씨너무너무더워요피피피피피피',
    startDate: '2025. 03. 18',
    endDate: '2025. 03. 21',
    startTime: '18:00',
    endTime: '20:00',
    currentParticipants: 18,
    maxParticipants: 20,
    location: '서울 중구 삼각동 118',
    detailAddress: '',
  });

  // 모달 표시 여부 상태
  const [showParticipantModal, setShowParticipantModal] = useState(false);
  
  // 예시 참여자 리스트
  const [participants, setParticipants] = useState([
    { id: 1, nickname: 'test1', profileImage: null },
    { id: 2, nickname: 'test2', profileImage: null },
    { id: 3, nickname: 'test3', profileImage: null },
    { id: 4, nickname: 'test4', profileImage: null },
  ]);

  const [coords, setCoords] = useState(null);

  const handleJoin = () => {
    // 모달 표시
    setShowParticipantModal(true);
  };

  const handleCloseModal = () => {
    setShowParticipantModal(false);
  };

  const handleCopyLocation = () => {
    console.log('위치 복사: ', scheduleData.location);
  };

  const getCoordsByAddress = async (address) => {
    try {
      const response = await fetch(`https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`, {
        headers: {
          Authorization: 'KakaoAK 19546b453ac3c8043f8f8f7696100f59',
        },
      });
      const json = await response.json();
      if (json.documents.length > 0) {
        const { x, y } = json.documents[0];
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

  useEffect(() => {
    (async () => {
      const result = await getCoordsByAddress(scheduleData.location);
      if (result) setCoords(result);
    })();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>일정 이름</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.value}>{scheduleData.title}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>일정 소개글</Text>
          <View style={styles.descriptionContainer}>
            <Text style={styles.value}>{scheduleData.description}</Text>
          </View>
        </View>

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

        <View style={styles.section}>
          <Text style={styles.label}>장소</Text>
          <View style={styles.locationContainer}>
            <Text style={styles.locationText}>{scheduleData.location}</Text>
            <TouchableOpacity onPress={handleCopyLocation}>
              <Icon name="content-copy" size={24} color={BLACK_COLOR} />
            </TouchableOpacity>
          </View>

          {/* 지도 */}
          {coords && (
            <MapView
              style={styles.mapContainer}
              initialRegion={{
                latitude: coords.latitude,
                longitude: coords.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
            >
              <Marker coordinate={coords} />
            </MapView>
          )}
        </View>
      </View>
      
      {/* 참여자 목록 모달 */}
      <ParticipantListModal 
        visible={showParticipantModal} 
        onClose={handleCloseModal} 
        participants={participants} 
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PRIMARY_BACK_COLOR },
  content: { padding: 16 },
  section: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 8, color: BLACK_COLOR },
  valueContainer: {
    backgroundColor: WHITE_COLOR,
    borderWidth: 1,
    borderColor: BLACK_COLOR,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  value: { fontSize: 14, color: BLACK_COLOR },
  descriptionContainer: {
    backgroundColor: WHITE_COLOR,
    borderWidth: 1,
    borderColor: BLACK_COLOR,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    minHeight: 100,
  },
  dateTimeSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  dateColumn: { flex: 2 },
  dateSeparator: {
    fontSize: 16,
    marginBottom: 14,
    marginHorizontal: 10,
    color: BLACK_COLOR,
  },
  participantsSection: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  participantsContainer: { flex: 1, marginRight: 10 },
  participantsValue: {
    backgroundColor: WHITE_COLOR,
    borderWidth: 1,
    borderColor: BLACK_COLOR,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  participantsText: { fontSize: 14, color: BLACK_COLOR },
  buttonWrapper: { flex: 1 },
  customButton: {
    backgroundColor: PRIMARY_BTN_COLOR,
    width: '100%',
    height: 48,
    borderRadius: 8,
  },
  customButtonText: { color: WHITE_COLOR, fontSize: 14, fontWeight: 'bold' },
  locationContainer: {
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
  locationText: { fontSize: 14, color: BLACK_COLOR, flex: 1 },
  mapContainer: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
  },
});

export default ScheduleDetails;
