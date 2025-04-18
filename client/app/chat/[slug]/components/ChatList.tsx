import React from "react";
import { Search, Plus } from "lucide-react";

export default function ChatList() {
  // Mock data สำหรับรายการแชท
  const chats = [
    {
      id: 1,
      name: "สนทนากับทีม",
      lastMessage: "เราจะประชุมเมื่อไหร่?",
      time: "10:45",
      unread: 3,
    },
    {
      id: 2,
      name: "โปรเจค A",
      lastMessage: "UI ใหม่เสร็จแล้ว",
      time: "09:30",
      unread: 0,
    },
    {
      id: 3,
      name: "แผนก IT",
      lastMessage: "อัพเดทระบบวันเสาร์",
      time: "เมื่อวาน",
      unread: 1,
    },
    {
      id: 4,
      name: "ทีม Frontend",
      lastMessage: "มีปัญหากับ component ใหม่",
      time: "เมื่อวาน",
      unread: 0,
    },
    {
      id: 5,
      name: "ทีม Backend",
      lastMessage: "API พร้อมใช้งานแล้ว",
      time: "3 วันที่แล้ว",
      unread: 0,
    },
  ];

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
          <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`flex items-center p-4 cursor-pointer hover:bg-gray-800 transition-colors ${
              chat.id === 4 ? "bg-gray-800" : ""
            }`}
          >
            <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              {chat.name.charAt(0)}
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
        ))}
      </div>
    </div>
  );
}