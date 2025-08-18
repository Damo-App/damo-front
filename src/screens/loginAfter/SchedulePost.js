import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import InputWithLabel from '../../components/InputWithLabel';
import { PRIMARY_BACK_COLOR, BLACK_COLOR, WHITE_COLOR, PRIMARY_BTN_COLOR } from '../../constants/colors';

// 분리된 컴포넌트들 임포트
import ScheduleTypeSelector from '../../components/schedule/ScheduleTypeSelector';
import ScheduleDateSection from '../../components/schedule/ScheduleDateSection';
import DropdownModal from '../../components/schedule/DropdownModal';
import AddressSearchModal from '../../components/schedule/AddressSearchModal';
import AddressInput from '../../components/schedule/AddressInput';

// API 서비스 임포트
import { createSchedule, getScheduleStatus, convertDaysOfWeek, formatDateTime } from '../../api/mutations/scheduleService';
import { CustomButton } from "../../components/CustomButton";

const SchedulePost = ({ navigation, route }) => {

  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
      console.log('입력값:', {
      title, description, startMonth, startDay, endMonth, endDay, 
      startHour, startMinute, endHour, endMinute, 
      selectedDays, maxMembers, address, selectedOption
    });

  const isValid = (
    title.trim() &&
    description.trim() &&
    startMonth !== 'MM' &&
    startDay !== 'DD' &&
    startHour !== 'hh' &&
    startMinute !== 'mm' &&
    maxMembers && !isNaN(parseInt(maxMembers)) &&
    address.trim()
  ) && (
    selectedOption === '단일일정' ? (
      endHour !== 'hh' && endMinute !== 'mm'
    ) : (
      endMonth !== 'MM' && endDay !== 'DD' && endHour !== 'hh' && endMinute !== 'mm'
    )
  ) && (
    selectedOption !== '정기일정' || selectedDays.length > 0
  );
  setIsFormValid(isValid);
}, [title, description, 
    startMonth, startDay, 
    endMonth, endDay, 
    startHour, startMinute, 
    endHour, endMinute, 
    selectedDays, maxMembers, 
    address, selectedOption]);


  const groupId = Number(route.params.groupId);
  // 상태 관리
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedOption, setSelectedOption] = useState('연속일정');
  
  // 날짜, 시간 값
  const [startMonth, setStartMonth] = useState('MM');
  const [startDay, setStartDay] = useState('DD');
  const [endMonth, setEndMonth] = useState('MM');
  const [endDay, setEndDay] = useState('DD');
  const [startHour, setStartHour] = useState('hh');
  const [startMinute, setStartMinute] = useState('mm');
  const [endHour, setEndHour] = useState('hh');
  const [endMinute, setEndMinute] = useState('mm');
  
  // 정기 일정 요일 선택
  const [selectedDays, setSelectedDays] = useState([]);
  
  // 드롭다운 상태
  const [showDropdown, setShowDropdown] = useState('');
  
  // 장소 정보
  const [maxMembers, setMaxMembers] = useState('');
  const [address, setAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [postcode, setPostcode] = useState('');
  
  // 로딩 상태
  const [isLoading, setIsLoading] = useState(false);
  
  // 주소 검색 모달 상태
  const [showAddressModal, setShowAddressModal] = useState(false);

  // route params에서 groupId 가져오기 (실제 구현 시 필요)
  // 임시로 테스트용 그룹 ID 설정
  // const groupId = route?.params?.groupId || '1'; // 테스트용 기본값

  // 드롭다운 옵션 준비
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const value = i + 1;
    return { label: value < 10 ? `0${value}` : `${value}`, value: value < 10 ? `0${value}` : `${value}` };
  });
  
  const dayOptions = Array.from({ length: 31 }, (_, i) => {
    const value = i + 1;
    return { label: value < 10 ? `0${value}` : `${value}`, value: value < 10 ? `0${value}` : `${value}` };
  });
  
  const hourOptions = Array.from({ length: 24 }, (_, i) => {
    return { label: i < 10 ? `0${i}` : `${i}`, value: i < 10 ? `0${i}` : `${i}` };
  });
  
  const minuteOptions = Array.from({ length: 60 }, (_, i) => {
    return { label: i < 10 ? `0${i}` : `${i}`, value: i < 10 ? `0${i}` : `${i}` };
  });
  
  // 요일 옵션
  const dayOfWeekOptions = [
    { id: 'mon', label: '월' },
    { id: 'tue', label: '화' },
    { id: 'wed', label: '수' },
    { id: 'thu', label: '목' },
    { id: 'fri', label: '금' },
    { id: 'sat', label: '토' },
    { id: 'sun', label: '일' }
  ];

  // 요일 선택 토글
  const toggleDaySelection = (dayId) => {
    if (selectedDays.includes(dayId)) {
      setSelectedDays(selectedDays.filter(id => id !== dayId));
    } else {
      setSelectedDays([...selectedDays, dayId]);
    }
  };

  // 드롭다운 옵션 선택 핸들러
  const handleSelectOption = (option, field) => {
    switch(field) {
      case 'startMonth':
        setStartMonth(option.value);
        break;
      case 'startDay':
        setStartDay(option.value);
        break;
      case 'endMonth':
        setEndMonth(option.value);
        break;
      case 'endDay':
        setEndDay(option.value);
        break;
      case 'startHour':
        setStartHour(option.value);
        break;
      case 'startMinute':
        setStartMinute(option.value);
        break;
      case 'endHour':
        setEndHour(option.value);
        break;
      case 'endMinute':
        setEndMinute(option.value);
        break;
    }
    setShowDropdown('');
  };

  // 유효성 검사 함수
  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('알림', '일정 이름을 입력해주세요.');
      return false;
    }
    
    if (!description.trim()) {
      Alert.alert('알림', '일정 소개글을 입력해주세요.');
      return false;
    }
    
    if (startMonth === 'MM' || startDay === 'DD' || startHour === 'hh' || startMinute === 'mm') {
      Alert.alert('알림', '시작 날짜와 시간을 선택해주세요.');
      return false;
    }
    
    if (selectedOption !== '단일일정' && (endMonth === 'MM' || endDay === 'DD')) {
      Alert.alert('알림', '종료 날짜를 선택해주세요.');
      return false;
    }
    
    if (endHour === 'hh' || endMinute === 'mm') {
      Alert.alert('알림', '종료 시간을 선택해주세요.');
      return false;
    }
    
    if (selectedOption === '정기일정' && selectedDays.length === 0) {
      Alert.alert('알림', '요일을 하나 이상 선택해주세요.');
      return false;
    }
    
    if (!maxMembers || isNaN(parseInt(maxMembers))) {
      Alert.alert('알림', '유효한 모집 인원 수를 입력해주세요.');
      return false;
    }
    
    if (!address.trim()) {
      Alert.alert('알림', '장소를 선택해주세요.');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    // 유효성 검사
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      
      // API 요청 데이터 준비
      const currentYear = new Date().getFullYear(); // 현재 년도
      const scheduleStatus = getScheduleStatus(selectedOption);
      
      // 시작 날짜/시간 포맷팅
      const startSchedule = formatDateTime(
        currentYear.toString(), 
        startMonth, 
        startDay, 
        startHour, 
        startMinute
      );
      
      // 종료 날짜/시간 포맷팅
      const endSchedule = formatDateTime(
        currentYear.toString(), 
        selectedOption === '단일일정' ? startMonth : endMonth, 
        selectedOption === '단일일정' ? startDay : endDay, 
        endHour, 
        endMinute
      );
      
      // 요일 변환 (정기일정일 경우만)
      const daysOfWeek = selectedOption === '정기일정' ? convertDaysOfWeek(selectedDays) : undefined;
      
      // 요청 데이터 구성
      const requestData = {
        scheduleName: title,
        scheduleContent: description,
        scheduleStatus: scheduleStatus,
        startSchedule: startSchedule,
        endSchedule: endSchedule,
        address: address,
        subAddress: detailAddress,
        maxMemberCount: parseInt(maxMembers)
      };
      
      // 정기일정인 경우에만 요일 정보 추가
      if (scheduleStatus === 'RECURRING') {
        requestData.daysOfWeek = daysOfWeek;
      }
      
      console.log('일정 생성 요청:', requestData);
      
      // API 호출
      const result = await createSchedule(groupId, requestData);
      console.log('일정 생성 성공:', result);
      
      Alert.alert('성공', '일정이 생성되었습니다.', [
        { 
          text: '확인', 
          onPress: () => {
            // 해당 모임의 일정 페이지로 이동
            // navigation.replace('GroupDetailScreen', {
            //   groupId: groupId,
            //   initialTab: 'schedule' // 일정 탭으로 바로 이동하도록 파라미터 추가
            // });
            setTimeout(() => {
              navigation.navigate('GroupDetail', {groupId: groupId});
            }, 500);
          }
        }
      ]);
      
    } catch (error) {
      console.error('일정 생성 오류:', error);
      Alert.alert('오류', '일정 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 현재 드롭다운에 표시할 옵션 결정
  const getCurrentDropdownOptions = () => {
    switch(showDropdown) {
      case 'startMonth':
      case 'endMonth':
        return monthOptions;
      case 'startDay':
      case 'endDay':
        return dayOptions;
      case 'startHour':
      case 'endHour':
        return hourOptions;
      case 'startMinute':
      case 'endMinute':
        return minuteOptions;
      default:
        return [];
    }
  };

  // 주소 검색 핸들러
  const handleAddressSearch = () => {
    setShowAddressModal(true);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* 일정 이름 */}
        <InputWithLabel
          label="일정이름"
          placeholder="일정 제목을 입력해주세요."
          value={title}
          onChangeText={setTitle}
        />

        {/* 일정 소개글 입력 필드 */}
        <View style={styles.inputGroup}>
          <InputWithLabel
            label={<Text style={styles.label}>일정 소개글</Text>}
            placeholder="일정에 대한 소개글을 작성해주세요."
            value={description}
            onChangeText={setDescription}
            isTextarea={true}
          />
        </View>

        {/* 일정 유형 선택 컴포넌트 (단일/연속/정기) */}
        <ScheduleTypeSelector 
          selectedOption={selectedOption} 
          setSelectedOption={setSelectedOption} 
        />

        {/* 일정 유형에 따른 날짜 및 시간 선택 UI */}
        <ScheduleDateSection 
          selectedOption={selectedOption}
          dates={{ startMonth, startDay, endMonth, endDay }}
          times={{ startHour, startMinute, endHour, endMinute }}
          selectedDays={selectedDays}
          toggleDaySelection={toggleDaySelection}
          setShowDropdown={setShowDropdown}
          dayOfWeekOptions={dayOfWeekOptions}
        />

        {/* 모집 인원 입력 필드 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>모집 인원</Text>
          <InputWithLabel
            placeholder="모집 인원을 작성해주세요."
            value={maxMembers}
            onChangeText={setMaxMembers}
            keyboardType="numeric"
            label=""
          />
        </View>

        {/* 장소 정보 입력 섹션 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>장소</Text>
          <AddressInput 
            address={address}
            onPress={handleAddressSearch}
          />
          <InputWithLabel
            placeholder="상세주소를 입력해주세요."
            value={detailAddress}
            onChangeText={setDetailAddress}
            label=""
          />
        </View>

        {/* 생성 버튼 */}
        <View style={styles.buttonContainer}>
          {/* <TouchableOpacity 
            style={[styles.submitButton, isLoading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>{isLoading ? '처리중...' : '일정 생성'}</Text>
          </TouchableOpacity> */}
          <CustomButton 
            title={isLoading ? '처리중...' : '일정 생성'}
            onPress={handleSubmit}
            style={{...styles.submitButton, marginTop: 20}}
            textStyle={{fontSize: 16, lineHeight: 20}}
            disabled={isLoading}
          />
        </View>
      </View>
      
      {/* 드롭다운 모달 컴포넌트 */}
      <DropdownModal 
        showDropdown={showDropdown}
        setShowDropdown={setShowDropdown}
        options={getCurrentDropdownOptions()}
        handleSelectOption={handleSelectOption}
      />
      
      {/* 주소 검색 모달 컴포넌트 */}
      <AddressSearchModal 
        showAddressModal={showAddressModal}
        setShowAddressModal={setShowAddressModal}
        setPostcode={setPostcode}
        setAddress={setAddress}
      />
    </ScrollView>
  );
};

/**
 * 스타일 정의
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PRIMARY_BACK_COLOR,
  },
  content: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: BLACK_COLOR,
  },
  buttonContainer: {
    marginTop: 1,
    alignItems: 'center',
    paddingRight: 0,
    marginBottom: 10,
    width: '100%',
  },
  submitButton: {
    width: '100%',
    height: 45,
    // backgroundColor: '#E8E8E8',
    // borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // disabledButton: {
  //   backgroundColor: '#cccccc',
  // },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: BLACK_COLOR,
  },
});

export default SchedulePost;
