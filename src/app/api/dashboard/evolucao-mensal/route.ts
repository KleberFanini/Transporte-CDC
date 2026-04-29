import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const corridas = await prisma.corrida.findMany({
            where: {
                dataSolicitacao: { not: null },
            },
            select: {
                dataSolicitacao: true,
                valorTotal: true,
            },
        });

        // Agrupar por mês
        const mesesMap = new Map();

        corridas.forEach(c => {
            if (!c.dataSolicitacao) return;

            const data = new Date(c.dataSolicitacao);
            const mesAno = data.toLocaleString('pt-BR', { month: 'short', year: 'numeric' });
            const valor = c.valorTotal ? Number(c.valorTotal) : 0;

            if (!mesesMap.has(mesAno)) {
                mesesMap.set(mesAno, { mes: mesAno, valor: 0, viagens: 0 });
            }
            const item = mesesMap.get(mesAno);
            item.valor += valor;
            item.viagens++;
        });

        const dados = Array.from(mesesMap.values());

        return NextResponse.json(dados);
    } catch (error) {
        console.error('Erro ao buscar evolução mensal:', error);
        return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 });
    }
}