import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function normalizarTexto(texto: string): string {
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

        const where: any = {
            programa: { not: null },
        };

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

        if (plataforma && plataforma !== 'todos') {
            where.plataforma = plataforma;
        }

        const programas = await prisma.corrida.groupBy({
            by: ['programa'],
            where,
        });

        const programasMap = new Map();

        programas.forEach(p => {
            if (!p.programa) return;

            const original = p.programa;
            const normalizado = normalizarTexto(original);

            if (!programasMap.has(normalizado)) {
                programasMap.set(normalizado, original);
            } else {
                const existente = programasMap.get(normalizado);
                if (original === original.toUpperCase() && existente !== existente.toUpperCase()) {
                } else if (original !== original.toUpperCase()) {
                    programasMap.set(normalizado, original);
                }
            }
        });

        const nomes = Array.from(programasMap.values()).sort();

        return NextResponse.json(nomes);
    } catch (error) {
        console.error('Erro ao buscar programas:', error);
        return NextResponse.json([], { status: 500 });
    }
}