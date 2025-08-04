

// import React, { useState, useEffect, useRef } from 'react';
// import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
// import { Client } from '@stomp/stompjs';
// import SockJS from 'sockjs-client';
// import { useUser } from '../../hooks/useUser';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// function Chat() {
//   const [client, setClient] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [inputMessage, setInputMessage] = useState('');
//   const [isConnected, setIsConnected] = useState(true);
//   const [chatRooms, setChatRooms] = useState([]);
//   const [selectedRoom, setSelectedRoom] = useState(null);
//   const [memberCount, setMemberCount] = useState(0);

//   const clientRef = useRef(null);
//   const subscriptionRef = useRef(null);

//   useEffect( async () => {

//     const token = await AsyncStorage.getItem('accessToken'); 

//     const fetchChatRooms = async () => {
//       try {
//         const response = await fetch('http://172.20.10.5:8080/chatrooms', {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         if (response.ok) {
//           const result = await response.json();
//           setChatRooms(result.data);
//         } else {
//           console.error('Failed to fetch chat rooms');
//         }
//       } catch (error) {
//         console.error('Error fetching chat rooms:', error);
//       }
//     };
//     fetchChatRooms();

//     // STOMP Client 생성 및 설정
//     const stompClient = new Client({
//       webSocketFactory: () => new SockJS('http://172.20.10.5:8080/ws-stomp'),
//       connectHeaders: { Authorization: `Bearer ${token}` },
//       debug: (str) => console.log(new Date(), str),
//       reconnectDelay: 5000,
//       onConnect: () => {
//         console.log("✅ STOMP connected");
//         setIsConnected(true);
//       },
//       onStompError: (frame) => {
//         console.error('STOMP Error:', frame.headers['message']);
//       },
//     });

//     // 클라이언트 활성화 및 참조 저장
//     stompClient.activate();
//     clientRef.current = stompClient;
//     setClient(stompClient);

//     return () => {
//       if (stompClient) {
//         stompClient.deactivate();
//       }
//     };
//   }, []);

//   const leaveRoom = () => {
//     if (subscriptionRef.current && selectedRoom) {
//       subscriptionRef.current.unsubscribe();
//       subscriptionRef.current = null;
//       setSelectedRoom(null);
//       setMessages([]);
//       setMemberCount(0);
//       setIsConnected(false);
//     }
//   };

//   // 채팅방 구독 처리
//   const subscribeToRoom = async (roomId) => {
//     if (!isConnected) {
//       console.warn("STOMP is not connected yet.");
//       return;
//     }

//     if (subscriptionRef.current) {
//       subscriptionRef.current.unsubscribe();
//       subscriptionRef.current = null;
//     }
//     setMessages([]);
//     setSelectedRoom(roomId);

//     const token = localStorage.getItem('accessToken');

//     // 과거 메시지 불러오기
//     try {
//       const res = await fetch(`http://172.20.10.5:8080/chatrooms/${roomId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (res.ok) {
//         const result = await res.json();
//         if (result.data?.messages) {
//           setMessages(result.data.messages);
//         }
//       }
//     } catch (err) {
//       console.error('Error loading past messages', err);
//     }

//     // 실시간 메시지 구독
//     const chatSub = clientRef.current.subscribe(
//       `/sub/chat/${roomId}`,
//       (message) => {
//         try {
//           const payload = JSON.parse(message.body);
//           if (payload.type === 'MEMBER_COUNT') {
//             setMemberCount(payload.payload.count);
//           } else {
//             setMessages((prev) => [...prev, payload]);
//           }
//         } catch (error) {
//           console.error('Parsing message failed', error);
//         }
//       }
//     );

//     // 인원 수 구독
//     const countSub = clientRef.current.subscribe(
//       `/sub/chat/${roomId}/members`,
//       (message) => {
//         try {
//           const count = JSON.parse(message.body);
//           setMemberCount(count);
//         } catch (err) {
//           console.error("Parsing count failed", err);
//         }
//       }
//     );

//     subscriptionRef.current = {
//       unsubscribe: () => {
//         chatSub.unsubscribe();
//         countSub.unsubscribe();
//       }
//     };
//   };

//   const sendMessage = () => {
//     if (client && inputMessage.trim() !== '' && selectedRoom) {
//       const messagePayload = {
//         content: inputMessage,
//         writer: '',
//         chatRoomId: selectedRoom
//       };
//       client.publish({
//         destination: `/pub/chat/${selectedRoom}/sendMessage`,
//         body: JSON.stringify(messagePayload),
//       });
//       setInputMessage('');
//     }
//   };

//   return (
//        <View style={styles.container}>
//       <Text style={styles.title}>💬 실시간 채팅</Text>
//       <Text>Status: {isConnected ? '✅ Connected' : '❌ Disconnected'}</Text>

