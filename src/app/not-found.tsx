"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home, LogIn } from "lucide-react";

export default function NotFound() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Verificar se o usuário está logado
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    // Redirecionamento automático após 5 segundos
    if (isLoggedIn === null) return;

    const timer = setTimeout(() => {
      if (isLoggedIn) {
        router.push('/dashboard');
      } else {
        router.push('/auth');
      }
    }, 5000);

    // Contador regressivo
    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [isLoggedIn, router]);

  // Não renderiza nada enquanto verifica o login
  if (isLoggedIn === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F3EF] px-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#5D2A1A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F3EF] px-4">
      <div className="text-center max-w-md">
        {/* Número 404 estilizado */}
        <h1 className="text-8xl font-bold text-[#5D2A1A] mb-4">404</h1>

        {/* Mensagem principal */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Página não encontrada
        </h2>

        <p className="text-gray-600 mb-6">
          Oops! A página que você está procurando não existe ou foi removida.
        </p>

        {/* Redirecionamento automático */}
        <p className="text-sm text-gray-500 mb-6">
          Redirecionando em {countdown} segundos...
        </p>

        {/* Botões de ação */}
        <div className="space-y-3">
          <Link href={isLoggedIn ? "/dashboard" : "/auth"}>
            <Button className="w-full bg-[#5D2A1A] hover:bg-[#4A2214] text-white">
              {isLoggedIn ? (
                <>
                  <Home className="mr-2 h-4 w-4" />
                  Ir para o Dashboard
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Ir para o Login
                </>
              )}
            </Button>
          </Link>

          <button
            onClick={() => window.history.back()}
            className="text-sm text-gray-600 hover:text-[#5D2A1A] underline"
          >
            Voltar para a página anterior
          </button>
        </div>
      </div>
    </div>
  );
}