import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const dataInicioStr = searchParams.get('dataInicio');
        const dataFimStr = searchParams.get('dataFim');
        const plataforma = searchParams.get('plataforma');
        const status = searchParams.get('status')

        const where: any = {
            dataSolicitacao: { not: null },
        };

        if (plataforma && plataforma !== 'todos') {
            where.plataforma = plataforma;
        }

        if (status && status !== 'todos') {
            where.status = status;
        }

        if (dataInicioStr) {
            const dataInicio = new Date(dataInicioStr);
            dataInicio.setHours(0, 0, 0, 0);
            where.dataSolicitacao = { ...where.dataSolicitacao, gte: dataInicio };
        }

        if (dataFimStr) {
            const dataFim = new Date(dataFimStr);
            dataFim.setHours(23, 59, 59, 999);
            where.dataSolicitacao = { ...where.dataSolicitacao, lte: dataFim };
        }

        const corridas = await prisma.corrida.findMany({
            where,
            select: {
                dataSolicitacao: true,
                valorTotal: true,
            },
        });

        const mesesMap = new Map();

        corridas.forEach(c => {
            if (!c.dataSolicitacao) return;

            const data = new Date(c.dataSolicitacao);
            const ano = data.getFullYear();
            const mes = data.getMonth();
            const nomeMes = data.toLocaleString('pt-BR', { month: 'short' });

            const chave = `${ano}-${String(mes + 1).padStart(2, '0')}`;
            const label = `${nomeMes}. ${ano}`;

            const valor = c.valorTotal ? Number(c.valorTotal) : 0;

            if (!mesesMap.has(chave)) {
                mesesMap.set(chave, {
                    chave,
                    mes: label,
                    valor: 0,
                    viagens: 0,
                    ano,
                    mesNumero: mes
                });
            }
            const item = mesesMap.get(chave);
            item.valor += valor;
            item.viagens++;
        });

        const dados = Array.from(mesesMap.values())
            .sort((a, b) => {
                if (a.ano !== b.ano) return a.ano - b.ano;
                return a.mesNumero - b.mesNumero;
            })
            .map(({ mes, valor, viagens }) => ({ mes, valor, viagens }));

        console.log(`📊 ${dados.length} meses encontrados (ordenados cronologicamente)`);

        return NextResponse.json(dados);
    } catch (error) {
        console.error('❌ Erro ao buscar evolução mensal:', error);
        return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 });
    }
}