import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const dataInicioStr = searchParams.get('dataInicio');
        const dataFimStr = searchParams.get('dataFim');
        const plataforma = searchParams.get('plataforma');
        const status = searchParams.get('status');
        const programa = searchParams.get('programa');

        const where: any = {
            cidade: { not: null },
        };

        if (plataforma && plataforma !== 'todos') {
            where.plataforma = plataforma;
        }

        if (status && status !== 'todos') {
            where.status = status;
        }

        if (programa && programa !== 'todos') {
            where.programa = programa;
        }

        if (dataInicioStr) {
            const dataInicio = new Date(dataInicioStr);
            if (!isNaN(dataInicio.getTime())) {
                dataInicio.setHours(0, 0, 0, 0);
                where.dataSolicitacao = { gte: dataInicio };
            }
        }

        if (dataFimStr) {
            const dataFim = new Date(dataFimStr);
            if (!isNaN(dataFim.getTime())) {
                dataFim.setHours(23, 59, 59, 999);
                where.dataSolicitacao = { ...where.dataSolicitacao, lte: dataFim };
            }
        }

        // Buscar todas as corridas
        const corridas = await prisma.corrida.findMany({
            where,
            select: {
                cidade: true,
                valorTotal: true,
            },
        });

        // Agrupar por cidade manualmente
        const cidadesMap = new Map<string, { viagens: number; valor: number }>();

        corridas.forEach(c => {
            const cidade = c.cidade as string;
            if (!cidade) return; // Pular cidades vazias

            if (!cidadesMap.has(cidade)) {
                cidadesMap.set(cidade, { viagens: 0, valor: 0 });
            }
            const item = cidadesMap.get(cidade)!;
            item.viagens++;
            if (c.valorTotal) {
                item.valor += Number(c.valorTotal);
            }
        });

        const dados = Array.from(cidadesMap.entries()).map(([nome, data]) => ({
            nome,
            viagens: data.viagens,
            valor: data.valor,
        }));

        console.log('Cidades encontradas:', dados.length);

        return NextResponse.json(dados);
    } catch (error) {
        console.error('Erro ao buscar cidades:', error);
        return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 });
    }
}