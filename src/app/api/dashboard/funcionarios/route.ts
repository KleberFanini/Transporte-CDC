import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const grupo = searchParams.get('grupo');
        const programa = searchParams.get('programa');
        const dataInicioStr = searchParams.get('dataInicio');
        const dataFimStr = searchParams.get('dataFim');
        const plataforma = searchParams.get('plataforma');

        console.log('📊 Parâmetros recebidos:', { grupo, programa, dataInicioStr, dataFimStr, plataforma });

        const where: any = {
            nomeCompleto: { not: null },
        };

        if (plataforma && plataforma !== 'todos') {
            where.plataforma = plataforma;
        }

        if (grupo && grupo !== '' && grupo !== 'todos') {
            where.grupo = grupo;
        }

        if (programa && programa !== '' && programa !== 'todos') {
            where.programa = programa;
        }

        // Tratamento seguro das datas
        if (dataInicioStr && dataInicioStr !== '') {
            const dataInicio = new Date(dataInicioStr);
            if (!isNaN(dataInicio.getTime())) {
                dataInicio.setHours(0, 0, 0, 0);
                where.dataSolicitacao = { gte: dataInicio };
            } else {
                console.log(`⚠️ Data início inválida: ${dataInicioStr}`);
            }
        }

        if (dataFimStr && dataFimStr !== '') {
            const dataFim = new Date(dataFimStr);
            if (!isNaN(dataFim.getTime())) {
                dataFim.setHours(23, 59, 59, 999);
                where.dataSolicitacao = { ...where.dataSolicitacao, lte: dataFim };
            } else {
                console.log(`⚠️ Data fim inválida: ${dataFimStr}`);
            }
        }

        console.log('🔍 Where clause final:', JSON.stringify(where));

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

        console.log(`📊 Encontradas ${corridas.length} corridas`);

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

        console.log(`📊 Total de funcionários: ${funcionarios.length}`);

        return NextResponse.json(funcionarios);
    } catch (error) {
        console.error('❌ Erro ao buscar funcionários:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar dados', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}