import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    console.log('🔍 [VALIDAR TOKEN] Iniciando validação...');

    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get("token");

        console.log(`🔍 [VALIDAR TOKEN] Token recebido: ${token?.substring(0, 20)}...`);

        if (!token) {
            console.log('❌ [VALIDAR TOKEN] Token não fornecido');
            return NextResponse.json(
                { valid: false, message: "Token não fornecido" },
                { status: 400 }
            );
        }

        // Buscar usuário com o token
        console.log('🔍 [VALIDAR TOKEN] Buscando usuário com token...');
        const usuario = await prisma.usuario.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: {
                    gt: new Date(), // Token ainda não expirou
                },
            },
        });

        if (!usuario) {
            console.log('❌ [VALIDAR TOKEN] Token inválido ou expirado');
            return NextResponse.json(
                { valid: false, message: "Token inválido ou expirado" },
                { status: 400 }
            );
        }

        console.log(`✅ [VALIDAR TOKEN] Token válido para usuário: ${usuario.email}`);
        console.log(`⏰ [VALIDAR TOKEN] Expira em: ${usuario.resetTokenExpiry}`);

        return NextResponse.json({ valid: true });
    } catch (error) {
        console.error('❌ [VALIDAR TOKEN] Erro:', error);
        return NextResponse.json(
            { valid: false, message: "Erro ao validar token" },
            { status: 500 }
        );
    }
}