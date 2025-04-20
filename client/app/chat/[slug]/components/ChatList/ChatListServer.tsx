import React from "react";
import { fetchChatList } from "./action";
import ChatList from "./ChatList";

export default async function ChatListServer({ user_id }: { user_id: string }) {
  const response = await fetchChatList({ user_id });

  return (
    <>
      <ChatList chatRooms={response} />
    </>
  );
}

