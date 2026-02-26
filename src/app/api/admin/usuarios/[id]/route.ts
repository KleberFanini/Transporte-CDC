import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET - Buscar um usuário específico
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // 👈 TIPO COMO PROMISE
) {
    try {
        const { id } = await params; // 👈 AWAIT AQUI
        const usuario = await prisma.usuario.findUnique({
            where: { id: Number(id) },
            select: {
                id: true,
                nome: true,
                email: true,
                perfil: true,
                status: true,
            },
        });

        if (!usuario) {
            return NextResponse.json(
                { error: "Usuário não encontrado" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            ...usuario,
            id: String(usuario.id),
        });
    } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        return NextResponse.json(
            { error: "Erro ao buscar usuário" },
            { status: 500 }
        );
    }
}

// PUT - Atualizar usuário
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // 👈 TIPO COMO PROMISE
) {
    try {
        const { id } = await params; // 👈 AWAIT AQUI
        const { nome, email, perfil, senha } = await request.json();

        // Verificar se email já existe para outro usuário
        const existe = await prisma.usuario.findFirst({
            where: {
                email,
                NOT: {
                    id: {
                        equals: Number(id) // 👈 AGORA USA id
                    }
                }
            }
        });

        if (existe) {
            return NextResponse.json(
                { error: "Email já está em uso" },
                { status: 400 }
            );
        }

        // Preparar dados para atualização
        const dadosAtualizacao: any = {
            nome,
            email,
            perfil,
        };

        // Se veio senha, fazer hash e atualizar
        if (senha) {
            dadosAtualizacao.senha = await bcrypt.hash(senha, 10);
        }

        const usuario = await prisma.usuario.update({
            where: { id: Number(id) },
            data: dadosAtualizacao,
            select: {
                id: true,
                nome: true,
                email: true,
                perfil: true,
                status: true,
            },
        });

        return NextResponse.json({
            ...usuario,
            id: String(usuario.id),
        });
    } catch (error) {
        console.error("Erro ao atualizar usuário:", error);
        return NextResponse.json(
            { error: "Erro ao atualizar usuário" },
            { status: 500 }
        );
    }
}

// DELETE - Deletar usuário
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // 👈 TIPO COMO PROMISE
) {
    try {
        const { id } = await params; // 👈 AWAIT AQUI
        await prisma.usuario.delete({
            where: { id: Number(id) },
        });

        return NextResponse.json({ message: "Usuário deletado com sucesso" });
    } catch (error) {
        console.error("Erro ao deletar usuário:", error);
        return NextResponse.json(
            { error: "Erro ao deletar usuário" },
            { status: 500 }
        );
    }
}