import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { CustomButton } from '../../components/CustomButton';
import CommonTag from '../../components/CommonTag';
import { BLACK_COLOR, G_DARK_COLOR, WHITE_COLOR } from '../../constants/colors';
import { commonShadow, commonStyles } from '../../constants/styles';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { instance } from '../../api/axiosInstance';
import { useRoute, useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import CommonModal from '../../components/CommonModal';

const UserManagementScreen = ({ route }) => {
  const [activeTab, setActiveTab] = useState('모임');
  // const route = useRoute();
  const navigation = useNavigation();
  const { memberId } = route.params;
  const queryClient = useQueryClient();
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  
  

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
  console.log('boardsData>>>>', boardsData);

  const { data: commentsData, isError: commentsError, error: commentsErrorData } = useQuery({
    queryKey: ['memberComments', memberId],
    queryFn: () => instance.get(`/admin/members/${memberId}/comments?page=1&size=3`),
  });

  console.log('commentsData', commentsData)


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
      Toast.show({
        type: 'success',
        text1: '회원이 성공적으로 탈퇴되었습니다.',
        position: 'bottom'
      })
      navigation.goBack();
    } catch (error) {
      if (error.response?.status === 400) {
        Toast.show({
          type: 'error',
          position: 'bottom'
        })
        setIsModalVisible(false);
      } else {
        Toast.show({
          type: 'error',
          text1: '회원 탈퇴 처리 중 오류가 발생했습니다.',
          position: 'bottom'
        })
        setIsModalVisible(false);
      }
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case '모임':
        return (
          <ScrollView style={styles.tabContent}>
            <View style={styles.gridContainer}>
              {(groupsData?.data?.data ?? []).length > 0 ?
              groupsData?.data?.data?.map((group, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.gridItem}
                  onPress={() => navigation.navigate('GroupDetail', { groupId: group.groupId })}
                >
                {/* <View key={index} style={styles.gridItem}> */}
                  <View style={[styles.imageWrapper, commonShadow.mainShadow]}>
                    <View style={styles.imageContainer}>
                      <Image 
                        source={{ 
                          uri: group.image 
                            ? `http://ec2-3-39-190-50.ap-northeast-2.compute.amazonaws.com:8080${group.image}`
                            : `http://ec2-3-39-190-50.ap-northeast-2.compute.amazonaws.com:8080/images/noImage.png`
                        }}
                        style={styles.gridImage} 
                      />
                    </View>
                    <Text style={styles.gridTitle}>{group.groupName}</Text>
                  </View>
                {/* </View> */}
                </TouchableOpacity>
              )) : 
                <View style={styles.emptyTextBox}>
                  <Text style={styles.emptyText}>가입한 모임이 없습니다.</Text>
                </View>}
            </View>
          </ScrollView>
        );
      case '게시글':
        return (
          <ScrollView style={styles.tabContent}>
            <View style={styles.postContainer}>
              {(boardsData?.data?.data ?? []).length > 0 ?
              boardsData?.data?.data?.map((board, index) => {
                const matchedGroup = groupsData?.data?.data.find(
                  (group) => group.groupName === board.groupName
                );
                return(
                <TouchableOpacity
                  key={index}
                  style={[styles.postBox, commonShadow.mainShadow]}
                  onPress={() => navigation.navigate('BoardDetailsScreen', { boardId: board.boardId, groupId: matchedGroup?.groupId })}
                >
                    <Text style={styles.postLabel}>{board.groupName}</Text>
                    <Text style={styles.postTitle}>{board.title}</Text>
                    <View style={styles.postImageBox}>
                      {board.image && (
                        <Image 
                          source={{ 
                            uri: `http://ec2-3-39-190-50.ap-northeast-2.compute.amazonaws.com:8080${board.image}`
                          }}
                          style={styles.postImage}
                        />
                      )}
                    </View>
                    <Text style={styles.postContent}>{board.contentPreview}</Text>
                    <View style={styles.postFooter}>
                      <View style={styles.commentContainer}>
                        <Image 
                          source={require('../../../assets/images/comment.png')}
                          style={styles.commentIcon}
                        />
                        <Text style={[styles.commentCount, { fontWeight: 'bold' }]}>{board.commentCount}</Text>
                      </View>
                      <Text style={styles.dateText}>{board.createdAt}</Text>
                    </View>
                </TouchableOpacity>
                )
              }) :
                <View style={styles.emptyTextBox}>
                  <Text style={styles.emptyText}>작성한 게시글이 없습니다.</Text>
                </View>}
            </View>
          </ScrollView>
        );
      case '댓글':
        return (  
          <ScrollView style={[styles.tabContent, {padding: 10}]}>
            {(commentsData?.data?.data ?? []).length > 0 ?
              commentsData?.data?.data?.map((comment, index) => {
                const matchedBoard = boardsData?.data?.data.find(
                  (b) => b.groupName === comment.groupName && b.title === comment.postTitle
                );
                const matchedGroup = groupsData?.data?.data.find(
                  g => g.groupName === comment.groupName
                );
                return(
                <TouchableOpacity
                    key={index}
                    style={[styles.commentBox, commonShadow.mainShadow]}
                    onPress={() => navigation.navigate('BoardDetailsScreen', { boardId: matchedBoard.boardId, groupId: matchedGroup?.groupId })}
                  >
                  <Text style={styles.commentLabel}>{comment.groupName}</Text>
                  <Text style={[styles.commentText, { fontWeight: 'bold' }]}>{comment.postTitle}</Text>
                  <Text style={styles.commentText}>{comment.content}</Text>
                </TouchableOpacity>
                )
              }) : 
              <View style={styles.emptyTextBox}>
                <Text style={styles.emptyText}>작성한 댓글이 없습니다.</Text>
              </View>}
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
                ? `http://ec2-3-39-190-50.ap-northeast-2.compute.amazonaws.com:8080${memberData.data.data.image}`
                : `http://ec2-3-39-190-50.ap-northeast-2.compute.amazonaws.com:8080/images/noImage.png`
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
          onPress={memberData?.data?.data?.email === 'h4@gmail.com' ? null : () => setIsModalVisible(true)}
          disabled={memberData?.data?.data?.email === 'h4@gmail.com'}
        />
        <CommonModal 
        style={{marginBottom: 10}}
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          onCancel={() => setIsModalVisible(false)}
          onConfirm={handleDeleteMember}
          title={"정말로 이 회원을 탈퇴시키시겠습니까 ?"}
          titleStyle={{fontSize: 14}}
          // introduction={`탈퇴 시 계정에 있는 모든 모임과 일정이 삭제되며 복구되지 않습니다.`}
          cancelButtonText={"취소"}
          confirmButtonText={"탈퇴"}
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

export default UserManagementScreen; 