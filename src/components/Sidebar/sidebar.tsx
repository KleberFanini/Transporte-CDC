"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  DollarSign,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";

// 🔥 Remova isso depois quando tiver Auth real
const mockUser = { role: "admin" };

const menuItems = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "operacional", "financeiro"],
  },
  {
    title: "Operacional",
    path: "/operacional",
    icon: ClipboardList,
    roles: ["admin", "operacional"],
  },
  {
    title: "Financeiro",
    path: "/financeiro",
    icon: DollarSign,
    roles: ["admin", "financeiro"],
  },
  {
    title: "Administração",
    path: "/admin",
    icon: Shield,
    roles: ["admin"],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const filteredItems = menuItems.filter((item) =>
    item.roles.includes(mockUser.role)
  );

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-[#5D2A1A] text-white transition-all duration-300 flex flex-col ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-white/10">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-12 h-12 relative shrink-0">
            <Image
              src="/logo-transporte.png"
              alt="CDC Transporte"
              width={50}
              height={50}
            />
          </div>
          {!collapsed && (
            <span className="text-sm font-semibold whitespace-nowrap">
              CDC Transporte
            </span>
          )}
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {filteredItems.map((item) => {
          const active =
            pathname === item.path ||
            pathname.startsWith(item.path + "/");

          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                active
                  ? "bg-[#F4511E] font-medium"
                  : "hover:bg-white/10 text-white/80"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Toggle */}
      <div className="p-2 border-t border-white/10">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex justify-center p-2 rounded-md hover:bg-white/10 transition"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
    </aside>
  );
}