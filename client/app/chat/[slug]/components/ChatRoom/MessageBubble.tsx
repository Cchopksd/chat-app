// components/MessageBubble.tsx
import React from "react";
import { LinkPreview, extractUrls } from "./ChatPreview";
import formatTime from "@/app/utils/dateFormat";

interface UserInfo {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

interface MessageProps {
  message: {
    _id: string;
    content: string;
    sender_id: string | UserInfo;
    createdAt: string;
  };
  isCurrentUser: boolean;
  showSenderInfo: boolean;
  senderName: string;
  senderInitial: string;
  senderColor: string;
}

const MessageBubble: React.FC<MessageProps> = ({
  message,
  isCurrentUser,
  showSenderInfo,
  senderName,
  senderInitial,
  senderColor,
}) => {
  // แยก URLs จากข้อความ
  const urls = extractUrls(message.content);
  const hasUrls = urls.length > 0;

  // แทนที่ URLs ด้วยลิงก์ที่คลิกได้
  const renderMessageContent = () => {
    if (!hasUrls) {
      return (
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
      );
    }

    const content = message.content;
    const elements: React.ReactNode[] = [];

    // แยกข้อความโดยรอบ URLs และสร้าง elements
    let lastIndex = 0;
    urls.forEach((url, idx) => {
      const urlIndex = content.indexOf(url, lastIndex);

      // เพิ่มข้อความก่อน URL
      if (urlIndex > lastIndex) {
        elements.push(
          <span key={`text-${idx}`}>
            {content.substring(lastIndex, urlIndex)}
          </span>
        );
      }

      // เพิ่มลิงก์
      elements.push(
        <a
          key={`url-${idx}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline">
          {url}
        </a>
      );

      lastIndex = urlIndex + url.length;
    });

    // เพิ่มข้อความที่เหลือหลัง URL สุดท้าย
    if (lastIndex < content.length) {
      elements.push(
        <span key="text-last">{content.substring(lastIndex)}</span>
      );
    }

    return <p className="whitespace-pre-wrap break-words">{elements}</p>;
  };

  return (
    <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
      {!isCurrentUser && showSenderInfo && (
        <div
          className={`h-8 w-8 ${senderColor} rounded-full flex items-center justify-center text-white font-bold mr-2 mt-1`}>
          {senderInitial}
        </div>
      )}
      <div>
        {!isCurrentUser && showSenderInfo && (
          <div className="font-medium text-xs text-gray-400 mb-1 ml-2">
            {senderName}
          </div>
        )}
        <div
          className={`max-w-xs sm:max-w-sm md:max-w-md p-3 rounded-lg ${
            isCurrentUser
              ? "bg-blue-600 text-white rounded-tr-none"
              : "bg-gray-800 text-gray-100 rounded-tl-none"
          }`}>
          {renderMessageContent()}
          <div
            className={`text-xs mt-1 text-right ${
              isCurrentUser ? "text-blue-200" : "text-gray-400"
            }`}>
            {formatTime(message.createdAt)}
          </div>
        </div>

        {/* Link Previews */}
        {hasUrls && (
          <div className={`mt-1 ${isCurrentUser ? "pl-12" : "pr-12"}`}>
            {urls.map((url, index) => (
              <LinkPreview
                key={`preview-${index}`}
                url={url}
                className="mb-2"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;

