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
import CommonModal from "../../components/CommonModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { instance } from '../../api/axiosInstance';
import { BottomTabBar } from "@react-navigation/bottom-tabs";


// 이메일 유효성 검사 정규식
const isValidEmail = (email) =>
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i.test(email);

const QuitMemberScreen = ({ route }) => {
  const navigation = useNavigation();
  const { logout } = useUser();
  const groupId = route.params?.groupId;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [emailErrors, setEmailErrors] = useState({});
  const [passwordErros, setPasswordErrors] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [myGroups, setMyGroups] = useState([]);
  const [groups, setGroups] = useState([]);
  // const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [isLeader, setIsLeader] = useState([]);
  const [token, setToken] = useState();
  
  // 이메일 입력 핸들러
  const handleEmailChange = (text) => {
    setEmail(text);
    if (!isValidEmail(text)) {
      setEmailErrors((prev) => ({...prev, email: "올바른 이메일 형식이 아닙니다."}));
    } else {
      setEmailErrors("");
    }
  };

  // 비밀번호 확인 및 에러 처리
  useEffect(() => {
    if (confirmPassword && password !== confirmPassword) {
      setPasswordErrors((prev) => ({...prev, password: "비밀번호가 일치하지 않습니다."}));
    } else {
      setPasswordErrors("");
    }
  }, [password, confirmPassword]);

  // 비동기 처리를 위해 useEffect를 사용하여 먼저 token값 불러오기
  useEffect(() => {
    const loadToken = async () => {
      const storedToken = await AsyncStorage.getItem('accessToken');
      if (storedToken) {
        setToken(storedToken);
      }
    };
    loadToken();
  }, []);

  // 내 모임 전체 조회
  const fetchGroups = async (categoryId) => {
    // setIsLoadingGroups(true);
    try {
      const response = await instance.get(`/mypage/groups`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: 1,
          size: 10,
          categoryId: categoryId === '전체' ? null : categoryId,
        },
      });

      console.log('Fetched groups:', response.data.data);
      setGroups(response.data.data || []); // Set groups data
    } catch (error) {
      console.error('Error fetching groups:', error.response?.data || error.message);
    } finally {
      setIsLoadingGroups(false);
    }
  };

  const isLeaderGroup = () => {
    fetchGroups();
    const leader = groups.filter(groupData => groupData.role === 'GROUP_LEADER');
    setIsLeader(leader);
  }

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
      setIsModalVisible(false);
      await logout(navigation);
    },
    onError: (error) => {
      // console.error('회원 탈퇴 실패 에러:', error);
      console.log("역할확인", groupData.myRole)
      Toast.show({
        type: "error",
        text1: "회원 탈퇴 실패",
        text2: error.response?.data?.message || "이메일/비밀번호를 다시 확인해주세요.",
      });
    },
  });

  const handleQuitMember = () => {
    console.log("handleQuitMember 실행", { email, password, agreed });  
    if (!agreed) {
      Toast.show({
        type: "error",
        text1: "개인정보 동의 필요",
        text2: "탈퇴를 위해 개인정보 동의가 필요합니다.",
        position:'bottom'
      });
      return;
    }

    if (emailErrors || passwordErros) {
      Toast.show({
        type: "error",
        text1: "입력 오류",
        text2: "이메일 또는 비밀번호를 확인해주세요.",
        position:'bottom'
      });
      return;
    }
    
    isLeaderGroup();
    console.log('isLeader}}}}}', isLeader);
    if(isLeader.length > 0) {
      Toast.show({
        type: 'error',
        text1: '모임장인 모임이 있습니다.',
        position: 'bottom'
      })
    }

    mutation.mutate(); // 탈퇴 요청
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={[commonStyles.container, commonStyles.paddingX, {alignItems: 'flex-start'}]}>
        <InputWithLabel
          label="아이디 (이메일)"
          value={email}
          onChangeText={handleEmailChange}
          placeholder="아이디를 입력해주세요."
          error={emailErrors.email}
          description={emailErrors.email ? <Text>{emailErrors.email}</Text> : ''}
        />

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
          error={passwordErros.password}
          description={passwordErros.password ? <Text>{passwordErros.password}</Text> : ''}
        />

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
                !emailErrors &&
                !passwordErros
                  ? "#FF6B6B"
                  : "#CCCCCC",
            },
          ]}
          disabled={
            !email ||
            !password ||
            !confirmPassword ||
            !!emailErrors ||
            !! passwordErros ||
            !agreed
          }
          onPress={() => setIsModalVisible(true)}
        />
        <CommonModal 
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          onCancel={() => setIsModalVisible(false)}
          onConfirm={handleQuitMember}
          title={"정말 탈퇴 하시겠어요 ?"}
          introduction={`탈퇴 시 계정에 있는 모든 모임과 일정이 삭제되며 복구되지 않습니다.`}
          cancelButtonText={"취소"}
          confirmButtonText={"확인"}
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
  // buttonStyle: {
  //   alignSelf: "center",
  //   marginTop: 16,
  //   paddingVertical: 12,
  //   paddingHorizontal: 24,
  //   borderRadius: 8,
  //   marginBottom: 16,
  //   shadowColor: BLACK_COLOR,
  //   shadowOffset: { width: 0, height: 2 },
  //   shadowOpacity: 0.2,
  //   shadowRadius: 4,
  //   elevation: 3,
  // },
  passwordErrorText: {
    color: ERROR_COLOR,
    marginTop: 8,
    marginBottom: 16,
  },
});

export default QuitMemberScreen;
