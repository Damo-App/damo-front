import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Postcode from '@actbase/react-daum-postcode';
import { BLACK_COLOR, WHITE_COLOR } from '../../constants/colors';

/**
 *   AddressSearchModal
 * - 카카오(다음) 주소 검색을 위한 모달 컴포넌트
 * - 주소 선택 시 postcode, address 값을 외부에서 관리할 수 있도록 props로 전달받아 갱신
 */
const AddressSearchModal = ({ 
  showAddressModal, 
  setShowAddressModal, 
  setPostcode, 
  setAddress 
}) => {
  return (
    <Modal
      visible={showAddressModal}
      animationType="slide"
      transparent={false}
    >
      <View style={styles.modalContainer}>
        {/* 헤더 영역 */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>주소 검색</Text>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setShowAddressModal(false)} // 닫기 버튼 누르면 모달 닫힘
          >
            <Icon name="close" size={24} color={BLACK_COLOR} />
          </TouchableOpacity>
        </View>
        
        {/* 주소 검색기: 카카오 우편번호 검색 컴포넌트 */}
        <Postcode
          style={[styles.postcode, {flex: 1}]}
          jsOptions={{ animation: true }}
          onSelected={(data) => {
            // 선택된 주소 정보 처리
            setPostcode(data.zonecode);
            
            // 도로명 주소 또는 지번 주소 설정
            const addr = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
            
            // 상세 주소 정보 구성
            let extraAddr = '';
            if (data.userSelectedType === 'R') {
              if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
                extraAddr += data.bname;
              }
              if (data.buildingName !== '' && data.apartment === 'Y') {
                extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
              }
              if (extraAddr !== '') {
                extraAddr = ' (' + extraAddr + ')';
              }
            }
            
            // 최종 주소 설정
            setAddress(addr + extraAddr);
            setShowAddressModal(false);
          }}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: WHITE_COLOR,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BLACK_COLOR,
  },
  closeButton: {
    padding: 8,
  },
  postcode: {
    width: '100%', 
    height: '100%',
  },
});

export default AddressSearchModal; 