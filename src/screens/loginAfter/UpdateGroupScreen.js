import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert, Platform } from "react-native";
import InputWithLabel from "../../components/InputWithLabel";
import { CommonRadio } from "../../components/CommonRadio";
import CommonTag from "../../components/CommonTag";
import { commonStyles } from "../../constants/styles";
import { CustomButton } from "../../components/CustomButton";
import * as ImagePicker from 'expo-image-picker';
import { BEIGE_COLOR, BLACK_COLOR, G_DARKER_COLOR, GREEN_LIGHT_COLOR, NAV_BAR_COLOR, PINK_DARK_COLOR, PINK_LIGHT_COLOR, PRIMARY_BTN_COLOR, PRIMARY_COLOR, SKY_BLUE, WHITE_COLOR, YELLOW_DARK_COLOR } from "../../constants/colors";
import { instance } from "../../api/axiosInstance";
import { useRoute } from "@react-navigation/native";
import DropDownPicker from "react-native-dropdown-picker";
import * as groupService from '../../api/queries/groupService';
import { text } from "framer-motion/client";


// 유효성 검사 함수
const isValidGroupName = (name) => {
  const regex = /^[a-zA-Z0-9가-힣\s]+$/; // 특수문자 불가
  return regex.test(name) && name.length >= 1 && name.length <= 15;
};

const categoryColor = {
  '연령대': PRIMARY_COLOR,
  'MBTI': BEIGE_COLOR,
  '분위기': NAV_BAR_COLOR,
  '장소': YELLOW_DARK_COLOR,
  '지역': SKY_BLUE,
  '장소': YELLOW_DARK_COLOR,
  '활동비': PINK_DARK_COLOR,
}

const isValidIntroduction = (text) => text.length >= 10 && text.length <= 100;
const isValidMemberCount = (count) => count >= 2 && count <= 100;

