import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, FlatList } from 'react-native';
import Postcode from '@actbase/react-daum-postcode'; // WebView 대신 Postcode 임포트
import InputWithLabel from '../../components/InputWithLabel';
import { PRIMARY_BACK_COLOR, PRIMARY_BTN_COLOR, BLACK_COLOR, WHITE_COLOR } from '../../constants/colors';
import { commonStyles, commonRadio } from '../../constants/styles';
import Icon from 'react-native-vector-icons/MaterialIcons'; // 아이콘 사용

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

  // 라디오 버튼 옵션
  const radioOptions = [
    { label: '단일일정', value: '단일일정' },
    { label: '연속일정', value: '연속일정' },
    { label: '정기일정', value: '정기일정' },
  ];

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

  // 드롭다운 렌더링 함수
  const renderDropdown = () => {
    let options = [];
    
    switch(showDropdown) {
      case 'startMonth':
      case 'endMonth':
        options = monthOptions;
        break;
      case 'startDay':
      case 'endDay':
        options = dayOptions;
        break;
      case 'startHour':
      case 'endHour':
        options = hourOptions;
        break;
      case 'startMinute':
      case 'endMinute':
        options = minuteOptions;
        break;
      default:
        return null;
    }
    
    return (
      <Modal
        visible={showDropdown !== ''}
        transparent={true}
        animationType="fade"
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          onPress={() => setShowDropdown('')}
        >
          <View style={styles.dropdownContainer}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={() => handleSelectOption(item, showDropdown)}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  // 주소 검색 핸들러
  const handleAddressSearch = () => {
    setShowAddressModal(true);
  };

  // 주소 검색 모달
  const renderAddressModal = () => {
    return (
      <Modal
        visible={showAddressModal}
        animationType="slide"
        transparent={false}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>주소 검색</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowAddressModal(false)}
            >
              <Icon name="close" size={24} color={BLACK_COLOR} />
            </TouchableOpacity>
          </View>
          
          <Postcode
            style={styles.postcode}
            jsOptions={{ animation: true }}
            onSelected={(data) => {
              // 선택된 주소 정보 처리
              setPostcode(data.zonecode);
              
              // 도로명 주소 또는 지번 주소 설정
              const addr = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
              
              // 상세 주소 정보 구성
              let extraAddr = '';
              if (data.userSelectedType === 'R') {
                if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
                  extraAddr += data.bname;
                }
                if (data.buildingName !== '' && data.apartment === 'Y') {
                  extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
                }
                if (extraAddr !== '') {
                  extraAddr = ' (' + extraAddr + ')';
                }
              }
              
              // 최종 주소 설정
              setAddress(addr + extraAddr);
              setShowAddressModal(false);
            }}
          />
        </View>
      </Modal>
    );
  };

  // 검색 아이콘이 있는 주소 입력 컴포넌트
  const AddressInputWithIcon = ({ onPress }) => {
    return (
      <TouchableOpacity 
        style={styles.addressInputContainer}
        onPress={onPress}
      >
        <Icon name="search" size={20} color="#888" style={styles.searchIcon} />
        <Text style={address ? styles.addressText : styles.addressPlaceholder}>
          {address ? address : "장소 검색해주세요."}
        </Text>
      </TouchableOpacity>
    );
  };

  // 단일 일정 렌더링
  const renderSingleSchedule = () => (
    <View>
      <View style={styles.dateSection}>
        <Text style={styles.label}>일자</Text>
        <View style={[styles.dateRow, styles.singleDateRow]}>
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => setShowDropdown('startMonth')}
          >
            <Text style={styles.dropdownText}>{startMonth}</Text>
            <Icon name="arrow-drop-down" size={20} color={BLACK_COLOR} />
          </TouchableOpacity>
          
          <Text style={styles.dateSeparator}>:</Text>
          
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => setShowDropdown('startDay')}
          >
            <Text style={styles.dropdownText}>{startDay}</Text>
            <Icon name="arrow-drop-down" size={20} color={BLACK_COLOR} />
          </TouchableOpacity>
          
          {/* 시작시간과 같은 레이아웃을 위한 공간 */}
          <Text style={styles.emptyTilde}></Text>
          
          {/* 나머지 공간을 채웁니다 */}
          <View style={styles.spaceFiller}></View>
        </View>
      </View>
      
      {/* 시간 UI */}
      <View style={styles.dateSection}>
        <View style={styles.timeLabels}>
          <View style={styles.startTimeLabel}>
            <Text style={styles.label}>시작시간</Text>
          </View>
          <View style={styles.endTimeLabel}>
            <Text style={styles.label}>종료시간</Text>
          </View>
        </View>
        <View style={styles.dateRow}>
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => setShowDropdown('startHour')}
          >
            <Text style={styles.dropdownText}>{startHour}</Text>
            <Icon name="arrow-drop-down" size={20} color={BLACK_COLOR} />
          </TouchableOpacity>
          
          <Text style={styles.colon}>:</Text>
          
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => setShowDropdown('startMinute')}
          >
            <Text style={styles.dropdownText}>{startMinute}</Text>
            <Icon name="arrow-drop-down" size={20} color={BLACK_COLOR} />
          </TouchableOpacity>
          
          <Text style={styles.tilde}>~</Text>
          
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => setShowDropdown('endHour')}
          >
            <Text style={styles.dropdownText}>{endHour}</Text>
            <Icon name="arrow-drop-down" size={20} color={BLACK_COLOR} />
          </TouchableOpacity>
          
          <Text style={styles.colon}>:</Text>
          
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => setShowDropdown('endMinute')}
          >
            <Text style={styles.dropdownText}>{endMinute}</Text>
            <Icon name="arrow-drop-down" size={20} color={BLACK_COLOR} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // 연속 일정 렌더링
  const renderContinuousSchedule = () => (
    <View>
      <View style={styles.dateSection}>
        <View style={styles.dateLabels}>
          <View style={styles.startDateLabel}>
            <Text style={styles.label}>시작 일자</Text>
          </View>
          <View style={styles.endDateLabel}>
            <Text style={styles.label}>종료 일자</Text>
          </View>
        </View>
        <View style={styles.dateRow}>
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => setShowDropdown('startMonth')}
          >
            <Text style={styles.dropdownText}>{startMonth}</Text>
            <Icon name="arrow-drop-down" size={20} color={BLACK_COLOR} />
          </TouchableOpacity>
          
          <Text style={styles.colon}>:</Text>
          
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => setShowDropdown('startDay')}
          >
            <Text style={styles.dropdownText}>{startDay}</Text>
            <Icon name="arrow-drop-down" size={20} color={BLACK_COLOR} />
          </TouchableOpacity>
          
          <Text style={styles.tilde}>~</Text>
          
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => setShowDropdown('endMonth')}
          >
            <Text style={styles.dropdownText}>{endMonth}</Text>
            <Icon name="arrow-drop-down" size={20} color={BLACK_COLOR} />
          </TouchableOpacity>
          
          <Text style={styles.colon}>:</Text>
          
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => setShowDropdown('endDay')}
          >
            <Text style={styles.dropdownText}>{endDay}</Text>
            <Icon name="arrow-drop-down" size={20} color={BLACK_COLOR} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* 시간 UI */}
      <View style={styles.dateSection}>
        <View style={styles.timeLabels}>
          <View style={styles.startTimeLabel}>
            <Text style={styles.label}>시작시간</Text>
          </View>
          <View style={styles.endTimeLabel}>
            <Text style={styles.label}>종료시간</Text>
          </View>
        </View>
        <View style={styles.dateRow}>
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => setShowDropdown('startHour')}
          >
            <Text style={styles.dropdownText}>{startHour}</Text>
            <Icon name="arrow-drop-down" size={20} color={BLACK_COLOR} />
          </TouchableOpacity>
          
          <Text style={styles.colon}>:</Text>
          
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => setShowDropdown('startMinute')}
          >
            <Text style={styles.dropdownText}>{startMinute}</Text>
            <Icon name="arrow-drop-down" size={20} color={BLACK_COLOR} />
          </TouchableOpacity>
          
          <Text style={styles.tilde}>~</Text>
          
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => setShowDropdown('endHour')}
          >
            <Text style={styles.dropdownText}>{endHour}</Text>
            <Icon name="arrow-drop-down" size={20} color={BLACK_COLOR} />
          </TouchableOpacity>
          
          <Text style={styles.colon}>:</Text>
          
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => setShowDropdown('endMinute')}
          >
            <Text style={styles.dropdownText}>{endMinute}</Text>
            <Icon name="arrow-drop-down" size={20} color={BLACK_COLOR} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // 정기 일정 렌더링
  const renderRegularSchedule = () => (
    <View>
      <View style={styles.dateSection}>
        <View style={styles.dateLabels}>
          <View style={styles.startDateLabel}>
            <Text style={styles.label}>시작 일자</Text>
          </View>
          <View style={styles.endDateLabel}>
            <Text style={styles.label}>종료 일자</Text>
          </View>
        </View>
        <View style={styles.dateRow}>
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => setShowDropdown('startMonth')}
          >
            <Text style={styles.dropdownText}>{startMonth}</Text>
            <Icon name="arrow-drop-down" size={20} color={BLACK_COLOR} />
          </TouchableOpacity>
          
          <Text style={styles.colon}>:</Text>
          
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => setShowDropdown('startDay')}
          >
            <Text style={styles.dropdownText}>{startDay}</Text>
            <Icon name="arrow-drop-down" size={20} color={BLACK_COLOR} />
          </TouchableOpacity>
          
          <Text style={styles.tilde}>~</Text>
          
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => setShowDropdown('endMonth')}
          >
            <Text style={styles.dropdownText}>{endMonth}</Text>
            <Icon name="arrow-drop-down" size={20} color={BLACK_COLOR} />
          </TouchableOpacity>
          
          <Text style={styles.colon}>:</Text>
          
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => setShowDropdown('endDay')}
          >
            <Text style={styles.dropdownText}>{endDay}</Text>
            <Icon name="arrow-drop-down" size={20} color={BLACK_COLOR} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 정기모임 요일 선택 UI */}
      <View style={styles.dateSection}>
        <Text style={styles.label}>정기모임 요일</Text>
        <View style={styles.weekdaysContainer}>
          {dayOfWeekOptions.map(day => (
            <TouchableOpacity
              key={day.id}
              style={[
                styles.dayButton,
                selectedDays.includes(day.id) && styles.selectedDayButton
              ]}
              onPress={() => toggleDaySelection(day.id)}
            >
              <Text 
                style={[
                  styles.dayText,
                  selectedDays.includes(day.id) && styles.selectedDayText
                ]}
              >
                {day.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 시간 UI */}
      <View style={styles.dateSection}>
        <View style={styles.timeLabels}>
          <View style={styles.startTimeLabel}>
            <Text style={styles.label}>시작시간</Text>
          </View>
          <View style={styles.endTimeLabel}>
            <Text style={styles.label}>종료시간</Text>
          </View>
        </View>
        <View style={styles.dateRow}>
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => setShowDropdown('startHour')}
          >
            <Text style={styles.dropdownText}>{startHour}</Text>
            <Icon name="arrow-drop-down" size={20} color={BLACK_COLOR} />
          </TouchableOpacity>
          
          <Text style={styles.colon}>:</Text>
          
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => setShowDropdown('startMinute')}
          >
            <Text style={styles.dropdownText}>{startMinute}</Text>
            <Icon name="arrow-drop-down" size={20} color={BLACK_COLOR} />
          </TouchableOpacity>
          
          <Text style={styles.tilde}>~</Text>
          
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => setShowDropdown('endHour')}
          >
            <Text style={styles.dropdownText}>{endHour}</Text>
            <Icon name="arrow-drop-down" size={20} color={BLACK_COLOR} />
          </TouchableOpacity>
          
          <Text style={styles.colon}>:</Text>
          
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => setShowDropdown('endMinute')}
          >
            <Text style={styles.dropdownText}>{endMinute}</Text>
            <Icon name="arrow-drop-down" size={20} color={BLACK_COLOR} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // 일정 유형에 따라 적절한 일자 컴포넌트 렌더링
  const renderDateSection = () => {
    switch(selectedOption) {
      case '단일일정':
        return renderSingleSchedule();
      case '연속일정':
        return renderContinuousSchedule();
      case '정기일정':
        return renderRegularSchedule();
      default:
        return null;
    }
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
        <View style={[commonRadio.container, styles.radioGroupContainer]}>
          <View style={[commonRadio.radioGroup, styles.customRadioGroup]}>
            <View style={styles.radioItemContainer}>
              <TouchableOpacity
                style={styles.radioButtonTouchable}
                onPress={() => setSelectedOption('단일일정')}
              >
                <View style={styles.radioButton}>
                  {selectedOption === '단일일정' && <View style={styles.radioSelected} />}
                </View>
              </TouchableOpacity>
              <Text style={commonRadio.radioLabel}>단일일정</Text>
            </View>
            
            <View style={styles.radioItemContainer}>
              <TouchableOpacity
                style={styles.radioButtonTouchable}
                onPress={() => setSelectedOption('연속일정')}
              >
                <View style={styles.radioButton}>
                  {selectedOption === '연속일정' && <View style={styles.radioSelected} />}
                </View>
              </TouchableOpacity>
              <Text style={commonRadio.radioLabel}>연속일정</Text>
            </View>
            
            <View style={styles.radioItemContainer}>
              <TouchableOpacity
                style={styles.radioButtonTouchable}
                onPress={() => setSelectedOption('정기일정')}
              >
                <View style={styles.radioButton}>
                  {selectedOption === '정기일정' && <View style={styles.radioSelected} />}
                </View>
              </TouchableOpacity>
              <Text style={commonRadio.radioLabel}>정기일정</Text>
            </View>
          </View>
        </View>

        {/* 일정 유형에 따라 다른 일자 선택 UI 표시 */}
        {renderDateSection()}

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
          <AddressInputWithIcon onPress={handleAddressSearch} />
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
      
      {/* 드롭다운 렌더링 */}
      {renderDropdown()}
      
      {/* 주소 검색 모달 */}
      {renderAddressModal()}
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
  radioGroupContainer: {
    marginBottom: 20,
    marginTop: 8,
  },
  customRadioGroup: {
    justifyContent: 'space-between',
    width: '100%',
  },
  radioItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  radioButtonTouchable: {
    padding: 2,
  },
  radioButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BLACK_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BLACK_COLOR,
  },
  dateSection: {
    marginBottom: 16,
  },
  dateLabels: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  startDateLabel: {
    width: '41%',
    paddingLeft: 2,
  },
  endDateLabel: {
    width: '41%',
    marginLeft: 45,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
    padding: 8,
    borderWidth: 1,
    borderColor: BLACK_COLOR,
    borderRadius: 8,
    backgroundColor: WHITE_COLOR,
    width: '20%',
  },
  dropdownText: {
    color: BLACK_COLOR,
    fontSize: 14,
  },
  tilde: {
    marginHorizontal: 5,
    fontSize: 16,
  },
  colon: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 2,
    color: BLACK_COLOR,
  },
  timeLabels: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  startTimeLabel: {
    width: '41%',
    paddingLeft: 2,
  },
  endTimeLabel: {
    width: '41%',
    marginLeft: 45,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dropdownContainer: {
    width: '80%',
    maxHeight: 300,
    backgroundColor: WHITE_COLOR,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BLACK_COLOR,
    overflow: 'hidden',
  },
  optionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    fontSize: 16,
    color: BLACK_COLOR,
  },
  weekdaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  dayButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BLACK_COLOR,
    backgroundColor: WHITE_COLOR,
  },
  selectedDayButton: {
    backgroundColor: PRIMARY_BTN_COLOR,
    borderColor: PRIMARY_BTN_COLOR,
  },
  dayText: {
    fontSize: 14,
    color: BLACK_COLOR,
  },
  selectedDayText: {
    color: WHITE_COLOR,
    fontWeight: '500',
  },
  addressInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: BLACK_COLOR,
    borderRadius: 8,
    backgroundColor: WHITE_COLOR,
    height: 48,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  addressPlaceholder: {
    color: '#888',
    fontSize: 14,
  },
  addressText: {
    color: BLACK_COLOR,
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: WHITE_COLOR,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BLACK_COLOR,
  },
  closeButton: {
    padding: 8,
  },
  postcode: {
    width: '100%', 
    height: '100%',
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
  spaceFiller: {
    flex: 1,
  },
  singleDateRow: {
    justifyContent: 'flex-start',
  },
  dateSeparator: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 7,
    color: BLACK_COLOR,
  },
  emptyTilde: {
    width: 20,
    marginHorizontal: 5,
  },
});

export default SchedulePost;
