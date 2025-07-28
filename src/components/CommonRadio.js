import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { RadioGroup, RadioButton } from 'react-native-ui-lib';
import { commonInput, commonRadio } from "../constants/styles";
import { BLACK_COLOR } from "../constants/colors";


export const CommonRadio = ({ label,value, onChange, options = [] , containerStyle,groupStyle, disabled}) => {

  const styles = StyleSheet.create({
    disableRadio: {
      backgroundColor: 'transparent',
      borderColor: '#747474ff',
    }
  })
  return (
    <View style={[commonRadio.container, containerStyle]}>
      {label && <Text style={commonInput.label}>{label}</Text>}
      <RadioGroup initialValue={value} onValueChange={onChange} style={[commonRadio.radioGroup, groupStyle]}>
        {options.map((option) => (
          <RadioButton
            key={option.value}
            label={option.label}
            value={option.value}
            style={[commonRadio.radioBtn, 
              disabled && styles.disableRadio
            ]}
            containerStyle={commonRadio.radioButtonContainer}
            labelStyle={commonRadio.radioLabel}
            selectedColor={BLACK_COLOR}
            color={BLACK_COLOR}
            size={20}
            disabled={disabled}
          />
        ))}
      </RadioGroup>
    </View>
  );
};