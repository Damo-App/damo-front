import React, { useContext, useEffect, useState } from "react";
import { Text, View, StyleSheet } from "react-native";
import InputWithLabel from "../../components/InputWithLabel";
import PasswordInput from "../../components/PasswordInput";
import { commonStyles } from "../../constants/styles";
import { CustomButton } from "../../components/CustomButton";
import { G_DARKER_COLOR } from "../../constants/colors";
import { AuthContext } from "../../contexts/AuthProvider";

// 비밀번호 유효성 검사 (영문+숫자+특수문자 조합, 8~20자)
const isValidPassword = (password) => 
    /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[%,\$,#,@,!].*[%,\$,#,@,!])[A-Za-z\d%,\$,#,@,!]{8,20}$/.test(password);

const ChangePWScreen = ({ navigation }) => {
   const {token} = useContext(AuthContext);
   console.log("비밀번호 변경 token ==", token);
    const [oldPassword, setOldPassword] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [passwordError, setPasswordError] = useState('');
    const [isFormValid, setIsFormValid] = useState(false);

    useEffect(() => {
        if (confirmPassword && password !== confirmPassword) {
            setPasswordError('비밀번호가 일치하지 않습니다.');
        } else {
            setPasswordError('');
        }
    }, [password, confirmPassword]);

   // 비밀번호 입력 핸들러
   const handleOldPasswordChange = (text) => {
    setOldPassword(text);
    
    if (!isValidPassword(text)) {
      setErrors((prev) => ({
        ...prev,
        oldPassword: "비밀번호는 8~20자, 영문, 숫자, 특수문자 2개 이상 포함해야 합니다.",
      }));
    } else {
      setErrors((prev) => ({ ...prev, oldPassword: null })); // 오류 해제
    }
  };
   const handlePasswordChange = (text) => {
    setPassword(text);
    
    if (!isValidPassword(text)) {
      setErrors((prev) => ({
        ...prev,
        password: "비밀번호는 8~20자, 영문, 숫자, 특수문자 2개 이상 포함해야 합니다.",
      }));
    } else {
      setErrors((prev) => ({ ...prev, password: null })); // 오류 해제
    }
  };

  useEffect(() => {
    const isValid = 
        isValidPassword(password) &&
        password === confirmPassword        
  }, [password, confirmPassword])

    return (
        <View style={commonStyles.container}>
        <PasswordInput
            label="기존 비밀번호"
            value={oldPassword}
            onChangeText={handleOldPasswordChange} // 입력 핸들러 연결
            error={errors.oldPassword}
            description={errors.oldPassword ? <Text>{errors.oldPassword}</Text> : ''}
          />

        <PasswordInput
            label="새 비밀번호"
            value={password}
            onChangeText={handlePasswordChange} // 입력 핸들러 연결
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
            onChangeText={setConfirmPassword}
            error={passwordError}
            description={passwordError}
          />
          <CustomButton style={styles.buttonStyle}
          title='변경하기'
          disabled={!isFormValid}
          />
        </View>
    )
}

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
    errorText: {
      color: "red", 
      marginLeft: 10,
      fontSize: 12,
    },
    buttonStyle: {
        marginTop: 10
    }
  });

export default ChangePWScreen;