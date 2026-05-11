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

        const dados = corridas.map(c => {
            let distanciaKm = 0;

            if (c.distanciaMetros) {
                const valorDistancia = Number(c.distanciaMetros);

                distanciaKm = valorDistancia;

                console.log(`Plataforma: ${c.plataforma}, Banco: ${valorDistancia}, Exibido: ${distanciaKm} km`);
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
                distanciaKm: c.distanciaMetros,
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