import React, { useContext, useEffect, useState } from "react";
import { Text, View, StyleSheet } from "react-native";
import PasswordInput from "../../components/PasswordInput";
import { commonStyles } from "../../constants/styles";
import { CustomButton } from "../../components/CustomButton";
import { G_DARKER_COLOR } from "../../constants/colors";
import { AuthContext } from "../../contexts/AuthProvider";
import { useMutation } from "@tanstack/react-query";
import * as userService from '../../api/mutations/userService';

const isValidPassword = (password) => 
  /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[%,\$,#,@,!].*[%,\$,#,@,!])[A-Za-z\d%,\$,#,@,!]{8,20}$/.test(password);

const ChangePWScreen = ({ navigation }) => {
  const { token } = useContext(AuthContext); // Assuming token is required for authentication
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [passwordError, setPasswordError] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);

  // Mutation for password change
  const mutation = useMutation({
    mutationFn: userService.patchUserPw,
    onSuccess: () => {
      console.log("비밀번호 변경 완료!");
      navigation.goBack(); // Navigate back after successful change
    },
    onError: (error) => {
      console.error("비밀번호 변경 실패:", error.message);
    },
  });

  // Validate confirm password
  useEffect(() => {
    if (confirmPassword && password !== confirmPassword) {
      setPasswordError('비밀번호가 일치하지 않습니다.');
    } else {
      setPasswordError('');
    }
  }, [password, confirmPassword]);

  // Validate form validity
  useEffect(() => {
    const isValid = 
      isValidPassword(password) &&
      password === confirmPassword &&
      oldPassword.length > 0;

    setIsFormValid(isValid);
  }, [password, confirmPassword, oldPassword]);

  // Handle password change request
  const handleChangePassword = () => {
    if (!isFormValid) return;

    const requestBody = {
      currentPassword: oldPassword,
      newPassword: password,
    };

    mutation.mutate(requestBody);
  };

  return (
    <View style={commonStyles.container}>
      <PasswordInput
        label="기존 비밀번호"
        value={oldPassword}
        onChangeText={(text) => setOldPassword(text)}
        error={errors.oldPassword}
        description={errors.oldPassword ? <Text>{errors.oldPassword}</Text> : ''}
      />

      <PasswordInput
        label="새 비밀번호"
        value={password}
        onChangeText={(text) => setPassword(text)}
        error={errors.password}
        description={errors.password ? <Text>{errors.password}</Text> : ''}
      />

      <View style={styles.textContainer}>
        <Text style={styles.infoText}>
          • 비밀번호는 8 ~ 20자 영문, 숫자, 특수문자 2자 (%,$,#,@,!) 이상으로 조합해주세요.
        </Text>
      </View>

      <PasswordInput
        label="새 비밀번호 확인"
        value={confirmPassword}
        onChangeText={(text) => setConfirmPassword(text)}
        error={passwordError}
        description={passwordError}
      />

      <CustomButton 
        style={styles.buttonStyle}
        title="변경하기"
        disabled={!isFormValid}
        onPress={handleChangePassword}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  textContainer: {
    alignSelf: "stretch",
    marginLeft: 0,
    marginRight: 0,
    paddingHorizontal: 10,
    backgroundColor: "transparent",
  },
  infoText: {
    textAlign: "left",
    color: G_DARKER_COLOR,
    fontSize: 12,
    marginVertical: 10,
  },
  buttonStyle: {
    marginTop: 10,
  },
});

export default ChangePWScreen;
