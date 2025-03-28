import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { CustomButton } from '../../components/CustomButton';
import CommonTag from '../../components/CommonTag';
import { BLACK_COLOR, WHITE_COLOR } from '../../constants/colors';
import { commonShadow } from '../../constants/styles';

const UserManagementScreen = ({ route, navigation }) => {
  const [activeTab, setActiveTab] = useState('모임');

  // 임시 데이터
  const userData = {
    nickname: "홍길동",
    email: "example@gmail.com",
    joinDate: "2024.03.10",
    groups: [
      {
        title: '배드민턴 모임',
        image: require('../../../assets/images/groups/tennis.png'),
        joinDate: '2024.03.15',
        role: '모임장'
      },
      {
        title: '수영 모임',
        image: require('../../../assets/images/groups/tennis.png'),
        joinDate: '2024.03.12',
        role: '회원'
      },
      {
        title: '맛집 탐방',
        image: require('../../../assets/images/groups/tennis.png'),
        joinDate: '2024.03.10',
        role: '회원'
      },
      {
        title: '수영부',
        image: require('../../../assets/images/groups/tennis.png'),
        joinDate: '2024.03.08',
        role: '회원'
      },
      {
        title: '야구 모임',
        image: require('../../../assets/images/groups/tennis.png'),
        joinDate: '2024.03.05',
        role: '회원'
      },
      {
        title: '농구 모임',
        image: require('../../../assets/images/groups/tennis.png'),
        joinDate: '2024.03.01',
        role: '회원'
      }
    ],
    posts: [
      {
        title: '오늘 모임 너무 재미있었어요!',
        content: '다음에도 또 참여하고 싶습니다...',
        date: '2024.03.15',
        groupName: '배드민턴 모임'
      },
      {
        title: '수영장 위치 문의드립니다',
        content: '다음 모임 장소가 어디인가요?',
        date: '2024.03.14',
        groupName: '수영 모임'
      }
    ],
    comments: [
      {
        postTitle: '오늘 모임 너무 재미있었어요!',
        content: '저도 정말 즐거웠습니다!',
        date: '2024.03.15',
        groupName: '배드민턴 모임'
      },
      {
        postTitle: '수영장 위치 문의드립니다',
        content: '강남역 2번출구 앞입니다.',
        date: '2024.03.14',
        groupName: '수영 모임'
      }
    ]
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case '모임':
        return (
          <ScrollView style={styles.tabContent}>
            <View style={styles.gridContainer}>
              {userData.groups.map((group, index) => (
                <View key={index} style={styles.gridItem}>
                  <View style={[styles.imageWrapper, commonShadow.mainShadow]}>
                    <View style={styles.imageContainer}>
                      <Image source={group.image} style={styles.gridImage} />
                    </View>
                    <Text style={styles.gridTitle}>{group.title}</Text>
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
              {userData.posts.map((post, index) => (
                <View key={index} style={[styles.postBox, commonShadow.mainShadow]}>
                  <Text style={styles.postLabel}>아이디</Text>
                  <Text style={styles.postTitle}>{post.title}</Text>
                  <View style={styles.postImageBox}>
                  </View>
                  <Text style={styles.postContent}>{post.content}</Text>
                  <Text style={styles.postLabel}>#{userData.posts.length - index}</Text>
                  <Text style={styles.dateText}>{post.date}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        );
      case '댓글':
        return (
          <ScrollView style={styles.tabContent}>
            {[1,2,3,4].map((_, index) => (
              <View key={index} style={[styles.commentBox, commonShadow.mainShadow]}>
                <Text style={styles.commentLabel}>아이디</Text>
                <Text style={styles.commentText}>게시글 제목</Text>
                <Text style={styles.commentLabel}>아이디</Text>
                <Text style={styles.commentText}>댓글이나 본 댓글</Text>
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
            source={require('../../../assets/images/mypage/user.png')} 
            style={styles.profileImage} 
          />
          <View style={styles.profileInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>닉네임</Text>
              <Text style={styles.value}>{userData.nickname}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>이메일</Text>
              <Text style={styles.value}>{userData.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>성별</Text>
              <Text style={styles.value}>남</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>가입일자</Text>
              <Text style={styles.value}>{userData.joinDate}</Text>
            </View>
          </View>
        </View>
        <CustomButton 
          title="탈퇴하기"
          style={{
            backgroundColor: '#FF6B6B',
            marginTop: 15,
            borderRadius: 10,
          }}
          textStyle={{
            color: WHITE_COLOR
          }}
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
    backgroundColor: '#E8F3F3',  // 민트색 배경
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
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 20,
    marginTop: 5,
  },
  profileInfo: {
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    width: 70,
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
  // 게시글 스타일
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
    color: '#666666',
    marginBottom: 3,
  },
  postTitle: {
    fontSize: 13,
    color: BLACK_COLOR,
    marginBottom: 8,
  },
  postImageBox: {
    width: '100%',
    height: 150,
    backgroundColor: '#F0F0F0',
    borderRadius: 5,
    marginBottom: 8,
  },
  postContent: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 8,
    lineHeight: 18,
  },
  dateText: {
    fontSize: 11,
    color: '#999999',
  },
  // 댓글 스타일
  commentBox: {
    borderWidth: 1,
    borderColor: BLACK_COLOR,
    borderRadius: 10,
    padding: 12,
    backgroundColor: WHITE_COLOR,
    marginBottom: 8,
    marginHorizontal: 10,
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