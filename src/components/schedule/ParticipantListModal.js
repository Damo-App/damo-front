import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, FlatList, Image, TextInput, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BLACK_COLOR, WHITE_COLOR, PRIMARY_BTN_COLOR } from '../../constants/colors';
import { getScheduleParticipants } from '../../api/mutations/scheduleService';

const ParticipantItem = ({ participant }) => {
  return (
    <View style={styles.participantItem}>
      <Image 
        source={participant.image ? { uri: participant.image } : require('../../../assets/images/mypage/user.png')} 
        style={styles.profileImage} 
      />
      <View style={styles.participantInfo}>
        <Text style={styles.participantName}>
          <Text style={styles.dot}>●</Text> 닉네임: {participant.name}
        </Text>
      </View>
    </View>
  );
};

const ParticipantListModal = ({ visible, onClose, scheduleId }) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filteredParticipants, setFilteredParticipants] = useState([]);

  const fetchParticipants = async (keyword = '') => {
    try {
      const response = await getScheduleParticipants(scheduleId, keyword);
      setFilteredParticipants(response.data);
    } catch (error) {
      console.error('참여자 조회 실패:', error);
      Alert.alert('에러', '참여자 정보를 불러오는 데 실패했습니다.');
    }
  };

  useEffect(() => {
    if (visible) {
      fetchParticipants();
    }
  }, [visible]);

  const handleSearch = () => {
    fetchParticipants(searchKeyword);
  };

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
              value={searchKeyword}
              onChangeText={setSearchKeyword}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity onPress={handleSearch}>
              <Icon name="search" size={24} color={BLACK_COLOR} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={filteredParticipants}
            keyExtractor={(item) => item.memberId.toString()}
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
    color: "#4CAF50",
    marginRight: 4,
  },
});

export default ParticipantListModal;