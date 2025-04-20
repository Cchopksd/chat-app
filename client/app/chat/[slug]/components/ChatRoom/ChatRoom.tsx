"use client";
import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Paperclip, Search, MoreVertical, Phone, Send } from "lucide-react";
import { useAppSelector } from "@/app/libs/redux/store";
import formatTime from "@/app/utils/dateFormat";
import { fetchChats, sendMessage } from "./action";
import { JwtPayload } from "jsonwebtoken";
import MessageBubble from "./MessageBubble";

interface UserInfo {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatMessage {
  _id: string;
  room_id: string;
  sender_id: string | UserInfo;
  content: string;
  message_type: string;
  readBy: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  is_read?: boolean;
}

interface ChatRoomData {
  _id: string;
  name: string;
  members: string[];
  isGroup: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  chats: ChatMessage[];
}

let socket: WebSocket | null = null;
let typingTimeoutId: NodeJS.Timeout | null = null;

export default function ChatRoom({ userInfo }: { userInfo: JwtPayload }) {
  const { room } = useAppSelector((state) => state.chat);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [roomInfo, setRoomInfo] = useState<ChatRoomData | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const currentUserId = userInfo.user_id;

  useEffect(() => {
    if (room) {
      fetchChatRoom(room);
    }
  }, [room]);

  // ใช้ useLayoutEffect เพื่อให้การ scroll ทำงานก่อนที่ component จะ render ให้ผู้ใช้เห็น
  useLayoutEffect(() => {
    if (messagesContainerRef.current) {
      // Scroll ไปที่ด้านล่างสุดทันทีโดยไม่มีการ animate
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!room || !currentUserId) return;

    const WEBSOCKET_URL =
      process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:5000/";
    const ws = new WebSocket(WEBSOCKET_URL);
    socket = ws;

    ws.onopen = () => {
      console.log("✅ WebSocket connected");
      // ส่ง join event
      ws.send(
        JSON.stringify({
          type: "join",
          payload: {
            userId: currentUserId,
            roomId: room,
          },
        })
      );
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case "joined":
          console.log(`👤 User joined: ${message.payload.userId}`);
          break;
        case "user_left":
          console.log(`👋 User left: ${message.payload.userId}`);
          if (typingUsers.has(message.payload.userId)) {
            const newTypingUsers = new Set(typingUsers);
            newTypingUsers.delete(message.payload.userId);
            setTypingUsers(newTypingUsers);
          }
          break;
        case "typing":
          if (message.payload.userId !== currentUserId) {
            const newTypingUsers = new Set(typingUsers);
            newTypingUsers.add(message.payload.userId);
            setTypingUsers(newTypingUsers);
          }
          break;
        case "stop_typing":
          if (typingUsers.has(message.payload.userId)) {
            const newTypingUsers = new Set(typingUsers);
            newTypingUsers.delete(message.payload.userId);
            setTypingUsers(newTypingUsers);
          }
          break;
        case "new_message":
          setMessages((prev) => [...prev, message.payload]);
          break;
        default:
          console.warn("📥 Unknown message type", message.type);
      }
    };

    ws.onerror = (error) => {
      console.error("❌ WebSocket error", error);
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ WebSocket");
    };

    ws.onclose = () => {
      console.log("❎ WebSocket disconnected");
    };

    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "ping" }));
      }
    }, 30000);

    return () => {
      ws.close(); // cleanup
      clearInterval(pingInterval);
      if (typingTimeoutId) clearTimeout(typingTimeoutId);
    };
  }, [room, currentUserId]);

  const fetchChatRoom = async (room_id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchChats({ room_id });
      if (response.success) {
        setRoomInfo(response.data);
        setMessages(response.data.chats || []);
      } else {
        setError(response.message || "ไม่สามารถโหลดข้อมูลห้องแชทได้");
      }
    } catch (err) {
      console.error("Error fetching chat room:", err);
      setError("เกิดข้อผิดพลาดในการโหลดข้อมูลห้องแชท");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !room) return;

    try {
      const tempId = `temp-${Date.now()}`;
      const mockMessage: ChatMessage = {
        _id: tempId,
        room_id: room,
        sender_id: currentUserId,
        content: inputMessage,
        message_type: "text",
        readBy: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        __v: 0,
      };

      setInputMessage("");

      // ส่ง stop_typing event
      sendTypingStatus(false);

      // ส่งข้อความไปยัง server
      const response = await sendMessage({
        room_id: "67fe38875c2fca24a9c8f302",
        sender_id: "67fb26723aadcb7386f733fc",
        content: "asdfasdfdasfasdfa",
        message_type: "text",
      });

      if (!response.success) {
        throw new Error(response.message);
      }

      // ส่งข้อความผ่าน WebSocket ถ้าต้องการให้ real-time มากขึ้น
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: "message",
            payload: {
              roomId: room,
              message: {
                ...mockMessage,
                _id: response.data._id, // ใช้ ID จริงจาก response
              },
            },
          })
        );
      }
    } catch (err) {
      console.error("Error sending message:", err);
      alert("ไม่สามารถส่งข้อความได้");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);

    // ส่ง typing status
    if (e.target.value.trim()) {
      sendTypingStatus(true);
    } else {
      sendTypingStatus(false);
    }
  };

  const sendTypingStatus = (isTyping: boolean) => {
    if (!socket || socket.readyState !== WebSocket.OPEN || !room) return;

    // ยกเลิก timeout ก่อนหน้า (ถ้ามี)
    if (typingTimeoutId) {
      clearTimeout(typingTimeoutId);
      typingTimeoutId = null;
    }

    if (isTyping) {
      socket.send(
        JSON.stringify({
          type: "typing",
          payload: {
            userId: currentUserId,
            roomId: room,
          },
        })
      );

      // ตั้ง timeout สำหรับ stop_typing
      typingTimeoutId = setTimeout(() => {
        sendTypingStatus(false);
      }, 3000); // หยุด typing หลังจาก 3 วินาที
    } else {
      socket.send(
        JSON.stringify({
          type: "stop_typing",
          payload: {
            userId: currentUserId,
            roomId: room,
          },
        })
      );
    }
  };

  const isCurrentUserMessage = (senderId: string | UserInfo) => {
    if (typeof senderId === "object" && senderId !== null) {
      return senderId._id === currentUserId;
    }
    return senderId === currentUserId;
  };

  const getSenderName = (sender: string | UserInfo) => {
    if (typeof sender === "object" && sender !== null) {
      return sender.name || "ไม่ระบุชื่อ";
    }
    return sender.substring(0, 8) + "...";
  };

  const getSenderInitial = (sender: string | UserInfo) => {
    if (typeof sender === "object" && sender !== null) {
      return sender.name ? sender.name.charAt(0).toUpperCase() : "U";
    }
    return "U";
  };

  // เรียงข้อความจากใหม่ไปเก่า
  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const getRandomColor = (userId: string) => {
    const colors = [
      "bg-blue-600",
      "bg-green-600",
      "bg-purple-600",
      "bg-pink-600",
      "bg-yellow-600",
      "bg-indigo-600",
    ];
    const index =
      Array.from(userId).reduce((acc, char) => acc + char.charCodeAt(0), 0) %
      colors.length;
    return colors[index];
  };

  const getUserId = (sender: string | UserInfo): string => {
    if (typeof sender === "object" && sender !== null) {
      return sender._id;
    }
    return sender;
  };

  // แสดงข้อความว่าใครกำลัง typing
  const renderTypingIndicator = () => {
    if (typingUsers.size === 0) return null;

    const typingUsersList = Array.from(typingUsers);
    let typingText = "";

    if (typingUsersList.length === 1) {
      typingText = "กำลังพิมพ์...";
    } else if (typingUsersList.length === 2) {
      typingText = "2 คนกำลังพิมพ์...";
    } else {
      typingText = `${typingUsersList.length} คนกำลังพิมพ์...`;
    }

    return (
      <div className="text-xs text-gray-400 italic ml-2 mt-1">{typingText}</div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-xl">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-700">
        <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
          {roomInfo?.name ? roomInfo.name.charAt(0).toUpperCase() : "C"}
        </div>
        <div className="ml-3">
          <h2 className="font-semibold text-white text-lg">
            {roomInfo?.name || "ห้องแชท"}
          </h2>
          <p className="text-sm text-gray-400">
            {roomInfo?.isGroup
              ? `สมาชิก ${roomInfo.members.length} คน`
              : "แชทส่วนตัว"}
          </p>
        </div>
        <div className="ml-auto flex space-x-2">
          <button className="p-2 text-gray-400 hover:bg-gray-800 rounded-full transition-colors">
            <Phone size={20} />
          </button>
          <button className="p-2 text-gray-400 hover:bg-gray-800 rounded-full transition-colors">
            <Search size={20} />
          </button>
          <button className="p-2 text-gray-400 hover:bg-gray-800 rounded-full transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 p-4 overflow-y-auto bg-gray-900 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-red-400 bg-red-900/20 px-4 py-2 rounded-lg">
              {error}
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full flex-col">
            <div className="h-16 w-16 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 mb-4">
              <Paperclip size={24} />
            </div>
            <p className="text-gray-400">ยังไม่มีข้อความในห้องนี้</p>
            <p className="text-gray-500 text-sm mt-2">
              เริ่มต้นการสนทนาด้วยการส่งข้อความ
            </p>
          </div>
        ) : (
          <div className="space-y-4 flex flex-col">
            {sortedMessages.map((message, index) => {
              const isCurrentUser = isCurrentUserMessage(message.sender_id);
              const senderId = getUserId(message.sender_id);
              const showSenderInfo =
                !isCurrentUser &&
                (index === 0 ||
                  getUserId(sortedMessages[index - 1].sender_id) !== senderId);

              return (
                <MessageBubble
                  key={message._id}
                  message={message}
                  isCurrentUser={isCurrentUser}
                  showSenderInfo={showSenderInfo}
                  senderName={getSenderName(message.sender_id)}
                  senderInitial={getSenderInitial(message.sender_id)}
                  senderColor={getRandomColor(senderId)}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Typing Indicator */}
      {renderTypingIndicator()}

      {/* Input */}
      <div className="p-4 bg-gray-800 border-t border-gray-700 rounded-b-xl">
        <div className="flex items-center">
          <button className="p-2 text-gray-400 hover:bg-gray-700 rounded-full mr-2 transition-colors">
            <Paperclip size={20} />
          </button>
          <input
            type="text"
            placeholder="พิมพ์ข้อความ..."
            value={inputMessage}
            onChange={handleInputChange}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600"
            disabled={!room}
          />
          <button
            onClick={handleSendMessage}
            disabled={!room || !inputMessage.trim()}
            className={`p-3 ml-2 rounded-full transition-colors ${
              !room || !inputMessage.trim()
                ? "bg-gray-700 text-gray-500"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}>
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

