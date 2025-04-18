"use server";
import React from "react";
import ChatList from "./components/ChatList";
import ChatRoom from "./components/ChatRoom";

export default async function Page() {
  return (
    <div className="flex flex-col lg:flex-row h-full gap-4">
      <div className="w-full lg:w-1/3 xl:w-1/4 h-full max-h-[300px] lg:max-h-full">
        <ChatList />
      </div>
      <div className="w-full lg:w-2/3 xl:w-3/4 h-full max-h-[calc(100vh-350px)] lg:max-h-full">
        <ChatRoom />
      </div>
    </div>
  );
}
