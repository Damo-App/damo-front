import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import { useCategories } from '../../hooks/useCategories'; // Custom hook for fetching categories
import CategoryTag from '../../components/CategoryTag';
import { CustomButton } from '../../components/CustomButton';
import * as categoryService from '../../api/queries/categoryService'; // API service
import { commonCircle, commonStyles } from '../../constants/styles';
import { AuthContext } from '../../contexts/AuthProvider'; 
import { BLACK_COLOR, G_DARK_COLOR, G_DARKER_COLOR } from '../../constants/colors';
import Toast from 'react-native-toast-message';

const SelectCategories = () => {
  //DB에 저장되어 있는걸로 가져오기 (더미데이터 삭제)
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.categoriesList(); // 비동기로 데이터 가져오기
        setCategories(data); // 가져온 데이터를 상태로 저장
      } catch (error) {
        Toast.error({
          type: 'error',
          text1: '카테고리 조회 실패패!',
          text2: error.message,
        })
      }
    };

    fetchCategories();
  }, []); // 컴포넌트가 마운트될 때 한 번 실행

  const [selectedCategories, setSelectedCategories] = useState([]);
  const { width } = Dimensions.get('window');
  const BUTTON_WIDTH = (width - 48) / 3 - 8;

  const route = useRoute();
  const navigation = useNavigation();
  const {isCategorySelected, setIsCategorySelected, memberId, token } = useContext(AuthContext);

  console.log("setIsCategorySelected ====", setIsCategorySelected, isCategorySelected, memberId, token)

  const isEditing = route.params?.isEditing || false;

  // const { data: existingCategories, isLoading, error } = useCategories(memberId, token);
  const { data: existingCategories, isLoading, error } = useCategories(
    isEditing && memberId ? memberId : null // 🔹 회원가입 시에는 호출하지 않음
  );

  // useEffect(() => {
  //   if (existingCategories && isEditing) {
  //     const initialSelected = existingCategories.map((category) => {
  //       const matchedCategory = categories.find((cat) => cat === category.name);
  //       return matchedCategory || null;
  //     }).filter(Boolean);
  //     setSelectedCategories(initialSelected);
  //   }
  // }, [existingCategories, isEditing]);

  useEffect(() => {
    if (isEditing && existingCategories) {
      setSelectedCategories(existingCategories.map((cat) => cat.name));
    }
  }, [existingCategories, isEditing]);

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : prev.length < 3 ? [...prev, category] : prev
    );
  };

  const mutation = useMutation({
    mutationFn: categoryService.updateUserCategories,
    onSuccess: () => {
      console.log('Category updated successfully!');
      navigation.replace('MainTabs');
    },
    onError: (error) => {
      console.error('Failed to update category:', error);
    },
  });


  const handleEditCategorySelection = () => {
    const memberCategories = selectedCategories.map((categoryName) => {
      const categoryId = categories.indexOf(categoryName) + 1;
      return { categoryId, priority: selectedCategories.indexOf(categoryName) + 1 };
    });

    mutation.mutate({ memberCategories });
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, commonStyles.container]}>
      <View style={commonStyles.boxContainer}>
        <View>
          {isLoading ? (
            <Text style={styles.noticeText}>Loading...</Text>
          ) : error ? (
            <Text style={styles.noticeText}>Failed to load data.</Text>
          ) : (
            <>
              <View style={styles.noticeContainer}>
                <View style={commonCircle.outer}>
                  <View style={commonCircle.inner}></View>
                </View>
                <Text style={styles.noticeText}>
                  안내사항{'\n'}
                  - 최소 하나에서 최대 세 개의 관심사를 선택하세요.{'\n'}
                  - 첫 번째 선택한 관심사가 우선순위로 지정됩니다.{'\n'}
                  - 마이페이지에서 수정 가능합니다.
                </Text>
              </View>

              <View style={styles.categoryGrid}>
                {categories.map((category, index) => (
                  <CategoryTag
                    key={index}
                    name={category}
                    size={14}
                    color="black"
                    onSelect={() => toggleCategory(category)}
                    selectedOrder={
                      selectedCategories.includes(category)
                        ? selectedCategories.indexOf(category) + 1
                        : null
                    }
                    isDisabled={
                      selectedCategories.length >= 3 &&
                      !selectedCategories.includes(category)
                    }
                    buttonWidth={BUTTON_WIDTH}
                  />
                ))}
              </View>
            </>
          )}
        </View>
        
        <CustomButton 
          title="선택 완료"
          onPress={handleEditCategorySelection} 
          disabled={selectedCategories.length === 0 || isLoading} 
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  categoryGrid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-start',
    marginBottom: 16,
    width: '100%',
  },
});

export default SelectCategories;


