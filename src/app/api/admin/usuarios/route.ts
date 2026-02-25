import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET - Listar todos os usuários
export async function GET() {
    try {
        const usuarios = await prisma.usuario.findMany({
            select: {
                id: true,
                nome: true,
                email: true,
                perfil: true,
                status: true,
                criadoEm: true,
            },
            orderBy: { criadoEm: "desc" },
        });

        return NextResponse.json(usuarios);
    } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        return NextResponse.json(
            { error: "Erro ao buscar usuários" },
            { status: 500 }
        );
    }
}

// POST - Criar novo usuário
export async function POST(request: Request) {
    try {
        const { nome, email, senha, perfil } = await request.json();

        // Validar se email já existe
        const existe = await prisma.usuario.findUnique({
            where: { email },
        });

        if (existe) {
            return NextResponse.json(
                { error: "Email já cadastrado" },
                { status: 400 }
            );
        }

        const hash = await bcrypt.hash(senha, 10);

        const usuario = await prisma.usuario.create({
            data: {
                nome,
                email,
                senha: hash,
                perfil,
                status: "ATIVO",
            },
            select: {
                id: true,
                nome: true,
                email: true,
                perfil: true,
                status: true,
            },
        });

        return NextResponse.json(usuario, { status: 201 });
    } catch (error) {
        console.error("Erro ao criar usuário:", error);
        return NextResponse.json(
            { error: "Erro ao criar usuário" },
            { status: 500 }
        );
    }
}