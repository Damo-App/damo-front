import React from 'react';
import { Modal, View, Text, TouchableHighlight, StyleSheet } from 'react-native';
import { BLACK_COLOR } from '../constants/colors';
import { commonShadow, commonStyles } from '../constants/styles';

const CommonModal = ({
  visible,
  onClose,
  title,
  introduction,
  children,
  cancelButtonText,
  onCancel,
  confirmButtonText,
  onConfirm,
  titleStyle
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={[styles.centeredView, ]}>
        <View style={[styles.modalView, commonShadow.mainShadow]}>
          {title && <Text style={[styles.titleText, titleStyle]}>{title}</Text>}
          {introduction && <Text style={styles.mainText}>{introduction}</Text>}

          {/* 만약 children이 있으면 children 렌더링 */}
          {children ? (
            children
          ) : (
            <View style={styles.buttonRow}>
              <TouchableHighlight
              underlayColor="#DDDDDD"
                style={[{ ...styles.button, backgroundColor: '#CCCCCC' }, commonShadow.btnShadow]}
                onPress={onCancel || onClose}
              >
                <Text style={[styles.buttonText, { color: BLACK_COLOR }]}>{cancelButtonText}</Text>
              </TouchableHighlight>

              <TouchableHighlight
                underlayColor="#DDDDDD"
                style={[{ ...styles.button, backgroundColor: '#FF6B6B' }, commonShadow.btnShadow]}
                onPress={onConfirm}
              >
                <Text style={styles.buttonText}>{confirmButtonText}</Text>
              </TouchableHighlight>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  titleText: {
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    color: BLACK_COLOR,
  },
  mainText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
  },
  buttonRow: {
    marginTop: 20,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: BLACK_COLOR,
    fontWeight: 'bold',
    fontSize: 16
  },
});

export default CommonModal;
