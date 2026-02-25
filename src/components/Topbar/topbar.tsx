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

// Props que o Topbar pode receber
interface TopbarProps {
    showMenuButton?: boolean; // Para mobile, mostrar botão de menu
    onMenuClick?: () => void; // Função para abrir/fechar sidebar
    title?: string; // Título personalizado
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
    onMenuClick,
    title = "Painel CDC",
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

    // Se não tem usuário e não está carregando, não renderiza nada
    // (o middleware já deve redirecionar, mas é uma segurança extra)
    if (!loading && !user) {
        return null;
    }

    if (loading) {
        return (
            <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 shadow-sm">
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

    // Só renderiza o conteúdo se tiver usuário
    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 shadow-sm sticky top-0 z-10">
            {/* Lado esquerdo - Título e botão do menu mobile */}
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
                <h1 className="text-xl font-semibold text-gray-800">
                    {title}
                </h1>
            </div>

            {/* Lado direito - Informações do usuário e logout */}
            <div className="flex items-center gap-4">
                {user && (
                    <>
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

                        {/* Versão mobile simplificada */}
                        <div className="sm:hidden flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#5D2A1A] flex items-center justify-center text-white">
                                <span className="text-sm font-medium">
                                    {user.nome.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <Badge
                                variant="outline"
                                className={`${roleBadgeClass[user.perfil] || "bg-gray-100 text-gray-700"} font-medium text-xs`}
                            >
                                {roleLabels[user.perfil] || user.perfil}
                            </Badge>
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
                    </>
                )}
            </div>
        </header>
    );
}