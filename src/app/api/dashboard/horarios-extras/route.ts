import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function normalizarTexto(texto: string): string {
    if (!texto) return '';
    return texto
        .toUpperCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const dataInicio = searchParams.get("dataInicio");
        const dataFim = searchParams.get("dataFim");
        const plataforma = searchParams.get("plataforma");
        const status = searchParams.get("status");
        const servico = searchParams.get("servico");
        const programa = searchParams.get("programa");
        const funcionario = searchParams.get("funcionario");
        const limit = parseInt(searchParams.get("limit") || "10");

        // Construir filtro
        const where: any = {};

        if (dataInicio && dataInicio !== "") {
            const inicioDate = new Date(dataInicio);
            inicioDate.setHours(0, 0, 0, 0);
            where.dataSolicitacao = { gte: inicioDate };
        }

        if (dataFim && dataFim !== "") {
            const fimDate = new Date(dataFim);
            fimDate.setHours(23, 59, 59, 999);
            where.dataSolicitacao = { ...where.dataSolicitacao, lte: fimDate };
        }

        if (plataforma && plataforma !== "todos") {
            where.plataforma = plataforma;
        }

        if (status && status !== "todos") {
            where.status = status;
        }
        if (servico && servico !== "todos" && servico !== "") {
            where.servico = servico;
        }

        if (programa && programa !== "todos" && programa !== "") {
            where.programa = programa;
        }

        if (funcionario && funcionario !== "todos" && funcionario !== "") {
            where.nomeCompleto = {
                contains: funcionario,
                mode: "insensitive",
            };
        }

        // Buscar todas as corridas com hora
        let corridas = await prisma.corrida.findMany({
            where: {
                ...where,
                horaSolicitacao: {
                    not: null,
                },
            },
            select: {
                id: true,
                nomeCompleto: true,
                horaSolicitacao: true,
                valorTotal: true,
                dataSolicitacao: true,
                enderecoPartida: true,
                enderecoDestino: true,
                servico: true,
                programa: true,
                plataforma: true,
            },
            orderBy: {
                dataSolicitacao: 'desc',
            },
        });

        if (funcionario && funcionario !== "todos" && funcionario !== "") {
            const funcNorm = normalizarTexto(funcionario);
            corridas = corridas.filter(c => normalizarTexto(c.nomeCompleto || "") === funcNorm);
        }

        const toNumber = (value: any): number => {
            if (value === null || value === undefined) return 0;
            if (typeof value === 'number') return value;
            if (typeof value === 'string') return parseFloat(value) || 0;
            if (value && typeof value.toNumber === 'function') return value.toNumber();
            return 0;
        };

        // Função para converter hora para número (ex: "08:30" -> 8.5)
        const horaParaNumero = (hora: string): number => {
            if (!hora) return 0;
            const parts = hora.split(':');
            const horas = parseInt(parts[0]) || 0;
            const minutos = parseInt(parts[1]) || 0;
            return horas + (minutos / 60);
        };

        // Função para verificar se está fora do horário comercial
        const isForaHorario = (hora: string): boolean => {
            if (!hora) return false;
            const num = horaParaNumero(hora);
            return num < 8 || num > 17;
        };

        // Separar viagens
        const viagensAntes8 = corridas.filter(c => {
            const num = horaParaNumero(c.horaSolicitacao || '00:00');
            return num < 8;
        });

        const viagensDepois17 = corridas.filter(c => {
            const num = horaParaNumero(c.horaSolicitacao || '00:00');
            return num > 17;
        });

        const viagensForaHorario = corridas.filter(c => isForaHorario(c.horaSolicitacao || '00:00'));

        // Calcular totais
        const valorAntes8 = viagensAntes8.reduce((sum, c) => sum + toNumber(c.valorTotal), 0);
        const valorDepois17 = viagensDepois17.reduce((sum, c) => sum + toNumber(c.valorTotal), 0);
        const valorForaHorario = viagensForaHorario.reduce((sum, c) => sum + toNumber(c.valorTotal), 0);

        // Agrupar por funcionário
        const funcionariosMap = new Map<string, {
            nome: string;
            antes8: number;
            depois17: number;
            total: number;
            valorTotal: number;
            viagens: any[];
        }>();

        corridas.forEach(c => {
            const nome = c.nomeCompleto || 'Não identificado';
            if (!funcionariosMap.has(nome)) {
                funcionariosMap.set(nome, {
                    nome,
                    antes8: 0,
                    depois17: 0,
                    total: 0,
                    valorTotal: 0,
                    viagens: [],
                });
            }
            const item = funcionariosMap.get(nome)!;
            const num = horaParaNumero(c.horaSolicitacao || '00:00');
            if (num < 8) item.antes8++;
            if (num > 17) item.depois17++;
            item.total++;
            item.valorTotal += toNumber(c.valorTotal);
            item.viagens.push(c);
        });

        const rankingFuncionarios = Array.from(funcionariosMap.values())
            .filter(f => f.antes8 > 0 || f.depois17 > 0)
            .sort((a, b) => (b.antes8 + b.depois17) - (a.antes8 + a.depois17))
            .slice(0, limit);

        // Distribuição por hora (agrupado)
        const distribuicaoPorHora: { hora: string; quantidade: number; valor: number }[] = [];
        for (let h = 0; h < 24; h++) {
            const horaStr = `${h.toString().padStart(2, '0')}:00`;
            const viagensHora = corridas.filter(c => {
                const num = horaParaNumero(c.horaSolicitacao || '00:00');
                return num >= h && num < h + 1;
            });
            if (viagensHora.length > 0) {
                distribuicaoPorHora.push({
                    hora: horaStr,
                    quantidade: viagensHora.length,
                    valor: viagensHora.reduce((sum, c) => sum + toNumber(c.valorTotal), 0),
                });
            }
        }

        return NextResponse.json({
            totalViagens: corridas.length,
            viagensAntes8: viagensAntes8.length,
            viagensDepois17: viagensDepois17.length,
            viagensForaHorario: viagensForaHorario.length,
            percentualForaHorario: corridas.length > 0
                ? ((viagensForaHorario.length / corridas.length) * 100).toFixed(1)
                : "0",
            valorAntes8,
            valorDepois17,
            valorForaHorario,
            rankingFuncionarios,
            distribuicaoPorHora,
            ultimasViagens: viagensForaHorario.slice(0, 20),
        });
    } catch (error) {
        console.error("Erro ao buscar horários extras:", error);
        return NextResponse.json(
            { error: "Erro ao buscar dados" },
            { status: 500 }
        );
    }
}