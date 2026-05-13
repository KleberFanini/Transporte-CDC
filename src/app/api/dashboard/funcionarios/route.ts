import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Função para normalizar textos (remover acentos, converter para maiúsculo, etc.)
function normalizarTexto(texto: string): string {
    if (!texto) return '';
    return texto
        .toUpperCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, ''); // Remove acentos
}

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

        // Filtro por data
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

        // 👇 AGRUPAR POR NOME NORMALIZADO
        const funcionariosMap = new Map();

        for (const c of corridas) {
            const nomeOriginal = c.nomeCompleto;
            if (!nomeOriginal) continue;

            const chaveNormalizada = normalizarTexto(nomeOriginal);

            if (!funcionariosMap.has(chaveNormalizada)) {
                funcionariosMap.set(chaveNormalizada, {
                    id: chaveNormalizada,
                    nome: c.nome || '',
                    sobrenome: c.sobrenome || '',
                    nomeCompleto: nomeOriginal, // Mantém a versão original
                    email: c.email || '',
                    titulo: 'Funcionário',
                    grupo: c.grupo || '',
                    programa: c.programa || '',
                    servico: c.servico || '',
                    cidade: c.cidade || '',
                    pais: c.pais || '',
                    totalViagens: 0,
                    valorTotal: 0,
                    // Armazenar diferentes variações do nome para referência
                    variacoes: new Set([nomeOriginal]),
                });
            } else {
                // Adicionar variação do nome se for diferente
                const func = funcionariosMap.get(chaveNormalizada);
                if (!func.variacoes.has(nomeOriginal)) {
                    func.variacoes.add(nomeOriginal);
                }
                // Se o nome original for mais "legível" (não está em CAIXA ALTA), atualiza
                if (nomeOriginal !== nomeOriginal.toUpperCase() && func.nomeCompleto === func.nomeCompleto.toUpperCase()) {
                    func.nomeCompleto = nomeOriginal;
                    func.nome = c.nome || '';
                    func.sobrenome = c.sobrenome || '';
                }
            }

            const func = funcionariosMap.get(chaveNormalizada);
            func.totalViagens++;
            if (c.valorTotal) {
                func.valorTotal += Number(c.valorTotal);
            }
        }

        // Remover a propriedade temporária 'variacoes' antes de retornar
        const funcionarios = Array.from(funcionariosMap.values())
            .map(({ variacoes, ...func }) => func)
            .sort((a, b) => b.valorTotal - a.valorTotal);

        console.log(`📊 Total de funcionários unificados: ${funcionarios.length}`);

        return NextResponse.json(funcionarios);
    } catch (error) {
        console.error('❌ Erro ao buscar funcionários:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar dados', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}