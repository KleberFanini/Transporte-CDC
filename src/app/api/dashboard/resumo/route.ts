import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const dataInicioStr = searchParams.get('dataInicio');
        const dataFimStr = searchParams.get('dataFim');

        console.log('📅 Data Início:', dataInicioStr);
        console.log('📅 Data Fim:', dataFimStr);

        // Construir o where dinamicamente
        const where: any = {};

        if (dataInicioStr) {
            const dataInicio = new Date(dataInicioStr);
            dataInicio.setHours(0, 0, 0, 0);
            where.dataSolicitacao = {
                gte: dataInicio,
            };
        }

        if (dataFimStr) {
            const dataFim = new Date(dataFimStr);
            dataFim.setHours(23, 59, 59, 999);
            where.dataSolicitacao = {
                ...where.dataSolicitacao,
                lte: dataFim,
            };
        }

        console.log('🔍 Where clause:', JSON.stringify(where));

        // Buscar corridas
        const corridas = await prisma.corrida.findMany({
            where: where,
        });

        console.log('📊 Corridas encontradas:', corridas.length);

        // Calcular somatórios
        let valorTotal = 0;
        let distanciaTotal = 0;
        let tempoTotal = 0;

        for (const corrida of corridas) {
            if (corrida.valorTotal) {
                valorTotal += Number(corrida.valorTotal);
            }
            if (corrida.distanciaMetros) {
                distanciaTotal += corrida.distanciaMetros / 1000;
            }
            if (corrida.duracaoMinutos) {
                tempoTotal += corrida.duracaoMinutos;
            }
        }

        // Buscar funcionários distintos
        const funcionariosDistintos = await prisma.corrida.groupBy({
            by: ['nomeCompleto'],
            where: {
                nomeCompleto: { not: null },
                ...where,
            },
        });

        // Buscar grupos distintos
        const gruposDistintos = await prisma.corrida.groupBy({
            by: ['grupo'],
            where: {
                grupo: { not: null },
                ...where,
            },
        });

        const resultado = {
            totalViagens: corridas.length,
            valorTotal: valorTotal,
            funcionariosAtivos: funcionariosDistintos.length,
            grupos: gruposDistintos.length,
            distanciaTotal: distanciaTotal,
            tempoTotal: tempoTotal,
        };

        console.log('📊 Resultado final:', resultado);

        return NextResponse.json(resultado);
    } catch (error) {
        console.error('❌ Erro ao buscar resumo:', error);
        return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 });
    }
}