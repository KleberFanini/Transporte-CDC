import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { status } = await request.json();

        // Validar se o status é válido
        if (!["ATIVO", "DESATIVADO"].includes(status)) {
            return NextResponse.json(
                { error: "Status inválido" },
                { status: 400 }
            );
        }

        const usuario = await prisma.usuario.update({
            where: { id: Number(id) },
            data: { status },
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
        console.error("Erro ao atualizar status:", error);
        return NextResponse.json(
            { error: "Erro ao atualizar status" },
            { status: 500 }
        );
    }
}