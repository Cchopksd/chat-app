"use client";
import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Paperclip, Search, MoreVertical, Phone, Send } from "lucide-react";
import { useAppSelector } from "@/app/libs/redux/store";
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

export default function ChatRoom({ userInfo }: { userInfo: JwtPayload }) {
  const { room } = useAppSelector((state) => state.chat);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [roomInfo, setRoomInfo] = useState<ChatRoomData | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  const currentUserId = userInfo.user_id;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (room) {
      fetchChatRoom(room);
    }
  }, [room]);

  useLayoutEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!room || !currentUserId) return;

    const WEBSOCKET_URL =
      process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:5000/";
    const ws = new WebSocket(WEBSOCKET_URL);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("✅ WebSocket connected");
      ws.send(
        JSON.stringify({
          type: "join",
          payload: { userId: currentUserId, roomId: room },
        })
      );
    };

    ws.onmessage = (event) => {
      if (!isMounted.current) return;
      const message = JSON.parse(event.data);

      switch (message.type) {
        case "joined":
          console.log(`👤 User joined: ${message.payload.userId}`);
          break;
        case "user_left":
        case "stop_typing":
          setTypingUsers((prev) => {
            const updated = new Set(prev);
            updated.delete(message.payload.userId);
            return updated;
          });
          break;
        case "typing":
          if (message.payload.userId !== currentUserId) {
            setTypingUsers((prev) => new Set(prev).add(message.payload.userId));
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
      if (isMounted.current) setError("เกิดข้อผิดพลาดในการเชื่อมต่อ WebSocket");
    };

    const pingInterval = setInterval(() => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: "ping" }));
      }
    }, 30000);

    return () => {
      ws.close();
      clearInterval(pingInterval);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
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
    if (!inputMessage.trim() || !room || isSending) return;

    setIsSending(true);
    const messageToSend = inputMessage;
    setInputMessage("");
    sendTypingStatus(false);

    try {
      const response = await sendMessage({
        room_id: room,
        sender_id: currentUserId,
        content: messageToSend,
        message_type: "text",
      });

      if (!response.success) {
        throw new Error(response.message);
      }
    } catch (err) {
      console.error("Error sending message:", err);
      alert("ไม่สามารถส่งข้อความได้");
      setInputMessage(messageToSend);
    } finally {
      setIsSending(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);

    if (e.target.value.trim()) {
      sendTypingStatus(true);
    } else {
      sendTypingStatus(false);
    }
  };

  const sendTypingStatus = (isTyping: boolean) => {
    if (
      !socketRef.current ||
      socketRef.current.readyState !== WebSocket.OPEN ||
      !room
    )
      return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    const type = isTyping ? "typing" : "stop_typing";

    socketRef.current.send(
      JSON.stringify({
        type,
        payload: {
          userId: currentUserId,
          roomId: room,
        },
      })
    );

    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingStatus(false);
      }, 3000);
    }
  };

  const extractUserInfo = (sender: string | UserInfo): UserInfo => {
    if (typeof sender === "object" && sender !== null) return sender;
    return { _id: sender, name: "", email: "", createdAt: "", updatedAt: "" };
  };

  const isCurrentUserMessage = (senderId: string | UserInfo) =>
    extractUserInfo(senderId)._id === currentUserId;

  const getSenderName = (sender: string | UserInfo) =>
    extractUserInfo(sender).name || "ไม่ระบุชื่อ";

  const getSenderInitial = (sender: string | UserInfo) =>
    extractUserInfo(sender).name?.charAt(0).toUpperCase() || "U";

  const getUserId = (sender: string | UserInfo): string =>
    extractUserInfo(sender)._id;

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

  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const renderTypingIndicator = () => {
    if (typingUsers.size === 0) return null;

    const typingText =
      typingUsers.size === 1
        ? "กำลังพิมพ์..."
        : `${typingUsers.size} คนกำลังพิมพ์...`;

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
          {[Phone, Search, MoreVertical].map((Icon, i) => (
            <button
              key={i}
              className="p-2 text-gray-400 hover:bg-gray-800 rounded-full transition-colors">
              <Icon size={20} />
            </button>
          ))}
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

      {/* Input Box */}
      <div className="p-4 bg-gray-800 border-t border-gray-700 rounded-b-xl">
        <div className="flex items-center">
          <button className="p-2 text-gray-400 hover:bg-gray-700 rounded-full mr-2 transition-colors">
            <Paperclip size={20} />
          </button>
          <textarea
            placeholder="พิมพ์ข้อความ..."
            value={inputMessage}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600 resize-none"
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