//       <View style={styles.roomSelector}>
//         <Text>채팅방 선택:</Text>
//         <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roomScroll}>
//           {chatRooms.map((room) => (
//             <TouchableOpacity
//               key={room.chatRoomId}
//               onPress={() => subscribeToRoom(room.chatRoomId)}
//               style={[
//                 styles.roomButton,
//                 selectedRoom === room.chatRoomId && styles.selectedRoomButton,
//               ]}
//             >
//               <Text
//                 style={[
//                   styles.roomButtonText,
//                   selectedRoom === room.chatRoomId && styles.selectedRoomButtonText,
//                 ]}
//               >
//                 {room.categoryName}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </ScrollView>
//         {selectedRoom && (
//           <TouchableOpacity onPress={leaveRoom} style={styles.leaveButton}>
//             <Text style={styles.leaveButtonText}>🚪 나가기</Text>
//           </TouchableOpacity>
//         )}
//       </View>

//       {selectedRoom && (
//         <View style={styles.roomInfo}>
//           <Text>🗂️ 채팅방: {chatRooms.find(r => r.chatRoomId === selectedRoom)?.categoryName}</Text>
//           <Text>👥 참여 인원: {memberCount}명</Text>
//         </View>
//       )}

//       <ScrollView style={styles.messages} contentContainerStyle={{ paddingVertical: 10 }}>
//         {messages.map((msg, index) => (
//           <View key={index} style={styles.messageItem}>
//             {msg.system || msg.type === 'SYSTEM_MESSAGE' ? (
//               <Text style={styles.systemMessage}>{msg.payload?.message || msg.message}</Text>
//             ) : (
//               <Text>
//                 <Text style={styles.messageWriter}>{msg.writer}</Text>
//                 {msg.content && `: ${msg.content}`}
//               </Text>
//             )}
//           </View>
//         ))}
//       </ScrollView>

//       <View style={styles.inputContainer}>
//         <TextInput
//           style={styles.input}
//           value={inputMessage}
//           onChangeText={setInputMessage}
//           placeholder="Type your message..."
//           onSubmitEditing={sendMessage}
//           editable={!!selectedRoom}
//           returnKeyType="send"
//         />
//         <TouchableOpacity
//           onPress={sendMessage}
//           disabled={!selectedRoom}
//           style={[styles.sendButton, !selectedRoom && styles.sendButtonDisabled]}
//         >
//           <Text style={styles.sendButtonText}>Send</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 16 },
//   title: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
//   roomSelector: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
//   roomScroll: { flexGrow: 0 },
//   roomButton: {
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     backgroundColor: '#ddd',
//     borderRadius: 15,
//     marginRight: 8,
//   },
//   selectedRoomButton: {
//     backgroundColor: '#ffc107',
//   },
//   roomButtonText: {
//     fontSize: 14,
//   },
//   selectedRoomButtonText: {
//     fontWeight: 'bold',
//   },
//   leaveButton: {
//     marginLeft: 8,
//     backgroundColor: '#d32f2f',
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 15,
//   },
//   leaveButtonText: { color: 'white', fontWeight: 'bold' },
//   roomInfo: { marginBottom: 12 },
//   messages: { flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 10 },
//   messageItem: { marginBottom: 10 },
//   systemMessage: { fontStyle: 'italic', color: '#888' },
//   messageWriter: { fontWeight: 'bold' },
//   inputContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
//   input: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 4,
//     paddingHorizontal: 8,
//     paddingVertical: 6,
//   },
//   sendButton: {
//     marginLeft: 8,
//     backgroundColor: '#1976d2',
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     borderRadius: 4,
//   },
//   sendButtonDisabled: {
//     backgroundColor: '#aaa',
//   },
//   sendButtonText: { color: 'white', fontWeight: 'bold' },
// });

// export default Chat;


import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

function Chat({ messages, memberCount }) {
  return (
    <View style={styles.container}>
      <Text>👥 참여 인원: {memberCount}명</Text>
      <ScrollView style={styles.messageContainer}>
        {messages.map((msg, index) => (
          <View key={index} style={styles.messageItem}>
            {msg.system || msg.type === 'SYSTEM_MESSAGE' ? (
              <Text style={styles.systemMessage}>{msg.payload?.message || msg.message}</Text>
            ) : (
              <Text>
                <Text style={styles.messageWriter}>{msg.writer}</Text>
                {msg.content && `: ${msg.content}`}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  messageContainer: { flex: 1, padding: 10 },
  messageItem: { marginBottom: 10 },
  systemMessage: { fontStyle: 'italic', color: '#888' },
  messageWriter: { fontWeight: 'bold' },
});

export default Chat;
