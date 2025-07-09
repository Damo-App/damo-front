import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import InputWithLabel from "../../components/InputWithLabel";
import PasswordInput from "../../components/PasswordInput";
import { CustomButton } from "../../components/CustomButton";
import CommonCheckBox from "../../components/CommonCheckBox";
import Info from "../../components/Info";
import { BLACK_COLOR, ERROR_COLOR } from "../../constants/colors";
import { commonStyles } from "../../constants/styles";
import { useMutation } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import { deleteUser } from "../../api/mutations/userService";
import { useUser } from "../../hooks/useUser";

// 이메일 유효성 검사 정규식
const isValidEmail = (email) =>
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i.test(email);

const QuitMemberScreen = () => {
  const navigation = useNavigation();
  const { logout } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [agreed, setAgreed] = useState(false);

  // 이메일 입력 핸들러
  const handleEmailChange = (text) => {
    setEmail(text);
    if (!isValidEmail(text)) {
      setEmailError("올바른 이메일 형식이 아닙니다.");
    } else {
      setEmailError("");
    }
  };

  // 비밀번호 확인 및 에러 처리
  useEffect(() => {
    if (confirmPassword && password !== confirmPassword) {
      setPasswordError("비밀번호가 일치하지 않습니다.");
    } else {
      setPasswordError("");
    }
  }, [password, confirmPassword]);

  // 회원 탈퇴 처리
  const mutation = useMutation({
    mutationFn: () => deleteUser(email, password),
    onSuccess: async () => {
      Toast.show({
        type: "success",
        text1: "회원 탈퇴 완료",
        text2: "그동안 이용해주셔서 감사합니다.",
        position:'bottom'
      });

      await logout(navigation);
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "회원 탈퇴 실패",
        text2: error.response?.data?.message || "이메일/비밀번호를 다시 확인해주세요.",
        position:'bottom'
      });
    },
  });

  const handleQuitMember = () => {
    if (!agreed) {
      Toast.show({
        type: "error",
        text1: "개인정보 동의 필요",
        text2: "탈퇴를 위해 개인정보 동의가 필요합니다.",
        position:'bottom'
      });
      return;
    }

    if (emailError || passwordError) {
      Toast.show({
        type: "error",
        text1: "입력 오류",
        text2: "이메일 또는 비밀번호를 확인해주세요.",
        position:'bottom'
      });
      return;
    }

    mutation.mutate(); // 탈퇴 요청
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={commonStyles.container}>
        <InputWithLabel
          label="아이디 (이메일)"
          value={email}
          onChangeText={handleEmailChange}
          placeholder="아이디를 입력해주세요."
          error={emailError}
        />
        {emailError !== "" && (
          <Text style={styles.errorText}>{emailError}</Text>
        )}

        <PasswordInput
          label="비밀번호"
          value={password}
          onChangeText={setPassword}
          placeholder="비밀번호를 입력해주세요."
        />

        <PasswordInput
          label="비밀번호 확인"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="비밀번호 확인을 위해 입력해주세요."
          error={passwordError}
        />
        {passwordError !== "" && (
          <Text style={styles.errorText}>{passwordError}</Text>
        )}

        {!agreed && (
          <View style={styles.infoContainer}>
            <Info title="• 안내사항 1" content="탈퇴 시 모든 데이터가 삭제됩니다." />
            <Info title="• 안내사항 2" content="복구가 불가능합니다." />
            <Info title="• 안내사항 3" content="모임 및 활동 정보도 삭제됩니다." />
          </View>
        )}

        <View style={styles.checkboxWrapper}>
          <CommonCheckBox
            label="개인정보 동의"
            value={agreed}
            onValueChange={setAgreed}
          />
        </View>

        <CustomButton
          title="회원 탈퇴"
          style={[
            styles.buttonStyle,
            {
              backgroundColor:
                email &&
                password &&
                confirmPassword &&
                agreed &&
                !passwordError &&
                !emailError
                  ? "#FF6B6B"
                  : "#CCCCCC",
            },
          ]}
          disabled={
            !email ||
            !password ||
            !confirmPassword ||
            !!passwordError ||
            !!emailError ||
            !agreed
          }
          onPress={handleQuitMember}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1 },
  infoContainer: {
    marginTop: 16,
    marginBottom: 16,
    alignItems: 'flex-start',
    width: '100%',
  },
  checkboxWrapper: {
    flexDirection: "row",
    width: '100%',
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 16,
  },
  buttonStyle: {
    alignSelf: "center",
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: BLACK_COLOR,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  passwordErrorText: {
    color: ERROR_COLOR,
    marginTop: 8,
    marginBottom: 16,
  },
});

export default QuitMemberScreen;
