"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserPlus, Edit, Trash2, CheckCircle, XCircle, Search, RefreshCw, Shield, Eye, EyeOff, MoreHorizontal, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

// Tipos
interface Usuario {
    id: string;
    nome: string;
    email: string;
    perfil: "admin" | "visualizador";
    status: "ATIVO" | "DESATIVADO";
    criadoEm?: string;
    atualizadoEm?: string;
}

// Schema para cadastro/edição de usuários
const usuarioSchema = z.object({
    nome: z.string().min(6, "Nome deve ter pelo menos 6 caracteres"),
    email: z.string().email("Email inválido"),
    senha: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
    perfil: z.enum(["admin", "visualizador"])
});

// Schema para EDIÇÃO de usuários (senha opcional)
const usuarioEditSchema = z.object({
    nome: z.string().min(6, "Nome deve ter pelo menos 6 caracteres"),
    email: z.string().email("Email inválido"),
    senha: z.string().min(8, "Senha deve ter pelo menos 8 caracteres").optional(),
    perfil: z.enum(["admin", "visualizador"])
});

type UsuarioFormValues = z.infer<typeof usuarioSchema>;
type UsuarioEditValues = z.infer<typeof usuarioEditSchema>;

export default function AdminPage() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [modalAberto, setModalAberto] = useState(false);
    const [modalTipo, setModalTipo] = useState<"cadastro" | "edicao">("cadastro");
    const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [resetSenha, setResetSenha] = useState(false);

    const form = useForm<UsuarioFormValues>({
        resolver: zodResolver(usuarioSchema),
        defaultValues: {
            nome: "",
            email: "",
            senha: "",
            perfil: "visualizador"
        },
    });

    const editForm = useForm<UsuarioEditValues>({
        resolver: zodResolver(usuarioEditSchema),
        defaultValues: {
            nome: "",
            email: "",
            senha: "",
            perfil: "visualizador"
        },
    });

    // Carregar usuários do banco local
    const carregarUsuarios = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/admin/usuarios");
            if (response.ok) {
                const data = await response.json();
                setUsuarios(data);
            }
        } catch (error) {
            console.error("Erro ao carregar usuários:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        carregarUsuarios();
    }, []);

    // Resetar formulário quando abrir modal
    useEffect(() => {
        if (modalAberto && modalTipo === "edicao" && usuarioEditando) {
            editForm.reset({
                nome: usuarioEditando.nome,
                email: usuarioEditando.email,
                perfil: usuarioEditando.perfil,
            });
        } else if (!modalAberto) {
            form.reset();
            editForm.reset();
            setUsuarioEditando(null);
            setShowPassword(false);
        }
    }, [modalAberto, modalTipo, usuarioEditando, editForm, form, setShowPassword]);

    const handleAbrirCadastro = () => {
        setModalTipo("cadastro");
        setUsuarioEditando(null);
        setModalAberto(true);
    };

    const handleAbrirEdicao = (usuario: Usuario) => {
        setModalTipo("edicao");
        setUsuarioEditando(usuario);
        setModalAberto(true);
    };

    const handleToggleStatus = async (usuario: Usuario) => {
        try {
            const novoStatus = usuario.status === "ATIVO" ? "DESATIVADO" : "ATIVO";

            // Chamar a API
            const response = await fetch(`/api/admin/usuarios/${usuario.id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: novoStatus }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Erro ao alterar status");
            }

            const usuarioAtualizado = await response.json();

            // Atualizar o estado local
            setUsuarios(prev =>
                prev.map(u => u.id === usuario.id ? usuarioAtualizado : u)
            );

            toast.success(`Usuário ${novoStatus === "ATIVO" ? "ativado" : "desativado"} com sucesso`);
        } catch (error: any) {
            console.error("Erro:", error);
            toast.error(error.message || "Erro ao alterar status");
        }
    };

    const handleCadastro = async (data: UsuarioFormValues) => {
        try {
            const response = await fetch("/api/admin/usuarios", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Erro ao cadastrar usuário");
            }

            toast.success("Usuário cadastrado com sucesso");
            setModalAberto(false);
            carregarUsuarios(); // Recarrega a lista
        } catch (error: any) {
            console.error("Erro:", error);
            toast.error(error.message || "Erro ao cadastrar usuário");
        }
    };

    const handleEditar = async (data: UsuarioEditValues) => {
        if (!usuarioEditando) return;
        setLoading(true);

        try {
            // Chamar a API para atualizar no banco
            const response = await fetch(`/api/admin/usuarios/${usuarioEditando.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nome: data.nome,
                    email: data.email,
                    perfil: data.perfil,
                    senha: resetSenha ? data.senha : undefined,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Erro ao editar usuário");
            }

            const usuarioAtualizado = await response.json();

            // Atualizar o estado local com o usuário atualizado
            setUsuarios(prev =>
                prev.map(u =>
                    u.id === usuarioEditando.id ? usuarioAtualizado : u
                )
            );

            toast.success("Usuário editado com sucesso");
            setModalAberto(false);
        } catch (error: any) {
            console.error("Erro:", error);
            toast.error(error.message || "Erro ao editar usuário");
        } finally {
            setLoading(false);
        }
    };

    const usuariosFiltrados = usuarios.filter((usuario) =>
        usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getPerfilBadge = (perfil: string) => {
        switch (perfil) {
            case "admin":
                return <Badge className="bg-purple-100 text-purple-700 border-purple-200">Administrador</Badge>;
            default:
                return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Visualizador</Badge>;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "ATIVO":
                return (
                    <Badge className="bg-green-100 text-green-700 border-green-200 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Ativo
                    </Badge>
                );
            default:
                return (
                    <Badge className="bg-gray-100 text-gray-700 border-gray-200 flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        Desativado
                    </Badge>
                );
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Administração</h1>
                    <p className="text-gray-600">Gerenciar usuários do sistema</p>
                </div>
                <Button onClick={handleAbrirCadastro} className="bg-[#5D2A1A] hover:bg-[#4A2214] text-white">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Cadastrar Usuário
                </Button>
            </div>

            {/* Barra de Pesquisa */}
            <CardContent>
                <div className="flex gap-4 relative bg-white">

                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Buscar por nome ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />

                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </CardContent>

            {/* Tabela de usuários*/}
            <Card className="rounded-xl bg-white overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b bg-gray-100">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Nome</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">E-mail</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Papel</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuariosFiltrados.map((usuario, index) => (
                                    <tr key={usuario.id} className={`border-b ${index === usuariosFiltrados.length - 1 ? "border-b-0" : ""
                                        }`}>
                                        <td className="py-3 px-4 font-medium">{usuario.nome}</td>
                                        <td className="py-3 px-4 text-sm">{usuario.email}</td>
                                        <td className="py-3 px-4">{getPerfilBadge(usuario.perfil)}</td>
                                        <td className="py-3 px-4">{getStatusBadge(usuario.status)}</td>
                                        <td className="text-right py-3 px-4">
                                            <div className="flex items-center gap-2 justify-end">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleAbrirEdicao(usuario)}
                                                    className="text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleToggleStatus(usuario)}
                                                    className={usuario.status === "ATIVO"
                                                        ? "text-gray-600 hover:text-red-600 hover:bg-red-50"
                                                        : "text-gray-600 hover:text-green-600 hover:bg-green-50"
                                                    }
                                                >
                                                    {usuario.status === "ATIVO" ? (
                                                        <XCircle className="h-4 w-4" />
                                                    ) : (
                                                        <CheckCircle className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {usuariosFiltrados.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-gray-500">
                                            Nenhum usuário encontrado
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Modal de Cadastro */}
            <Dialog open={modalAberto && modalTipo === "cadastro"} onOpenChange={setModalAberto}>
                <DialogContent className="sm:max-w-[500px] bg-[#F5F3EF]">
                    <DialogHeader>
                        <DialogTitle>Cadastrar Usuário</DialogTitle>
                        <DialogDescription>
                            Preencha os campos abaixo para cadastrar um novo usuário.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={form.handleSubmit(handleCadastro)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="nome">Nome Completo</Label>
                                <Input
                                    id="nome"
                                    {...form.register("nome")}
                                    className="bg-white"
                                    placeholder="Digite o nome completo"
                                />
                                {form.formState.errors.nome && (
                                    <p className="text-red-500 text-sm">
                                        {form.formState.errors.nome.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    {...form.register("email")}
                                    className="bg-white"
                                    placeholder="Digite o email"
                                />
                                {form.formState.errors.email && (
                                    <p className="text-red-500 text-sm">
                                        {form.formState.errors.email.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="senha">Senha</Label>
                                <div className="relative">
                                    <Input
                                        id="senha"
                                        type={showPassword ? "text" : "password"}
                                        className="bg-white"
                                        {...form.register("senha")}
                                        placeholder="********"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {form.formState.errors.senha && (
                                    <p className="text-sm text-red-500">{form.formState.errors.senha.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="perfil">Perfil</Label>
                                <Select
                                    onValueChange={(value) => form.setValue("perfil", value as "admin" | "visualizador")}
                                    defaultValue={form.getValues("perfil")}
                                    value={form.watch("perfil")}
                                >
                                    <SelectTrigger className="w-full bg-white">
                                        <SelectValue placeholder="Selecione um papel" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        <SelectItem value="admin">Administrador</SelectItem>
                                        <SelectItem value="visualizador">Visualizador</SelectItem>
                                    </SelectContent>
                                </Select>
                                {form.formState.errors.perfil && (
                                    <p className="text-sm text-red-500">{form.formState.errors.perfil.message}</p>
                                )}
                            </div>
                        </div>
                        <DialogFooter className="mt-4 flex items-center ">
                            <Button
                                type="button"
                                variant="outline"
                                className="bg-white"
                                onClick={() => setModalAberto(false)}
                            >
                                Cancelar
                            </Button>

                            <Button
                                type="submit"
                                className="bg-[#5D2A1A] hover:bg-[#4A2214] text-white"
                                disabled={form.formState.isSubmitting}
                            >
                                {form.formState.isSubmitting ? "Cadastrando..." : "Cadastrar"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal de Edição */}
            <Dialog open={modalAberto && modalTipo === "edicao"} onOpenChange={setModalAberto}>
                <DialogContent className="sm:max-w-[500px] bg-[#F5F3EF]">
                    <DialogHeader>
                        <DialogTitle>Editar Usuário</DialogTitle>
                        <DialogDescription>
                            Altere os dados do usuário selecionado.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={editForm.handleSubmit(handleEditar)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-nome">Nome completo</Label>
                            <Input
                                id="edit-nome"
                                {...editForm.register("nome")}
                                className="bg-white"
                                placeholder="Digite o nome completo"
                            />
                            {editForm.formState.errors.nome && (
                                <p className="text-sm text-red-500">{editForm.formState.errors.nome.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-email">Email</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                {...editForm.register("email")}
                                className="bg-white"
                                placeholder="email@exemplo.com"
                            />
                            {editForm.formState.errors.email && (
                                <p className="text-sm text-red-500">{editForm.formState.errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-perfil">Perfil</Label>
                            <Select
                                onValueChange={(value) => editForm.setValue("perfil", value as "admin" | "visualizador")}
                                value={editForm.watch("perfil")}
                                defaultValue={editForm.getValues("perfil")}
                            >
                                <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="Selecione um perfil" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    <SelectItem value="visualizador">Visualizador</SelectItem>
                                    <SelectItem value="admin">Administrador</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Checkbox para resetar senha */}
                        <div className="flex items-center space-x-2 py-2">
                            <input
                                type="checkbox"
                                id="resetSenha"
                                checked={resetSenha}
                                onChange={(e) => {
                                    setResetSenha(e.target.checked);
                                    if (!e.target.checked) {
                                        editForm.setValue("senha", undefined);
                                    }
                                }}
                                className="rounded border-gray-300"
                            />
                            <Label htmlFor="resetSenha" className="text-sm cursor-pointer">
                                Resetar senha do usuário
                            </Label>
                        </div>

                        {/* Campo de nova senha (só aparece se marcar o checkbox) */}
                        {resetSenha && (
                            <div className="space-y-2">
                                <Label htmlFor="edit-senha">Nova Senha</Label>
                                <div className="relative">
                                    <Input
                                        id="edit-senha"
                                        type={showPassword ? "text" : "password"}
                                        {...editForm.register("senha")}
                                        className="bg-white"
                                        placeholder="********"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {editForm.formState.errors.senha && (
                                    <p className="text-sm text-red-500">{editForm.formState.errors.senha.message}</p>
                                )}
                            </div>
                        )}

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setModalAberto(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                className="bg-[#5D2A1A] hover:bg-[#4A2214] text-white"
                            >
                                Salvar Alterações
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}