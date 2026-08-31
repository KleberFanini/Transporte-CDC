import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function normalizarTexto(texto: string): string {
    if (!texto) return '';
    return texto
        .toUpperCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const dataInicioStr = searchParams.get('dataInicio');
        const dataFimStr = searchParams.get('dataFim');
        const plataforma = searchParams.get('plataforma');
        const status = searchParams.get('status');
        const programa = searchParams.get('programa');

        const where: any = {
            nomeCompleto: { not: null },
        };

        if (dataInicioStr) {
            const dataInicio = new Date(dataInicioStr);
            if (!isNaN(dataInicio.getTime())) {
                dataInicio.setHours(0, 0, 0, 0);
                where.dataSolicitacao = { gte: dataInicio };
            }
        }

        if (dataFimStr) {
            const dataFim = new Date(dataFimStr);
            if (!isNaN(dataFim.getTime())) {
                dataFim.setHours(23, 59, 59, 999);
                where.dataSolicitacao = { ...where.dataSolicitacao, lte: dataFim };
            }
        }

        if (plataforma && plataforma !== 'todos') {
            where.plataforma = plataforma;
        }

        if (status && status !== 'todos') {
            where.status = status;
        }

        if (programa && programa !== 'todos') {
            where.programa = programa;
        }

        const corridas = await prisma.corrida.groupBy({
            by: ['nomeCompleto'],
            where,
        });

        const funcionariosMap = new Map();

        corridas.forEach(c => {
            if (!c.nomeCompleto) return;
            const original = c.nomeCompleto.trim();
            const normalizado = normalizarTexto(original);

            if (!funcionariosMap.has(normalizado)) {
                funcionariosMap.set(normalizado, original);
            } else {
                const existente = funcionariosMap.get(normalizado);
                if (original !== original.toUpperCase() && existente === existente.toUpperCase()) {
                    funcionariosMap.set(normalizado, original);
                }
            }
        });

        const nomes = Array.from(funcionariosMap.values()).sort((a, b) =>
            a.localeCompare(b, 'pt-BR')
        );

        return NextResponse.json(nomes);
    } catch (error) {
        console.error('Erro ao buscar lista de funcionários:', error);
        return NextResponse.json([], { status: 500 });
    }
}
