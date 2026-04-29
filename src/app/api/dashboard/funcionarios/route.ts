import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const grupo = searchParams.get('grupo');
        const dataInicioStr = searchParams.get('dataInicio');
        const dataFimStr = searchParams.get('dataFim');

        // Construir where
        const where: any = {
            nomeCompleto: { not: null },
        };

        // Filtro por grupo
        if (grupo && grupo !== '') {
            where.grupo = grupo;
        }

        // Filtro por data
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

        console.log('📊 Buscando funcionários com where:', JSON.stringify(where));

        // Buscar todas as corridas
        const corridas = await prisma.corrida.findMany({
            where,
            select: {
                nome: true,
                sobrenome: true,
                nomeCompleto: true,
                email: true,
                grupo: true,
                programa: true,
                servico: true,
                cidade: true,
                pais: true,
                valorTotal: true,
            },
        });

        console.log(`📊 Encontradas ${corridas.length} corridas para funcionários`);

        // Agrupar por funcionário
        const funcionariosMap = new Map();

        for (const c of corridas) {
            const key = c.nomeCompleto;
            if (!key) continue;

            if (!funcionariosMap.has(key)) {
                funcionariosMap.set(key, {
                    id: key,
                    nome: c.nome || '',
                    sobrenome: c.sobrenome || '',
                    nomeCompleto: key,
                    email: c.email || '',
                    titulo: 'Funcionário',
                    grupo: c.grupo || '',
                    programa: c.programa || '',
                    servico: c.servico || '',
                    cidade: c.cidade || '',
                    pais: c.pais || '',
                    totalViagens: 0,
                    valorTotal: 0,
                });
            }

            const func = funcionariosMap.get(key);
            func.totalViagens++;
            if (c.valorTotal) {
                func.valorTotal += Number(c.valorTotal);
            }
        }

        const funcionarios = Array.from(funcionariosMap.values())
            .sort((a, b) => b.valorTotal - a.valorTotal);

        console.log(`📊 Total de funcionários encontrados: ${funcionarios.length}`);

        return NextResponse.json(funcionarios);
    } catch (error) {
        console.error('❌ Erro ao buscar funcionários:', error);
        return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 });
    }
}