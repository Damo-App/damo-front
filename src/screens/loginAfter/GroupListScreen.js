import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { CustomButton } from '../../components/CustomButton';
import { commonStyles } from '../../constants/styles';
import GroupListBox from '../../components/GroupListBox';
import { CategoryIcon } from '../../components/CategoryIcon';
import { commonShadow } from '../../constants/styles';
import { instance } from '../../api/axiosInstance';
import { BLACK_COLOR, ERROR_COLOR, G_DARK_COLOR, G_LIGHT_COLOR, PRIMARY_COLOR, WHITE_COLOR } from '../../constants/colors';
// import { red } from 'react-native-reanimated/lib/typescript/Colors';

// 카테고리 ID에 따른 이미지 매핑
const categoryImages = {
  1: require('../../../assets/images/loopimg/left/1.png'),
  2: require('../../../assets/images/loopimg/left/2.png'),
  3: require('../../../assets/images/loopimg/left/3.png'),
  4: require('../../../assets/images/loopimg/left/4.png'),
  5: require('../../../assets/images/loopimg/left/5.png'),
  6: require('../../../assets/images/loopimg/left/6.png'),
  7: require('../../../assets/images/loopimg/left/7.png'),
  8: require('../../../assets/images/loopimg/left/8.png'),
  9: require('../../../assets/images/loopimg/left/9.png'),
  10: require('../../../assets/images/loopimg/left/10.png'),
  11: require('../../../assets/images/loopimg/left/11.png'),
  12: require('../../../assets/images/loopimg/left/12.png'),
  13: require('../../../assets/images/loopimg/left/13.png')
};

const getCategoryImage = (categoryId) => {
  return categoryImages[categoryId] || categoryImages[1]; // 기본값으로 category1.png 사용
};

