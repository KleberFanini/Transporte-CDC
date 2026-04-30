import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const dataInicioStr = searchParams.get('dataInicio');
        const dataFimStr = searchParams.get('dataFim');
        const plataforma = searchParams.get('plataforma');

        // Construir where dinamicamente
        const where: any = {
            dataSolicitacao: { not: null },
        };

        // Filtro por plataforma
        if (plataforma && plataforma !== 'todos') {
            where.plataforma = plataforma;
        }

        // Filtro por data início
        if (dataInicioStr) {
            const dataInicio = new Date(dataInicioStr);
            dataInicio.setHours(0, 0, 0, 0);
            where.dataSolicitacao = { ...where.dataSolicitacao, gte: dataInicio };
        }

        // Filtro por data fim
        if (dataFimStr) {
            const dataFim = new Date(dataFimStr);
            dataFim.setHours(23, 59, 59, 999);
            where.dataSolicitacao = { ...where.dataSolicitacao, lte: dataFim };
        }

        console.log('📊 Evolução Mensal - Where:', JSON.stringify(where));

        const corridas = await prisma.corrida.findMany({
            where,
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

        console.log(`📊 ${dados.length} meses encontrados`);

        return NextResponse.json(dados);
    } catch (error) {
        console.error('❌ Erro ao buscar evolução mensal:', error);
        return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 });
    }
}