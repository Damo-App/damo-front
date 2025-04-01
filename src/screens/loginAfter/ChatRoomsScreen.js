import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TextInput, Image, TouchableOpacity } from 'react-native';
import { PRIMARY_BACK_COLOR, BLACK_COLOR, WHITE_COLOR } from '../../constants/colors';
import { commonStyles, commonShadow } from '../../constants/styles';
import { instance } from '../../api/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Client } from '@stomp/stompjs';
import websocket from 'websocket';

// WebSocket을 전역 객체에 할당
global.WebSocket = websocket.w3cwebsocket;

// TextEncoder polyfill
if (typeof TextEncoder === 'undefined') {
    global.TextEncoder = require('text-encoding').TextEncoder;
}
if (typeof TextDecoder === 'undefined') {
    global.TextDecoder = require('text-encoding').TextDecoder;
}

const ChatRoomsScreen = ({ route, navigation }) => {
    console.log('Route params:', route.params);
    // ChatScreen에서 전달받은 파라미터
    const { chatroomId, categoryId, categoryName } = route.params || {};

    // chatroomId가 없으면 이전 화면으로 돌아가기
    useEffect(() => {
        if (!chatroomId) {
            console.error('채팅방 ID가 없습니다. Route params:', route.params);
            navigation.goBack();
            return;
        }
        console.log('채팅방 입장:', chatroomId);
        connectStomp();

        // 컴포넌트 언마운트 시 정리
        return () => {
            console.log('채팅방 퇴장: 구독 해제 및 연결 종료');
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe();
            }
            if (clientRef.current) {
                // 퇴장 메시지 전송
                try {
                    clientRef.current.publish({
                        destination: `/pub/chat/${chatroomId}/leave`,
                        body: JSON.stringify({
                            type: 'LEAVE',
                            chatRoomId: chatroomId
                        })
                    });
                } catch (error) {
                    console.error('퇴장 메시지 전송 실패:', error);
                }
                
                // STOMP 연결 종료
                clientRef.current.deactivate();
            }
        };
    }, []);

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [memberCount, setMemberCount] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const scrollViewRef = useRef();
    const clientRef = useRef();
    const subscriptionRef = useRef();

    const connectStomp = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) {
                console.error('토큰이 없습니다');
                navigation.navigate('Login');
                return;
            }

            console.log('STOMP 연결 시도...');
            const client = new Client({
                brokerURL: 'ws://ec2-3-39-190-50.ap-northeast-2.compute.amazonaws.com:8080/ws-stomp',
                connectHeaders: {
                    'Authorization': `Bearer ${token}`,
                    'heart-beat': '0,0'
                },
                debug: function (str) {
                    console.log('STOMP Debug:', str);
                },
                reconnectDelay: 5000,
                heartbeatIncoming: 0,
                heartbeatOutgoing: 0,
                forceBinaryWSFrames: true,
                appendMissingNULLonIncoming: true,
                onConnect: (frame) => {
                    console.log("✅ STOMP connected:", frame);
                    setIsConnected(true);

                    // 채팅 메시지 구독
                    console.log('채팅방 구독 시도:', `/sub/chat/${chatroomId}`);
                    const chatSubscription = client.subscribe(
                        `/sub/chat/${chatroomId}`,
                        (message) => {
                            console.log('Received message:', message.body);
                            try {
                                const payload = JSON.parse(message.body);
                                if (payload.type === 'MEMBER_COUNT') {
                                    setMemberCount(payload.payload.count);
                                } else {
                                    setMessages(prev => [...prev, payload]);
                                    scrollViewRef.current?.scrollToEnd({ animated: true });
                                }
                            } catch (error) {
                                console.error('메시지 파싱 실패:', error);
                            }
                        }
                    );

                    // 참여자 수 구독
                    console.log('참여자 수 구독 시도:', `/sub/chat/${chatroomId}/members`);
                    const countSubscription = client.subscribe(
                        `/sub/chat/${chatroomId}/members`,
                        (message) => {
                            console.log('Received count:', message.body);
                            try {
                                const count = JSON.parse(message.body);
                                setMemberCount(count);
                            } catch (error) {
                                console.error('참여자 수 파싱 실패:', error);
                            }
                        }
                    );

                    subscriptionRef.current = {
                        unsubscribe: () => {
                            try {
                                chatSubscription.unsubscribe();
                                countSubscription.unsubscribe();
                            } catch (error) {
                                console.error('구독 해제 실패:', error);
                            }
                        }
                    };

                    // 초기 메시지 로딩
                    fetchInitialMessages(token);

                    // 입장 메시지 전송
                    client.publish({
                        destination: `/pub/chat/${chatroomId}/enter`,
                        body: JSON.stringify({
                            type: 'ENTER',
                            chatRoomId: chatroomId
                        })
                    });
                }
            });

            client.onStompError = function (frame) {
                console.error('STOMP 에러:', frame);
                setIsConnected(false);
            };

            client.onWebSocketError = function (event) {
                console.error('WebSocket 에러:', event);
                setIsConnected(false);
            };

            console.log('STOMP 클라이언트 활성화 시도...');
            client.activate();
            clientRef.current = client;

        } catch (error) {
            console.error('STOMP 연결 에러:', error);
            setIsConnected(false);
        }
    };

    const fetchInitialMessages = async (token) => {
        console.log('초기 메시지 로딩 시도:', chatroomId);
        try {
            console.log('API 요청 URL:', `/chatrooms/${chatroomId}`);
            const response = await instance.get(`/chatrooms/${chatroomId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('서버 응답:', response.data);
            if (response.data?.data?.messages) {
                console.log('받은 메시지 수:', response.data.data.messages.length);
                setMessages(response.data.data.messages);
            } else {
                console.log('메시지가 없거나 다른 형식의 응답:', response.data);
            }
        } catch (error) {
            console.error('초기 메시지 로딩 실패:', error);
            if (error.response) {
                console.error('에러 응답:', error.response.data);
                console.error('상태 코드:', error.response.status);
            }
        }
    };

    const sendMessage = () => {
        if (!clientRef.current || !isConnected || !newMessage.trim()) {
            console.log('메시지 전송 불가:', { 
                hasClient: !!clientRef.current, 
                isConnected, 
                hasMessage: !!newMessage.trim() 
            });
            return;
        }

        try {
            const messagePayload = {
                content: newMessage.trim(),
                chatRoomId: chatroomId
            };

            console.log('메시지 전송:', messagePayload);
            // /pub 엔드포인트로 메시지 전송
            clientRef.current.publish({
                destination: `/pub/chat/${chatroomId}/sendMessage`,
                body: JSON.stringify(messagePayload)
            });

            setNewMessage('');
        } catch (error) {
            console.error('메시지 전송 실패:', error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.categoryName}>{categoryName}</Text>
                <Text style={styles.participantCount}>참여인원: {memberCount}명</Text>
            </View>
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoid}
                keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
            >
                <ScrollView 
                    ref={scrollViewRef}
                    style={styles.messageContainer}
                    contentContainerStyle={styles.messageContent}
                    onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                >
                    {messages.map((message, index) => (
                        <View 
                            key={index} 
                            style={[
                                styles.messageWrapper,
                                message.isMyMessage ? styles.myMessage : styles.otherMessage
                            ]}
                        >
                            {message.system || message.type === 'SYSTEM_MESSAGE' ? (
                                <Text style={styles.systemMessage}>
                                    {message.payload?.message || message.message}
                                </Text>
                            ) : (
                                <>
                                    {!message.isMyMessage && (
                                        <View style={styles.profileContainer}>
                                            <Image 
                                                source={{ uri: message.profileImage }} 
                                                style={styles.profileImage}
                                            />
                                            <Text style={styles.username}>{message.writer}</Text>
                                        </View>
                                    )}
                                    <View style={[
                                        styles.messageBubble,
                                        message.isMyMessage ? styles.myBubble : styles.otherBubble
                                    ]}>
                                        <Text style={styles.messageText}>{message.content}</Text>
                                    </View>
                                </>
                            )}
                        </View>
                    ))}
                </ScrollView>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={newMessage}
                        onChangeText={setNewMessage}
                        placeholder="메시지를 입력하세요."
                        placeholderTextColor="#999"
                        multiline
                    />
                    <TouchableOpacity 
                        style={styles.sendButton}
                        onPress={sendMessage}
                    >
                        <Text style={styles.sendButtonText}>전송</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: PRIMARY_BACK_COLOR,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: WHITE_COLOR,
        borderBottomWidth: 1,
        borderBottomColor: BLACK_COLOR,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: BLACK_COLOR,
    },
    participantCount: {
        fontSize: 14,
        color: BLACK_COLOR,
    },
    keyboardAvoid: {
        flex: 1,
    },
    messageContainer: {
        flex: 1,
        padding: 10,
    },
    messageContent: {
        flexGrow: 1,
        paddingBottom: 10,
    },
    messageWrapper: {
        marginVertical: 5,
        maxWidth: '80%',
    },
    myMessage: {
        alignSelf: 'flex-end',
    },
    otherMessage: {
        alignSelf: 'flex-start',
    },
    systemMessage: {
        alignSelf: 'center',
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
        marginVertical: 5,
    },
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    profileImage: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 8,
        borderWidth: 1,
        borderColor: BLACK_COLOR,
    },
    username: {
        fontSize: 12,
        color: BLACK_COLOR,
    },
    messageBubble: {
        padding: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: BLACK_COLOR,
        ...commonShadow.mainShadow,
    },
    myBubble: {
        backgroundColor: WHITE_COLOR,
    },
    otherBubble: {
        backgroundColor: WHITE_COLOR,
    },
    messageText: {
        fontSize: 14,
        color: BLACK_COLOR,
    },
    timestamp: {
        fontSize: 10,
        color: '#666',
        marginTop: 2,
        marginHorizontal: 5,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: WHITE_COLOR,
        borderTopWidth: 1,
        borderTopColor: BLACK_COLOR,
        alignItems: 'center',
    },
    input: {
        flex: 1,
        backgroundColor: WHITE_COLOR,
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginRight: 10,
        borderWidth: 1,
        borderColor: BLACK_COLOR,
        maxHeight: 100,
        color: BLACK_COLOR,
    },
    sendButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        backgroundColor: WHITE_COLOR,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: BLACK_COLOR,
        ...commonShadow.mainShadow,
    },
    sendButtonText: {
        color: BLACK_COLOR,
        fontSize: 14,
    },
});

export default ChatRoomsScreen;