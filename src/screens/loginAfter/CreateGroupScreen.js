import React, { useState , useEffect} from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import InputWithLabel from "../../components/InputWithLabel";
import { CommonRadio } from "../../components/CommonRadio";
import CommonTag from "../../components/CommonTag";
import { commonStyles } from "../../constants/styles";
import { CustomButton } from "../../components/CustomButton";
import RNPickerSelect from 'react-native-picker-select';
import { BLACK_COLOR, GREEN_LIGHT_COLOR, PINK_DARK_COLOR, WHITE_COLOR, YELLOW_DARK_COLOR } from "../../constants/colors";
import { instance } from "../../api/axiosInstance";

// const [mandatoryTags, setMandatoryTags] = useState([]); // 필수 태그 상태
// const [selectedTags, setSelectedTags] = useState([]); // 선택 태그 상태
// const [groupName, setGroupName] = useState("");
// const [description, setDescription] = useState("");
// const [maxMembers, setMaxMembers] = useState("");
// const [gender, setGender] = useState("무관");
// const [ageRestriction, setAgeRestriction] = useState("무관");
// const [startYear, setStartYear] = useState('2000');
// const [endYear, setEndYear] = useState('2005');


// const sections = [
//   {
//     title: "서브 카테고리",
//     tags: ["축구", "야구", "배드민턴", "농구", "볼링", "당구", "테니스", "탁구"],
//     color: "#F5A9A9",
//   },
//   {
//     title: "연령대",
//     tags: ["10대", "20대", "30대", "40대", "50대"],
//     color: "#A9D0F5",
//   },
//   {
//     title: "MBTI",
//     tags: [
//       "INFP", "INFJ", "INTP", "INTJ",
//       "ISFP", "ISFJ", "ISTP", "ISTJ",
//       "ENFP", "ENFJ", "ENTP", "ENTJ",
//       "ESFP", "ESFJ", "ESTP", "ESTJ",
//     ],
//     color: "#D0A9F5",
//   },
//   {
//     title: "분위기",
//     tags: ["활발함", "조용함"],
//     color: "#A9F5A9",
//   },
//   {
//     title: "장소",
//     tags: ["서울", "경기/인천", "강원도", "충청도"],
//     color: "#F5D0A9",
//   },
// ];
// const [isMandatoryExpanded, setIsMandatoryExpanded] = useState(false);
// const [expandedSections, setExpandedSections] = useState(sections.slice(1).map(() => false));

// const toggleMandatory = () => {
//   setIsMandatoryExpanded(!isMandatoryExpanded);
// };

// const toggleSection = (index) => {
//   setExpandedSections((prev) => {
//     const newState = [...prev];
//     newState[index] = !newState[index];
//     return newState;
//   });
// };



// 유효성 검사 함수
const isValidGroupName = (name) => {
  const regex = /^[a-zA-Z0-9가-힣\s]+$/; // 특수문자 불가
  return regex.test(name) && name.length >= 1 && name.length <= 15;
};

const isValidIntroduction = (text) => text.length >= 10 && text.length <= 100;
const isValidMemberCount = (count) => count >= 2 && count <= 100;

