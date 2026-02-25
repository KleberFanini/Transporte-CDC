"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Verificar se usuário está logado
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];

    if (token) {
      router.push('/dashboard');
    } else {
      router.push('/auth');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[#5D2A1A] mb-4">CDC Transporte</h1>
        <p className="text-gray-600">Redirecionando...</p>
      </div>
    </div>
  );
}