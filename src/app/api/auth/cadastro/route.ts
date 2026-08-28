import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "@/lib/email";
import crypto from "crypto";

// Gerar token aleatório seguro
function generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { nome, email, senha } = body;

        // Validações
        if (!nome || !email || !senha) {
            return NextResponse.json(
                { error: "Nome, email e senha são obrigatórios" },
                { status: 400 }
            );
        }

        // Verificar se email já existe
        const usuarioExistente = await prisma.usuario.findUnique({
            where: { email }
        });

        if (usuarioExistente) {
            return NextResponse.json(
                { error: "Email já cadastrado" },
                { status: 400 }
            );
        }

        // Hash da senha
        const senhaHash = await bcrypt.hash(senha, 10);

        // Gerar token para definição de senha
        const resetToken = generateResetToken();

        // Verificar se é o primeiro usuário (se for, criar como admin)
        const totalUsuarios = await prisma.usuario.count();
        const perfil = totalUsuarios === 0 ? 'admin' : 'visualizador';

        // Criar usuário
        const usuario = await prisma.usuario.create({
            data: {
                nome,
                email,
                senha: senhaHash,
                perfil,
                status: 'ATIVO',
                resetToken: resetToken,
                resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000),
            },
            select: {
                id: true,
                nome: true,
                email: true,
                perfil: true,
                status: true,
                criadoEm: true,
            },
        });

        // Enviar email de boas-vindas com link para definir senha
        try {
            await sendWelcomeEmail(email, nome, resetToken);
            console.log(`✅ Email de boas-vindas enviado para ${email}`);
        } catch (emailError) {
            console.error(`❌ Erro ao enviar email de boas-vindas para ${email}:`, emailError);
            // Não falha o cadastro se o email não enviar
        }

        return NextResponse.json({
            message: "Usuário criado com sucesso! Um email foi enviado para definir a senha.",
            usuario,
        });
    } catch (error) {
        console.error("Erro ao criar usuário:", error);
        return NextResponse.json(
            { error: "Erro ao criar usuário" },
            { status: 500 }
        );
    }
}