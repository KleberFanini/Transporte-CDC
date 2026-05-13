import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { corridaStatus } from '@prisma/client';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const dataInicioStr = searchParams.get('dataInicio');
        const dataFimStr = searchParams.get('dataFim');
        const plataforma = searchParams.get('plataforma');
        const grupo = searchParams.get('grupo');
        const programa = searchParams.get('programa');
        const statusParam = searchParams.get('status');

        console.log('📅 Parâmetros recebidos:', {
            dataInicioStr,
            dataFimStr,
            plataforma,
            grupo,
            programa,
            statusParam
        });

        // Construir o where dinamicamente
        const where: any = {};

        if (plataforma && plataforma !== 'todos') {
            where.plataforma = plataforma;
        }

        if (grupo && grupo !== 'todos' && grupo !== '') {
            where.grupo = grupo;
        }

        if (programa && programa !== 'todos' && programa !== '') {
            where.programa = programa;
        }

        // 👇 FILTRO DE STATUS - CORRIGIDO
        if (statusParam && statusParam !== 'todos') {
            where.status = statusParam; // Como string, mas o Prisma aceita
            console.log(`🔍 Aplicando filtro de status: ${statusParam}`);
        }

        if (dataInicioStr && dataInicioStr !== '') {
            const dataInicio = new Date(dataInicioStr);
            if (!isNaN(dataInicio.getTime())) {
                dataInicio.setHours(0, 0, 0, 0);
                where.dataSolicitacao = { gte: dataInicio };
            }
        }

        if (dataFimStr && dataFimStr !== '') {
            const dataFim = new Date(dataFimStr);
            if (!isNaN(dataFim.getTime())) {
                dataFim.setHours(23, 59, 59, 999);
                where.dataSolicitacao = { ...where.dataSolicitacao, lte: dataFim };
            }
        }

        console.log('🔍 Where clause final:', JSON.stringify(where, null, 2));

        // Buscar corridas
        const corridas = await prisma.corrida.findMany({
            where: where,
        });

        console.log(`📊 Corridas encontradas: ${corridas.length}`);

        // Log dos primeiros status para debug
        if (corridas.length > 0) {
            const primeirosStatus = [...new Set(corridas.slice(0, 10).map(c => c.status))];
            console.log(`📊 Status encontrados: ${primeirosStatus.join(', ')}`);
        }

        // Calcular somatórios
        let valorTotal = 0;
        let distanciaTotal = 0;
        let tempoTotal = 0;

        for (const corrida of corridas) {
            if (corrida.valorTotal) {
                valorTotal += Number(corrida.valorTotal);
            }
            if (corrida.distanciaMetros) {
                distanciaTotal += Number(corrida.distanciaMetros);
            }
            if (corrida.duracaoMinutos && corrida.duracaoMinutos > 0) {
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