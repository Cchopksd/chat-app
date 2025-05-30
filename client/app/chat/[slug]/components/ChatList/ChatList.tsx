"use client";
import React, { useMemo } from "react";
import { Search, Plus } from "lucide-react";
import { formatTime } from "@/app/utils/dateFormat";
import { useAppDispatch } from "@/app/libs/redux/store";
import { setViewRoom } from "@/app/libs/redux/features/chatSlice";

interface ChatRoom {
  room: {
    _id: string;
    name: string;
    isPrivate: boolean;
    isGroup?: boolean;
    members: string[];
    createdAt: string;
    updatedAt: string;
  };
  lastChat?: {
    _id: string;
    content: string;
    createdAt: string;
  } | null;
}

interface ChatListProps {
  chatRooms: ChatRoom[];
}

export default function ChatList({ chatRooms }: ChatListProps) {
  const dispatch = useAppDispatch();
  const processedChats = useMemo(() => {
    return chatRooms.map((item) => {
      return {
        id: item.room._id,
        name: item.room.name,
        time: item.lastChat
          ? formatTime(item.lastChat.createdAt)
          : formatTime(item.room.updatedAt),
        lastMessage: item.lastChat?.content || "ไม่มีข้อความ",
        unread: 0,
        isGroup: item.room.isGroup || false,
      };
    });
  }, [chatRooms]);

  const onSelectChat = (room_id: string) => {
    dispatch(setViewRoom(room_id));
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-xl">
      <div className="p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold text-white">แชท</h1>
          <button className="p-2 text-gray-400 hover:bg-gray-800 rounded-full transition-colors">
            <Plus size={20} />
          </button>
        </div>
        <div className="my-4 relative">
          <input
            type="text"
            placeholder="ค้นหาการสนทนา..."
            className="w-full pl-10 pr-3 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700"
          />
          <Search
            size={18}
            className="absolute left-3 top-2.5 text-gray-400"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {processedChats.length > 0 ? (
          processedChats.map((chat) => (
            <div
              role="button"
              onClick={() => onSelectChat(chat.id)}
              key={chat.id}
              className="flex items-center p-4 cursor-pointer hover:bg-gray-800 transition-colors">
              <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {chat.isGroup ? "G" : chat.name.charAt(0).toUpperCase()}
              </div>
              <div className="ml-3 flex-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-white">{chat.name}</span>
                  <span className="text-xs text-gray-400">{chat.time}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-sm text-gray-400 truncate max-w-[140px] sm:max-w-[180px] md:max-w-[220px]">
                    {chat.lastMessage}
                  </p>
                  {chat.unread > 0 && (
                    <span className="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-400">ไม่พบการสนทนา</p>
          </div>
        )}
      </div>
    </div>
  );
}

