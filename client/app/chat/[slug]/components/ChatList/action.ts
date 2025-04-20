"use server";

import { getToken } from "@/app/utils/token";

export const fetchChatList = async ({ user_id }: { user_id: string }) => {
  const API = process.env.API_URL;
  const token = await getToken();
  if (!token) {
    return;
  }
  try {
    if (!API) {
      throw new Error("API_URL is not defined in the environment variables.");
    }
    const response = await fetch(`${API}/chat-rooms/user/${user_id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error during login action:", error);
  }
};

