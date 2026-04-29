import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const periodo = searchParams.get('periodo') || 'mes';

        // Calcular data de início
        const hoje = new Date();
        let dataInicio: Date;

        switch (periodo) {
            case 'hoje':
                dataInicio = new Date(hoje.setHours(0, 0, 0, 0));
                break;
            case 'semana':
                dataInicio = new Date(hoje);
                dataInicio.setDate(hoje.getDate() - 7);
                break;
            case 'mes':
                dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
                break;
            case 'ano':
                dataInicio = new Date(hoje.getFullYear(), 0, 1);
                break;
            default:
                dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        }

        const servicos = await prisma.corrida.groupBy({
            by: ['servico'],
            where: {
                dataSolicitacao: {
                    gte: dataInicio,
                },
                servico: { not: null },
            },
            _sum: {
                valorTotal: true,
            },
            _count: true,
        });

        const dados = servicos.map(s => ({
            tipo: s.servico,
            viagens: s._count,
            valor: s._sum.valorTotal ? Number(s._sum.valorTotal) : 0,
        }));

        return NextResponse.json(dados);
    } catch (error) {
        console.error('Erro ao buscar serviços:', error);
        return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 });
    }
}