// components/IconButton.js
import React from 'react';
import { TouchableWithoutFeedback } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const IconButton = ({ name, size, color, onPress }) => {
  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <Icon name={name} size={size} color={color} />
    </TouchableWithoutFeedback>
  );
};

export default IconButton;
