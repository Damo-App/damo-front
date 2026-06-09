import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { CustomButton } from '../../components/CustomButton';
import CommonTag from '../../components/CommonTag';
import { BLACK_COLOR, G_DARK_COLOR, WHITE_COLOR } from '../../constants/colors';
import { commonShadow, commonStyles } from '../../constants/styles';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { instance } from '../../api/axiosInstance';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useUser } from '../../hooks/useUser';
import { useCategories } from '../../hooks/useCategories';
import { CommonRadio } from '../../components/CommonRadio';
import { Size } from 'react-native-ui-lib/src/components/skeletonView';
import { SafeAreaView } from 'react-native-safe-area-context';

const MyBoardScreen = () => {
  const {user} = useUser();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [boards, setBoards] = useState([]);
  const [isLoadingBoards, setIsLoadingBoards] = useState(true);
  const memberId = user.memberId;
  
  const {categories, isLoading: isLoadingCategories } = useCategories(memberId)

  const fetchBoards = async (categoryId) => {
    setIsLoadingBoards(true);
    try{
      const response = await instance.get(`/mypage/boards`, {
        // headers: {Authorization: `Bearer ${user.accessToken}`}
        params:{
          page: 1,
          size: 10,
          categoryId: categoryId === '전체' ? null : categoryId,
        },
      })
      setBoards(response.data.data || [])
    }catch(error){
      console.log("Error fetch Board : ", error.response?.data || error.message);
    }finally{
      setIsLoadingBoards(false);
    }
  }

  useEffect(() => {
    fetchBoards(selectedCategory);
  },[selectedCategory]);

  const handlePostPress = (boardId, groupId) => {
    console.log('게시글 클릭 - boardId:', boardId);
    navigation.navigate('BoardDetailsScreen', { boardId, groupId });
  };

  return (
    <SafeAreaView style={{flex: 1}} edges={['left', 'right', 'bottom']}>
      <View style={[ commonStyles.container]}>
          <CommonRadio
            value={selectedCategory}
            onChange={(value) => setSelectedCategory(value)}
            options={[
              { label: '전체', value: '전체' },
              ...(Array.isArray(categories) ? categories.map((category) => ({
                label: category.categoryName,
                value: category.categoryId,
              })) : []), 
            ]}
          />
      
          <ScrollView style={[styles.tabContent, commonStyles.paddingX, commonStyles.paddingY]}>
            <View style={styles.postContainer}>
              {boards.length > 0 
                ?
                boards.map((post, index) => (
                  <TouchableOpacity onPress={() => handlePostPress(post.boardId, post.groupId)}
                  activeOpacity={0.8} key={index} style={[styles.postBox, commonShadow.mainShadow]}>
                    <Text style={styles.postLabel}>{post.groupName}</Text>
                    <Text style={styles.postTitle}>{post.title}</Text>
                    <View style={styles.postImageBox}>
                      {post.image && (
                        <Image 
                          source={{ 
                            // uri: `http://ec2-3-39-190-50.ap-northeast-2.compute.amazonaws.com:8080${post.image}`
                            uri: post.image
                          }}
                          style={styles.postImage}
                        />
                      )}
                    </View>
                    <Text style={styles.postContent}>{post.contentPreview}</Text>
                    <View style={styles.postFooter}>
                      <View style={styles.commentContainer}>
                        <Image 
                          source={require('../../../assets/images/comment.png')}
                          style={styles.commentIcon}
                        />
                        <Text style={[styles.commentCount, { fontWeight: 'bold' }]}>{post.commentCount}</Text>
                      </View>
                      <Text style={styles.dateText}>{post.createdAt}</Text>
                    </View>
                  </TouchableOpacity>
                ))
                :
                <View style={styles.emptyTextBox}>
                  <Text style={styles.emptyText}>해당하는 카테고리 게시글이 없습니다.</Text>
                </View>
                }
            </View>
          </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    backgroundColor: '#E8F3F3',
    // padding: 15,
  },
  infoCard: {
    backgroundColor: WHITE_COLOR,
    // padding: 20,
    marginBottom: 20,
    borderRadius: 20,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 50,
    marginRight: 20,
    marginTop: 5,
  },
  profileInfo: {
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: 50,
    fontSize: 14,
    color: '#666666',
  },
  value: {
    fontSize: 14,
    color: BLACK_COLOR,
    flex: 1,
  },
  activityContainer: {
    flex: 1,
    backgroundColor: WHITE_COLOR,
    borderRadius: 20,
    overflow: 'hidden',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: WHITE_COLOR,
    borderBottomWidth: 1,
    borderBottomColor: BLACK_COLOR,
  },
 
  contentScroll: {
    flex: 1,
  },
  // gridContainer: {
  //   flexDirection: 'row',
  //   flexWrap: 'wrap',
  //   padding: 10,
  // },
  // gridItem: {
  //   width: '100%',
  //   padding: 5,
  // },
  imageWrapper: {
    borderWidth: 2,
    borderColor: BLACK_COLOR,
    borderRadius: 15,
    backgroundColor: WHITE_COLOR,
    padding: 5,
  },
  imageContainer: {
    aspectRatio: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gridTitle: {
    fontSize: 12,
    color: BLACK_COLOR,
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 5,
  },
  tabContent: {
    flex: 1,
    width:'100%'
  },
  postContainer: {
    width:'100%',
    paddingBottom: 16
    // padding: 10,
  },
  postBox: {
    borderWidth: 1,
    borderColor: BLACK_COLOR,
    borderRadius: 10,
    padding: 12,
    backgroundColor: WHITE_COLOR,
    marginBottom: 10,
  },
  postLabel: {
    fontSize: 11,
    color: BLACK_COLOR,
    marginBottom: 3,
    fontWeight: '300', // 폰트 진하게 설정
  },
  commentCount: {
    fontSize: 11,
    color: BLACK_COLOR,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  postTitle: {
    fontSize: 13,
    color: BLACK_COLOR,
    marginBottom: 8,
    fontWeight: 'bold', // 폰트 진하게 설정
  },
  postImageBox: {
    width: '100%',
    height: 150,
    backgroundColor: '#F0F0F0',
    borderRadius: 5,
    marginBottom: 8,
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  postContent: {
    fontSize: 12,
    color: BLACK_COLOR,
    marginBottom: 8,
    lineHeight: 18,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  commentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentIcon: {
    width: 13,
    height: 13,
    marginRight: 4,
  },
  dateText: {
    fontSize: 11,
    color: BLACK_COLOR,
  },
  commentBox: {
    borderWidth: 1,
    borderColor: BLACK_COLOR,
    borderRadius: 10,
    padding: 8,
    backgroundColor: WHITE_COLOR,
    marginHorizontal: 10,
    marginTop: 10, 
    marginBottom: 7,
  },
  commentLabel: {
    color: '#666666',
    fontSize: 11,
    marginBottom: 3,
  },
  commentText: {
    color: BLACK_COLOR,
    fontSize: 13,
    marginBottom: 8,
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
    }
});

export default MyBoardScreen; 