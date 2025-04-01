import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

function Chat() {
  const [client, setClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [memberCount, setMemberCount] = useState(0);

  const clientRef = useRef(null);
  const subscriptionRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    const fetchChatRooms = async () => {
      try {
        const response = await fetch('http://ec2-3-39-190-50.ap-northeast-2.compute.amazonaws.com:8080/chatrooms', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const result = await response.json();
          setChatRooms(result.data);
        } else {
          console.error('Failed to fetch chat rooms');
        }
      } catch (error) {
        console.error('Error fetching chat rooms:', error);
      }
    };
    fetchChatRooms();

    const stompClient = new Client({
      webSocketFactory: () => new SockJS('http://ec2-3-39-190-50.ap-northeast-2.compute.amazonaws.com:8080/ws-stomp'),
      connectHeaders: { Authorization: `Bearer ${token}` },
      debug: (str) => console.log(new Date(), str),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("✅ STOMP connected");
        setIsConnected(true);
      },
      onStompError: (frame) => {
        console.error('STOMP Error:', frame.headers['message']);
      },
    });

    stompClient.activate();
    clientRef.current = stompClient;
    setClient(stompClient);

    return () => {
      if (stompClient) {
        stompClient.deactivate();
      }
    };
  }, []);

  const leaveRoom = () => {
    if (subscriptionRef.current && selectedRoom) {
      subscriptionRef.current.unsubscribe();
      clientRef.current.deactivate();
      setSelectedRoom(null);
      setMessages([]);
      setMemberCount(0);
      setIsConnected(false);
    }
  };

  // ✅ 채팅방 입장 시 과거 메시지 불러오기 + 구독 처리
  const subscribeToRoom = async (roomId) => {
    if (!isConnected) {
      console.warn("STOMP is not connected yet.");
      return;
    }

    // 1. 기존 구독 해제
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    // 2. 메시지 초기화
    setMessages([]);
    setSelectedRoom(roomId);

    const token = localStorage.getItem('accessToken');

    // 3. 채팅방 메시지 API 요청
    try {
      const res = await fetch(`http://ec2-3-39-190-50.ap-northeast-2.compute.amazonaws.com:8080/chatrooms/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const result = await res.json();
        if (result.data?.messages) {
          setMessages(result.data.messages);
        }
      }
    } catch (err) {
      console.error('Error loading past messages', err);
    }

    // 4. 실시간 메시지 구독
    const chatSub = clientRef.current.subscribe(
      `/sub/chat/${roomId}`,
      (message) => {
        try {
          const payload = JSON.parse(message.body);
          
          // 🔥 인원 수 메시지 처리
          if (payload.type === 'MEMBER_COUNT') {
            setMemberCount(payload.payload.count);
          } else {
            // 일반 메시지 처리
            setMessages((prev) => [...prev, payload]);
          }
    
        } catch (error) {
          console.error('Parsing message failed', error);
        }
      }
    );

    // 5. 인원 수 구독
    const countSub = clientRef.current.subscribe(
      `/sub/chat/${roomId}/members`,
      (message) => {
        try {
          const count = JSON.parse(message.body);
          setMemberCount(count);
        } catch (err) {
          console.error("Parsing count failed", err);
        }
      }
    );

    // 6. 묶어서 저장
    subscriptionRef.current = {
      unsubscribe: () => {
        chatSub.unsubscribe();
        countSub.unsubscribe();
      },
    };
  };

  const sendMessage = () => {
    if (client && inputMessage.trim() !== '' && selectedRoom) {
      const messagePayload = {
        content: inputMessage,
        writer: '',
        chatRoomId: selectedRoom
      };
      client.publish({
        destination: `/pub/chat/${selectedRoom}/sendMessage`,
        body: JSON.stringify(messagePayload),
      });
      setInputMessage('');
    }
  };

  return (
    <div>
      <h2>💬 실시간 채팅</h2>
      <p>Status: {isConnected ? '✅ Connected' : '❌ Disconnected'}</p>

      <div>
        <label>채팅방 선택: </label>
        <select onChange={(e) => subscribeToRoom(e.target.value)} defaultValue="">
          <option value="" disabled>-- 선택 --</option>
          {chatRooms.map((room) => (
            <option key={room.chatRoomId} value={room.chatRoomId}>
              {room.categoryName}
            </option>
          ))}
        </select>
        {selectedRoom && <button onClick={leaveRoom} style={{ marginLeft: '10px' }}>🚪 나가기</button>}
      </div>

      {selectedRoom && (
        <>
          <p>🗂️ 채팅방: {chatRooms.find(r => r.chatRoomId === selectedRoom)?.categoryName}</p>
          <p>👥 참여 인원: {memberCount}명</p>
        </>
      )}

      <div style={{ border: '1px solid #ccc', padding: '10px', height: '300px', overflowY: 'scroll', marginTop: '10px' }}>
        {messages.map((msg, index) => (
          <div key={index}>
            {msg.system || msg.type === 'SYSTEM_MESSAGE' ? (
              <em style={{ color: '#888' }}>{msg.payload?.message || msg.message}</em>
            ) : (
              <strong>{msg.writer}</strong>
            )}
            {(!msg.system && msg.content) && `: ${msg.content}`}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '10px' }}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          disabled={!selectedRoom}
        />
        <button onClick={sendMessage} disabled={!selectedRoom}>Send</button>
      </div>
    </div>
  );
}

export default Chat;
