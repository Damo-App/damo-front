import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MapView, { Marker } from 'react-native-maps';
import { PRIMARY_BACK_COLOR, BLACK_COLOR, WHITE_COLOR, PRIMARY_BTN_COLOR } from '../../constants/colors';
import { CustomButton } from '../../components/CustomButton';
import ParticipantListModal from '../../components/schedule/ParticipantListModal';
import { getScheduleDetails } from '../../api/queries/scheduleQueries';
import { getScheduleParticipants } from '../../api/mutations/scheduleService';

const ScheduleDetails = ({ route }) => {
  const groupId = route?.params?.groupId || '1';
  const scheduleId = route?.params?.scheduleId || '7';

  const [scheduleData, setScheduleData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showParticipantModal, setShowParticipantModal] = useState(false);
  const [coords, setCoords] = useState(null);
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    const fetchScheduleData = async () => {
      try {
        setIsLoading(true);
        const scheduleResponse = await getScheduleDetails(groupId, scheduleId);
        setScheduleData(scheduleResponse.data);
  
        // ✅ 추가: 참여자 목록도 같이 조회
        const participantsResponse = await getScheduleParticipants(scheduleId);
        setParticipants(participantsResponse.data);
  
        setError(null);
      } catch (err) {
        console.error('일정 정보 로딩 실패:', err);
        setError('일정 정보를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchScheduleData();
  }, [groupId, scheduleId]);

  useEffect(() => {
    if (scheduleData && scheduleData.address) {
      const getCoordinates = async () => {
        try {
          const result = await getCoordsByAddress(scheduleData.address);
          if (result) setCoords(result);
        } catch (err) {
          console.error('좌표 변환 실패:', err);
        }
      };
      getCoordinates();
    }
  }, [scheduleData]);

  const handleJoin = async () => {
    try {
      const res = await getScheduleParticipants(scheduleId);
      console.log('참여자 조회 응답:', res);
      setParticipants(res.data); // ✅ 이렇게 해야 리스트가 3명 나옴
      setShowParticipantModal(true);
    } catch (err) {
      console.error('참여자 조회 실패:', err);
      Alert.alert('에러', '참여자 정보를 불러오는 데 실패했습니다.');
    }
  };

  const handleCloseModal = () => {
    setShowParticipantModal(false);
  };

  const handleCopyLocation = () => {
    if (scheduleData?.address) {
      Alert.alert('주소 정보', scheduleData.address);
    }
  };

  const getCoordsByAddress = async (address) => {
    try {
      const response = await fetch(`https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`, {
        headers: {
          Authorization: 'KakaoAK 19546b453ac3c8043f8f8f7696100f59',
        },
      });
      const json = await response.json();
      if (json.documents && json.documents.length > 0) {
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}. ${month}. ${day}`;
  };

  const formatTime = (datePart, timePart) => {
  if (!datePart || !timePart) return '';

  const dateTimeString = `${datePart}T${timePart}`;
  const date = new Date(dateTimeString);

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY_BTN_COLOR} />
        <Text style={styles.loadingText}>일정 정보를 불러오는 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error" size={48} color="red" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!scheduleData) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="info" size={48} color="orange" />
        <Text style={styles.errorText}>일정 정보가 없습니다.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>일정 이름</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.value}>{scheduleData.scheduleName}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>일정 소개글</Text>
          <View style={styles.descriptionContainer}>
            <Text style={styles.value}>{scheduleData.scheduleContent}</Text>
          </View>
        </View>

        <View style={styles.dateTimeSection}>
          <View style={styles.dateColumn}>
            <Text style={styles.label}>일자</Text>
            <View style={styles.valueContainer}>
              <Text style={styles.value}>{formatDate(scheduleData.startSchedule)}</Text>
            </View>
          </View>
          <Text style={styles.dateSeparator}>~</Text>
          <View style={styles.dateColumn}>
            <Text style={styles.label}>일자</Text>
            <View style={styles.valueContainer}>
              <Text style={styles.value}>{formatDate(scheduleData.endSchedule)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.dateTimeSection}>
          <View style={styles.dateColumn}>
            <Text style={styles.label}>시작시간</Text>
            <View style={styles.valueContainer}>
            <Text style={styles.value}>
              {formatTime(scheduleData.startSchedule, scheduleData.startTime)}
            </Text>
            </View>
          </View>
          <Text style={styles.dateSeparator}>~</Text>
          <View style={styles.dateColumn}>
            <Text style={styles.label}>종료시간</Text>
            <View style={styles.valueContainer}>
            <Text style={styles.value}>
              {formatTime(scheduleData.endSchedule, scheduleData.endTime)}
            </Text>
            </View>
          </View>
        </View>

        <View style={styles.participantsSection}>
          <View style={styles.participantsContainer}>
            <Text style={styles.label}>참여 인원수</Text>
            <View style={styles.participantsValue}>
            <Text style={styles.participantsText}>
              {participants.length} / {scheduleData.maxMemberCount || 0}
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
            <Text style={styles.locationText}>{scheduleData.address}</Text>
            <TouchableOpacity onPress={handleCopyLocation}>
              <Icon name="content-copy" size={24} color={BLACK_COLOR} />
            </TouchableOpacity>
          </View>

          {scheduleData.subAddress && scheduleData.subAddress.trim() !== '' ? (
            <View style={styles.locationContainer}>
              <Text style={styles.locationText}>{scheduleData.subAddress}</Text>
            </View>
          ) : null}

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

      <ParticipantListModal 
        visible={showParticipantModal} 
        onClose={handleCloseModal} 
        participants={participants} 
        scheduleId={scheduleId}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: PRIMARY_BACK_COLOR,
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: BLACK_COLOR,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: PRIMARY_BACK_COLOR,
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: BLACK_COLOR,
    textAlign: 'center',
  },
});

export default ScheduleDetails;