const CreateGroupScreen = () => {
  const [groupName, setGroupName] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [maxMembers, setMaxMembers] = useState('');
  const [gender, setGender] = useState('NONE');
  const [ageRestriction, setAgeRestriction] = useState('무관');
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');
  const [mandatoryTags, setMandatoryTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [isMandatoryExpanded, setIsMandatoryExpanded] = useState(true);
  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [expandedSections, setExpandedSections] = useState([]); // 선택 태그 섹션 확장 여부
  const [value, setValue] = useState('');


  // 테스트 시 데이터 주입 가능하도록 빈 배열로 초기화
  const sections = [
    {
      title: "서브 카테고리",
      tags: ["축구", "야구", "배드민턴", "농구", "볼링", "당구", "테니스", "탁구"],
      color: "#F5A9A9",
      isMandatory: true // 필수 선택
    },
    {
      title: "연령대",
      tags: ["10대", "20대", "30대", "40대", "50대"],
      color: "#A9D0F5",
      isMandatory: true
    },
    {
      title: "MBTI",
      tags: ["INFP", "INFJ", "INTP", "INTJ", "ISFP", "ISFJ", "ISTP", "ISTJ", "ENFP", "ENFJ", "ENTP", "ENTJ", "ESFP", "ESFJ", "ESTP", "ESTJ"],
      color: "#D0A9F5",
      isMandatory: false
    },
    {
      title: "분위기",
      tags: ["활발함", "조용함"],
      color: "#A9F5A9",
      isMandatory: false
    },
    {
      title: "장소",
      tags: ["서울", "경기/인천", "강원도", "충청도"],
      color: "#F5D0A9",
      isMandatory: false
    },
  ];

  const toggleMandatory = () => setIsMandatoryExpanded(!isMandatoryExpanded);

  const toggleSection = (index) => {
    setExpandedSections((prev) => {
      const newSections = [...prev];
      newSections[index] = !newSections[index];
      return newSections;
    });
  };
  
  // 폼 유효성 검사
  useEffect(() => {
    const errors = {};

    // 모임 이름 검사
    if (!isValidGroupName(groupName)) {
      errors.groupName = '특수문자 없이 1~15자 이내로 입력하세요';
    }

    // 모임 소개글 검사
    if (!isValidIntroduction(introduction)) {
      errors.introduction = '10~100자 이내로 입력하세요';
    }

    // 가입 인원수 검사
    if (!isValidMemberCount(Number(maxMembers))) {
      errors.maxMembers = '2~100명 사이로 입력하세요';
    }

    setErrors(errors);
    setIsFormValid(Object.keys(errors).length === 0);
  }, [groupName, introduction, maxMembers]);

  // 모임 생성 요청
  const handleSubmit = async () => {
    if (!isFormValid) return;

    try {
      const groupData = {
        groupName,
        introduction,
        maxMemberCount: maxMembers,
        gender,
        minBirth: startYear,
        maxBirth: endYear,
        tags: selectedTags.map((tag) => ({ tagName: tag })),
      };

      console.log('요청 데이터:', groupData);

      const response = await instance.post('/groups', groupData);
      console.log(response);
      console.alert('성공', '모임이 생성되었습니다');
    } catch (error) {
      console.error('오류 발생:', error.response?.data || error.message);
      console.alert('오류', error.response?.data?.message || '서버 오류 발생');
    }
  };


  return (
    <View style={[commonStyles.container, styles.container]}>
      <FlatList style={styles.flatContainer}
        ListHeaderComponent={
          <>
          {/* 모임 대표 이미지 */}
          <Text style={styles.header}>모임 대표 이미지</Text>
          <View style={styles.buttonContainer}>
            <CustomButton
              title="+"
              onPress={() => {}}
              style={styles.imageButton}
            />
          </View>

  
            {/* 모임 이름 입력 */}
            <InputWithLabel
              label="모임 이름"
              value={groupName}
              onChangeText={setGroupName}
              placeholder="모임 이름을 입력해주세요. (최소 1자, 최대 10자 이내)"
              isTextarea={true}
              style={styles.input}
            />
  
            {/* 소개글 입력 */}
            <InputWithLabel
              label="소개글"
              value={{value}}
              onChangeText={setIntroduction}
              placeholder="소개글을 입력해주세요. (최소 10자, 최대 100자 이내)"
              isTextarea={true}
              style={styles.input}
            />
  
            {/* 가입 인원수 및 성별 */}
            <View style={styles.row}>
              <InputWithLabel
                label="가입 인원수"
                value={maxMembers}
                onChangeText={setMaxMembers}
                placeholder="최대 인원수를 입력해주세요." 
                containerStyle={{width: '50%'}}
                // style={[styles.smallInput]}
              />
              <CommonRadio
                label="성별"
                value={gender}
                onChange={setGender}
                options={[
                  { label: "무관", value: "무관" },
                  { label: "남성", value: "남성" },
                  { label: "여성", value: "여성" },
                ]}
                containerStyle={{width: '50%'}}
                groupStyle={{display:'flex', flexDirection:'column'}}
                // style={styles.radio}
              />
            </View>
  
            {/* 모임 연령 */}
<View style={styles.ageContainer}>
  <Text style={styles.label}>모임 연령</Text>
  <CommonRadio
    value={ageRestriction}
    onChange={setAgeRestriction}
    options={[
      { label: "무관", value: "무관" },
      { label: "제한", value: "제한" },
    ]}
    containerStyle={{ paddingBottom: 8 }}
    groupStyle={{ flexDirection: 'column' }}
  />

  {/* 조건부 렌더링: 제한 선택 시 드롭박스 표시 */}
  {ageRestriction === "제한" && (
    <View style={styles.ageRange}>
      {/* 시작 연도 드롭다운 */}
      <RNPickerSelect
        onValueChange={(value) => setStartYear(value)}
        value={startYear}
        items={[...Array(35)].map((_, i) => {
          const year = 1990 + i;
          return { label: String(year), value: String(year) };
        })}
        style={pickerStyle}
        placeholder={{ label: "시작 연도", value: null }}
      />
      <Text style={styles.rangeSeparator}>~</Text>
      {/* 종료 연도 드롭다운 */}
      <RNPickerSelect
        onValueChange={(value) => setEndYear(value)}
        value={endYear}
        items={[...Array(35)].map((_, i) => {
          const year = 1990 + i;
          return { label: String(year), value: String(year) };
        })}
        style={pickerStyle}
        placeholder={{ label: "종료 연도", value: null }}
      />
    </View>
  )}
</View>
            {/* 태그 선택 */}
            <Text style={styles.subHeader}>태그 선택</Text>
            {mandatoryTags && <View style={styles.selectedTagsContainer}>
             {[...mandatoryTags, ...selectedTags].map((tag) => (
              <CommonTag
                key={tag}
                name={tag}
                size={14}
                color="#000"
                showCloseButton={true}
                containerStyle={{
                  borderWidth:1, 
                  borderColor:BLACK_COLOR,
                  backgroundColor: YELLOW_DARK_COLOR,
                }}
                closeButtonStyle={{
                  backgroundColor: YELLOW_DARK_COLOR
                }}
                onPress={() =>
                  mandatoryTags.includes(tag)
                    ? setMandatoryTags([])
                    : setSelectedTags(selectedTags.filter((t) => t !== tag))
                }
              />
            ))}
          </View>}

{/* 필수 태그 */}
<View style={[styles.sectionContainer, { backgroundColor: PINK_DARK_COLOR }]}>
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{sections[0].title}</Text>
    <TouchableOpacity onPress={toggleMandatory} style={styles.toggleButton}>
      <Text style={styles.toggleButtonText}>{isMandatoryExpanded ? '-' : '+'}</Text>
    </TouchableOpacity>
  </View>
  {isMandatoryExpanded && (
    <View style={styles.tagContainer}>
      {sections[0].tags.map((tag) => (
        <TouchableOpacity
          key={tag}
          onPress={() => {
            if (mandatoryTags.includes(tag)) {
              setMandatoryTags([]);
            } else {
              setMandatoryTags([tag]);
            }
          }}
        >
          <CommonTag
            name={tag}
            size={14}
            color="#000"
            showCloseButton={false}
            containerStyle={{
              borderColor: mandatoryTags.includes(tag) ? BLACK_COLOR : "#CCE5E5",
              borderWidth: mandatoryTags.includes(tag) ? 2 : 0,
              backgroundColor: WHITE_COLOR,
            }}
          />
        </TouchableOpacity>
      ))}
    </View>
  )}
</View>

{/* 선택 태그 */}
{sections.slice(1).map((section, index) => (
  <View key={section.title || index} style={[styles.sectionContainer, { backgroundColor: GREEN_LIGHT_COLOR }]}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <TouchableOpacity onPress={() => toggleSection(index)} style={styles.toggleButton}>
        <Text style={styles.toggleButtonText}>{expandedSections[index] ? '-' : '+'}</Text>
      </TouchableOpacity>
    </View>
    {expandedSections[index] && (
      <View style={styles.tagContainer}>
        {section.tags.map((tag) => (
          <TouchableOpacity
            key={tag}
            onPress={() => {
              if (selectedTags.includes(tag)) {
                setSelectedTags(selectedTags.filter((t) => t !== tag));
              } else if (selectedTags.length < 3) {
                setSelectedTags([...selectedTags, tag]);
              }
            }}
            disabled={!selectedTags.includes(tag) && selectedTags.length >= 3}
          >
            <CommonTag
              name={tag}
              size={14}
              color="#000"
              showCloseButton={false}
              containerStyle={{
                borderColor: selectedTags.includes(tag) ? BLACK_COLOR : "#CCE5E5",
                borderWidth: selectedTags.includes(tag) ? 2 : 0,
                backgroundColor: WHITE_COLOR,
              }}
            />
          </TouchableOpacity>
        ))}
      </View>
    )}
  </View>
))}
                        </>
                      }
                      data={[]}
                      contentContainerStyle={styles.listContent}
                      ListFooterComponent={
                        <CustomButton
                          title="모임 생성하기"
                          onPress={handleSubmit}
                          style={{ alignSelf: 'stretch', marginVertical: 20 }}
                        />
                      }
                    />
                  </View>
                );
              };
  
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 25,
    paddingHorizontal: 16,
    backgroundColor: '#fce7fc',
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  buttonContainer: {
    justifyContent: "center", // 세로축 중앙 정렬
    alignItems: "center", // 가로축 중앙 정렬
  },
  imageButton: {
    width: 80, // 버튼 크기
    height: 80,
    borderRadius: 40, // 둥근 모양
    justifyContent: 'center',
    alignItems: 'center', // 텍스트 중앙 정렬,
  },
  sectionHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 8,
},
toggleButton: {
  width: 20,
  height: 20,
  justifyContent: 'center',
  alignItems: 'center',
},
toggleButtonText: {
  fontSize: 20,
  fontWeight: 'bold',
  color: '#000',
},
  subHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  selectedTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    // marginBottom: 10,
  },
  sectionContainer: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: "#CCE5E5",
    fontWeight: 'bold',
  },
  flatContainer:{
    width:'100%',
  },
  imageContainer: {
    width: '100%',
    height: 150,
    marginBottom: 16,
  },
  imagePlaceholder: {
    width: '100%',
    height: '50%',
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageText: {
    fontSize: 24,
    color: '#666',
  },
  smallInput:{
    borderWidth:1,
    borderColor:BLACK_COLOR
  },
  input: {
    marginBottom: 16,
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: 16,
    gap:16
  },
  row2: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: '100%',
    marginBottom: 16,
    gap:16,
  },
  ageRange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  yearInput: {
    width: '30%',
    textAlignVertical: 'center',
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    padding: 8,
  },
  listContent: {
    paddingBottom: 20,
  },
  ageRange: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // 드롭박스와 "~" 사이 간격 조정
  },
  yearInput: {
    borderWidth: 1,
    borderColor: '#000', // 테두리 색상 (검은색)
    borderRadius: 8, // 둥근 모서리
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: 80, // 드롭박스 너비
    textAlign: 'center', // 텍스트 중앙 정렬
    backgroundColor: '#FFFFFF', // 배경색 (흰색)
  },
  rangeSeparator: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000', // "~" 색상 (검은색)
    marginHorizontal: 8, // "~" 좌우 간격
  },
  ageContainer: {
    // marginVertical: 16,
    // paddingVertical: 12,
    // borderRadius: 8,
    // paddingHorizontal: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  ageRange: {
    flexDirection: 'row', // 시작 연도와 종료 연도를 가로로 배치
    alignItems: 'center', // 세로축 중앙 정렬
    justifyContent: 'space-between', // 좌우 간격 조정
    marginTop: 8,
  },
  rangeSeparator: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000', // "~" 색상 (검은색)
    marginHorizontal: 8, // "~" 좌우 간격
  },
});

const pickerStyle = StyleSheet.create({
  viewContainer: {
    borderWidth: 1,
    borderColor: BLACK_COLOR,
    borderRadius: 12,
    backgroundColor: 'white',
    width: 140,
  },
  inputAndroid: {
    height: 50,
    color: '#333',
    fontSize: 14,
    paddingLeft: 10,
    paddingRight: 10,
  },
  inputIOS: {
    height: 50,
    color: '#333',
    fontSize: 14,
    paddingLeft: 10,
    paddingRight: 10,
  },
  iconContainer: {
    top: 12,
    right: 12,
  },
});

export default CreateGroupScreen;
