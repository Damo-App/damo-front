import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from "react-native";
import { PRIMARY_BACK_COLOR, BLACK_COLOR, WHITE_COLOR, PRIMARY_BTN_COLOR, ERROR_COLOR, YELLOW_DARK_COLOR, YELLOW_LIGHT_COLOR, INPUT_BACK_COLOR, PINK_DARK_COLOR } from "../../constants/colors";
import { commonStyles } from "../../constants/styles";
import { commonShadow } from "../../constants/styles";
import BoardCard from "../../components/BoardCard";
import InputWithLabel from "../../components/InputWithLabel";
import { CustomButton } from "../../components/CustomButton";
import CommentItem from "../../components/CommentItem";
import Toast from "react-native-toast-message";
import { instance } from "../../api/axiosInstance";
// import { jwtDecode } from "jwt-decode";
import AsyncStorage from '@react-native-async-storage/async-storage';

function BoardDetailsScreen({ route, navigation }) {
    const { groupId, boardId } = route.params;
    const [comment, setComment] = useState("");
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [memberName, setMemberName] = useState("");
    const [isAuthor, setIsAuthor] = useState(false);

    // 게시글 상세 조회
    const fetchPostDetails = async () => {
        try {
            const response = await instance.get(`/groups/${groupId}/boards/${boardId}`);
            console.log('게시글 데이터:', response.data.data);
            setPost(response.data.data);
        } catch (error) {
            console.error('에러 발생:', error);
            Toast.show({
                type: 'error',
                text1: '게시글을 불러오는데 실패했습니다.'
            });
        }
    };

    // 댓글 목록 조회
    const fetchComments = async (page = 1) => {
        try {
            const response = await instance.get(`/boards/${boardId}/comments?page=${page}&size=10`);
            setComments(response.data.data);
            setCurrentPage(page);
        } catch (error) {
            console.error('댓글 조회 실패:', error);
        }
    };

    // 현재 사용자 정보 가져오기
    const fetchMyInfo = async () => {
        try {
            const response = await instance.get('/mypage');
            console.log('내 정보:', response.data.data);
            setMemberName(response.data.data.name);  // 사용자 이름 설정
        } catch (error) {
            console.error('사용자 정보 조회 실패:', error);
        }
    };

    // 댓글 작성
    const handleSubmit = async () => {
        if (!comment.trim()) return;
        
        try {
            await instance.post(`/boards/${boardId}/comments`, {
                content: comment.trim()
            });
            setComment('');
            fetchComments(1);
            Toast.show({
                type: 'success',
                text1: '댓글이 작성되었습니다.'
            });
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: '댓글 작성에 실패했습니다.'
            });
        }
    };

    useEffect(() => {
        fetchPostDetails();
        fetchComments(1);
        fetchMyInfo();  // 사용자 정보 조회 추가
    }, []);

    const handleEdit = () => {
        navigation.navigate('BoardUpdateScreen', { 
            groupId, 
            boardId,
            title: post.title,
            content: post.content,
            image: post.image
        });
    };

    const handleDelete = () => {
        Alert.alert(
            '게시글 삭제',
            '정말로 이 게시글을 삭제하시겠습니까?',
            [
                {
                    text: '취소',
                    style: 'cancel'
                },
                {
                    text: '삭제',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await instance.delete(`/groups/${groupId}/boards/${boardId}`);
                            Toast.show({
                                type: 'success',
                                text1: '게시글이 삭제되었습니다.'
                            });
                            navigation.navigate('BoardScreen', {
                                groupId: groupId,
                                refresh: Date.now()
                            });
                        } catch (error) {
                            Toast.show({
                                type: 'error',
                                text1: '게시글 삭제에 실패했습니다.'
                            });
                        }
                    }
                }
            ]
        );
    };

    const handleCommentEdit = async (commentId, editedContent) => {
        if (!editedContent || !editedContent.trim()) return;

        try {
            await instance.patch(`/boards/${boardId}/comments/${commentId}`, {
                content: editedContent.trim()
            });
            
            Toast.show({
                type: 'success',
                text1: '댓글이 수정되었습니다.'
            });
            
            fetchComments(currentPage);
        } catch (error) {
            if (error.response?.data?.message === 'Not authorized to access this resource') {
                Toast.show({
                    type: 'error',
                    text1: '댓글 작성자가 아닙니다.'
                });
            } else {
                Toast.show({
                    type: 'error',
                    text1: '댓글 수정에 실패했습니다.'
                });
            }
        }
    };

    const handleCommentDelete = async (commentId) => {
        try {
            await instance.delete(`/boards/${boardId}/comments/${commentId}`);
            Toast.show({
                type: 'success',
                text1: '댓글이 삭제되었습니다.'
            });
            fetchComments(currentPage);
        } catch (error) {
            if (error.response?.data?.message === 'Not authorized to access this resource') {
                Toast.show({
                    type: 'error',
                    text1: '댓글 작성자가 아닙니다.'
                });
            } else {
                Toast.show({
                    type: 'error',
                    text1: '댓글 삭제에 실패했습니다.'
                });
            }
        }
    };

    if (!post) return null;

    const boardData = {
        profileImage: post.memberProfile ? { uri: post.memberProfile } : null,
        username: post.memberName,
        title: post.title,
        content: post.content,
        postImage: post.image ? { uri: post.image } : null,
        createdAt: new Date(post.createdAt).toLocaleDateString(),
        commentCount: post.commentCount,
    };

    return (
        <View style={styles.mainContainer}>
            <View style={styles.keyboardAvoid}>
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.contentContainer}>
                        <BoardCard {...boardData} />
                        
                        {/* 작성자인 경우에만 수정/삭제 버튼 표시 */}
                        {isAuthor && (
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity 
                                    style={[styles.actionButton, styles.deleteButton, commonShadow.mainShadow]} 
                                    onPress={handleDelete}
                                >
                                    <Text style={[styles.buttonText, styles.deleteButtonText]}>삭제</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.actionButton, styles.editButton, commonShadow.mainShadow]} 
                                    onPress={handleEdit}
                                >
                                    <Text style={styles.buttonText}>수정</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* 댓글 목록 */}
                        <View style={styles.commentSection}>
                            <Text style={styles.commentTitle}>댓글</Text>
                            <View style={styles.commentList}>
                                {comments.map((item) => (
                                    <CommentItem
                                        key={item.commentId}
                                        username={item.memberName}
                                        content={item.content}
                                        createdAt={new Date(item.createdAt).toLocaleDateString()}
                                        isMyComment={true}
                                        onEdit={(editedContent) => handleCommentEdit(item.commentId, editedContent)}
                                        onDelete={() => handleCommentDelete(item.commentId)}
                                    />
                                ))}
                            </View>
                        </View>

                        {/* 댓글 입력 */}
                        <View style={styles.commentSection}>
                        <View style={{ height: 2, backgroundColor: BLACK_COLOR, marginVertical: 10 }} />
                            <Text style={styles.commentTitle}>댓글</Text>
                            <Text style={styles.commentUsername}>{memberName}</Text>
                            <InputWithLabel
                                placeholder="댓글을 입력해주세요."
                                value={comment}
                                onChangeText={(text) => setComment(text)}
                            />
                            <CustomButton
                                title={<Text style={styles.buttonText}>댓글 작성</Text>}
                                onPress={handleSubmit}
                                disabled={comment.length < 1}
                            />
                        </View>
                    </View>
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: PRIMARY_BACK_COLOR,
    },
    keyboardAvoid: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        width: '100%',
        paddingBottom: 32,
        paddingHorizontal: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
        width: '100%',
        paddingHorizontal: 0.8, // Moved to the right by increasing paddingHorizontal
        marginTop: 8,
        marginBottom: 12,
    },
    actionButton: {
        paddingVertical: 5.3,
        paddingHorizontal: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: BLACK_COLOR,
    },
    editButton: {
        backgroundColor: "#FEDA79",
    },
    deleteButton: {
        backgroundColor: PINK_DARK_COLOR,
    },
    buttonText: {
        color: BLACK_COLOR,
        fontSize: 14,
        fontWeight: '600',
    },
    deleteButtonText: {
        color: BLACK_COLOR,
    },
    commentTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        marginTop: 8,
    },
    commentSection: {
        width: '100%',
        paddingVertical: 16,
    },
    commentList: {
        width: '100%',
        gap: 12,
    },
    commentUsername: {
        fontSize: 14,
        marginBottom: 8,
    },
    inputSection: {
        width: '100%',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#000000',
        backgroundColor: PRIMARY_BACK_COLOR,
        gap: 16,
        marginTop: 24,
    },
});

export default BoardDetailsScreen;