import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function formatarData(date: Date | null): string {
    if (!date) return '';
    const dia = date.getDate().toString().padStart(2, '0');
    const mes = (date.getMonth() + 1).toString().padStart(2, '0');
    const ano = date.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '10');

        const viagens = await prisma.corrida.findMany({
            take: limit,
            orderBy: {
                dataSolicitacao: 'desc',
            },
        });

        const dados = viagens.map((v) => ({
            id: v.id,
            funcionario: v.nomeCompleto || 'N/A',
            grupo: v.grupo || '',
            programa: v.programa || '',
            servico: v.servico || '',
            dataSolicitacao: formatarData(v.dataSolicitacao),
            horaSolicitacao: v.horaSolicitacao || '',
            dataChegada: formatarData(v.dataChegada),
            horaChegada: v.horaChegada || '',
            partida: v.enderecoPartida || '',
            destino: v.enderecoDestino || '',
            distancia: v.distanciaMetros ? v.distanciaMetros / 1000 : 0,
            duracao: v.duracaoMinutos || 0,
            valor: v.valorTotal ? Number(v.valorTotal) : 0,
        }));

        return NextResponse.json(dados);
    } catch (error) {
        console.error('Erro ao buscar últimas viagens:', error);
        return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 });
    }
}