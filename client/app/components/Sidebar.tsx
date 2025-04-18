"use client";

import {
  Archive,
  BellRing,
  LogOut,
  MessageCircleMore,
  Search,
  Settings,
} from "lucide-react";
import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const NavMenu = [
  { name: "Chat", icon: MessageCircleMore, path: "/chat" },
  { name: "Archive", icon: Archive, path: "/archive" },
  { name: "Search", icon: Search, path: "/search" },
  { name: "Notification", icon: BellRing, path: "/notifications" },
];

const BottomMenu = [
  { name: "Settings", icon: Settings, path: "/settings" },
  { name: "Logout", icon: LogOut, path: "/logout" },
];

export default function Sidebar({ token }: { token?: unknown }) {
  const pathname = usePathname();
  console.log(token);

  const hiddenRoutes = ["/login", "/register"];
  if (hiddenRoutes.includes(pathname)) return null;

  const renderMenu = (menu: typeof NavMenu) =>
    menu.map((item, idx) => {
      const Icon = item.icon;
      const isActive = pathname === item.path;

      return (
        <Link
          href={item.path}
          key={idx}>
          <div
            className={`p-2 rounded-lg transition-colors ${
              isActive ? "bg-gray-700" : "hover:bg-gray-700"
            }`}>
            <Icon
              size={28}
              className={isActive ? "text-blue-400" : "text-gray-300"}
            />
          </div>
        </Link>
      );
    });

  return (
    <nav className="flex flex-col justify-between h-full w-16 text-white py-6">
      <div className="flex flex-col items-center gap-6">
        {renderMenu(NavMenu)}
      </div>
      <div className="flex flex-col items-center gap-6">
        {renderMenu(BottomMenu)}
      </div>
    </nav>
  );
}