const UpdateGroupScreen = ({ navigation }) => {
  const [groupName, setGroupName] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [maxMembers, setMaxMembers] = useState('');
  const [gender, setGender] = useState('');
  const [ageRestriction, setAgeRestriction] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');
  const [mandatoryTags, setMandatoryTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [isMandatoryExpanded, setIsMandatoryExpanded] = useState(true);
  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [expandedSections, setExpandedSections] = useState([]);
  const [sections, setSections] = useState([]);
  const [sectionsTag, setSectionsTag] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const route = useRoute();
  const { selectedCategoryId } = route.params || {};
  const [openStart, setOpenStart] = useState(false);
  const [openEnd, setOpenEnd] = useState(false);
  const yearItems = [...Array(50)].map((_, i) => ({
    label: String(1970 + i)+"년",
    value: String(1970 + i),
  }));
  const [groupData, setGroupData] = useState([]);

  const groupId = route.params?.groupId;

  console.log('groupId', groupId);

    const tagToCategory = {};
      sectionsTag.forEach(section => {
        section.tags.forEach(tag => {
          tagToCategory[tag] = section.title;
        });
    });
    useEffect(() => {
      console.log(`Received Category ID in CreateGroupScreen: ${selectedCategoryId}`);
  
      if (!selectedCategoryId) {
        Alert.alert(
          "오류", 
          "카테고리 정보가 없습니다. 이전 화면으로 돌아가 다시 시도해주세요.",
          [{ text: "확인", onPress: () => navigation.goBack() }]
        );
      }
    }, [selectedCategoryId]);
  
    useEffect(() => {
      const fetchTagsByCategory = async () => {
        try {
          if (!selectedCategoryId) {
            console.error("No category ID provided");
            return;
          }
    
          const response = await instance.get(`/categories/${selectedCategoryId}/subcategories`);
          const responseTag = await instance.get(`/tags`);
          
          console.log("response 카테고리 서브카테고리 }}}}}}", response.data.data);
          console.log("responseTag 카테고리 서브카테고리", responseTag.data.data.tags);
          if (response.data?.data?.length === 0) {
            console.warn("No tags found for this category");
            setSections([]);
          } else if (response.data?.data) {
            setSections(response.data.data);
          } else {
            console.error("Unexpected response format");
          }
  
          if (responseTag.data.data.tags && Object.keys(responseTag.data.data.tags).length > 0) {
            const sectionsArray = Object.entries(responseTag.data.data.tags).map(([title, tags]) => ({
              title,
              tags,  
          }));
            setSectionsTag(sectionsArray);
  
        console.log("선택 태그 map 돌리기 용 sectionsTag ==",sectionsTag)
        } else {
          setSectionsTag([]);
        }
        } catch (error) {
          if (error.response?.status === 404) {
            console.error("Tags not found for this category");
            Alert.alert("알림", "선택한 카테고리에 태그 정보가 없습니다.");
          } else {
            console.error("Error fetching tags:", error.message);
            Alert.alert("오류", "태그 정보를 가져오는 중 문제가 발생했습니다.");
          }
        }
      };
    
      fetchTagsByCategory();
    }, [selectedCategoryId]);

  useEffect(() => {
    if (!groupId) {
      console.log('[에러] groupId가 전달되지 않았습니다:', route.params);
      return;
    }
    const fetchGroupDetail = async () => {
        try {
            const groupInfo = await groupService.fetchGroupDetail(groupId);

            console.log('groupInfo]]]]]]]]]]]]]]', groupInfo)
            setGroupData(groupInfo)
            setGroupName(groupInfo.name || '');
            setIntroduction(groupInfo.introduction || '');
            setMaxMembers(String(groupInfo.maxMemberCount) || '');
            setGender(
              groupInfo.gender === 'NONE' ? '무관' : 
              groupInfo.gender === 'FEMALE' ? '여성' : 
              groupInfo.gender === 'MALE' ? '남성' : ''
            );  
            
            if (groupInfo.minBirth != null && groupInfo.maxBirth != null) {
              setAgeRestriction('제한') 
              setStartYear(String(groupInfo.minBirth));
              setEndYear(String(groupInfo.maxBirth));
            } else {
              setAgeRestriction('무관');
              setStartYear('');
              setEndYear('');
            }

            const tagsObj = groupInfo.tags || {};
            const selected = Object.values(tagsObj).flat();
            setSelectedTags(selected);
            setProfileImage(groupInfo.image || null);

            setMandatoryTags([groupInfo.subCategoryName]);
          } catch(e) {
              console.log('noData', e);
            }
    }
    fetchGroupDetail();
  }, [groupId])
  console.log('groupData', groupData)
  // 섹션 토글 함수
  const toggleSection = (index) => {
    const newExpandedSections = [...expandedSections];
    newExpandedSections[index] = !newExpandedSections[index];
    setExpandedSections(newExpandedSections);
  };

   const openGallery = async () => {
      // 권한 요청
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '사진 접근 권한이 필요합니다.');
        return;
      }
  
      // 갤러리 열기
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });
  
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        console.log("이미지 선택 관련 result 결과",result.assets[0].uri);
        setProfileImage(result.assets[0].uri); //이미지 등록 useState 함수 활욘
      } else {
        console.log("이미지 선택이 취소되었습니다.");
      }
    };
  

  // 폼 유효성 검사
  useEffect(() => {
    const errors = {};

    // 모임 이름 검사
    if (groupName && !isValidGroupName(groupName)) {
      errors.groupName = '특수문자 없이 1~15자 이내로 입력하세요';
    }

    // 모임 소개글 검사
    if (introduction && !isValidIntroduction(introduction)) {
      errors.introduction = '10~100자 이내로 입력하세요';
    }

    // 가입 인원수 검사
    if (maxMembers && !isValidMemberCount(Number(maxMembers))) {
      errors.maxMembers = '2~100명 사이로 입력하세요';
    }

    setErrors(errors);
    setIsFormValid(
      groupName && 
      introduction && 
      maxMembers && 
      Object.keys(errors).length === 0 &&
      mandatoryTags.length > 0  // 필수 태그 선택 확인
    );
  }, [groupName, introduction, maxMembers, mandatoryTags]);

  // 이미지 업로드 함수
  const uploadImage = async (groupId) => {
    if (!profileImage) return null;

    try {
      // 이미지 파일 이름 추출 (URI에서 마지막 부분)
      const uriParts = profileImage.split('/');
      const fileName = uriParts[uriParts.length - 1];
      
      // 파일 타입 추측 (확장자 기반)
      const fileType = fileName.split('.').pop().toLowerCase() === 'png' 
        ? 'image/png' 
        : 'image/jpeg';

        console.log("uriParts============ ",uriParts);
        console.log("fileName========== ",fileName);
        console.log("fileType========== ",fileType);
        
        console.log("Uploading image for group:", groupId);
      
      console.log("Image upload response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error uploading image:", error.response?.data || error.message);
      throw error;
    }
  };

  const handleSubmit = async () => {  
    console.log('handleSubmit - groupId:', groupId);
  if (!isFormValid) {
    Alert.alert("입력 오류", "모든 필수 정보를 올바르게 입력해주세요.");
    return;
  }

  if (!selectedCategoryId) {
    Alert.alert("오류", "카테고리 정보가 없습니다.");
    return;
  }

  try {
    setIsLoading(true);

    // 1. groupData 준비
    const groupData = {
      introduction: introduction,
      maxMemberCount: parseInt(maxMembers, 10),
    };

    /// 수정중 ----------- //////
    const formData = new FormData();

    if (profileImage) {
      const uriParts = profileImage.split('/');
      const fileName = uriParts[uriParts.length - 1];
      const fileType = fileName.split('.').pop().toLowerCase() === 'png'
        ? 'image/png'
        : 'image/jpeg';

        console.log("uriParts : ",uriParts);
        console.log("fileName : ",fileName);
        console.log("fileType : ",fileType);

      formData.append('groupImage', {
        uri: profileImage,
        name: fileName,
        type: fileType,
      });
    }

    formData.append(
      'groupPatchDto',
      JSON.stringify(groupData)
    );

    const response = await instance.patch(`/groups/${groupId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const location = response.headers.location;
    
    if (location) {
      const match = location.match(/\/groups\/(\d+)/);
      if (match && match[1]) {
        groupId = Number(match[1]);
      }
    }

      Alert.alert("성공", "모임이 성공적으로 수정되었습니다.", [
        {
          text: "확인",
          onPress: () => navigation.replace('GroupDetail', { groupId })
        }
      ]);

    // 이후 로직 (성공 처리 등)
  } catch (error) {
    // 에러 처리
    console.error('Error details:', error.toJSON ? error.toJSON() : error);
     console.error('모임 수정 오류:', error);
     console.error('모임 수정 오류:', error.response?.data || error.message);
      Alert.alert(
        "오류", 
        error.response?.data?.message || "모임 수정 중 오류가 발생했습니다. 다시 시도해주세요."
      );
  } finally {
    setIsLoading(false);
  }
};

  return (
    <View style={[commonStyles.container, styles.container]}>
      <FlatList style={[styles.flatContainer, commonStyles.paddingX]}
        ListHeaderComponent={
          <>
            {/* 모임 대표 이미지 */}
            <Text style={styles.header}>모임 대표 이미지</Text>
            <View style={styles.profilePosition}>
              <TouchableOpacity style={styles.imageButton} onPress={openGallery}>
                {profileImage ? (
                  <Image
                    source={{ uri: profileImage }}
                    style={styles.profileImage}
                    onLoad={() => console.log("이미지 로드 성공")}
                    onError={(error) => console.log("이미지 로드 오류:", error.nativeEvent.error)}
                  />
                ) : (
                  <View style={styles.buttonContainer}>
                    <CustomButton
                      title="+"
                      onPress={openGallery}
                      style={styles.imageButton}
                    />
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* 모임 이름 입력 */}
            <InputWithLabel
              style={styles.input}
              label="모임 이름"
              value={groupName}
              placeholderStyle={{fontSize:12}}
              placeholder="모임 이름을 입력해주세요. (최소 1자, 최대 15자 이내)"
              isTextarea={false}
              disabled={true}
              error={errors.groupName}
            />
  
            {/* 소개글 입력 */}
            <InputWithLabel
              label="소개글"
              value={introduction}
              placeholderStyle={{fontSize:12}}
              onChangeText={setIntroduction}
              placeholder="소개글을 입력해주세요. (최소 10자, 최대 100자 이내)"
              isTextarea={true}
              style={styles.input}
              error={errors.introduction}
            />
  
            {/* 가입 인원수 및 성별 */}
            <View style={styles.row}>
              <InputWithLabel
                label="가입 인원수"
                value={maxMembers}
                placeholderStyle={{fontSize:12}}
                onChangeText={text => setMaxMembers(text.replace(/[^0-9]/g, ''))}
                placeholder="최대 인원수를 입력해주세요." 
                containerStyle={{width: '50%'}}
                keyboardType="numeric"
                error={errors.maxMembers}
              />
              <CommonRadio
                label="성별"
                value={gender}
                // onChange={setGender}
                disabled={true}
                options={[
                  { label: "무관", value: "무관" },
                  { label: "남성", value: "남성" },
                  { label: "여성", value: "여성" },
                ]}
                containerStyle={{width: '50%'}}
                groupStyle={{display:'flex', flexDirection:'column'}}
              />
            </View>
            <View>
              <Text style={styles.label}>모임 연령</Text>
              <CommonRadio
                disabled={true}
                value={ageRestriction}
                onChange={setAgeRestriction}
                options={[
                  { label: "무관", value: "무관" },
                  { label: "제한", value: "제한" },
                ]}
                containerStyle={{ paddingBottom: 8 }}
                groupStyle={{ flexDirection: 'column' }}
              />

                {ageRestriction === "제한" && (
                  <View style={styles.ageRange}>
                    {/* 시작연도 드롭다운 */}
                    <DropDownPicker 
                      open={openStart}
                      value={startYear}
                      items={yearItems}
                      setValue={setStartYear}
                      setItems={() => {}}
                      style={styles.pickerBox}   // 커스텀 박스 스타일
                      containerStyle={{ width: 140 }}
                      textStyle={styles.pickerText}
                      arrowIconStyle={styles.arrowIcon}
                      listMode="SCROLLVIEW"
                      zIndex={2000}
                      disabled={true}
                    />

                    {/* ~ 텍스트 */}
                    <Text style={styles.rangeSeparator}>~</Text>

                    {/* 종료연도 드롭다운 */}
                    <DropDownPicker
                      open={openEnd}
                      value={endYear}
                      items={yearItems}
                      setValue={setEndYear}
                      setItems={() => {}}
                      style={styles.pickerBox}
                      containerStyle={{ width: 140 }}
                      textStyle={styles.pickerText}
                      arrowIconStyle={styles.arrowIcon}
                      listMode="SCROLLVIEW"
                      zIndex={1000}
                      disabled={true}
                    />
                  </View>
                )};
            </View>

            {/* 태그 선택 */}
            <Text style={styles.subHeader}>선택 한 태그</Text>
            <View style={styles.selectedTagsContainer}>
              {[...mandatoryTags].map((tag) => {
                return(
                  <CommonTag
                    key={tag}
                    name={tag}
                    size={14}
                    color="#000"
                    showCloseButton={false}
                    containerStyle={{
                      borderWidth:1, 
                      borderColor:BLACK_COLOR,
                      backgroundColor: PINK_LIGHT_COLOR
                    }}
                    closeButtonStyle={{
                      backgroundColor: PINK_LIGHT_COLOR
                    }}
                    onPress={() =>
                      setMandatoryTags([])
                    }
                  />
                  );
              })}
              {[...selectedTags].map((tag) => {
                const categoryName = tagToCategory[tag];
                const color = categoryColor[categoryName];
                return (
                  <CommonTag
                    key={tag}
                    name={tag}
                    size={14}
                    color="#000"
                    showCloseButton={false}
                    containerStyle={{
                      borderWidth:1, 
                      borderColor:BLACK_COLOR,
                      backgroundColor: color
                    }}
                    closeButtonStyle={{
                      backgroundColor: color  
                    }}
                    onPress={() =>
                      setSelectedTags(selectedTags.filter((t) => t !== tag))
                    }
                  />
                )}
              )}
                
            </View>
          </>
        }
        data={[]}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 80
        }}
        ListFooterComponent={
          <CustomButton
            title={isLoading ? "처리 중..." : "모임 수정완료"}
            onPress={handleSubmit}
            style={{ alignSelf: 'stretch', marginVertical: 20 }}
            disabled={!isFormValid || isLoading}
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
    backgroundColor: '#fce7fc',
    width: '100%',
    height: '100%'
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
  subTagStyle: {
    marginVertical: 10,
    fontSize: 14,
    fontWeight: 'bold'
  },
  imageButton: {
    width: 100, // 버튼 크기
    height: 100,
    borderRadius: 50, // 둥근 모양
    justifyContent: 'center',
    alignItems: 'center', // 텍스트 중앙 정렬,
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
  },
  profilePosition: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  sectionHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingTop: 8,
},
toggleButton: {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'start',
  width: 20,
  height: 20,
},
toggleButtonText: {
  lineHeight: 18,
  fontSize: 20,
  fontWeight: 'bold',
  color: BLACK_COLOR,
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
  },
  sectionContainer: {
    marginBottom:12, 
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  sectionTitle: {
    marginBottom: 12,
    fontSize: 14,
    fontWeight: 'bold',
  },
  tagContainer: {
    borderRadius: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 12,
    paddingHorizontal: 10,

  },
  tag: {
    backgroundColor: WHITE_COLOR,
    fontWeight: 'bold',
  },
  flatContainer:{
    width:'100%',
  },
  input: {
    marginBottom: 16,
    width: '100%',
    fontSize: 10
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: 16,
    gap:16
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 20,
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
    fontSize: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  ageRange: {
    width:'100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  rangeSeparator: {
    fontSize: 19,
    fontWeight: 'bold',
    color: BLACK_COLOR, // "~" 색상 (검은색)
    marginHorizontal: 14
  },
  pickerBox: {
    width: '100%',
    height: 44,
    borderWidth: 1,
    borderColor: BLACK_COLOR,
    borderRadius: 14,
    backgroundColor: '#fff',
    marginHorizontal: 0,
    justifyContent: 'center',
    padding: 0,
  },
  pickerText: {
    fontSize: 16,
    color: '#202020',
    textAlign: 'center',
    lineHeight: 20,
    textAlignVertical: 'center',
    includeFontPadding: false
  },
  pickerDropDown: {
    width: '100%',
    left: 0,
    alignSelf: 'flex-start',
    borderColor: '#121212',
    borderRadius: 14,
    backgroundColor: '#fff',
  },
  arrowIcon: {
    width: 0,
    height: 0,
    opacity: 0,
    margin: 0,
    padding: 0,
  },
});

export default UpdateGroupScreen;
