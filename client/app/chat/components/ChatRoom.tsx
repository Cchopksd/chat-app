import React from "react";
import { Paperclip, Search, MoreVertical, Phone, Send } from "lucide-react";

export default function ChatRoom() {
  // Mock data สำหรับข้อความในแชท
  const messages = [
    { id: 1, sender: "user", text: "สวัสดีครับ ทุกคน!", time: "10:32" },
    {
      id: 2,
      sender: "other",
      name: "พิมพ์",
      text: "สวัสดีค่ะ มีอะไรให้ช่วยไหมคะ",
      time: "10:33",
    },
    {
      id: 3,
      sender: "other",
      name: "สมชาย",
      text: "เราต้องคุยเรื่อง deadline โปรเจคใหม่",
      time: "10:34",
    },
    {
      id: 4,
      sender: "user",
      text: "ครับ ผมว่าเรามีปัญหากับ UI component ใหม่",
      time: "10:35",
    },
    {
      id: 5,
      sender: "other",
      name: "พิมพ์",
      text: "มีปัญหาตรงไหนบ้างคะ ช่วยอธิบายได้ไหม?",
      time: "10:36",
    },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-xl">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-700">
        <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
          T
        </div>
        <div className="ml-3">
          <h2 className="font-semibold text-white">ทีม Frontend</h2>
          <p className="text-xs text-gray-400">สมาชิก 5 คน, 3 คนออนไลน์</p>
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

      {/* Message Area */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-900">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}>
              <div
                className={`max-w-xs sm:max-w-sm md:max-w-md p-3 rounded-lg ${
                  message.sender === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-100"
                }`}>
                {message.sender !== "user" && (
                  <div className="font-medium text-sm text-gray-400 mb-1">
                    {message.name}
                  </div>
                )}
                <p>{message.text}</p>
                <div
                  className={`text-xs mt-1 text-right ${
                    message.sender === "user"
                      ? "text-blue-200"
                      : "text-gray-400"
                  }`}>
                  {message.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gray-900 border-t border-gray-700">
        <div className="flex items-center">
          <button className="p-2 text-gray-400 hover:bg-gray-800 rounded-full mr-2 transition-colors">
            <Paperclip size={18} />
          </button>
          <input
            type="text"
            placeholder="พิมพ์ข้อความ..."
            className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700"
          />
          <button className="p-2 ml-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
