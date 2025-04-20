"use server";

import { cookies } from "next/headers";

export const loginAction = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const API = process.env.API_URL;

  try {
    if (!API) {
      throw new Error("API_URL is not defined in the environment variables.");
    }
    const response = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log(data);
    (await cookies()).set("user-token", data.data, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000 * 24,
    });
    return data;
  } catch (error) {
    console.error("Error during login action:", error);
  }
};

