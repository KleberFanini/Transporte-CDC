"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, User, Menu } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Interface do usuário
interface UserInfo {
    id: string;
    nome: string;
    email: string;
    perfil: string;
}

interface TopbarProps {
    showMenuButton?: boolean;
    onMenuClick?: () => void;
    title?: string;
}

// Mapeamento de cores para cada perfil
const roleBadgeClass: Record<string, string> = {
    admin: "bg-purple-100 text-purple-700 border-purple-200",
    operacional: "bg-blue-100 text-blue-700 border-blue-200",
    financeiro: "bg-green-100 text-green-700 border-green-200",
    visualizador: "bg-gray-100 text-gray-700 border-gray-200",
};

// Labels amigáveis para cada perfil
const roleLabels: Record<string, string> = {
    admin: "Administrador",
    operacional: "Operacional",
    financeiro: "Financeiro",
    visualizador: "Visualizador",
};

export default function Topbar({
    showMenuButton = false,
    onMenuClick
}: TopbarProps) {
    const router = useRouter();
    const [user, setUser] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Buscar informações do usuário do token
        const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];

        if (token) {
            try {
                // Decodificar o token JWT
                const tokenData = JSON.parse(atob(token.split('.')[1]));
                setUser({
                    id: tokenData.sub,
                    nome: tokenData.nome || tokenData.email?.split('@')[0] || "Usuário",
                    email: tokenData.email,
                    perfil: tokenData.perfil || "visualizador",
                });
            } catch (error) {
                console.error("Erro ao decodificar token:", error);
                setUser(null);
            }
        }
        setLoading(false);
    }, []);

    const handleLogout = () => {
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
        router.push('/auth');
    };

    if (loading) {
        return (
            <header className="h-16 w-full bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
                <div className="flex items-center gap-3">
                    {showMenuButton && (
                        <div className="lg:hidden w-8 h-8 bg-gray-200 animate-pulse rounded" />
                    )}
                    <div className="h-6 w-32 bg-gray-200 animate-pulse rounded" />
                </div>
                <div className="h-8 w-40 bg-gray-200 animate-pulse rounded" />
            </header>
        );
    }

    // Se não tem usuário, mostra apenas o header básico (sem informações)
    if (!user) {
        return (
            <header className="h-16 w-full bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
                <div className="flex items-center gap-3">
                    {showMenuButton && (
                        <button
                            onClick={onMenuClick}
                            className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
                            aria-label="Abrir menu"
                        >
                            <Menu className="h-5 w-5 text-gray-600" />
                        </button>
                    )}
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/auth')}
                    className="text-gray-600 hover:text-[#5D2A1A] hover:bg-gray-100"
                >
                    <LogOut className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Login</span>
                </Button>
            </header>
        );
    }

    return (
        <header className="h-16 w-full bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
            {/* Lado esquerdo */}
            <div className="flex items-center gap-3">
                {showMenuButton && (
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
                        aria-label="Abrir menu"
                    >
                        <Menu className="h-5 w-5 text-gray-600" />
                    </button>
                )}
            </div>

            {/* Lado direito */}
            <div className="flex items-center gap-4">
                {/* Versão desktop */}
                <div className="hidden sm:flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#5D2A1A] flex items-center justify-center text-white">
                            <span className="text-sm font-medium">
                                {user.nome.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-700">
                                {user.nome}
                            </span>
                            <span className="text-xs text-gray-500">
                                {user.email}
                            </span>
                        </div>
                    </div>
                    <Badge
                        variant="outline"
                        className={`${roleBadgeClass[user.perfil] || "bg-gray-100 text-gray-700"} font-medium`}
                    >
                        {roleLabels[user.perfil] || user.perfil}
                    </Badge>
                </div>

                {/* Versão mobile */}
                <div className="sm:hidden flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#5D2A1A] flex items-center justify-center text-white">
                        <span className="text-sm font-medium">
                            {user.nome.charAt(0).toUpperCase()}
                        </span>
                    </div>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-red-600 hover:bg-red-50"
                >
                    <LogOut className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Sair</span>
                </Button>
            </div>
        </header>
    );
}