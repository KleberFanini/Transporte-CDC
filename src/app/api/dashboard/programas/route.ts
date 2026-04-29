import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const dataInicioStr = searchParams.get('dataInicio');
        const dataFimStr = searchParams.get('dataFim');

        // Construir where
        const where: any = {
            programa: { not: null },
        };

        if (dataInicioStr) {
            const dataInicio = new Date(dataInicioStr);
            dataInicio.setHours(0, 0, 0, 0);
            where.dataSolicitacao = { gte: dataInicio };
        }

        if (dataFimStr) {
            const dataFim = new Date(dataFimStr);
            dataFim.setHours(23, 59, 59, 999);
            where.dataSolicitacao = { ...where.dataSolicitacao, lte: dataFim };
        }

        const programas = await prisma.corrida.groupBy({
            by: ['programa'],
            where,
            _sum: { valorTotal: true },
            _count: true,
        });

        const dados = programas.map(p => ({
            nome: p.programa,
            valor: p._sum.valorTotal ? Number(p._sum.valorTotal) : 0,
            viagens: p._count,
        }));

        return NextResponse.json(dados);
    } catch (error) {
        console.error('Erro ao buscar programas:', error);
        return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 });
    }
}