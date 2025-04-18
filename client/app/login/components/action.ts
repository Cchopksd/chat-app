"use server";
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
    console.log(data)
    console.log(data);
  } catch (error) {
    console.error("Error during login action:", error);
  }
};

