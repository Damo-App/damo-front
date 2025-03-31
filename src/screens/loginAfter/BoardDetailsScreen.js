import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import { PRIMARY_BACK_COLOR, BLACK_COLOR, WHITE_COLOR, PRIMARY_BTN_COLOR, ERROR_COLOR, YELLOW_DARK_COLOR, YELLOW_LIGHT_COLOR, INPUT_BACK_COLOR, PINK_DARK_COLOR } from "../../constants/colors";
import { commonStyles } from "../../constants/styles";
import { commonShadow } from "../../constants/styles";
import BoardCard from "../../components/BoardCard";
import InputWithLabel from "../../components/InputWithLabel";
import { CustomButton } from "../../components/CustomButton";
import CommentItem from "../../components/CommentItem";

function BoardDetailsScreen({ navigation }) {
    const [comment, setComment] = useState("");

    // 임시 데이터
    const boardData = {
        profileImage: null,
        username: "작성자",
        title: "게시글 제목",
        content: "진짜 미안해 제발 스타일 제대로 입혀줘 제발.....내가정말잘못했다...",
        postImage: null,
        createdAt: "2024.03.18",
        commentCount: 2,
        // likeCount: 2,
    };

    // 임시 댓글 데이터
    const commentList = [
        {
            id: 1,
            profileImage: null,
            username: "강기룡",
            content: "김밥한줄,,,,두고갑니다,,,,,@)))))",
            createdAt: "2024.03.26",
            isMyComment: true,
        },
        {
            id: 2,
            profileImage: null,
            username: "곽덕배",
            content: "징징 거리지 말고 그냥 쓰셈",
            createdAt: "2024.03.26",
            isMyComment: true,
        },
        {
            id: 3,
            profileImage: null,
            username: "권택현",
            content: "드디어 댓글 컴포넌트 되네 ㅠㅠㅠ",
            createdAt: "2024.03.26",
            isMyComment: true,
        },
    ];

    const handleLikePress = () => {
        console.log('좋아요 클릭');
    };

    const handleMorePress = () => {
        console.log('더보기 클릭');
    };

    const handleSubmit = () => {
        console.log('댓글 작성');
    };

    const handleEdit = () => {
        console.log('게시글 수정');
    };

    const handleDelete = () => {
        console.log('게시글 삭제');
    };

    const handleCommentEdit = (commentId) => {
        console.log('댓글 수정', commentId);
    };

    const handleCommentDelete = (commentId) => {
        console.log('댓글 삭제', commentId);
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
                        <BoardCard 
                            {...boardData}
                            onLikePress={handleLikePress}
                            onMorePress={handleMorePress}
                        />
                        
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
                                {commentList.map((item) => (
                                    <CommentItem
                                        key={item.id}
                                        {...item}
                                        onEdit={() => handleCommentEdit(item.id)}
                                        onDelete={() => handleCommentDelete(item.id)}
                                    />
                                ))}
                            </View>
                            <View style={styles.inputSection}>
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