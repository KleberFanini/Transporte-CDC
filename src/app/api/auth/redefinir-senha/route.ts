import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    console.log('🔑 [REDEFINIR SENHA] Iniciando redefinição...');

    try {
        const { token, novaSenha } = await req.json();

        console.log(`🔑 [REDEFINIR SENHA] Token recebido: ${token?.substring(0, 20)}...`);
        console.log(`🔑 [REDEFINIR SENHA] Nova senha: ${novaSenha ? '***' : 'NÃO FORNECIDA'}`);

        if (!token || !novaSenha) {
            console.log('❌ [REDEFINIR SENHA] Token ou senha não fornecidos');
            return NextResponse.json(
                { error: "Token e nova senha são obrigatórios" },
                { status: 400 }
            );
        }

        if (novaSenha.length < 6) {
            console.log('❌ [REDEFINIR SENHA] Senha muito curta');
            return NextResponse.json(
                { error: "Senha deve ter pelo menos 6 caracteres" },
                { status: 400 }
            );
        }

        // Buscar usuário com o token válido
        console.log('🔍 [REDEFINIR SENHA] Buscando usuário com token...');
        const usuario = await prisma.usuario.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: {
                    gt: new Date(),
                },
            },
        });

        if (!usuario) {
            console.log('❌ [REDEFINIR SENHA] Token inválido ou expirado');
            return NextResponse.json(
                { error: "Token inválido ou expirado" },
                { status: 400 }
            );
        }

        console.log(`✅ [REDEFINIR SENHA] Usuário encontrado: ${usuario.email}`);

        // Hash da nova senha
        console.log('🔐 [REDEFINIR SENHA] Gerando hash da nova senha...');
        const senhaHash = await bcrypt.hash(novaSenha, 10);
        console.log('✅ [REDEFINIR SENHA] Hash gerado!');

        // Atualizar senha e limpar token
        console.log('💾 [REDEFINIR SENHA] Atualizando senha...');
        await prisma.usuario.update({
            where: { id: usuario.id },
            data: {
                senha: senhaHash,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });
        console.log('✅ [REDEFINIR SENHA] Senha atualizada com sucesso!');

        return NextResponse.json({
            success: true,
            message: "Senha redefinida com sucesso!",
        });
    } catch (error) {
        console.error('❌ [REDEFINIR SENHA] Erro:', error);
        return NextResponse.json(
            { error: "Erro ao redefinir senha" },
            { status: 500 }
        );
    }
}