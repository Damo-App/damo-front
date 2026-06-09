import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { CustomButton } from '../../components/CustomButton';
import CommonTag from '../../components/CommonTag';
import { BLACK_COLOR, WHITE_COLOR } from '../../constants/colors';
import { commonShadow } from '../../constants/styles';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { instance, API_BASE_URL } from '../../api/axiosInstance';
import { useRoute, useNavigation } from '@react-navigation/native';

const UserManagementScreen = () => {
  const [activeTab, setActiveTab] = useState('모임');
  const route = useRoute();
  const navigation = useNavigation();
  const { memberId } = route.params;
  const queryClient = useQueryClient();

  // API 데이터 가져오기
  const { data: memberData, isError: memberError, error: memberErrorData } = useQuery({
    queryKey: ['memberDetail', memberId],
    queryFn: () => instance.get(`/admin/members/${memberId}`),
  });

  const { data: groupsData, isError: groupsError, error: groupsErrorData } = useQuery({
    queryKey: ['memberGroups', memberId],
    queryFn: () => instance.get(`/admin/members/${memberId}/groups?page=1&size=10`),
  });

  const { data: boardsData, isError: boardsError, error: boardsErrorData } = useQuery({
    queryKey: ['memberBoards', memberId],
    queryFn: () => instance.get(`/admin/members/${memberId}/boards?page=1&size=5`),
  });

  const { data: commentsData, isError: commentsError, error: commentsErrorData } = useQuery({
    queryKey: ['memberComments', memberId],
    queryFn: () => instance.get(`/admin/members/${memberId}/comments?page=1&size=3`),
  });

  // 에러 발생시 콘솔에 로그 출력
  React.useEffect(() => {
    if (memberError) console.error('Member Error:', memberErrorData);
    if (groupsError) console.error('Groups Error:', groupsErrorData);
    if (boardsError) console.error('Boards Error:', boardsErrorData);
    if (commentsError) console.error('Comments Error:', commentsErrorData);
  }, [memberError, groupsError, boardsError, commentsError]);

  const handleDeleteMember = async () => {
    try {
      await instance.delete(`/members/${memberId}`);
      // 삭제 성공 후 users 쿼리 무효화
      await queryClient.invalidateQueries(['users']);
      Alert.alert('성공', '회원이 성공적으로 탈퇴되었습니다.', [
        { 
          text: '확인', 
          onPress: () => {
            navigation.goBack();
          }
        }
      ]);
    } catch (error) {
      if (error.response?.status === 400) {
        Alert.alert('실패', '모임장은 회원 탈퇴할 수 없습니다.');
      } else {
        Alert.alert('오류', '회원 탈퇴 처리 중 오류가 발생했습니다.');
      }
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      '회원 탈퇴',
      '정말로 이 회원을 탈퇴시키시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '탈퇴', onPress: handleDeleteMember, style: 'destructive' }
      ],
      { cancelable: true }
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case '모임':
        return (
          <ScrollView style={styles.tabContent}>
            <View style={styles.gridContainer}>
              {groupsData?.data?.data?.map((group, index) => (
                <View key={index} style={styles.gridItem}>
                  <View style={[styles.imageWrapper, commonShadow.mainShadow]}>
                    <View style={styles.imageContainer}>
                      <Image 
                        source={{ 
                          uri: group.image 
                            ? `${API_BASE_URL}${group.image}`
                            : `${API_BASE_URL}/images/noImage.png`
                        }}
                        style={styles.gridImage} 
                      />
                    </View>
                    <Text style={styles.gridTitle}>{group.groupName}</Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        );
      case '게시글':
        return (
          <ScrollView style={styles.tabContent}>
            <View style={styles.postContainer}>
              {boardsData?.data?.data?.map((post, index) => (
                <View key={index} style={[styles.postBox, commonShadow.mainShadow]}>
                  <Text style={styles.postLabel}>{post.groupName}</Text>
                  <Text style={styles.postTitle}>{post.title}</Text>
                  <View style={styles.postImageBox}>
                    {post.image && (
                      <Image 
                        source={{ 
                          uri: `${API_BASE_URL}${post.image}`
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
                </View>
              ))}
            </View>
          </ScrollView>
        );
      case '댓글':
        return (
          <ScrollView style={styles.tabContent}>
            {commentsData?.data?.data?.map((comment, index) => (
              <View key={index} style={[styles.commentBox, commonShadow.mainShadow]}>
                <Text style={styles.commentLabel}>{comment.groupName}</Text>
                <Text style={[styles.commentText, { fontWeight: 'bold' }]}>{comment.postTitle}</Text>
                <Text style={styles.commentText}>{comment.content}</Text>
              </View>
            ))}
          </ScrollView>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* 회원 기본 정보 */}
      <View style={[styles.infoCard, commonShadow.mainShadow]}>
        <View style={styles.profileContainer}>
          <Image 
            source={{ 
              uri: memberData?.data?.data?.image 
                ? `${API_BASE_URL}${memberData.data.data.image}`
                : `${API_BASE_URL}/images/noImage.png`
            }}
            style={styles.profileImage} 
          />
          <View style={styles.profileInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>닉네임</Text>
              <Text style={styles.value}>{memberData?.data?.data?.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>이메일</Text>
              <Text style={styles.value}>{memberData?.data?.data?.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>성별</Text>
              <Text style={styles.value}>
                {memberData?.data?.data?.gender === 'MALE' ? '남성' : '여성'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>생년</Text>
              <Text style={styles.value}>{memberData?.data?.data?.birth || '-'}</Text>
            </View>
          </View>
        </View>
        <CustomButton 
          title="탈퇴하기"
          style={{
            backgroundColor: '#FF6B6B',
            marginTop: 10,
            borderRadius: 10,
            paddingVertical: 5, 
          }}
          textStyle={{
            color: WHITE_COLOR
          }}
          onPress={memberData?.data?.data?.email === 'h4@gmail.com' ? null : confirmDelete}
          disabled={memberData?.data?.data?.email === 'h4@gmail.com'}
        />
      </View>

      {/* 활동 내역 박스 */}
      <View style={[styles.activityContainer, commonShadow.mainShadow]}>
        {/* 탭 메뉴 */}
        <View style={styles.tabContainer}>
          {['모임', '게시글', '댓글'].map((tab, index, array) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && styles.activeTab,
                index === array.length - 1 && styles.lastTab
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText
              ]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 스크롤 영역 */}
        <ScrollView style={styles.contentScroll}>
          {renderTabContent()}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F3F3',
    padding: 15,
  },
  infoCard: {
    backgroundColor: WHITE_COLOR,
    padding: 20,
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
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: WHITE_COLOR,
    borderRightWidth: 1,
    borderRightColor: BLACK_COLOR,
  },
  activeTab: {
    backgroundColor: '#FFD700',
  },
  lastTab: {
    borderRightWidth: 0,
  },
  tabText: {
    fontSize: 14,
    color: BLACK_COLOR,
  },
  activeTabText: {
    color: BLACK_COLOR,
  },
  contentScroll: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  gridItem: {
    width: '50%',
    padding: 5,
  },
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
  },
  postContainer: {
    padding: 10,
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
});

export default UserManagementScreen; 