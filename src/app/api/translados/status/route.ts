import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const dataInicio = searchParams.get("dataInicio");
        const dataFim = searchParams.get("dataFim");

        const where: any = {};

        if (dataInicio && dataInicio !== "") {
            const inicioDate = new Date(dataInicio);
            inicioDate.setHours(0, 0, 0, 0);
            where.dataVencimento = { gte: inicioDate };
        }

        if (dataFim && dataFim !== "") {
            const fimDate = new Date(dataFim);
            fimDate.setHours(23, 59, 59, 999);
            where.dataVencimento = { ...where.dataVencimento, lte: fimDate };
        }

        const status = await prisma.translado.groupBy({
            by: ['statusAprovacao'],
            where,
            _sum: {
                valorLiquido: true,
            },
            _count: {
                id: true,
            },
        });

        const resultado = status.map(s => ({
            status: s.statusAprovacao || 'Pendente',
            quantidade: s._count.id,
            valor: s._sum.valorLiquido || 0,
        }));

        return NextResponse.json(resultado);
    } catch (error) {
        console.error("Erro ao buscar status:", error);
        return NextResponse.json([], { status: 500 });
    }
}