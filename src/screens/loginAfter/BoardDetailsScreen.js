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

function BoardDetailsScreen({ route, navigation }) {
    const { groupId, boardId } = route.params;
    const [comment, setComment] = useState("");
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    // 게시글 상세 조회
    const fetchPostDetails = async () => {
        try {
            const response = await instance.get(`/groups/${groupId}/boards/${boardId}`);
            setPost(response.data.data);
        } catch (error) {
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
    }, [boardId]);

    const handleEdit = () => {
        console.log('게시글 수정');
    };

    const handleDelete = () => {
        console.log('게시글 삭제');
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
            Toast.show({
                type: 'error',
                text1: '댓글 수정에 실패했습니다.'
            });
        }
    };

    const handleCommentDelete = async (commentId) => {
        Alert.alert(
            '댓글 삭제',
            '댓글을 삭제하시겠습니까?',
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
                            await instance.delete(`/boards/${boardId}/comments/${commentId}`);
                            
                            Toast.show({
                                type: 'success',
                                text1: '댓글이 삭제되었습니다.'
                            });
                            
                            fetchComments(currentPage);
                        } catch (error) {
                            Toast.show({
                                type: 'error',
                                text1: '댓글 삭제에 실패했습니다.'
                            });
                        }
                    }
                }
            ]
        );
    };

    if (!post) return null;

    const boardData = {
        profileImage: post.memberProfile,
        username: post.memberName,
        title: post.title,
        content: post.content,
        postImage: post.image,
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
                                        isMyComment={true} // API에서 제공하는 정보에 따라 수정 필요
                                        onEdit={(editedContent) => handleCommentEdit(item.commentId, editedContent)}
                                        onDelete={() => handleCommentDelete(item.commentId)}
                                    />
                                ))}
                            </View>
                        </View>

                        {/* 댓글 입력 */}
                        <View style={styles.commentSection}>
                            <Text style={styles.commentTitle}>댓글</Text>
                            <Text style={styles.commentUsername}>유저 닉네임</Text>
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
        width: '100%',
        paddingBottom: 32,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
        width: '100%',
        paddingHorizontal: 16,
        marginTop: -4,
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
        paddingHorizontal: 16,
    },
    commentList: {
        width: '100%',
        gap: 16,
    },
    commentUsername: {
        fontSize: 14,
        fontWeight: 'bold',
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