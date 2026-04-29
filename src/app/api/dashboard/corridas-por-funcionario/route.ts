import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const nomeCompleto = searchParams.get('nomeCompleto');

        if (!nomeCompleto) {
            return NextResponse.json(
                { error: 'Nome do funcionário é obrigatório' },
                { status: 400 }
            );
        }

        console.log(`🔍 Buscando corridas para: ${nomeCompleto}`);

        const corridas = await prisma.corrida.findMany({
            where: {
                nomeCompleto: nomeCompleto,
            },
            orderBy: {
                dataSolicitacao: 'desc',
            },
            select: {
                id: true,
                dataSolicitacao: true,
                horaSolicitacao: true,
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