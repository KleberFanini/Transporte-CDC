import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const nomeCompleto = searchParams.get('nomeCompleto');
        const dataInicioStr = searchParams.get('dataInicio');
        const dataFimStr = searchParams.get('dataFim');
        const programa = searchParams.get('programa');

        if (!nomeCompleto) {
            return NextResponse.json(
                { error: 'Nome do funcionário é obrigatório' },
                { status: 400 }
            );
        }

        const where: any = {
            nomeCompleto: nomeCompleto,
        };

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

        if (programa && programa !== 'todos') {
            where.programa = programa;
        }

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

        const MILHAS_PARA_KM = 1.60934;

        const dados = corridas.map(c => {
            let distanciaKm = 0;

            if (c.distanciaMetros) {
                // 👇 CONVERTER Decimal PARA NUMBER
                const valorDistancia = Number(c.distanciaMetros);

                if (c.plataforma === 'UBER') {
                    // UBER: está em MILHAS → converter para KM
                    distanciaKm = Number((valorDistancia * MILHAS_PARA_KM).toFixed(1));
                } else if (c.plataforma === 'NOVE_NOVE') {
                    // 99: já está em KM
                    distanciaKm = Number(valorDistancia.toFixed(1));
                } else {
                    // Fallback: assume que está em metros
                    distanciaKm = Number((valorDistancia / 1000).toFixed(1));
                }
            }

            console.log(`📏 Corrida ${c.id}: ${c.plataforma} - ${c.distanciaMetros} -> ${distanciaKm} km`);

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