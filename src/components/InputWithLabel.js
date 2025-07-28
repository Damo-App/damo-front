import React, {useState} from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { commonInput } from '../constants/styles';
import { BLACK_COLOR, ERROR_COLOR } from '../constants/colors'; // 에러 시 사용할 색상

const InputWithLabel = ({
  label,
  description,
  value,
  onChangeText,
  placeholder,
  error,
  isTextarea = false, // textarea 여부를 결정하는 속성 (기본값: false)
  containerStyle,
  labelStyle,
  placeholderStyle,
  disabled = false
}) => {

  const [height, setHeight] = useState(100);

  return (
    <View style={[commonInput.container, containerStyle]}>
      {label && <Text style={[commonInput.label, labelStyle]}>{label}</Text>}

      <TextInput
        style={[
          commonInput.input,
          placeholderStyle,
          isTextarea && styles.textarea,
          error && styles.errorBorder,
          isTextarea && { height: Math.max(100, height) },
          disabled && styles.disabledInput
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline={isTextarea} 
        editable={!disabled}
        onContentSizeChange={(event) => {
          if (isTextarea) {
            const newHeight = event.nativeEvent.contentSize.height;
            setHeight(newHeight); 
          }
        }}
      />

      {/* Description (오류 메시지일 경우 = error | 빨간색) */}
      {description && (
        <Text style={[commonInput.description, error && styles.errorText]}>
          {description}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  textarea: {
    height: 100, // 기본 높이 설정
    textAlignVertical: 'top', // 텍스트가 위쪽부터 시작하도록 설정
  },
  errorBorder: {
    borderColor: ERROR_COLOR,
    borderWidth: 1.5,
  },
  errorText: {
    color: ERROR_COLOR,
  },
  disabledInput: {
    backgroundColor: '#F0F0F0',
    color: BLACK_COLOR, 
  },
});

export default InputWithLabel;
