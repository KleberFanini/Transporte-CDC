"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  DollarSign,
  Shield,
  ChevronLeft,
  ChevronRight,
  User,
  BarChart4,
  Users,
  Upload
} from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { validarToken } from "@/lib/jwt";

interface UserInfo {
  id: string;
  email: string;
  perfil: string;
  nome?: string;
}

const menuItems = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "visualizador"],
  },
  {
    title: "Relatórios",
    path: "/relatorios",
    icon: BarChart4,
    roles: ["admin", "visualizador"],
  },
  {
    title: "Funcionários",
    path: "/funcionarios",
    icon: Users,
    roles: ["admin"],
  },
  {
    title: "Administração",
    path: "/admin",
    icon: Shield,
    roles: ["admin"],
  },
  {
    title: "Importar",
    path: "/importar",
    icon: Upload,
    roles: ["admin"],
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Buscar informações do usuário do token
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];

    if (token) {
      try {
        // Decodificar token (aqui você pode usar a função validarToken do backend)
        // Como é client-side, vamos simular ou buscar de outro lugar
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        setUser({
          id: tokenData.sub,
          email: tokenData.email,
          perfil: tokenData.perfil,
          nome: tokenData.nome || tokenData.email.split('@')[0]
        });
      } catch (error) {
        console.error("Erro ao decodificar token:", error);
      }
    }
    setLoading(false);
  }, []);

  // Filtra itens baseado no perfil do usuário
  const filteredItems = menuItems.filter((item) =>
    user ? item.roles.includes(user.perfil) : []
  );

  return (
    <>
      <aside
        className={`fixed left-0 top-0 h-screen bg-[#5D2A1A] text-white transition-all duration-300 flex flex-col z-30 ${collapsed ? "w-16" : "w-60"
          }`}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-white/10">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-12 h-12 relative shrink-0">
              <Image
                src="/logo-transporte.png"
                alt="CDC Transporte"
                width={100}
                height={100}
                className="object-contain"
              />
            </div>
            {!collapsed && (
              <span className="text-sm font-semibold whitespace-nowrap">
                CDC Transporte
              </span>
            )}
          </div>
        </div>

        {/* Informações do usuário */}
        {!loading && user && !collapsed && (
          <div className="px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#F4511E] flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.nome || user.email}</p>
                <p className="text-xs text-white/60 truncate">{user.perfil}</p>
              </div>
            </div>
          </div>
        )}

        {/* Menu */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {filteredItems.map((item) => {
            const active =
              pathname === item.path || pathname.startsWith(item.path + "/");

            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${active
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

        {/* Botões inferiores */}
        <div className="p-2 border-t border-white/10 space-y-1">
          {/* Toggle Sidebar */}
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

      {/* Espaçador para compensar a sidebar fixa */}
      <div className={`${collapsed ? "w-16" : "w-60"} transition-all duration-300 flex-shrink-0`} />
    </>
  );
}