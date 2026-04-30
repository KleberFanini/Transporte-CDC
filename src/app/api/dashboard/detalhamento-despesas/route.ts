import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const dataInicioStr = searchParams.get('dataInicio');
        const dataFimStr = searchParams.get('dataFim');
        const plataforma = searchParams.get('plataforma');

        // Construir where dinamicamente
        const where: any = {};

        // Filtro por plataforma
        if (plataforma && plataforma !== 'todos') {
            where.plataforma = plataforma;
        }

        // Filtro por data
        if (dataInicioStr || dataFimStr) {
            where.dataSolicitacao = {};
            if (dataInicioStr) {
                const dataInicio = new Date(dataInicioStr);
                dataInicio.setHours(0, 0, 0, 0);
                where.dataSolicitacao.gte = dataInicio;
            }
            if (dataFimStr) {
                const dataFim = new Date(dataFimStr);
                dataFim.setHours(23, 59, 59, 999);
                where.dataSolicitacao.lte = dataFim;
            }
        }

        console.log('📊 Detalhamento Despesas - Where:', JSON.stringify(where));

        const corridas = await prisma.corrida.findMany({
            where,
            select: {
                servico: true,
                valorTotal: true,
            },
        });

        console.log(`📊 Encontradas ${corridas.length} corridas`);

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

        console.log(`📊 ${dados.length} categorias encontradas`);

        return NextResponse.json(dados);
    } catch (error) {
        console.error('❌ Erro ao buscar detalhamento de despesas:', error);
        return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 });
    }
}