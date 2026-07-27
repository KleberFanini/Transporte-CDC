"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const schema = z.object({
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string().min(6, "Confirme sua senha"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

function RedefinirSenhaContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [validToken, setValidToken] = useState<boolean | null>(null);

    const form = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    // Validar token ao carregar
    useEffect(() => {
        if (!token) {
            setValidToken(false);
            setError("Token de redefinição não encontrado");
            return;
        }

        const validarToken = async () => {
            try {
                const response = await fetch(`/api/auth/validar-token?token=${token}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.valid) {
                        setValidToken(true);
                    } else {
                        setValidToken(false);
                        setError(data.message || "Token inválido ou expirado");
                    }
                } else {
                    setValidToken(false);
                    setError("Token inválido ou expirado");
                }
            } catch {
                setValidToken(false);
                setError("Erro ao validar token");
            }
        };

        validarToken();
    }, [token]);

    const onSubmit = async (data: FormData) => {
        if (!token) return;

        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/auth/redefinir-senha", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token,
                    novaSenha: data.password,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Erro ao redefinir senha");
            }

            setSuccess(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (validToken === false) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F5F3EF] px-4">
                <div className="w-full max-w-md">
                    <Card className="shadow-xl border-0 overflow-hidden rounded-2xl border bg-white">
                        <CardContent className="p-6 text-center">
                            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                Token inválido
                            </h2>
                            <p className="text-gray-600 mb-6">
                                {error || "O link de redefinição é inválido ou expirou."}
                            </p>
                            <Link href="/auth/recuperar-senha">
                                <Button className="w-full bg-[#5D2A1A] hover:bg-[#4A2214] text-white">
                                    Solicitar novo link
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (validToken === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F5F3EF] px-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5D2A1A] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Validando token...</p>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F5F3EF] px-4">
                <div className="w-full max-w-md">
                    <Card className="shadow-xl border-0 overflow-hidden rounded-2xl border bg-white">
                        <CardContent className="p-6 text-center">
                            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                Senha redefinida!
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Sua senha foi alterada com sucesso.
                            </p>
                            <Link href="/auth">
                                <Button className="w-full bg-[#5D2A1A] hover:bg-[#4A2214] text-white">
                                    Fazer login
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F5F3EF] px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-24 h-24 mb-4">
                        <Image
                            src="/logo-transporte.png"
                            alt="CDC Transporte"
                            width={96}
                            height={96}
                            className="object-contain"
                        />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Redefinir Senha
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Digite sua nova senha
                    </p>
                </div>

                <Card className="shadow-xl border-0 overflow-hidden rounded-2xl border bg-white">
                    <CardContent className="p-6">
                        {error && (
                            <div className="mb-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl p-3">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Nova Senha</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        {...form.register("password")}
                                        className="rounded-xl pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {form.formState.errors.password && (
                                    <p className="text-sm text-red-500">
                                        {form.formState.errors.password.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        {...form.register("confirmPassword")}
                                        className="rounded-xl pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {form.formState.errors.confirmPassword && (
                                    <p className="text-sm text-red-500">
                                        {form.formState.errors.confirmPassword.message}
                                    </p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full rounded-xl bg-[#5D2A1A] hover:bg-[#4A2214] text-white"
                                disabled={loading}
                            >
                                {loading ? "Redefinindo..." : "Redefinir Senha"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function RedefinirSenhaPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#F5F3EF] px-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5D2A1A] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Carregando...</p>
                </div>
            </div>
        }>
            <RedefinirSenhaContent />
        </Suspense>
    );
}