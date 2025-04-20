import React from "react";
import ChatRoom from "./components/ChatRoom/ChatRoom";
import ChatListServer from "./components/ChatList/ChatListServer";
import { decodeJWT } from "@/app/utils/token";

export default async function Page({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const userInfo = await decodeJWT();

  if (!userInfo) {
    return;
  }

  return (
    <div className="flex flex-col lg:flex-row h-full gap-4">
      <div className="w-full lg:w-1/3 xl:w-1/4 h-full max-h-[300px] lg:max-h-full">
        <ChatListServer user_id={slug} />
      </div>
      <div className="w-full lg:w-2/3 xl:w-3/4 h-full max-h-[calc(100vh-350px)] lg:max-h-full">
        <ChatRoom userInfo={userInfo} />
      </div>
    </div>
  );
}

