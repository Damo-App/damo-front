import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TextInput, Image, TouchableOpacity } from 'react-native';
import { PRIMARY_BACK_COLOR, BLACK_COLOR, WHITE_COLOR } from '../../constants/colors';
import { commonShadow } from '../../constants/styles';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { instance } from '../../api/axiosInstance';
import { useUser } from '../../hooks/useUser';

const ChatRoomsScreen = ({ route, navigation }) => {
    console.log(navigation);
    const { chatroomId, categoryId, categoryName } = route?.params || {};
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [memberCount, setMemberCount] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const { user } = useUser();

    console.log("messages ==========", messages);
    console.log("user ===========", user?.name);

    const scrollViewRef = useRef();
    const clientRef = useRef();
    const subscriptionRef = useRef();

    useEffect(() => {
        if (!chatroomId || !categoryId) {
            console.error('채팅방 ID가 없습니다.', route.params);
            navigation.goBack();
            return;
        }
        connectStomp();

        return () => {
            // 컴포넌트 언마운트 시 구독해제 및 연결 종료 처리
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe();
                subscriptionRef.current = null;
            }
            if (clientRef.current) {
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
                clientRef.current.deactivate();
            }
        };
    }, []);

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
              webSocketFactory: () => new SockJS('http://10.154.168.95:8080/ws-stomp'),
              // connectHeaders: { Authorization: `Bearer ${token}` },
                // webSocketFactory: () => new SockJS('ws://172.20.10.5:8080/ws-stomp'),
                connectHeaders: {
                    'Authorization': `Bearer ${token}`,
                    'heart-beat': '0,0'
                },
                debug: (str) => {
                    console.log('STOMP Debug:', str);
                },
                // reconnectDelay: 5000,
                // heartbeatIncoming: 0,
                // heartbeatOutgoing: 0,
                // forceBinaryWSFrames: true,
                // appendMissingNULLonIncoming: true,
                onConnect: async () => {
                    console.log("✅ STOMP connected");
                    setIsConnected(true);

                     // 초기 메시지 로딩
                    await fetchInitialMessages(token);

                    

                    // 채팅방 메시지 구독
                    console.log('채팅방 구독 시도:', `/sub/chat/${chatroomId}`);
                    const chatSubscription = client.subscribe(
                        `/sub/chat/${chatroomId}`,  
                        message => {
                            try {
                                const payload = JSON.parse(message.body);
                                console.log("message.body payload",payload)
                                if (payload.type === 'MEMBER_COUNT') {
                                    setMemberCount(payload.payload.count);
                                }else if (payload.type === 'ENTER'){
                                  setMessages(prev => [...prev, payload.payload.message]);
                                } 
                                else {
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
                        message => {
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

                   // 입장 메시지 전송
                    client.publish({
                        destination: `/pub/chat/${chatroomId}/enter`,
                        body: JSON.stringify({
                            type: 'ENTER',
                            chatRoomId: chatroomId
                        }),
                    });

                },
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
        try {
            const response = await instance.get(`/chatrooms/${chatroomId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.data?.data?.messages) {
                setMessages(response.data.data.messages);
            }
        } catch (error) {
            console.error('초기 메시지 로딩 실패:', error);
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
            clientRef.current.publish({
                destination: `/pub/chat/${chatroomId}/sendMessage`,
                body: JSON.stringify(messagePayload),
            });
            setNewMessage('');
        } catch (error) {
            console.error('메시지 전송 실패:', error);
        }
    };

function extractDate(datetime) {
  if (!datetime) return '';
  const parts = datetime.split(' ');
  if (parts.length < 1) return '';
  return parts[0];
}

function extractTime(datetime) {
  if (!datetime) return '';
  const parts = datetime.split(' ');
  if (parts.length < 2) return '';
  // 시간 부분에서 시:분까지만 반환
  return parts[1].slice(0, 5);
}

function groupMessagesByDate(messages) {
  if (!messages || messages.length === 0) return {};
  return messages.reduce((acc, msg) => {
    if (!msg.createdAt) return acc;
    const date = extractDate(msg.createdAt);
    if (!acc[date]) acc[date] = [];
    acc[date].push(msg);
    return acc;
  }, {});
}

    const grouped = groupMessagesByDate(messages);

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
                  {Object.entries(grouped).map(([date, msgs]) => (
                    <View key={date}>
                      <Text style={styles.dateHeader}>{date}</Text>
                      {msgs.map((message, index) => (
                        <View
                          key={index}
                          style={[
                            styles.messageWrapper,
                            message.writer === user.name ? styles.myMessage : styles.otherMessage,
                          ]}
                        >
                          {message.system || message.type === 'SYSTEM_MESSAGE' ? (
                            <Text style={styles.systemMessage}>
                              {message.payload?.message || message.message}
                            </Text>
                          ) : (
                            <>
                              {message.writer !== user.name && (
                                <View style={styles.profileContainer}>
                                  <Image
                                    source={{ uri: message.writerProfileImage }}
                                    style={styles.profileImage}
                                  />
                                  <Text style={styles.username}>{message.writer}</Text>
                                </View>
                              )}
                              <View
                                style={[
                                  styles.messageBubble,
                                  message.writer === user.name ? styles.myBubble : styles.otherBubble,
                                ]}
                              >
                                <Text style={styles.messageText}>{message.content}</Text>
                              </View>
                              <Text
                                style={[
                                  styles.timestamp,
                                  message.writer === user.name ? styles.myTimestamp : styles.otherTimestamp,
                                ]}
                              >
                                {extractTime(message.createdAt)}
                              </Text>
                            </>
                          )}
                        </View>
                      ))}
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
    dateHeader:{
      textAlign: 'center',
      paddingVertical: 8
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
        color: '#5B5B5B',
        marginTop: 2,
        fontWeight: 'medium',
        marginHorizontal: 5,
        width: 'inherit',
        marginTop: 6
    },
    myTimestamp:{
      textAlign: 'left'
    },
    otherTimestamp:{
      textAlign: 'right'
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
