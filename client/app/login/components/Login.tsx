"use client";
import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    const API = process.env.NEXT_PUBLIC_API_URL;

    try {
      if (!API) {
        throw new Error("API_URL is not defined in the environment variables.");
      }
      const response = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      console.log(response);
      const data = await response.json();

        if (data.success) {
          window.location.href = "/chat";
        }
    } catch (error) {
      console.error("Error during login action:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl p-8 shadow-lg bg-white dark:bg-gray-800">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            เข้าสู่ระบบแชท
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            ยินดีต้อนรับกลับมา! กรุณาเข้าสู่ระบบเพื่อเริ่มการสนทนา
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              อีเมล
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Mail
                  size={18}
                  className="text-gray-400 dark:text-gray-500"
                />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
                className="block w-full pl-10 pr-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              รหัสผ่าน
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Lock
                  size={18}
                  className="text-gray-400 dark:text-gray-500"
                />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="block w-full pl-10 pr-10 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3">
                {showPassword ? (
                  <EyeOff
                    size={18}
                    className="text-gray-400 dark:text-gray-500"
                  />
                ) : (
                  <Eye
                    size={18}
                    className="text-gray-400 dark:text-gray-500"
                  />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <div>
              <a
                href="#"
                className="text-sm font-medium text-blue-600 hover:text-blue-500">
                ลืมรหัสผ่าน?
              </a>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`flex w-full justify-center items-center rounded-lg px-5 py-2.5 text-center text-sm font-medium text-white ${
              isLoading
                ? "bg-blue-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } transition-colors duration-300`}>
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                กำลังเข้าสู่ระบบ...
              </>
            ) : (
              <>
                <LogIn
                  size={18}
                  className="mr-2"
                />
                เข้าสู่ระบบ
              </>
            )}
          </button>

          <div className="relative flex items-center justify-center mt-8">
            <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
            <span className="flex-shrink mx-4 text-sm text-gray-500 dark:text-gray-400">
              หรือเข้าสู่ระบบด้วย
            </span>
            <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
          </div>

          <div className="flex w-full gap-4">
            <button
              type="button"
              className="flex w-full items-center justify-center rounded-lg px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white">
              {/* <Google
                size={18}
                className="mr-2"
              /> */}
              Google
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          ยังไม่มีบัญชี?{" "}
          <a
            href="#"
            className="font-medium text-blue-600 hover:text-blue-500">
            สมัครสมาชิกตอนนี้
          </a>
        </p>
      </div>
    </div>
  );
}

