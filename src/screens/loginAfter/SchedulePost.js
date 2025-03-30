import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import InputWithLabel from '../../components/InputWithLabel';
import { PRIMARY_BACK_COLOR, BLACK_COLOR, WHITE_COLOR } from '../../constants/colors';

// 분리된 컴포넌트들 임포트
import ScheduleTypeSelector from '../../components/schedule/ScheduleTypeSelector';
import ScheduleDateSection from '../../components/schedule/ScheduleDateSection';
import DropdownModal from '../../components/schedule/DropdownModal';
import AddressSearchModal from '../../components/schedule/AddressSearchModal';
import AddressInput from '../../components/schedule/AddressInput';

const SchedulePost = ({ navigation }) => {
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
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [postcode, setPostcode] = useState('');
  
  // 주소 검색 모달 상태
  const [showAddressModal, setShowAddressModal] = useState(false);

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

  const handleSubmit = () => {
    // 일정 등록 로직
    const scheduleData = {
      title,
      description,
      scheduleType: selectedOption,
      location,
      address,
      detailAddress
    };

    // 일정 유형에 따라 다른 데이터 포함
    if (selectedOption === '단일일정') {
      scheduleData.date = { month: startMonth, day: startDay };
    } else if (selectedOption === '연속일정') {
      scheduleData.dateRange = { 
        start: { month: startMonth, day: startDay },
        end: { month: endMonth, day: endDay }
      };
    } else if (selectedOption === '정기일정') {
      scheduleData.repeatingDays = selectedDays;
    }

    // 시간 정보 추가
    scheduleData.timeRange = { 
      start: { hour: startHour, minute: startMinute },
      end: { hour: endHour, minute: endMinute }
    };

    console.log(scheduleData);
    // navigation.goBack();
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

        {/* 일정 소개글 */}
        <View style={styles.inputGroup}>
          <InputWithLabel
            label={<Text style={styles.label}>일정 소개글</Text>}
            placeholder="일정에 대한 소개글을 작성해주세요."
            value={description}
            onChangeText={setDescription}
            isTextarea={true}
          />
        </View>

        {/* 일정 유형 선택 */}
        <ScheduleTypeSelector 
          selectedOption={selectedOption} 
          setSelectedOption={setSelectedOption} 
        />

        {/* 일정 유형에 따른 날짜 선택 UI */}
        <ScheduleDateSection 
          selectedOption={selectedOption}
          dates={{ startMonth, startDay, endMonth, endDay }}
          times={{ startHour, startMinute, endHour, endMinute }}
          selectedDays={selectedDays}
          toggleDaySelection={toggleDaySelection}
          setShowDropdown={setShowDropdown}
          dayOfWeekOptions={dayOfWeekOptions}
        />

        {/* 모집 인원 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>모집 인원</Text>
          <InputWithLabel
            placeholder="모집 인원을 작성해주세요."
            value={location}
            onChangeText={setLocation}
            label=""
          />
        </View>

        {/* 장소 */}
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
          <TouchableOpacity 
            style={styles.submitButton} 
            onPress={handleSubmit}
          >
            <Text style={styles.buttonText}>생성</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* 드롭다운 모달 */}
      <DropdownModal 
        showDropdown={showDropdown}
        setShowDropdown={setShowDropdown}
        options={getCurrentDropdownOptions()}
        handleSelectOption={handleSelectOption}
      />
      
      {/* 주소 검색 모달 */}
      <AddressSearchModal 
        showAddressModal={showAddressModal}
        setShowAddressModal={setShowAddressModal}
        setPostcode={setPostcode}
        setAddress={setAddress}
      />
    </ScrollView>
  );
};

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
  },
  submitButton: {
    width: 80,
    height: 40,
    backgroundColor: '#E8E8E8',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: BLACK_COLOR,
  },
});

export default SchedulePost;
