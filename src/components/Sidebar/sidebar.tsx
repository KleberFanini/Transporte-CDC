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
  ChevronDown,
  ChevronUp,
  Car,
  Plane,
  Upload
} from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";

interface UserInfo {
  id: string;
  email: string;
  perfil: string;
  nome?: string;
}

interface SubMenuItem {
  title: string;
  path: string;
  icon?: any;
  roles?: string[];
}

interface MenuItem {
  title: string;
  path?: string;
  icon: any;
  roles: string[];
  subItems?: SubMenuItem[];
}

const menuItems: MenuItem[] = [

  {
    title: "Uber e 99",
    icon: Car,
    roles: ["admin", "visualizador"],
    subItems: [
      {
        title: "Dashboard Uber/99",
        path: "/dashboard",
        icon: LayoutDashboard,
        roles: ["admin", "visualizador"]
      },
      {
        title: "Relatórios Uber/99",
        path: "/relatorios",
        icon: BarChart4,
        roles: ["admin", "visualizador"]
      },
      {
        title: "Funcionários",
        path: "/funcionarios",
        icon: Users,
        roles: ["admin", "visualizador"],
      },
      {
        title: "Importar Uber/99",
        path: "/importar",
        icon: Upload,
        roles: ["admin"]
      }
    ],
  },
  {
    title: "Translado",
    icon: Plane,
    roles: ["admin", "visualizador"],
    subItems: [
      {
        title: "Dashboard Translado",
        path: "/translado/dashboard",
        icon: LayoutDashboard,
        roles: ["admin", "visualizador"]
      },
      {
        title: "Relatórios Translado",
        path: "/translado/relatorios",
        icon: BarChart4,
        roles: ["admin", "visualizador"]
      },
      {
        title: "Importar Translados",
        path: "/translado/importar",
        icon: Upload,
        roles: ["admin"]
      },
    ],
  },
  {
    title: "Administração",
    path: "/admin",
    icon: Shield,
    roles: ["admin"],
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];

    if (token) {
      try {
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

  // Função para verificar se o usuário pode ver um item
  const canViewItem = (item: MenuItem | SubMenuItem) => {
    if (!user) return false;
    if (!item.roles) return true;
    return item.roles.includes(user.perfil);
  };

  // Auto-expand menus based on current path (sem depender do user para expansão)
  useEffect(() => {
    if (!pathname) return;

    const newOpenMenus: { [key: string]: boolean } = {};
    menuItems.forEach(item => {
      if (item.subItems) {
        // Verifica se algum subitem está ativo (sem filtrar por permissão aqui)
        const isActive = item.subItems.some(subItem =>
          pathname === subItem.path || pathname.startsWith(subItem.path + "/")
        );
        if (isActive) {
          newOpenMenus[item.title] = true;
        }
      }
    });
    setOpenMenus(prev => ({ ...prev, ...newOpenMenus }));
  }, [pathname]);

  const toggleMenu = (menuTitle: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuTitle]: !prev[menuTitle]
    }));
  };

  // Filtrar os menus principais que o usuário tem acesso
  const filteredItems = menuItems.filter((item) => {
    if (!user) return false; // Aguarda o usuário carregar
    if (!item.roles) return true;
    return item.roles.includes(user.perfil);
  });

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <aside
        className={`fixed left-0 top-0 h-screen bg-[#5D2A1A] text-white transition-all duration-300 flex flex-col z-30 ${collapsed ? "w-16" : "w-60"}`}
      >
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
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </aside>
    );
  }

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
        {user && !collapsed && (
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
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isOpen = openMenus[item.title];

            // Check if the main item has a direct path and is active
            const isDirectActive = item.path ?
              (pathname === item.path || pathname.startsWith(item.path + "/")) :
              false;

            const Icon = item.icon;

            return (
              <div key={item.title}>
                {hasSubItems ? (
                  <>
                    {/* Dropdown Toggle Button */}
                    <button
                      onClick={() => !collapsed && toggleMenu(item.title)}
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${collapsed ? "justify-center" : ""
                        } hover:bg-white/10 text-white/80`}
                      title={collapsed ? item.title : undefined}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </div>
                      {!collapsed && (
                        isOpen ?
                          <ChevronUp className="h-4 w-4" /> :
                          <ChevronDown className="h-4 w-4" />
                      )}
                    </button>

                    {/* Submenu Items - Filtrar por permissão */}
                    {!collapsed && isOpen && (
                      <div className="ml-4 mt-1 space-y-1 border-l border-white/10 pl-2">
                        {item.subItems!
                          .filter(subItem => canViewItem(subItem))
                          .map((subItem) => {
                            const isSubActive =
                              pathname === subItem.path ||
                              pathname.startsWith(subItem.path + "/");
                            const SubIcon = subItem.icon;

                            return (
                              <Link
                                key={subItem.path}
                                href={subItem.path}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isSubActive
                                  ? "bg-[#F4511E] font-medium"
                                  : "hover:bg-white/10 text-white/70"
                                  }`}
                              >
                                {SubIcon && <SubIcon className="h-4 w-4 shrink-0" />}
                                <span>{subItem.title}</span>
                              </Link>
                            );
                          })}
                      </div>
                    )}
                  </>
                ) : (
                  /* Normal Menu Item */
                  <Link
                    href={item.path!}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${isDirectActive
                      ? "bg-[#F4511E] font-medium"
                      : "hover:bg-white/10 text-white/80"
                      }`}
                    title={collapsed ? item.title : undefined}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!collapsed && <span>{item.title}</span>}
                  </Link>
                )}
              </div>
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