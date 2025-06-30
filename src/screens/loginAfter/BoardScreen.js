import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text } from 'react-native';
import BoardCard from '../../components/BoardCard';
import { PRIMARY_BACK_COLOR, PRIMARY_BTN_COLOR, BLACK_COLOR, WHITE_COLOR } from '../../constants/colors';
import { commonBtn, commonShadow, commonStyles } from '../../constants/styles';
import { instance } from '../../api/axiosInstance';
import { useIsFocused } from '@react-navigation/native';

const BoardScreen = ({route, navigation}) => {
  const groupId = Number(route.params.groupId);
  const isFocused = useIsFocused();
  const [posts, setPosts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const PAGE_SIZE = 10;
  const defaultImage = require('../../../assets/images/loginLogo.png');

  React.useEffect(() => {
    const newGroupId = Number(route.params.groupId);
    console.log('Route params changed - New groupId:', newGroupId);
    if (newGroupId !== groupId) {
      setCurrentPage(1);
      setPosts([]);
    }
  }, [route.params]);

  React.useEffect(() => {
    if (groupId) {
      console.log('Fetching posts for groupId:', groupId);
      fetchPosts();
    }
  }, [groupId, currentPage]);

  // useEffect(() => {
  //   if (route.params?.refresh) {
  //     fetchPosts();
  //     navigation.setParams({ refresh: undefined });
  //   }
  // }, [route.params?.refresh]);

  const fetchPosts = async () => {
    try {
      const url = `/groups/${groupId}/boards?page=${currentPage}&size=${PAGE_SIZE}`;
      console.log('API Request URL:', url);
      console.log('Current groupId:', groupId, typeof groupId);
      
      const response = await instance.get(url);
      console.log('API Response data:', {
        groupId: groupId,
        totalPosts: response.data.data.length,
        firstPost: response.data.data[0],
        pageInfo: response.data.pageInfo
      });
      
      setPosts(response.data.data);
      setTotalPages(response.data.pageInfo.totalPages || 1);
    } catch (error) {
      console.error('게시글 목록 조회 실패:', error);
      console.error('Error request URL:', `/groups/${groupId}/boards?page=${currentPage}&size=${PAGE_SIZE}`);
      console.error('Error details:', error.response?.data);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

   useEffect(() => {
        if (isFocused) {
        fetchPosts();
        }
    }, [isFocused]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePostPress = (boardId) => {
    console.log('게시글 클릭 - boardId:', boardId, 'groupId:', groupId);
    navigation.navigate('BoardDetailsScreen', { boardId, groupId });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  return (
    <View style={commonStyles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.writeButton, commonShadow.mainShadow]}
            onPress={() => {
              navigation.navigate('BoardPostScreen', { groupId });
            }}
          >
            <Text style={styles.buttonText}>게시글 작성</Text>
          </TouchableOpacity>
        </View>

        {posts.length > 0 ? (
          posts.map((post) => (
            <TouchableOpacity 
              key={post.boardId}
              onPress={() => handlePostPress(post.boardId)}
              activeOpacity={0.8}
              style={styles.cardContainer}
            >
              <BoardCard
                profileImage={post.memberProfile ? { uri: post.memberProfile } : null}
                username={post.memberName}
                title={post.title}
                content={post.content}
                postImage={post.image ? { uri: post.image } : null}
                createdAt={formatDate(post.createdAt)}
                commentCount={post.commentCount}
              />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>게시글이 없습니다.</Text>
          </View>
        )}

        {totalPages > 1 && (
          <View style={styles.paginationContainer}>
            <TouchableOpacity 
              style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
              onPress={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <Text style={styles.pageButtonText}>{'<'}</Text>
            </TouchableOpacity>

            {(() => {
              let startPage = Math.max(1, currentPage - 1);
              let endPage = Math.min(totalPages, startPage + 3);
              
              if (endPage - startPage < 3) {
                startPage = Math.max(1, endPage - 3);
              }
              
              return Array.from({length: endPage - startPage + 1}, (_, i) => startPage + i).map(page => (
                <TouchableOpacity
                  key={page}
                  style={[
                    styles.pageButton,
                    currentPage === page && styles.pageButtonActive
                  ]}
                  onPress={() => handlePageChange(page)}
                >
                  <Text style={[
                    styles.pageButtonText,
                    currentPage === page && styles.pageButtonTextActive
                  ]}>
                    {page}
                  </Text>
                </TouchableOpacity>
              ));
            })()}

            <TouchableOpacity 
              style={[
                styles.pageButton,
                currentPage === totalPages && styles.pageButtonDisabled
              ]}
              onPress={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <Text style={styles.pageButtonText}>{'>'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    width: '100%',
  },
  scrollViewContent: {
    paddingHorizontal: 15,
    paddingBottom: 80,
  },
  buttonContainer: {
    paddingVertical: 8,
    alignItems: 'flex-end',
  },
  writeButton: {
    backgroundColor: PRIMARY_BTN_COLOR,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    width: 'auto',
    minWidth: 100,
  },
  buttonText: {
    color: BLACK_COLOR,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 'bold'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  cardContainer: {
    width: '100%',
    marginBottom: 15,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: PRIMARY_BACK_COLOR,
    gap: 8,
    marginTop: 10,
  },
  pageButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: WHITE_COLOR,
    borderRadius: 8,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BLACK_COLOR,
    ...commonShadow.mainShadow,
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
    color: BLACK_COLOR,
    fontWeight: '600',
  },
  pageButtonTextActive: {
    color: BLACK_COLOR,
    fontWeight: 'bold',
  },
});

export default BoardScreen;
