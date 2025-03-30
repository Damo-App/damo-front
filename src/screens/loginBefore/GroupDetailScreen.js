
import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { CustomButton } from '../../components/CustomButton';
import CommonTag from '../../components/CommonTag';
import { BLACK_COLOR, PINK_DARK_COLOR, WHITE_COLOR } from '../../constants/colors';
import { commonShadow, commonStyles } from '../../constants/styles';
import { sub } from 'framer-motion/client';

const GroupDetailScreen = ({ route, navigation }) => {
  // 임시 데이터
  const groupData = {
    title: '배드민턴 모임',
    image: require('../../../assets/images/groups/tennis.png'),
    currentCount: 15,
    maxCount: 20,
    description: '안녕하세요! 배드민턴 모임입니다!\n매주 배드민턴 치는 모임!! 배드민턴 초보도 환영합니다 :)',
    subCategory: '#배드민턴',
    tags: ['INFP', '실내/야외'],
    schedules: [
      {
        title: '복약점 캠핑',
        time: '10:00 ~ 12:00',
        address: '경기 이천시 부발읍 무촌리',
        date: '2025.03.09 ~ 2025.03.11',
        participants: 5
      },
      {
        title: '설봉산 등산',
        time: '10:00 ~ 12:00',
        address: '경기도 이천시 설봉산부근',
        date: '2025.03.19',
        participants: 5
      }
    ]
  };

  const schedule = {
    schedules: [
        {
          title: '친구야 놀자',
          time: '10:00 ~ 12:00',
          address: '경기 이천시 창전동 CGV',
          date: '2025.04.11 ~ 2025.04.15',
          participants: 5
        },
        {
          title: '면접 스터디',
          time: '10:00 ~ 12:00',
          address: '서울시 강남구 중앙정보처리학원',
          date: '2025.04.12',
          participants: 5
        }
      ]
  }

  const handleWithdraw = () => {
    navigation.navigate('Main');
  };

  const handleBoard = () => {
    navigation.navigate('Board');
  };

  return (
    <View style={[commonStyles.container, { flex: 1 }]}>
      <ScrollView 
        style={{ width: '100%', flex: 1 }}
        contentContainerStyle={{ 
          flexGrow: 1,
          paddingBottom: 40,
          paddingHorizontal: 5,
        }}
      >
        {/* 모임 기본 정보 */}
        <View style={[styles.groupInfoCard, commonShadow.mainShadow]}>
          <View style={styles.imageContainer}>
            <Image source={groupData.image} style={styles.groupImage} />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.groupTitle}>{groupData.title}</Text>
            <Text style={styles.memberCount}>{groupData.currentCount}/{groupData.maxCount}</Text>
          </View>
          <Text style={styles.description}>{groupData.description}</Text>
          <View style={styles.bottomContainer}>
            <View style={styles.tagContainer}>
              <CommonTag
                key={-1}
                name={groupData.subCategory}
                size={7.4}
                color={BLACK_COLOR}
                showCloseButton={false}
                containerStyle={{ backgroundColor: '#EEE333', borderColor: BLACK_COLOR, borderWidth: 0.6, marginRight: -1 }} // Reduced margin
              />
              {groupData.tags.map((tag, index) => (
                <CommonTag
                  key={index}
                  name={tag}
                  size={8}
                  color={BLACK_COLOR}
                  showCloseButton={false}
                  containerStyle={{ backgroundColor: '#E6E6FA', marginRight: -1}} // Reduced margin
                />
              ))}
            </View>
            <View style={styles.participantIcons}>
              {[...Array(5)].map((_, i) => (
                <View key={i} style={styles.participantIcon}>
                  <Image 
                    source={require('../../../assets/images/groups/tennis.png')}
                    style={styles.participantImage}
                  />
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* 가입하기 / 게시판 버튼 */}
        <CustomButton 
          title="게시판"
          style={{
            ...styles.button,
            backgroundColor: PINK_DARK_COLOR,
            borderColor: BLACK_COLOR, 
            paddingVertical: 4, 
            paddingHorizontal: 16, 
          }}
        />

        {/* 소개글 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>소개글</Text>
          <Text style={styles.description}>
             {groupData.description}
          </Text>
        </View>

        {/* 모임 일정 */}
        <View>
          <Text style={styles.sectionTitle}>모임 일정</Text>
          <Text style={styles.subTitle}>일정 예정</Text>
          {schedule.schedules.map((schedule, index) => (
            <View key={index} style={[styles.scheduleCard, styles.sectionboard]}>
              <Text style={styles.scheduleTitle}>{schedule.title}</Text>
              <Text style={styles.scheduleInfo}>시간: {schedule.time}</Text>
              <Text style={styles.scheduleInfo}>장소: {schedule.address}</Text>
              <View style={styles.scheduleFooter}>
                <View style={styles.participantIcons}>
                  {[...Array(5)].map((_, i) => (
                    <View key={i} style={styles.participantIcon}>
                      <Image 
                        source={require('../../../assets/images/groups/tennis.png')}
                        style={styles.participantImage}
                      />
                    </View>
                  ))}
                </View>
                <Text style={styles.scheduleDate}>{schedule.date}</Text> 
              </View>
            </View>
          ))}
          {/* <View style={[styles.scheduleBox, styles.sectionboard]}>
            <Text style={styles.noSchedule}>예정된 일정이 없습니다.</Text>
          </View> */}
          <Text style={styles.subTitle}>일정 내역</Text>
          {groupData.schedules.map((schedule, index) => (
            <View key={index} style={[styles.scheduleCard, styles.sectionboard]}>
              <Text style={styles.scheduleTitle}>{schedule.title}</Text>
              <Text style={styles.scheduleInfo}>시간: {schedule.time}</Text>
              <Text style={styles.scheduleInfo}>장소: {schedule.address}</Text>
              <View style={styles.scheduleFooter}>
                <View style={styles.participantIcons}>
                  {[...Array(5)].map((_, i) => (
                    <View key={i} style={styles.participantIcon}>
                      <Image 
                        source={require('../../../assets/images/groups/tennis.png')}
                        style={styles.participantImage}
                      />
                    </View>
                  ))}
                </View>
                <Text style={styles.scheduleDate}>{schedule.date}</Text>
              </View>
            </View>
          ))}
        </View>
        {/* 탈퇴하기 버튼 */}
        <CustomButton 
          title="탈퇴하기"
          style={{
            ...styles.button,
            backgroundColor: 'red',
            borderColor: BLACK_COLOR, 
            marginBottom: 40,
            paddingVertical: 4, 
            paddingHorizontal: 16, 
          }}
          onPress={handleWithdraw}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  sectionboard: {
    borderWidth: 0.5,
    borderColor: BLACK_COLOR,
  },
  groupInfoCard: {
    backgroundColor: WHITE_COLOR,
    padding: 15,
    marginBottom: 15,
    borderRadius: 20,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: BLACK_COLOR,
    flex: 1,
    marginRight: 10,
  },
  memberCount: {
    fontSize: 13,
    color: '#666666',
  },
  description: {
    fontSize: 13,
    color: '#666666',
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
  scheduleBox: {
    backgroundColor: WHITE_COLOR,
    padding: 12,
    marginBottom: 15,
    borderRadius: 20,
  },
  noSchedule: {
    textAlign: 'center',
    color: '#999999',
    fontSize: 13,
  },
  scheduleCard: {
    backgroundColor: WHITE_COLOR,
    padding: 12,
    marginBottom: 12,   
    borderRadius: 20,
  },
  scheduleTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: BLACK_COLOR,
    marginBottom: 4,
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
  },
});

export default GroupDetailScreen; 