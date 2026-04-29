import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const corridas = await prisma.corrida.findMany({
            select: {
                servico: true,
                valorTotal: true,
            },
        });

        // Agrupar por serviço/tipo de despesa
        const despesasMap = new Map();

        corridas.forEach(c => {
            const tipo = c.servico || 'Não categorizado';
            const valor = c.valorTotal ? Number(c.valorTotal) : 0;

            if (!despesasMap.has(tipo)) {
                despesasMap.set(tipo, { tipo, valor: 0, quantidade: 0 });
            }
            const item = despesasMap.get(tipo);
            item.valor += valor;
            item.quantidade++;
        });

        const totalValor = Array.from(despesasMap.values()).reduce((acc, d) => acc + d.valor, 0);

        const dados = Array.from(despesasMap.values())
            .map(d => ({
                ...d,
                porcentagem: totalValor > 0 ? (d.valor / totalValor) * 100 : 0,
            }))
            .sort((a, b) => b.valor - a.valor);

        return NextResponse.json(dados);
    } catch (error) {
        console.error('Erro ao buscar detalhamento de despesas:', error);
        return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 });
    }
}