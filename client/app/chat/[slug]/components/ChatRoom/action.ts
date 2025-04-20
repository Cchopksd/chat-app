"use server";

import { getToken } from "@/app/utils/token";

export const fetchChats = async ({ room_id }: { room_id: string }) => {
  const API = process.env.API_URL;
  const token = await getToken();
  if (!token) {
    return;
  }
  try {
    if (!API) {
      throw new Error("API_URL is not defined in the environment variables.");
    }
    const response = await fetch(`${API}/chat-rooms/${room_id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error during login action:", error);
  }
};

export const sendMessage = async ({
  room_id,
  sender_id,
  content,
  message_type,
}: {
  room_id: string;
  sender_id: string;
  content: string;
  message_type: "text" | "image";
}) => {
  const API = process.env.API_URL;
  const token = await getToken();
  if (!token) {
    return;
  }
  try {
    if (!API) {
      throw new Error("API_URL is not defined in the environment variables.");
    }
    const response = await fetch(`${API}/chats`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        room_id,
        sender_id,
        content,
        message_type,
      }),
    });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error during login action:", error);
  }
};

