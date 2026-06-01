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

        const translados = await prisma.translado.groupBy({
            by: ['competencia'],
            where,
            _sum: {
                valorLiquido: true,
            },
            _count: {
                id: true,
            },
            orderBy: {
                competencia: 'asc',
            },
        });

        // Filtrar competências inválidas e ordenar
        const validTranslados = translados.filter(t => t.competencia && t.competencia.includes('/'));

        const sorted = validTranslados.sort((a, b) => {
            if (!a.competencia) return 1;
            if (!b.competencia) return -1;
            const [mesA, anoA] = a.competencia.split('/');
            const [mesB, anoB] = b.competencia.split('/');
            const dataA = new Date(parseInt(anoA), parseInt(mesA) - 1);
            const dataB = new Date(parseInt(anoB), parseInt(mesB) - 1);
            return dataA.getTime() - dataB.getTime();
        });

        const resultado = sorted.map(t => ({
            mes: t.competencia || 'Não definido',
            valor: t._sum.valorLiquido || 0,
            viagens: t._count.id,
        }));

        return NextResponse.json(resultado);
    } catch (error) {
        console.error("Erro ao buscar evolução mensal:", error);
        return NextResponse.json([], { status: 500 });
    }
}