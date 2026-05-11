import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '10');
        const dataInicioStr = searchParams.get('dataInicio');
        const dataFimStr = searchParams.get('dataFim');
        const plataforma = searchParams.get('plataforma');

        // Construir where
        const where: any = {};

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

        if (plataforma && plataforma !== 'todos') {
            where.plataforma = plataforma;
        }

        const viagens = await prisma.corrida.findMany({
            where,
            take: limit,
            orderBy: {
                dataSolicitacao: 'desc',
            },
        });

        const formatarData = (date: Date | null): string => {
            if (!date) return '';
            return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
        };

        const dados = viagens.map((v) => {
            // 👇 CONVERTER Decimal PARA NUMBER
            let distancia = 0;
            if (v.distanciaMetros) {
                const valorDistancia = Number(v.distanciaMetros);
                // Se o valor for muito grande (> 1000), provavelmente está em metros, converte para km
                if (valorDistancia > 1000) {
                    distancia = Number((valorDistancia / 1000).toFixed(1));
                } else {
                    // Senão, já está em km
                    distancia = Number(valorDistancia.toFixed(1));
                }
            }

            return {
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
                distancia: distancia,
                duracao: v.duracaoMinutos || 0,
                valor: v.valorTotal ? Number(v.valorTotal) : 0,
            };
        });

        return NextResponse.json(dados);
    } catch (error) {
        console.error('Erro ao buscar últimas viagens:', error);
        return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 });
    }
}