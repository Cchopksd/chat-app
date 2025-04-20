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
  const urls = extractUrls(message.content);
  const hasUrls = urls.length > 0;

  const renderMessageContent = () => {
    if (!hasUrls) {
      return (
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
      );
    }

    const content = message.content;
    const elements: React.ReactNode[] = [];

    let lastIndex = 0;
    urls.forEach((url, idx) => {
      const urlIndex = content.indexOf(url, lastIndex);

      if (urlIndex > lastIndex) {
        elements.push(
          <span key={`text-${idx}`}>
            {content.substring(lastIndex, urlIndex)}
          </span>
        );
      }

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

    if (lastIndex < content.length) {
      elements.push(
        <span key="text-last">{content.substring(lastIndex)}</span>
      );
    }

    return <p className="whitespace-pre-wrap break-words">{elements}</p>;
  };

  return (
    <div
      className={`flex mb-2 ${
        isCurrentUser ? "justify-end" : "justify-start"
      }`}>
      <div className={`flex-shrink-0 ${isCurrentUser ? "w-0" : "w-10 mr-2"}`}>
        {" "}
        {!isCurrentUser && (
          <div className="flex-shrink-0 mr-2 mt-1">
            {showSenderInfo && (
              <div
                className={`h-8 w-8 ${senderColor} rounded-full flex items-center justify-center text-white font-bold`}>
                {senderInitial}
              </div>
            )}
          </div>
        )}
      </div>

      <div
        className={`flex flex-col ${
          isCurrentUser ? "items-end" : "items-start"
        }`}>
        {!isCurrentUser && showSenderInfo && (
          <div className="font-medium text-xs text-gray-400 mb-1">
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

        {hasUrls && (
          <div className={`mt-1 ${isCurrentUser ? "pr-0" : "pl-0"}`}>
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

