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
            },
        });

        console.log(`📊 Encontradas ${corridas.length} corridas`);

        // Formatar os dados
        const dados = corridas.map(c => ({
            id: c.id,
            dataSolicitacao: c.dataSolicitacao ? c.dataSolicitacao.toISOString() : '',
            horaSolicitacao: c.horaSolicitacao || '',
            horaChegada: c.horaChegada || '',
            enderecoPartida: c.enderecoPartida || '',
            enderecoDestino: c.enderecoDestino || '',
            servico: c.servico || '',
            detalhamentoDespesa: c.detalhamentoDespesa || '',
            valorTotal: c.valorTotal ? Number(c.valorTotal) : 0,
        }));

        return NextResponse.json(dados);
    } catch (error) {
        console.error('❌ Erro ao buscar corridas:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar dados' },
            { status: 500 }
        );
    }
}