// import React, { useState, useContext } from 'react';
// import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useRoute, useNavigation } from '@react-navigation/native';
// import CategoryTag from '../../components/CategoryTag';
// import { CustomButton } from '../../components/CustomButton';
// import * as userService from '../../api/mutations/userService';
// import { commonCircle, commonStyles } from '../../constants/styles';
// import { AuthContext } from '../../contexts/AuthProvider'; 
// import { BLACK_COLOR, G_DARK_COLOR, G_DARKER_COLOR } from '../../constants/colors';

// const categories = [
//   '스포츠', '언어', '악기', '댄스', '반려동물',
//   '사교/인맥', '요리/레시피', '게임/오락', '사진/영상',
//   '독서', '노래', '자동차', '여행',
// ];

// const SelectCategories = () => {
//   const [selectedCategories, setSelectedCategories] = useState([]);
//   const { width } = Dimensions.get('window');
//   const BUTTON_WIDTH = (width - 48) / 3 - 8; 

//   const route = useRoute();
//   const navigation = useNavigation();
//   const { setIsCategorySelected } = useContext(AuthContext); 

//   const initialData = route.params?.initialData || {}; // 회원가입 데이터

//   // 카테고리 선택 토글
//   const toggleCategory = (category) => {
//     setSelectedCategories((prev) =>
//       prev.includes(category)
//         ? prev.filter((item) => item !== category)
//         : prev.length < 3 ? [...prev, category] : prev
//     );
//   };

//   // 카테고리 선택 완료 (로그인한 경우)
//   const handleCategorySelectionComplete = async () => {
//     try {
//       await AsyncStorage.setItem('isCategorySelected', 'true'); 
//       setIsCategorySelected(true); // 상태 업데이트
//       navigation.replace('MainTabs'); 
//     } catch (error) {
//       console.error('Error saving category selection:', error);
//     }
//   };

//   // 카테고리 선택 완료 (회원가입하는 경우)
//   const handleCompleteSelection = async () => {
//     const memberCategories = selectedCategories.map((categoryName) => {
//       const categoryId = categories.indexOf(categoryName) + 1;
//       return { categoryId };
//     });

//     const finalData = { ...initialData, memberCategories };

//     console.log("finalData = ", finalData);

//     try {
//       if (Object.keys(initialData).length > 0) {
//         // 회원가입 진행 중
//         await userService.registerUser(finalData);
//         console.log('회원가입 성공!', finalData);
//         navigation.navigate('MainTabs', { screen: 'Login' });
//       } else {
//         // 이미 로그인한 경우
//         await AsyncStorage.setItem('isCategorySelected', 'true');
//         setIsCategorySelected(true); // 상태 업데이트 추가
//         navigation.replace('MainTabs');
//       }
//     } catch (error) {
//       console.log(error.response?.data);
//       console.error('회원가입 또는 카테고리 저장 실패:', error);
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={[styles.container,commonStyles.container]}>
//       <View style={commonStyles.boxContainer}>
//         <View >
//           {/* Notice */}
//           <View style={styles.noticeContainer}>
//           <View style={commonCircle.outer} ><View style={commonCircle.inner} ></View></View>
//             <Text style={styles.noticeText}>
//                안내사항{'\n'}
//               - 관심사는 최소 1개 최대 3개 선택 가능합니다.{'\n'}
//               - 처음 선택한 관심사가 1순위로 지정됩니다.{'\n'}
//               - 카테고리는 마이페이지에서 수정이 가능합니다.
//             </Text>
//           </View>

//           {/* Category list */}
//           <View style={styles.categoryGrid}>
//             {categories.map((category, index) => (
//               <CategoryTag
//                 key={index}
//                 name={category}
//                 size={14}
//                 color="black"
//                 onSelect={() => toggleCategory(category)}
//                 selectedOrder={selectedCategories.includes(category) ? 
//                   selectedCategories.indexOf(category) + 1 : null}
//                 isDisabled={
//                   selectedCategories.length >= 3 && 
//                   !selectedCategories.includes(category)
//                 }
//                 buttonWidth={BUTTON_WIDTH}
//               />
//             ))}
//           </View>
//         </View>
      
//         <CustomButton 
//           title="선택 완료"
//           onPress={handleCompleteSelection}
//           disabled={selectedCategories.length === 0} 
//         />
//       </View>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   // container: {
//   //   width: '100%',
//   //   flex: 1,
//   //   alignItems: 'center',
//   //   paddingHorizontal: 16,
//   //   paddingVertical: 32,
//   // },
//   categoryGrid: {
//     // borderWidth:1,
//     // borderColor:BLACK_COLOR,
//     display: 'flex',
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap : 8,
//     justifyContent: 'flex-start',
//     marginBottom: 16,
//     width: '100%',
//   },
//   noticeContainer: {
//     marginBottom: 16,
//     width: '100%',
//     alignItems: 'flex-start',
//     flexDirection:'row',
//     gap:4
//   },
//   noticeText: {
//     fontSize: 14,
//     color: G_DARKER_COLOR,
//     lineHeight: 18,
//     textAlign: 'left',
//   },
// });

// export default SelectCategories;
