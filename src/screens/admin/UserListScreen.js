import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native';
import { BLACK_COLOR, WHITE_COLOR } from '../../constants/colors';
import { commonShadow } from '../../constants/styles';

const UserListScreen = () => {
  // 임시 사용자 데이터 (실제로는 API에서 받아올 데이터)
  const allUsers = [
    { id: 1, nickname: 'Lain', image: require('../../../assets/images/mypage/user.png') },
    { id: 2, nickname: 'Brian', image: require('../../../assets/images/mypage/user.png') },
    { id: 3, nickname: 'Smith', image: require('../../../assets/images/mypage/user.png') },
    { id: 4, nickname: 'Sam', image: require('../../../assets/images/mypage/user.png') },
    { id: 5, nickname: 'Kevin', image: require('../../../assets/images/mypage/user.png') },
    { id: 6, nickname: 'Max', image: require('../../../assets/images/mypage/user.png') },
    { id: 7, nickname: 'John', image: require('../../../assets/images/mypage/user.png') },
    { id: 8, nickname: 'Emma', image: require('../../../assets/images/mypage/user.png') },
    { id: 9, nickname: 'Oliver', image: require('../../../assets/images/mypage/user.png') },
    { id: 10, nickname: 'Sophie', image: require('../../../assets/images/mypage/user.png') },
    { id: 11, nickname: 'William', image: require('../../../assets/images/mypage/user.png') },
    { id: 12, nickname: 'Isabella', image: require('../../../assets/images/mypage/user.png') },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(allUsers.length / itemsPerPage);

  // 현재 페이지에 해당하는 사용자만 필터링
  const getCurrentPageUsers = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return allUsers.slice(startIndex, endIndex);
  };

  // 페이지 변경 핸들러
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const renderUserItem = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <Image source={item.image} style={styles.userImage} />
        <View style={styles.nicknameContainer}>
          <Text style={styles.dotText}>●</Text>
          <Text style={styles.nicknameLabel}>닉네임 : </Text>
          <Text style={styles.nicknameText}>{item.nickname}</Text>
        </View>
      </View>
      <TouchableOpacity style={[styles.detailButton, commonShadow.mainShadow]}>
        <Text style={styles.detailButtonText}>상세조회</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPagination = () => {
    const pageNumbers = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    // 페이지 범위 조정
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity 
          style={styles.paginationArrow}
          onPress={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <Text style={currentPage === 1 ? styles.paginationArrowDisabled : styles.paginationArrow}>{'<'}</Text>
        </TouchableOpacity>
        {pageNumbers.map((page) => (
          <TouchableOpacity
            key={page}
            style={[
              styles.paginationButton,
              page === currentPage && styles.paginationButtonActive,
            ]}
            onPress={() => handlePageChange(page)}
          >
            <Text
              style={[
                styles.paginationText,
                page === currentPage && styles.paginationTextActive,
              ]}
            >
              {page}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity 
          style={styles.paginationArrow}
          onPress={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <Text style={currentPage === totalPages ? styles.paginationArrowDisabled : styles.paginationArrow}>{'>'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={getCurrentPageUsers()}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListFooterComponent={renderPagination}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F3FF',
  },
  listContainer: {
    padding: 20,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: WHITE_COLOR,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  nicknameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dotText: {
    color: '#4CAF50',
    marginRight: 8,
    fontSize: 8,
  },
  nicknameLabel: {
    fontSize: 16,
    color: BLACK_COLOR,
  },
  nicknameText: {
    fontSize: 16,
    color: BLACK_COLOR,
    fontWeight: '500',
  },
  detailButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: BLACK_COLOR,
  },
  detailButtonText: {
    fontSize: 14,
    color: BLACK_COLOR,
    fontWeight: '500',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  paginationButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    borderRadius: 15,
  },
  paginationButtonActive: {
    backgroundColor: '#FFD700',
    borderWidth: 1,
    borderColor: BLACK_COLOR,
  },
  paginationText: {
    fontSize: 14,
    color: BLACK_COLOR,
  },
  paginationTextActive: {
    fontWeight: 'bold',
  },
  paginationArrow: {
    padding: 10,
    color: BLACK_COLOR,
  },
  paginationArrowDisabled: {
    padding: 10,
    color: '#CCCCCC',
  },
});

export default UserListScreen; 