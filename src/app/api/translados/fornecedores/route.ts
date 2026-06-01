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

        const fornecedores = await prisma.translado.groupBy({
            by: ['fornecedor'],
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
            take: 10,
        });

        const resultado = fornecedores.map(f => ({
            nome: f.fornecedor || 'Não especificado',
            valor: f._sum.valorLiquido || 0,
            quantidade: f._count.id,
        }));

        return NextResponse.json(resultado);
    } catch (error) {
        console.error("Erro ao buscar fornecedores:", error);
        return NextResponse.json([], { status: 500 });
    }
}