import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const dataInicioStr = searchParams.get('dataInicio');
        const dataFimStr = searchParams.get('dataFim');
        const plataforma = searchParams.get('plataforma');

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
        if (plataforma && plataforma !== 'todos') {
            where.plataforma = plataforma;
        }

        const programas = await prisma.corrida.groupBy({
            by: ['programa'],
            where,
        });

        const nomes = programas
            .map(p => p.programa)
            .filter(p => p !== null);

        return NextResponse.json(nomes);
    } catch (error) {
        console.error('Erro ao buscar programas:', error);
        return NextResponse.json([], { status: 500 });
    }
}