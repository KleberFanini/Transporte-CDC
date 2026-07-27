import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";

function generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

export async function POST(req: NextRequest) {
    console.log('========================================');
    console.log('📧 [RECUPERAR SENHA] INICIANDO PROCESSO');
    console.log('========================================');

    try {
        console.log('📥 Lendo body da requisição...');
        const body = await req.json();
        console.log('📦 Body recebido:', body);

        const { email } = body;
        console.log(`📧 Email recebido: "${email}"`);

        if (!email) {
            console.log('❌ Email não fornecido');
            return NextResponse.json(
                { error: "Email é obrigatório" },
                { status: 400 }
            );
        }

        console.log('🔍 Buscando usuário no banco...');
        const usuario = await prisma.usuario.findUnique({
            where: { email },
        });
        console.log('👤 Resultado da busca:', usuario ? 'Usuário encontrado' : 'Usuário NÃO encontrado');

        if (!usuario) {
            console.log(`⚠️ Usuário não encontrado: ${email}`);
            return NextResponse.json({
                success: true,
                message: "Se o email existir, enviaremos um link de redefinição."
            });
        }

        console.log(`✅ Usuário encontrado: ${usuario.email} (ID: ${usuario.id})`);

        console.log('🔑 Gerando token...');
        const resetToken = generateResetToken();
        console.log(`🔑 Token gerado: ${resetToken.substring(0, 30)}...`);

        console.log('💾 Salvando token no banco...');
        const updateResult = await prisma.usuario.update({
            where: { id: usuario.id },
            data: {
                resetToken: resetToken,
                resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000),
            },
        });
        console.log('✅ Token salvo!');
        console.log(`📅 Expira em: ${updateResult.resetTokenExpiry}`);

        console.log('📧 Enviando email...');
        const emailResult = await sendPasswordResetEmail(email, resetToken);
        console.log('✅ Email enviado!', emailResult);

        console.log('========================================');
        console.log('✅ [RECUPERAR SENHA] FINALIZADO COM SUCESSO');
        console.log('========================================');

        return NextResponse.json({
            success: true,
            message: "Email de recuperação enviado com sucesso!"
        });

    } catch (error) {
        console.error('========================================');
        console.error('❌ [RECUPERAR SENHA] ERRO:', error);
        console.error('========================================');
        return NextResponse.json(
            { error: "Erro ao processar solicitação" },
            { status: 500 }
        );
    }
}