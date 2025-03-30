import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, FlatList, Image, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BLACK_COLOR, WHITE_COLOR, PRIMARY_BTN_COLOR } from '../../constants/colors';

/**
 *   ParticipantItem
 * - 개별 참가자 정보를 렌더링하는 컴포넌트
 * - 프로필 이미지, 닉네임 표시
 */
const ParticipantItem = ({ participant }) => {
  return (
    <View style={styles.participantItem}>
        {/* 프로필 이미지 (없으면 기본 이미지) */}
      <Image 
        source={participant.profileImage ? { uri: participant.profileImage } : require('../../../assets/images/mypage/user.png')} 
        style={styles.profileImage} 
      />
      <View style={styles.participantInfo}>
        <Text style={styles.participantName}>
          <Text style={styles.dot}>●</Text> 닉네임: {participant.nickname}
        </Text>
      </View>
    </View>
  );
};

/**
 *   ParticipantListModal
 * - 참여 회원 리스트를 모달로 보여주는 컴포넌트
 * - FlatList로 참가자 나열 + 검색창 포함
 */
const ParticipantListModal = ({ visible, onClose, participants }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>회원 리스트</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color={BLACK_COLOR} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color="#888" style={styles.searchIcon} />
            <TextInput 
              style={styles.searchInput} 
              placeholder="회원 닉네임으로 검색해주세요." 
              placeholderTextColor="#888"
            />
          </View>
          
          <FlatList
            data={participants}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <ParticipantItem participant={item} />}
            style={styles.participantList}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxHeight: '70%',
    backgroundColor: WHITE_COLOR,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: BLACK_COLOR,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BLACK_COLOR,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE_COLOR,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    margin: 16,
    paddingHorizontal: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: BLACK_COLOR,
    fontSize: 14,
  },
  participantList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginRight: 12,
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 14,
    fontWeight: '500',
    color: BLACK_COLOR,
  },
  dot: {
    fontSize: 8,
    color: PRIMARY_BTN_COLOR,
    marginRight: 4,
  },
});

export default ParticipantListModal; 