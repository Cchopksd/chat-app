"use client";
import React, { useState, useEffect } from "react";
import { Paperclip, Search, MoreVertical, Phone, Send } from "lucide-react";
import { useAppSelector } from "@/app/libs/redux/store";
import formatTime from "@/app/utils/dateFormat";
import { fetchChats } from "./action";
import { JwtPayload } from "jsonwebtoken";

interface ChatMessage {
  _id: string;
  room_id: string;
  sender_id: string;
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentUserId = userInfo.user_id;

  useEffect(() => {
    if (room) {
      fetchChatRoom(room);
    }
  }, [room]);

  const fetchChatRoom = async (room_id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchChats({ room_id });
      if (response.success) {
        setRoomInfo(response.data);
        setMessages(response.data.chats);
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
      // สร้างข้อความใหม่
      const newMessage = {
        room_id: room,
        sender_id: currentUserId,
        content: inputMessage,
        message_type: "text",
      };
      const mockResponse: ChatMessage = {
        _id: `temp-${Date.now()}`,
        ...newMessage,
        readBy: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        __v: 0,
      };

      setMessages((prev) => [mockResponse, ...prev]);
      setInputMessage("");

    } catch (err) {
      console.error("Error sending message:", err);
      alert("ไม่สามารถส่งข้อความได้");
    }
  };

  const isCurrentUserMessage = (senderId: string) => {
    return senderId === currentUserId;
  };

  const sortedMessages = [...messages].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-xl">
      <div className="flex items-center p-4 border-b border-gray-700">
        <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
          {roomInfo?.name ? roomInfo.name.charAt(0).toUpperCase() : "C"}
        </div>
        <div className="ml-3">
          <h2 className="font-semibold text-white">
            {roomInfo?.name || "ห้องแชท"}
          </h2>
          <p className="text-xs text-gray-400">
            {roomInfo?.isGroup
              ? `สมาชิก ${roomInfo.members.length} คน`
              : "แชทส่วนตัว"}
          </p>
        </div>
        <div className="ml-auto flex space-x-2">
          <button className="p-2 text-gray-400 hover:bg-gray-800 rounded-full transition-colors">
            <Phone size={18} />
          </button>
          <button className="p-2 text-gray-400 hover:bg-gray-800 rounded-full transition-colors">
            <Search size={18} />
          </button>
          <button className="p-2 text-gray-400 hover:bg-gray-800 rounded-full transition-colors">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto bg-gray-900">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-400">กำลังโหลดข้อความ...</p>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-red-400">{error}</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-400">ยังไม่มีข้อความในห้องนี้</p>
          </div>
        ) : (
          <div className="space-y-4 flex flex-col-reverse">
            {" "}
            {sortedMessages.map((message) => (
              <div
                key={message._id}
                className={`flex ${
                  isCurrentUserMessage(message.sender_id)
                    ? "justify-end"
                    : "justify-start"
                }`}>
                <div
                  className={`max-w-xs sm:max-w-sm md:max-w-md p-3 rounded-lg ${
                    isCurrentUserMessage(message.sender_id)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-100"
                  }`}>
                  {!isCurrentUserMessage(message.sender_id) && (
                    <div className="font-medium text-sm text-gray-400 mb-1">
                      {message.sender_id.substring(0, 8)}...
                    </div>
                  )}
                  <p>{message.content}</p>
                  <div
                    className={`text-xs mt-1 text-right ${
                      isCurrentUserMessage(message.sender_id)
                        ? "text-blue-200"
                        : "text-gray-400"
                    }`}>
                    {formatTime(message.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 bg-gray-900 border-t border-gray-700">
        <div className="flex items-center">
          <button className="p-2 text-gray-400 hover:bg-gray-800 rounded-full mr-2 transition-colors">
            <Paperclip size={18} />
          </button>
          <input
            type="text"
            placeholder="พิมพ์ข้อความ..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700"
            disabled={!room}
          />
          <button
            onClick={handleSendMessage}
            disabled={!room || !inputMessage.trim()}
            className={`p-2 ml-2 rounded-full transition-colors ${
              !room || !inputMessage.trim()
                ? "bg-gray-700 text-gray-400"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