function GroupListScreen({navigation}) {
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // 회원의 카테고리 조회
  const { data: categoriesData } = useQuery({
    queryKey: ['memberCategories'],
    queryFn: async () => {
      const response = await instance.get('/members/categories');
      console.log('Categories response:', response.data);
      return response.data;
    },
  });

  // console.log("categoriesData ==", memberCategories);

  // 첫 번째 카테고리 자동 선택
  // useEffect(() => {
  //   if (categoriesData?.data?.length > 0 && !selectedCategoryId) {
  //     const firstCategory = categoriesData.data[0];
  //     console.log('Initial category set:', firstCategory);
  //     setSelectedCategoryId(firstCategory.categoryId);
  //     setCurrentPage(1);
  //   }
  // }, [categoriesData]);
  useEffect(() => {
    if (categoriesData?.data?.length > 0 && !selectedCategoryId) {
      const firstCategory = categoriesData.data[0];
      console.log('Initial category set:', firstCategory);
      setSelectedCategoryId(firstCategory.categoryId); // 첫 번째 카테고리 ID 설정
      setCurrentPage(1);
    }
  }, [categoriesData]);

  // 선택된 카테고리의 모임 목록 조회
  const { data: groupsData, isLoading, refetch } = useQuery({
    queryKey: ['groups', selectedCategoryId, currentPage],
    queryFn: async () => {
      if (!selectedCategoryId) return null;
      console.log('Fetching groups for categoryId:', selectedCategoryId, 'page:', currentPage);
      const response = await instance.get(`/groups?page=${currentPage}&size=${PAGE_SIZE}&categoryId=${selectedCategoryId}`);
      console.log('Groups API Response:', response.data);
      return response.data;
    },
    enabled: !!selectedCategoryId,
  });

  // 카테고리 변경시 페이지 초기화
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategoryId]);

  const totalPages = Math.ceil((groupsData?.pageInfo?.totalElements || 0) / PAGE_SIZE);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // 카테고리 아이콘 배열 생성 (3개 고정)
  const renderCategoryIcons = () => {
    const categories = categoriesData?.data || [];
    console.log('Current categories:', categories);

    const getCategoryImageName = (categoryId) => {
      const categoryNameMap = {
        1: 'Sports',
        2: 'Languages',
        3: 'MusicInstrument',
        4: 'Dance',
        5: 'Pets',
        6: 'Society',
        7: 'Cook',
        8: 'Game',
        9: 'Photo',
        10: 'Books',
        11: 'Music',
        12: 'Car',
        13: 'Travel'
      };
      return categoryNameMap[categoryId];
    };

    const icons = [];

    // 3개의 아이콘 슬롯 생성
    for (let i = 0; i < 3; i++) {
      const category = categories.find(cat => cat.priority === i + 1);
      console.log(`Slot ${i + 1}, Category:`, category);
      
      icons.push(
        <CategoryIcon 
          key={i}
          imageName={category ? getCategoryImageName(category.categoryId) : null}
          style={[
            styles.categoryIcon,
            commonShadow.mainShadow,
            selectedCategoryId === category?.categoryId && styles.selectedCategory,
            !category && styles.disabledCategory
          ]}
          onPress={() => {
            if (category && category.categoryId !== selectedCategoryId) {
              setSelectedCategoryId(category.categoryId);
            }
          }}
        />
      );
    }
    return icons;
  };

  const renderPagination = () => {
    if (!groupsData?.data?.length) return null;

    const pageNumbers = [];
    const maxVisible = 5; // 한 번에 보여줄 최대 페이지 수
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    // 시작 페이지 조정
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    return (
      <View style={styles.pagination}>
        <TouchableOpacity 
          style={[
            styles.pageButton, 
            commonShadow.mainShadow,
            currentPage === 1 && styles.pageButtonDisabled
          ]}
          onPress={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <Text style={styles.pageButtonText}>{'<'}</Text>
        </TouchableOpacity>

        {start > 1 && (
          <>
            <TouchableOpacity 
              style={[styles.pageButton, commonShadow.mainShadow]}
              onPress={() => handlePageChange(1)}
            >
              <Text style={styles.pageButtonText}>1</Text>
            </TouchableOpacity>
            {start > 2 && <Text style={styles.pageButtonText}>...</Text>}
          </>
        )}

        {Array.from({length: end - start + 1}, (_, i) => start + i).map(page => (
          <TouchableOpacity
            key={page}
            style={[
              styles.pageButton,
              commonShadow.mainShadow,
              currentPage === page && styles.pageButtonActive
            ]}
            onPress={() => handlePageChange(page)}
          >
            <Text style={[styles.pageButtonText, currentPage === page && styles.pageButtonTextActive]}>
              {page}
            </Text>
          </TouchableOpacity>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <Text style={styles.pageButtonText}>...</Text>}
            <TouchableOpacity 
              style={[styles.pageButton, commonShadow.mainShadow]}
              onPress={() => handlePageChange(totalPages)}
            >
              <Text style={styles.pageButtonText}>{totalPages}</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity 
          style={[
            styles.pageButton,
            commonShadow.mainShadow,
            currentPage === totalPages && styles.pageButtonDisabled
          ]}
          onPress={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <Text style={styles.pageButtonText}>{'>'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[commonStyles.container, { flex: 1 }]}>
      {/* 카테고리 아이콘 */}
      <View style={styles.categoryContainer}>
        {renderCategoryIcons()}
      </View>
    
      {/* 모임 생성 버튼 */}
      <CustomButton 
        style={{ marginTop: 20 }}
        textStyle={{ fontSize: 16 }}
        title="모임 생성하기"
        onPress={() => {
          if (!selectedCategoryId) {
            console.error("No category selected");
            return;
          }
          navigation.navigate('CreateGroupScreen', { selectedCategoryId }); // 카테고리 ID 전달
        }}
        // onPress={() => navigation.navigate('CreateGroupScreen', { selectedCategoryId: selectedCategoryId })}
      />

      {/* 그룹 리스트 */}

      {groupsData?.data.length > 0 ? 
      <FlatList
      style={styles.flatList}
      data={groupsData?.data || []}
      keyExtractor={(item) => item.groupId.toString()}
      renderItem={({ item }) => (
        <GroupListBox
          style={styles.groupCard}
          image={{ uri: item.image }}
          title={item.name}
          text={item.introduction}
          currentCount={item.memberCount}
          maxCount={item.maxMemberCount}
          subCategory={item.subCategoryName}
          tags={[
            ...(item.tags?.mood || []), 
            ...(item.tags?.MBTI || [])
          ]}
          onPress={() => navigation.navigate('GroupDetail', { groupId: item.groupId })}
        />
      )}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
      // ListEmptyComponent={() => (
      //   <Text style={styles.emptyText}>해당 카테고리의 모임이 없습니다.</Text>
      // )}
      ListFooterComponent={() => (
        <View style={styles.footer}>
          {isLoading ? (
            <Text style={styles.loadingText}>로딩 중...</Text>
          ) : renderPagination()}
          <View style={{ height: 20 }}/>
        </View>
      )}
    />
      : 
      <View style={styles.emptyTextBox}>
      <Text style={styles.emptyText}>해당 카테고리의 모임이 없습니다.</Text>
      </View>
      }
      
    </View>
  );
}

const styles = StyleSheet.create({
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    marginBottom: 5,
    gap: 30,
  },
  categoryIcon: {
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    padding: 20,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center'
  },
  selectedCategory: {
    backgroundColor: PRIMARY_COLOR,
  },
  disabledCategory: {
    opacity: 0.5,
    backgroundColor: '#F0F0F0',
  },
  flatList: {
    flex: 1,
    width: '100%',
  },
  listContainer: {
    flexGrow: 1,
    // paddingHorizontal: 10,
    paddingBottom: 40,
    // minHeight: '100%',
  },
  groupCard: {
    marginVertical: 5,
    width: '100%',
  },
  createButton: {
    marginBottom: 5,
    width: '95%',
    alignSelf: 'center',
    paddingVertical: 10,
  },
  emptyTextBox:{
    marginTop:5,
    height:'auto',
    width:'100%',
    paddingHorizontal:20,
    paddingVertical:50,
    borderWidth:1,
    borderColor:G_DARK_COLOR,
    borderRadius:12,
    backgroundColor:WHITE_COLOR
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: G_DARK_COLOR,
    textAlign: 'center',
  },
  footer: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginVertical: 10,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
    width: '100%',
    paddingHorizontal: 10,
  },
  pageButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    minWidth: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageButtonActive: {
    backgroundColor: '#E6E6E6',
  },
  pageButtonDisabled: {
    opacity: 0.5,
    backgroundColor: '#F0F0F0',
  },
  pageButtonText: {
    fontSize: 14,
    color: '#333333',
    textAlign: 'center',
  },
  pageButtonTextActive: {
    color: BLACK_COLOR,
  },
});

export default GroupListScreen;