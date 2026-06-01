import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const dataInicio = searchParams.get("dataInicio");
        const dataFim = searchParams.get("dataFim");

        // Construir filtro de data
        const where: any = {};

        if (dataInicio) {
            const inicioDate = new Date(dataInicio);
            inicioDate.setHours(0, 0, 0, 0);
            where.dataVencimento = { gte: inicioDate };
        }

        if (dataFim) {
            const fimDate = new Date(dataFim);
            fimDate.setHours(23, 59, 59, 999);
            where.dataVencimento = { ...where.dataVencimento, lte: fimDate };
        }

        console.log("Filtros aplicados:", { dataInicio, dataFim, where });

        // Total de translados
        const totalTranslados = await prisma.translado.count({ where });

        // Valor total (soma do valor líquido)
        const somaValores = await prisma.translado.aggregate({
            where,
            _sum: {
                valorLiquido: true,
            },
        });

        // Valor total por projeto (com filtro de data)
        const valoresPorProjeto = await prisma.translado.groupBy({
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
            take: 10,
        });

        // Translados por mês/competência (com filtro de data)
        const transladosPorMes = await prisma.translado.groupBy({
            by: ['competencia'],
            where,
            _sum: {
                valorLiquido: true,
            },
            _count: {
                id: true,
            },
            orderBy: {
                competencia: 'desc',
            },
            take: 12,
        });

        // Top fornecedores (com filtro de data)
        const topFornecedores = await prisma.translado.groupBy({
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
            take: 5,
        });

        // Status de aprovação (com filtro de data)
        const statusAprovacao = await prisma.translado.groupBy({
            by: ['statusAprovacao'],
            where,
            _count: {
                id: true,
            },
            _sum: {
                valorLiquido: true,
            },
        });

        // Valor médio por translado
        const valorMedio = totalTranslados > 0
            ? (somaValores._sum.valorLiquido || 0) / totalTranslados
            : 0;

        // Ordenar transladosPorMes cronologicamente
        const sortedTransladosPorMes = [...transladosPorMes].sort((a, b) => {
            if (!a.competencia) return 1;
            if (!b.competencia) return -1;
            const [mesA, anoA] = a.competencia.split('/');
            const [mesB, anoB] = b.competencia.split('/');
            const dataA = new Date(parseInt(anoA), parseInt(mesA) - 1);
            const dataB = new Date(parseInt(anoB), parseInt(mesB) - 1);
            return dataA.getTime() - dataB.getTime();
        });

        return NextResponse.json({
            success: true,
            data: {
                totalTranslados,
                valorTotal: somaValores._sum.valorLiquido || 0,
                valorMedio: Number(valorMedio.toFixed(2)),
                valoresPorProjeto: valoresPorProjeto.map(item => ({
                    projeto: item.projetoOrigem || 'Não especificado',
                    valor: item._sum.valorLiquido || 0,
                    quantidade: item._count.id,
                })),
                transladosPorMes: sortedTransladosPorMes.map(item => ({
                    mes: item.competencia || 'Não definido',
                    valor: item._sum.valorLiquido || 0,
                    quantidade: item._count.id,
                })),
                topFornecedores: topFornecedores.map(item => ({
                    fornecedor: item.fornecedor || 'Não especificado',
                    valor: item._sum.valorLiquido || 0,
                    quantidade: item._count.id,
                })),
                statusAprovacao: statusAprovacao.map(item => ({
                    status: item.statusAprovacao || 'Não informado',
                    quantidade: item._count.id,
                    valor: item._sum.valorLiquido || 0,
                })),
            },
        });
    } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
        return NextResponse.json(
            { error: "Erro ao buscar dados", success: false },
            { status: 500 }
        );
    }
}