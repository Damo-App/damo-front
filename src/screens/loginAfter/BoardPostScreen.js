import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { instance } from '../../api/axiosInstance';
import { commonStyles, commonShadow } from '../../constants/styles';
import { BLACK_COLOR, PRIMARY_BTN_COLOR, WHITE_COLOR } from '../../constants/colors';
import InputWithLabel from '../../components/InputWithLabel';
import Toast from 'react-native-toast-message';
import { Alert } from 'react-native';

const BoardPostScreen = ({ route, navigation }) => {
  const { groupId } = route.params;
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [image, setImage] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const openGallery = async () => {
    // 권한 요청
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '사진 접근 권한이 필요합니다.');
      return;
    }

    // 갤러리 열기
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImage = result.assets[0];
      setImage({
        uri: selectedImage.uri,
        type: 'image/jpeg',
        name: 'image.jpg'
      });
    } else {
      console.log("이미지 선택이 취소되었습니다.");
    }
  };

  const handleSubmit = async () => {
    if (loading) return;
    
    try {
      setLoading(true);

      if (!title.trim() || !content.trim()) {
        Toast.show({
          type: 'error',
          text1: '입력 오류',
          text2: '제목과 내용을 모두 입력해주세요.'
        });
        return;
      }

      const formData = new FormData();
      formData.append('boardPostDto', JSON.stringify({
        title: title,
        content: content
      }));
      
      if (image) {
        formData.append('boardImage', {
          uri: image.uri,
          type: 'image/jpeg',
          name: 'image.jpg'
        });
      } else {
        formData.append('boardImage', '');
      }

      const response = await instance.post(`/groups/${groupId}/boards`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        Toast.show({
          type: 'success',
          text1: '게시글이 작성되었습니다.',
          position: 'bottom'
        });
        navigation.goBack();
        if (route.params?.onGoBack) {
          route.params.onGoBack();
        }
      }
    } catch (error) {
      console.error('게시글 작성 오류:', error);
      Toast.show({
        type: 'error',
        text1: '게시글 작성 실패',
        text2: error.response?.data?.message || '다시 시도해주세요.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[commonStyles.container, { flex: 1 }]}>
      <ScrollView
        style={{ width: '100%', flex: 1 }}
        contentContainerStyle={{ 
          flexGrow: 1,
          paddingBottom: 150,
          paddingHorizontal: 15,
        }}
        showsVerticalScrollIndicator={false}
      >
        <InputWithLabel
          label="제목"
          value={title}
          onChangeText={setTitle}
          placeholder="제목을 입력해주세요"
          style={styles.input}
        />

        <InputWithLabel
          label="내용"
          value={content}
          onChangeText={setContent}
          placeholder="내용을 입력해주세요"
          multiline
          numberOfLines={10}
          style={[styles.input, styles.contentInput]}
        />

        <View style={styles.imageSection}>
          <Text style={styles.label}>이미지 (선택)</Text>
          <TouchableOpacity 
            style={[styles.imageButton, commonShadow.mainShadow]} 
            onPress={openGallery}
          >
            {image ? (
              <Image
                source={{ uri: image.uri }}
                style={styles.selectedImage}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.imageButtonText}>+</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, commonShadow.mainShadow, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? '작성 중...' : '작성하기'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    marginBottom: 20,
  },
  contentInput: {
    height: 200,
    textAlignVertical: 'top',
  },
  imageSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: BLACK_COLOR,
  },
  imageButton: {
    width: 100,
    height: 100,
    backgroundColor: WHITE_COLOR,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  imageButtonText: {
    fontSize: 24,
    color: '#666',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  submitButton: {
    backgroundColor: PRIMARY_BTN_COLOR,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: BLACK_COLOR,
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default BoardPostScreen;