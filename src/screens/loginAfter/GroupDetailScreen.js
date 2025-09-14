import React, { useContext, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { CustomButton } from '../../components/CustomButton';
import CommonTag from '../../components/CommonTag';
import { BLACK_COLOR, BORDER_COLOR, G_DARK_COLOR, GREEN_LIGHT_COLOR, PINK_DARK_COLOR, PINK_LIGHT_COLOR, PRIMARY_BTN_COLOR, PRIMARY_COLOR, WHITE_COLOR, YELLOW_DARK_COLOR, YELLOW_LIGHT_COLOR } from '../../constants/colors';
import { commonShadow, commonStyles } from '../../constants/styles';
import { instance } from '../../api/axiosInstance';
import { useUser } from '../../hooks/useUser';
import { AuthContext } from '../../contexts/AuthProvider';
import { getCurrentUser } from '../../api/queries/userService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';

const GroupDetailScreen = ({ route, navigation }) => {
  const { groupId } = route.params;
  const { user } = useUser();
  const isFocused = useIsFocused();
  const [joinedStatus, setJoinedStatus] = useState([]);
  const [groupData, setGroupData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMemberList, setShowMemberList] = useState(false);
  const [memberList, setMemberList] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const { isLoggedIn, isCategorySelected } = useContext(AuthContext);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const checkAdmin = async () => {
    const memberId = await AsyncStorage.getItem("memberId");
    const token = await AsyncStorage.getItem("accessToken");
    try {
      const response = await instance.get(`/members/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('response.data.data.email', response.data.data.email);

      const checkEmail = response.data.data.email
      setEmail(checkEmail);
      setIsAdmin(checkEmail === 'admin123@gmail.com');
      return response.data.data;
    } catch (error) {
      console.log('error', error);
    }}
    checkAdmin();
  }, [isLoggedIn]);

  useEffect(() => {
    setIsAdmin(email === 'admin123@gmail.com')
    console.log('isAdmin??', isAdmin);
  }, [email])


  useEffect(() => {
    const fetchGroupDetail = async () => {
      try {
        const response = await instance.get(`/groups/${groupId}`);
        
        console.log('API Response:', response.data.data);
        setGroupData(response.data.data);
      } catch (error) {
        console.error('Error fetching group details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isFocused) {
          fetchGroupDetail();
    }
  }, [groupId, isFocused]);


  const activeSchedules = useMemo(() => {
    if (!groupData?.schedules) return [];
    return groupData.schedules.filter(s => s.state === 'SCHEDULE_ACTIVE');
  }, [groupData]);

  console.log("activeSchedules test", activeSchedules.length);

  // 2. activeSchedules 변경 시, 내가 참여 중인지 여부 계산
  useEffect(() => {
    if (!user?.memberId) return;

    const statusArray = activeSchedules.map(schedule => {
      const isJoined = schedule.members?.some(m => m.memberId === user.memberId);
      return {
        scheduleId: schedule.scheduleId,
        isJoined
      };
    });

    setJoinedStatus(statusArray);
  }, [activeSchedules, user]);

  // 확인용 콘솔
  useEffect(() => {
    console.log('참여 여부 상태 ===', joinedStatus);
    // 예) [ { scheduleId: 99, isJoined: true }, { scheduleId: 100, isJoined: false } ]
  }, [joinedStatus]);

  const toggleJoinStatus = async (scheduleId, isCurrentlyJoined) => {
    try {
      // setLoading(scheduleId); // 버튼 로딩 표시

      //참여 했으면 됬다고 아래 토스트 메세지 띄우기
      if (isCurrentlyJoined) {
        // 취소 API 호출
        await instance.delete(`/schedules/${scheduleId}/participation`);
      } else {
        // 참여 API 호출
        await instance.post(`/schedules/${scheduleId}/participation`);
      }

      // 상태 토글
      setJoinedStatus(prev =>
        prev.map(item =>
          item.scheduleId === scheduleId
            ? { ...item, isJoined: !isCurrentlyJoined }
            : item
        )
      );
    } catch (error) {
      console.error('참여/취소 API 오류:', error);
    } finally {
      setLoading(null);
    }
  };
  




  const handleWithdraw = () => {
    Alert.alert(
      "모임 탈퇴",
      "정말 모임을 탈퇴하시겠습니까?",
      [
        {
          text: "취소",
          style: "cancel"
        },
        {
          text: "확인",
          onPress: async () => {
            try {
              await instance.delete(`/groups/${groupId}/leave`);
              // 탈퇴 성공 시 이전 화면으로 이동
              navigation.navigate('GroupList', { 
                refresh: Date.now()
              });
            } catch (error) {
              console.error('Error leaving group:', error);
              Alert.alert(
                "탈퇴 실패",
                "모임 탈퇴 중 오류가 발생했습니다."
              );
            }
          }
        }
      ]
    );
  };

  const handleJoin = async () => {
    try {
      console.log(`Sending join request to: /groups/${groupId}/join`); // Log the request URL
      const response = await instance.post(`/groups/${groupId}/join`);
      console.log('Join response:', response); // Log the response

      if (response.status === 200) {
        Alert.alert(
          "가입 완료",
          "모임 가입이 완료되었습니다.",
          [
            {
              text: "확인",
              onPress: async () => {
                // 가입 성공 시 그룹 정보 새로고침
                const updatedGroupResponse = await instance.get(`/groups/${groupId}`);
                setGroupData(updatedGroupResponse.data.data);
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error joining group:', error); // Log the error
      console.error(error.response.data.message)
      if (error.response) {
        // 서버에서 오는 에러 메시지 처리
        switch(error.response.data.message) {
          case '성별 조건에 부합하지 않아 가입이 불가능합니다.':
            Alert.alert("가입 실패", "성별 조건이 맞지 않아 가입할 수 없습니다.");
            break;
          case '나이 조건에 부합하지 않아 가입이 불가능합니다.':
            Alert.alert("가입 실패", "나이 조건이 맞지 않아 가입할 수 없습니다.");
            break;
          case '모임의 최대 인원 수를 초과했습니다.':
            Alert.alert("가입 실패", "모임 정원이 가득 찼습니다.");
            break;
          default:
            Alert.alert("가입 실패", "가입 중 오류가 발생했습니다.");
        }
      } else {
        Alert.alert("네트워크 오류", "네트워크 연결을 확인해주세요.");
      }
      console.error('Error joining group:', error);
    }
  };

  const handleBoard = () => {
    navigation.navigate('BoardScreen', { groupId: groupId });
  };

  const handleSchedule = () => {
    navigation.navigate('SchedulePost', { groupId: groupId });
  };

  const fetchMemberList = async (keyword = '') => {
    try {
      const response = await instance.get(`/groups/${groupId}/memberlist${keyword ? `?keyword=${keyword}` : ''}`);
      setMemberList(response.data.data);
    } catch (error) {
      console.error('Error fetching member list:', error);
      Alert.alert('오류', '회원 목록을 불러오는데 실패했습니다.');
    }
  };

  const handleMemberListPress = () => {
    setShowMemberList(true);
    fetchMemberList();
  };

  const handleSearch = (text) => {
    setSearchKeyword(text);
    fetchMemberList(text);
  };

  const handleDetailSchedule = (scheduleId) => {
    navigation.navigate('ScheduleDetails', { scheduleId, groupId });
  }

  const handleCancelSchedule = (scheduleId) => {
    Alert.alert(
      "일정 취소",
      "정말 이 일정을 취소하시겠습니까?",
      [
        {
          text: "취소",
          style: "cancel"
        },
        {
          text: "확인",
          onPress: async () => {
            try {
              await instance.delete(`/groups/${groupId}/schedules/${scheduleId}`);
              const response = await instance.get(`/groups/${groupId}`);
              setGroupData(response.data.data);
              Alert.alert('알림', '일정이 취소되었습니다.');
            } catch (error) {
              console.error('Error canceling schedule:', error);
              Alert.alert('오류', '일정 취소에 실패했습니다.');
            }
          }
        }
      ]
    );
  };

  const handleDeleteGroup = async () => {
    Alert.alert(
      '모임 삭제',
      '정말로 이 모임을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '확인',
          onPress: async () => {
            try {
              await instance.delete(`/groups/${groupId}`);
              Alert.alert('성공', '모임이 삭제되었습니다.', [
                {
                  text: '확인',
                  onPress: () => {
                   navigation.replace('MainTabs', { screen: '모임 리스트' })
                  }
                }
              ]);
            } catch (error) {
              console.error('Error deleting group:', error);
              Alert.alert('오류', error.response?.data?.message || '모임 삭제 중 오류가 발생했습니다.');
            }
          },
        },
      ]
    );
  };

  const handleUpdateGroup = async () => {
      console.log('[디버깅] groupData:', groupData); // 🔍 groupData 확인
  console.log('[디버깅] groupId:', groupData?.groupId); // 🔍 groupId 확인
    
    if(!groupData?.groupId) {
      Alert.alert("모임정보가 없습니다.")
      return;
    }
    navigation.navigate('UpdateGroupScreen', { groupId: groupData.groupId, selectedCategoryId: groupData.categoryId })
  }

  if (loading || !groupData) {
    return <View style={commonStyles.container}><Text>Loading...</Text></View>;
  }

  console.log('Schedules:', groupData.schedules);
  
  // const activeSchedules = groupData.schedules?.filter(
  //   schedule => schedule.state === 'SCHEDULE_ACTIVE'
  // ) || [];

  const pastSchedules = groupData.schedules?.filter(
    schedule => schedule.state === 'SCHEDULE_COMPLETED'
  ) || [];

  const renderActionButton = () => {
    if(isAdmin) return null;
    console.log('isAdmin', isAdmin)
    if (groupData.myRole === 'GROUP_LEADER') {
      return (
        <>
        <CustomButton 
          title="게시판"
          style={{
            ...styles.button,
            backgroundColor: PRIMARY_COLOR,
            borderColor: BLACK_COLOR,
            paddingVertical: 4,
            paddingHorizontal: 16,
          }}
          onPress={handleBoard}
        />
        <CustomButton 
          title="일정 생성"
          style={{
            ...styles.button,
            backgroundColor: PINK_LIGHT_COLOR,
            borderColor: BLACK_COLOR,
            paddingVertical: 4,
            paddingHorizontal: 16,
          }}
          onPress={handleSchedule}
        />
        </>
      );
    } else if (groupData.myRole === 'GROUP_MEMBER') {
      return (
        <CustomButton 
          title="게시판"
          style={{
            ...styles.button,
            backgroundColor: PRIMARY_COLOR,
            borderColor: BLACK_COLOR,
            paddingVertical: 4,
            paddingHorizontal: 16,
          }}
          onPress={handleBoard}
        />
      );
    } else {
      return (
        <CustomButton 
          title="가입하기"
          style={{
            ...styles.button,
            backgroundColor: PINK_DARK_COLOR,
            borderColor: BLACK_COLOR,
            paddingVertical: 4,
            paddingHorizontal: 16,
          }}
          onPress={handleJoin}
        />
      );
    }
  };

  const renderBottomButton = () => {
    if (!groupData) return null;
    if(isAdmin) return null;

    return (
      <View style={styles.bottomButtonContainer}>
        {groupData.myRole === 'GROUP_LEADER' ? (
          <View style={{flexDirection:'row', justifyContent: 'space-between'}}>
            <CustomButton
              title="삭제하기"
              style={{
                ...styles.button,
                width: '48%',
                backgroundColor: PINK_DARK_COLOR,
                borderColor: BLACK_COLOR,
                paddingVertical: 4,
                paddingHorizontal: 16,
              }}
              onPress={handleDeleteGroup}
            />
            <CustomButton 
              title="수정하기"
              style={{
                ...styles.button,
                width: '48%',
                backgroundColor: PINK_LIGHT_COLOR,
                borderColor: BLACK_COLOR,
                paddingVertical: 4,
                paddingHorizontal: 16,
              }}
              onPress={handleUpdateGroup}
            />
          </View>
        ) : groupData.myRole === 'GROUP_MEMBER' ? (
          <CustomButton
            title="탈퇴하기"
            style={{
              ...styles.button,
              backgroundColor: PINK_DARK_COLOR,
              borderColor: BLACK_COLOR,
              paddingVertical: 4,
              paddingHorizontal: 16,
            }}
            onPress={handleWithdraw}
          />
        ) : null}
      </View>
    );
  };

  return (
    <View style={[commonStyles.container]}>
      <ScrollView 
        style={{ width: '100%', flex: 1 }}
        contentContainerStyle={{ 
          paddingHorizontal:16,
          paddingBottom: 50,
        }}
      >
        {/* 모임 기본 정보 */}
        <View style={[styles.groupInfoCard, commonShadow.mainShadow]}>
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: groupData.image}}
              style={styles.groupImage}
            />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.groupTitle}>{groupData.name}</Text>
            <Text style={styles.memberCount}>{groupData.memberCount}/{groupData.maxMemberCount}</Text>
          </View>
          {/* <Text style={styles.description}>{groupData.introduction}</Text> */}
          <View style={styles.bottomContainer}>
            <View style={styles.tagContainer}>
              <CommonTag
                key={-1}
                name={`#${groupData.subCategoryName}`}
                size={7.4}
                color={BLACK_COLOR}
                showCloseButton={false}
                containerStyle={{ backgroundColor: '#EEE333', borderColor: BLACK_COLOR, borderWidth: 0.6, marginRight: -1 }}
              />
              {[...(groupData.tags.age || []),
               ...(groupData.tags.MBTI || []),
               ...(groupData.tags.mood || []),
               ...(groupData.tags.place || []),
               ...(groupData.tags.location || []),
               ...(groupData.tags.cost || [])].map((tag, index) => (
                <CommonTag
                  key={index}
                  name={tag}
                  size={8}
                  color={BLACK_COLOR}
                  showCloseButton={false}
                  containerStyle={{ backgroundColor: '#E6E6FA', marginRight: -1 }}
                />
              ))}
            </View>
            <TouchableOpacity 
              style={styles.participantIcons}
              onPress={handleMemberListPress}
            >
              {groupData.members.slice(0, 5).map((member, i) => (
                <View key={i} style={styles.participantIcon}>
                  <Image 
                    source={{ uri: member.image }}
                    style={styles.participantImage}
                  />
                </View>
              ))}
            </TouchableOpacity>
          </View>
        </View>

        {/* 액션 버튼 */}
        {renderActionButton()}

        {/* 소개글 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>소개글</Text>
          <Text style={styles.description}>
             {groupData.introduction}
          </Text>
        </View>

        {/* 모임 일정 */}
        <View>
          <Text style={styles.sectionTitle}>모임 일정</Text>
          <Text style={styles.subTitle}>일정 예정</Text>
          {activeSchedules.length > 0 ? (
            activeSchedules.map((schedule, index) => {
              const status = joinedStatus.find(j => j.scheduleId === schedule.scheduleId);
              const isJoined = status?.isJoined || false;
              return (
              <View key={index} style={[styles.scheduleCard, styles.sectionboard]}>
                <View style={styles.scheduleHeader}>
                  <View style={styles.titleWrapper}>
                    <Text style={styles.scheduleTitle}>{schedule.scheduleName}</Text>
                    <View style={[styles.statusDot, { 
                      backgroundColor: schedule.scheduleStatus === 'SINGLE' ? GREEN_LIGHT_COLOR 
                        : schedule.scheduleStatus === 'CONTINUOUS' ? PINK_LIGHT_COLOR 
                        : YELLOW_LIGHT_COLOR
                    }]} />
                  </View>
                  {groupData.myRole === 'GROUP_LEADER' ? (
                    <View style={styles.scheduleActions}>
                      <TouchableOpacity style={[styles.smallButton, commonShadow.mainShadow]} onPress={() => handleDetailSchedule(schedule.scheduleId)}>
                        <Text style={styles.smallButtonText}>상세</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.smallButton, { backgroundColor: '#FFE5E5' }, commonShadow.mainShadow]}
                        onPress={() => handleCancelSchedule(schedule.scheduleId)}
                      >
                        <Text style={styles.smallButtonText}>취소</Text>
                      </TouchableOpacity>
                    </View>
                  )
                  :
                  (
                    <View style={styles.scheduleActions}>
                      <TouchableOpacity style={[styles.smallButton, commonShadow.mainShadow, {backgroundColor : isJoined ? '#FFA79D' : '#FFC27E' }]} onPress={() => toggleJoinStatus(schedule.scheduleId, isJoined)}>
                        <Text style={styles.smallButtonText}>{isJoined ? '취소' : '참여' }</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.smallButton, { backgroundColor: '#fff' }, commonShadow.mainShadow]}
                        onPress={() => handleCancelSchedule(schedule.scheduleId)}
                      >
                        <Text style={styles.smallButtonText}>상세</Text>
                      </TouchableOpacity>
                    </View>
                  )
                }
                </View>
                {schedule.scheduleStatus === 'CONTINUOUS' ? (
                  <View style={styles.timeContainer}>
                    <View style={styles.timeRow}>
                      <Text style={styles.timeLabel}>시작</Text>
                      <Text style={styles.timeValue}>{schedule.startTime.substring(0, 5)}</Text>
                    </View>
                    <View style={styles.timeRow}>
                      <Text style={styles.timeLabel}>종료</Text>
                      <Text style={styles.timeValue}>{schedule.endTime.substring(0, 5)}</Text>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.scheduleInfo}>시간: {schedule.startTime.substring(0, 5)} ~ {schedule.endTime.substring(0, 5)}</Text>
                )}
                <Text style={styles.scheduleInfo}>장소: {schedule.address}</Text>
                <View style={styles.scheduleFooter}>
                  <View style={styles.participantIcons}>
                    {schedule.members.slice(0, 5).map((member, i) => (
                      <View key={i} style={styles.participantIcon}>
                        <Image 
                          source={{ uri: member.image }}
                          style={styles.participantImage}
                        />
                      </View>
                    ))}
                  </View>
                  <Text style={styles.scheduleDate}>
                    {schedule.startDate === schedule.endDate 
                      ? schedule.startDate
                      : `${schedule.startDate} ~ ${schedule.endDate}`}
                  </Text>
                </View>
              </View>
            )})
          ) : (
              <View style={styles.emptyTextBox}>
                <Text style={styles.emptyText}>예정된 일정이 없습니다.</Text>
              </View>
          )}
          
          <Text style={styles.subTitle}>일정 내역</Text>
          {pastSchedules.length > 0 ? (
            pastSchedules.map((schedule, index) => (
              <View key={index} style={[styles.scheduleCard, styles.sectionboard]}>
                <Text style={styles.scheduleTitle}>{schedule.scheduleName}</Text>
                <Text style={styles.scheduleInfo}>시간: {schedule.startTime.substring(0, 5)} ~ {schedule.endTime.substring(0, 5)}</Text>
                <Text style={styles.scheduleInfo}>장소: {schedule.address}</Text>
                <View style={styles.scheduleFooter}>
                  <View style={styles.participantIcons}>
                    {schedule.members.slice(0, 5).map((member, i) => (
                      <View key={i} style={styles.participantIcon}>
                        <Image 
                          source={{ uri: member.image }}
                          style={styles.participantImage}
                        />
                      </View>
                    ))}
                  </View>
                  <Text style={styles.scheduleDate}>
                    {schedule.startDate === schedule.endDate 
                      ? schedule.startDate
                      : `${schedule.startDate} ~ ${schedule.endDate}`}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyTextBox}>
              <Text style={styles.emptyText}>일정 내역이 없습니다.</Text>
            </View>
          )}
        </View>

        {/* 하단 버튼 */}
        {renderBottomButton()}

        {/* Member List Modal */}
        <Modal
          visible={showMemberList}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowMemberList(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>회원 리스트</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setShowMemberList(false)}
                >
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="닉네임 검색"
                  value={searchKeyword}
                  onChangeText={handleSearch}
                />
              </View>

              <ScrollView style={styles.memberListContainer}>
                {memberList.map((member, index) => (
                  <View key={index} style={styles.memberItem}>
                    <Image
                      // source={{ uri: `http://ec2-3-39-190-50.ap-northeast-2.compute.amazonaws.com:8080${member.image}` }}
                      source={{ uri: member.image }}
                      style={styles.memberImage}
                    />
                    <Text style={styles.memberName}>닉네임 : {member.name}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingRight:10,
    paddingHorizontal:16,
    width: '100%',
  },
  sectionboard: {
    borderWidth: 0.5,
    borderColor: BLACK_COLOR,
  },
  groupInfoCard: {
    backgroundColor: WHITE_COLOR,
    paddingTop: 10,
    paddingHorizontal:10,
    marginBottom: 12,
    borderRadius: 10,
    width: '100%',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  groupImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BLACK_COLOR,
    flex: 1,
    marginRight: 10,
  },
  memberCount: {
    fontSize: 13,
    color: BLACK_COLOR,
  },
  description: {
    backgroundColor: WHITE_COLOR,
    padding:10,
    borderRadius: 10,
    borderStyle: "solid",
    borderWidth:1,
    borderColor: BORDER_COLOR,
    fontSize: 12,
    color: BLACK_COLOR,
    lineHeight: 18,
    width: '100%',
    marginBottom: 8,
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    marginTop: 8,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    gap: 3,
    marginLeft: -3,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: BLACK_COLOR,
    marginBottom: 12,
  },
  subTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#666666',
    marginBottom: 8,
  },
  // scheduleBox: {
  //   backgroundColor: WHITE_COLOR,
  //   padding: 50,
  //   marginBottom: 15,
  //   borderRadius: 10,
  // },
  // noSchedule: {
  //   textAlign: 'center',
  //   color: '#999999',
  //   fontSize: 10,
  // },
  scheduleCard: {
    backgroundColor: WHITE_COLOR,
    padding: 12,
    marginBottom: 12,   
    borderRadius: 10,
    width: '100%',
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scheduleType: {
    fontSize: 10,
    color: '#666666',
  },
  scheduleActions: {
    flexDirection: 'row',
    gap: 4,
  },
  smallButton: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: '#E6E6FA',
    borderWidth: 0.5,
    borderColor: BLACK_COLOR,
    minWidth: 32,
  },
  smallButtonText: {
    fontSize: 10,
    color: BLACK_COLOR,
    textAlign: 'center',
  },
  scheduleTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: BLACK_COLOR,
    marginRight: 1,
  },
  timeContainer: {
    marginTop: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  timeLabel: {
    fontSize: 12,
    color: '#666666',
    width: 30,
  },
  timeValue: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
  scheduleInfo: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  scheduleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  participantIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginRight: -6,
    borderWidth: 1,
    borderColor: BLACK_COLOR,
    backgroundColor: WHITE_COLOR,
    overflow: 'hidden',
  },
  participantImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  scheduleDate: {
    fontSize: 11,
    color: '#999999',
  },
  button: {
    marginBottom: 15,
    borderRadius: 20,
    paddingVertical: 12,
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: WHITE_COLOR,
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BLACK_COLOR,
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    color: BLACK_COLOR,
  },
  searchContainer: {
    marginBottom: 15,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
  },
  memberListContainer: {
    maxHeight: '80%',
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  memberImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BLACK_COLOR,
    marginRight: 12,
  },
  memberName: {
    fontSize: 14,
    color: BLACK_COLOR,
  },
  bottomButtonContainer: {
    marginBottom: 15,
    borderRadius: 20,
    paddingVertical: 12,
    width: '100%',
  },
  bottomButton: {
    backgroundColor: 'red',
    borderColor: BLACK_COLOR,
    borderWidth: 0.5,
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 16,
  },
  bottomButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: WHITE_COLOR,
    textAlign: 'center',
  },
  emptyTextBox:{
    marginTop:5,
    height:'auto',
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
});

export default GroupDetailScreen;