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
import { ArrowLeft, Mail, AlertCircle, CheckCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const schema = z.object({
    email: z.string().email("Email inválido"),
});

type FormData = z.infer<typeof schema>;

export default function RecuperarSenhaPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const form = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { email: "" },
    });

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/auth/recuperar-senha", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: data.email }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Erro ao enviar solicitação");
            }

            setSuccess(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F5F3EF] px-4">
                <div className="w-full max-w-md">
                    <Card className="shadow-xl border-0 overflow-hidden rounded-2xl border bg-white">
                        <CardContent className="p-6 text-center">
                            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                Email enviado!
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Enviamos um link de redefinição de senha para o seu email.
                                Verifique sua caixa de entrada e spam.
                            </p>
                            <Link href="/auth">
                                <Button variant="outline" className="w-full">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Voltar para o login
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
                        Recuperar Senha
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Digite seu email para receber um link de redefinição
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
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    {...form.register("email")}
                                    className="rounded-xl"
                                />
                                {form.formState.errors.email && (
                                    <p className="text-sm text-red-500">
                                        {form.formState.errors.email.message}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <Button
                                    type="submit"
                                    className="w-full rounded-xl bg-[#5D2A1A] hover:bg-[#4A2214] text-white"
                                    disabled={loading}
                                >
                                    <Mail className="mr-2 h-4 w-4" />
                                    {loading ? "Enviando..." : "Enviar link"}
                                </Button>

                                <Link href="/auth">
                                    <Button variant="outline" className="w-full mt-2">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Voltar para o login
                                    </Button>
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}