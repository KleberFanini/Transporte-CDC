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
import { LogIn, UserPlus, AlertCircle, CheckCircle } from "lucide-react";
import Image from "next/image";

// Schema para Login
const loginSchema = z.object({
    email: z.string().email("Email inválido"),
    password: z.string().min(3, "Senha deve ter pelo menos 3 caracteres"),
});

// Schema para Cadastro
const cadastroSchema = z.object({
    nome: z.string().min(6, "Nome deve ter pelo menos 6 caracteres"),
    email: z.string().email("Email inválido"),
    password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
    confirmPassword: z.string().min(8, "Confirme sua senha"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
});

type LoginForm = z.infer<typeof loginSchema>;
type CadastroForm = z.infer<typeof cadastroSchema>;

export default function AuthPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"login" | "cadastro">("login");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    // Form de Login
    const loginForm = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    // Form de Cadastro
    const cadastroForm = useForm<CadastroForm>({
        resolver: zodResolver(cadastroSchema),
        defaultValues: {
            nome: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const handleLogin = async (data: LoginForm) => {
        setLoading(true);
        setError("");
        setSuccess("");

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

    const handleCadastro = async (data: CadastroForm) => {
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const response = await fetch("/api/auth/cadastro", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nome: data.nome,
                    email: data.email,
                    senha: data.password,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Erro ao fazer cadastro");
            }

            setSuccess("Cadastro realizado com sucesso! Faça seu login.");
            setActiveTab("login");

            // Limpa e pré-preenche o email no login
            loginForm.setValue("email", data.email);
            loginForm.setValue("password", "");

            // Limpa o form de cadastro
            cadastroForm.reset();
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
                        Centro de Desenvolvimento e Cidadania
                    </h1>
                    <p className="text-gray-600 mt-2">Painel de Gestão de Transporte</p>
                </div>

                {/* Card com Tabs */}
                <Card className="shadow-xl border-0 overflow-hidden rounded-2xl border bg-white">
                    {/* Tabs */}
                    <div className="flex border-b">
                        <button
                            onClick={() => {
                                setActiveTab("login");
                                setError("");
                                setSuccess("");
                            }}
                            className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === "login"
                                ? "text-[#5D2A1A] border-b-2 border-[#5D2A1A] bg-[#5D2A1A]/5"
                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            <LogIn className="inline-block mr-2 h-4 w-4" />
                            Login
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab("cadastro");
                                setError("");
                                setSuccess("");
                            }}
                            className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === "cadastro"
                                ? "text-[#5D2A1A] border-b-2 border-[#5D2A1A] bg-[#5D2A1A]/5"
                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            <UserPlus className="inline-block mr-2 h-4 w-4" />
                            Cadastro
                        </button>
                    </div>

                    <CardContent className="p-6">
                        {/* Mensagens */}
                        {error && (
                            <div className="mb-6 flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl p-3">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="mb-6 flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-xl p-3">
                                <CheckCircle className="h-4 w-4 shrink-0" />
                                {success}
                            </div>
                        )}

                        {/* Form de Login */}
                        {activeTab === "login" && (
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
                            </form>
                        )}

                        {/* Form de Cadastro */}
                        {activeTab === "cadastro" && (
                            <form onSubmit={cadastroForm.handleSubmit(handleCadastro)} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cadastro-nome">Nome completo</Label>
                                    <Input
                                        id="cadastro-nome"
                                        type="text"
                                        placeholder="Seu nome completo"
                                        {...cadastroForm.register("nome")}
                                        className="rounded-xl"
                                    />
                                    {cadastroForm.formState.errors.nome && (
                                        <p className="text-sm text-red-500">
                                            {cadastroForm.formState.errors.nome.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="cadastro-email">Email</Label>
                                    <Input
                                        id="cadastro-email"
                                        type="email"
                                        placeholder="seu@email.com"
                                        {...cadastroForm.register("email")}
                                        className="rounded-xl"
                                    />
                                    {cadastroForm.formState.errors.email && (
                                        <p className="text-sm text-red-500">
                                            {cadastroForm.formState.errors.email.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="cadastro-password">Senha</Label>
                                    <Input
                                        id="cadastro-password"
                                        type="password"
                                        placeholder="••••••••"
                                        {...cadastroForm.register("password")}
                                        className="rounded-xl"
                                    />
                                    {cadastroForm.formState.errors.password && (
                                        <p className="text-sm text-red-500">
                                            {cadastroForm.formState.errors.password.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="cadastro-confirm-password">Confirmar senha</Label>
                                    <Input
                                        id="cadastro-confirm-password"
                                        type="password"
                                        placeholder="••••••••"
                                        {...cadastroForm.register("confirmPassword")}
                                        className="rounded-xl"
                                    />
                                    {cadastroForm.formState.errors.confirmPassword && (
                                        <p className="text-sm text-red-500">
                                            {cadastroForm.formState.errors.confirmPassword.message}
                                        </p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full rounded-xl bg-[#5D2A1A] hover:bg-[#4A2214] text-white"
                                    disabled={loading}
                                >
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    {loading ? "Cadastrando..." : "Criar conta"}
                                </Button>

                                <div className="text-center text-sm text-gray-500">
                                    Ao se cadastrar, você concorda com nossos{' '}
                                    <a href="#" className="text-blue-600 hover:underline">Termos de uso</a>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>

                {/* Rodapé */}
                <p className="text-center text-sm text-gray-600 mt-8">
                    © 2024 CDC Transporte. Todos os direitos reservados.
                </p>
            </div>
        </div>
    );
}