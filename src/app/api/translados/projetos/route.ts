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

        const projetos = await prisma.translado.groupBy({
            by: ['projetoOrigem'],
            where,
            _sum: {
                valorLiquido: true,
            },
            _count: {
                id: true,
            },
            orderBy: {
                _sum: {
                    valorLiquido: 'desc',
                },
            },
        });

        const resultado = projetos.map(p => ({
            nome: p.projetoOrigem || 'Não especificado',
            valor: p._sum.valorLiquido || 0,
            viagens: p._count.id,
        }));

        return NextResponse.json(resultado);
    } catch (error) {
        console.error("Erro ao buscar projetos:", error);
        return NextResponse.json([], { status: 500 });
    }
}