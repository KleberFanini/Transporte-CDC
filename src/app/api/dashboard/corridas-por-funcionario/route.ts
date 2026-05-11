import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const nomeCompleto = searchParams.get('nomeCompleto');
        const dataInicioStr = searchParams.get('dataInicio');
        const dataFimStr = searchParams.get('dataFim');

        console.log('📊 Parâmetros recebidos:', { nomeCompleto, dataInicioStr, dataFimStr });

        if (!nomeCompleto) {
            return NextResponse.json(
                { error: 'Nome do funcionário é obrigatório' },
                { status: 400 }
            );
        }

        const where: any = {
            nomeCompleto: nomeCompleto,
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

        console.log('🔍 Where clause:', JSON.stringify(where));

        console.log(`🔍 Buscando corridas para: ${nomeCompleto}`);

        const corridas = await prisma.corrida.findMany({
            where,
            orderBy: { dataSolicitacao: 'desc' },
            select: {
                id: true,
                dataSolicitacao: true,
                horaSolicitacao: true,
                horaChegada: true,
                enderecoPartida: true,
                enderecoDestino: true,
                servico: true,
                detalhamentoDespesa: true,
                valorTotal: true,
                distanciaMetros: true,
                plataforma: true,
            },
        });

        console.log(`📊 Encontradas ${corridas.length} corridas`);

        // Formatar os dados
        const MILHAS_PARA_KM = 1.60934;

        const dados = corridas.map(c => {
            let distanciaKm = 0;

            if (c.distanciaMetros) {
                if (c.plataforma === 'UBER') {
                    distanciaKm = Number((c.distanciaMetros * MILHAS_PARA_KM).toFixed(1));
                } else if (c.plataforma === 'NOVE_NOVE') {
                    distanciaKm = Number((c.distanciaMetros / 1000).toFixed(1));
                } else {
                    distanciaKm = Number((c.distanciaMetros / 1000).toFixed(1));
                }
            }

            return {
                id: c.id,
                dataSolicitacao: c.dataSolicitacao ? c.dataSolicitacao.toISOString() : '',
                horaSolicitacao: c.horaSolicitacao || '',
                horaChegada: c.horaChegada || '',
                enderecoPartida: c.enderecoPartida || '',
                enderecoDestino: c.enderecoDestino || '',
                servico: c.servico || '',
                detalhamentoDespesa: c.detalhamentoDespesa || '',
                valorTotal: c.valorTotal ? Number(c.valorTotal) : 0,
                distanciaKm: distanciaKm,
                plataforma: c.plataforma || '',
            };
        });

        return NextResponse.json(dados);
    } catch (error) {
        console.error('❌ Erro ao buscar corridas:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar dados' },
            { status: 500 }
        );
    }
}