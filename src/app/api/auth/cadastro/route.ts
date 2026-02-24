import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { criarToken } from "@/lib/jwt";

const bodySchema = z.object({
    nome: z.string().min(6, "Nome deve ter no mínimo 6 caracteres"),
    email: z.string().email("Email inválido"),
    senha: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
});

export async function POST(req: Request) {
    try {
        // Verifica se consegue ler o JSON
        let json;
        try {
            json = await req.json();
        } catch (e) {
            return NextResponse.json(
                { error: "JSON inválido no corpo da requisição" },
                { status: 400 }
            );
        }

        // Valida com Zod
        const result = bodySchema.safeParse(json);

        if (!result.success) {
            return NextResponse.json(
                {
                    error: "Dados inválidos",
                    detalhes: result.error.issues.map(i => ({
                        campo: i.path.join('.'),
                        mensagem: i.message
                    }))
                },
                { status: 400 }
            );
        }

        const body = result.data;

        // Verifica se usuário existe
        const existe = await prisma.usuario.findUnique({
            where: { email: body.email }
        });

        if (existe) {
            return NextResponse.json(
                { error: "Email já cadastrado!" },
                { status: 409 }
            );
        }

        // Cria hash da senha
        const hash = await bcrypt.hash(body.senha, 10);

        // Cria usuário
        const usuario = await prisma.usuario.create({
            data: {
                nome: body.nome,
                email: body.email,
                senha: hash,
                perfil: "visualizador",
            },
            select: {
                id: true,
                nome: true,
                email: true,
                perfil: true,
            }
        });

        // Gera token JWT
        const token = await criarToken({
            sub: usuario.id,
            email: usuario.email,
            perfil: usuario.perfil,
        });

        return NextResponse.json(
            { usuario, token },
            { status: 201 }
        );

    } catch (error) {
        console.error("Erro no cadastro:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}