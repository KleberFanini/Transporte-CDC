"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { LogIn, AlertCircle } from "lucide-react";
import Image from "next/image";

// Schema apenas para Login
const loginSchema = z.object({
    email: z.string().email("Email inválido"),
    password: z.string().min(3, "Senha deve ter pelo menos 3 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function AuthPage() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Form de Login
    const loginForm = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const handleLogin = async (data: LoginForm) => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: data.email,
                    senha: data.password,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Erro ao fazer login");
            }

            // Salva o token em cookie
            document.cookie = `token=${result.token}; path=/; max-age=604800`; // 7 dias

            // Redireciona para o dashboard
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F5F3EF] px-4">
            <div className="w-full max-w-md">
                {/* Logo e Título */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-32 h-32 mb-4">
                        <Image
                            src="/logo-transporte.png"
                            alt="CDC Transporte"
                            width={120}
                            height={120}
                            className="object-contain"
                        />
                    </div>
                    <h1 className="font-display text-2xl font-bold text-gray-900">
                        Painel de Gestão de Transporte CDC
                    </h1>
                </div>

                {/* Card de Login */}
                <Card className="shadow-xl border-0 overflow-hidden rounded-2xl border bg-white">
                    <CardContent className="p-6">
                        {/* Título do Login */}
                        <h2 className="text-xl font-semibold text-center text-gray-800 mb-6">
                            Acesse sua conta
                        </h2>

                        {/* Mensagem de erro */}
                        {error && (
                            <div className="mb-6 flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl p-3">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* Form de Login */}
                        <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="login-email">Email</Label>
                                <Input
                                    id="login-email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    {...loginForm.register("email")}
                                    className="rounded-xl"
                                />
                                {loginForm.formState.errors.email && (
                                    <p className="text-sm text-red-500">
                                        {loginForm.formState.errors.email.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="login-password">Senha</Label>
                                <Input
                                    id="login-password"
                                    type="password"
                                    placeholder="••••••••"
                                    {...loginForm.register("password")}
                                    className="rounded-xl"
                                />
                                {loginForm.formState.errors.password && (
                                    <p className="text-sm text-red-500">
                                        {loginForm.formState.errors.password.message}
                                    </p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full rounded-xl bg-[#5D2A1A] hover:bg-[#4A2214] text-white"
                                disabled={loading}
                            >
                                <LogIn className="mr-2 h-4 w-4" />
                                {loading ? "Entrando..." : "Entrar"}
                            </Button>

                            {/* Link para recuperar senha (opcional) */}
                            <div className="text-center text-sm text-gray-500">
                                <a href="#" className="text-gray-600 hover:text-[#5D2A1A] hover:underline">
                                    Esqueceu sua senha?
                                </a>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Rodapé */}
                <p className="text-center text-sm text-gray-600 mt-8">
                    © 2026 CDC Transporte. Todos os direitos reservados.
                </p>
            </div>
        </div>
    );
}