import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { criarToken } from "@/lib/jwt";

const bodySchema = z.object({
    email: z.string().email("Email inválido"),
    senha: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
});

export async function POST(req: Request) {
    try {
        // 1. Parse do JSON com tratamento de erro
        let json;
        try {
            json = await req.json();
        } catch {
            return NextResponse.json(
                { error: "Formato de dados inválido" },
                { status: 400 }
            );
        }

        // 2. Validação com Zod e mensagens amigáveis
        const result = bodySchema.safeParse(json);

        if (!result.success) {
            return NextResponse.json(
                {
                    error: "Dados inválidos",
                    detalhes: result.error.issues.map(issue => ({
                        campo: issue.path[0],
                        mensagem: issue.message
                    }))
                },
                { status: 400 }
            );
        }

        const { email, senha } = result.data;

        // 3. Busca usuário com select explícito (mais seguro)
        const usuario = await prisma.usuario.findUnique({
            where: { email },
            select: {
                id: true,
                nome: true,
                email: true,
                senha: true,
                perfil: true,
            }
        });

        // 4. Mensagem genérica por segurança (não revela se email existe)
        if (!usuario) {
            return NextResponse.json(
                { error: "Email ou senha inválidos" },
                { status: 401 }
            );
        }

        // 5. Verifica senha
        const senhaValida = await bcrypt.compare(senha, usuario.senha);

        if (!senhaValida) {
            return NextResponse.json(
                { error: "Email ou senha inválidos" },
                { status: 401 }
            );
        }

        // 6. Gera token
        const token = await criarToken({
            sub: usuario.id,
            email: usuario.email,
            perfil: usuario.perfil,
        });

        // 7. Remove senha do objeto de retorno
        const { senha: _, ...usuarioSemSenha } = usuario;

        // 8. Retorna sucesso
        return NextResponse.json(
            {
                usuario: usuarioSemSenha,
                token,
                message: "Login realizado com sucesso"
            },
            {
                status: 200,
                headers: {
                    // Opcional: adicionar token no header também
                    'Authorization': `Bearer ${token}`
                }
            }
        );

    } catch (error) {
        // 9. Log do erro para debug
        console.error("Erro no login:", error);

        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}