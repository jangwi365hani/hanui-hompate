"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";

const PROXY = process.env.NEXT_PUBLIC_SYSTEM_PROXY_ORIGIN || "";

const NAV_ITEMS = [
  { href: "/dashboard", label: "스케줄", icon: "📅", group: "main" },
  { href: "/tangjeon", label: "탕전", icon: "🫙", group: "main" },
  { href: "/manage", label: "관리", icon: "⚙️", group: "admin" },
];

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem("jw_user");
    if (stored) {
      setUser(JSON.parse(stored));
      setLoading(false);
    } else {
      router.replace("/login");
    }
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem("jw_user");
    router.replace("/login");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F5F0EB]">
        <div className="text-[#8B1A1A] font-medium">로딩중...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F5F0EB] font-sans overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`flex flex-col bg-[#2D0A0A] text-white transition-all duration-200 ${
          sidebarOpen ? "w-56" : "w-14"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-3 py-4 border-b border-[#5a1a1a]">
          <Image src="/favicon.ico" alt="logo" width={28} height={28} className="rounded-full flex-shrink-0" />
          {sidebarOpen && (
            <span className="text-sm font-bold text-[#F5C842] whitespace-nowrap">장위365 경희</span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 space-y-1 px-2">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-[#8B1A1A] text-white font-semibold"
                    : "text-gray-300 hover:bg-[#4a1010] hover:text-white"
                }`}
              >
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                {sidebarOpen && <span className="whitespace-nowrap">{item.label}</span>}
              </a>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-[#5a1a1a] px-2 py-3 space-y-1">
          {sidebarOpen && user && (
            <div className="px-2 py-1 text-xs text-gray-400 truncate">
              {user.name} · {user.role}
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-2 py-2 rounded-lg text-sm text-gray-300 hover:bg-[#4a1010] hover:text-white transition-colors"
          >
            <span className="text-lg flex-shrink-0">🚪</span>
            {sidebarOpen && <span>로그아웃</span>}
          </button>
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="flex items-center gap-3 w-full px-2 py-2 rounded-lg text-sm text-gray-300 hover:bg-[#4a1010] hover:text-white transition-colors"
          >
            <span className="text-lg flex-shrink-0">{sidebarOpen ? "◀" : "▶"}</span>
            {sidebarOpen && <span>접기</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
        }
