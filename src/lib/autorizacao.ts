import { auth } from "@/auth";

export async function exigirLogin() {
    const sessao = await auth();
    if (!sessao?.user) throw new Error("NAO_AUTENTICADO");
    return sessao;
}

export async function exigirPerfil(perfis: Array<"admin" | "visualizador">) {
    const sessao = await exigirLogin();
    const perfil = (sessao.user as any).perfil as "admin" | "visualizador" | undefined;
    if (!perfil || !perfis.includes(perfil)) throw new Error("SEM_PERMISSAO");
    return sessao;
}