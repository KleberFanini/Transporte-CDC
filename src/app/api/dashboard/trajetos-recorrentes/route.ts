import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const dataInicio = searchParams.get("dataInicio");
        const dataFim = searchParams.get("dataFim");
        const plataforma = searchParams.get("plataforma");
        const status = searchParams.get("status");
        const programa = searchParams.get("programa");
        const limit = parseInt(searchParams.get("limit") || "10");

        // Construir filtro
        const where: any = {};

        if (dataInicio && dataInicio !== "") {
            const inicioDate = new Date(dataInicio);
            if (!isNaN(inicioDate.getTime())) {
                inicioDate.setHours(0, 0, 0, 0);
                where.dataSolicitacao = { gte: inicioDate };
            }
        }

        if (dataFim && dataFim !== "") {
            const fimDate = new Date(dataFim);
            if (!isNaN(fimDate.getTime())) {
                fimDate.setHours(23, 59, 59, 999);
                where.dataSolicitacao = { ...where.dataSolicitacao, lte: fimDate };
            }
        }

        if (plataforma && plataforma !== "todos") {
            where.plataforma = plataforma;
        }

        if (status && status !== "todos") {
            where.status = status;
        }

        if (programa && programa !== "todos") {
            where.programa = programa;
        }

        // Buscar todas as corridas com endereços
        const corridas = await prisma.corrida.findMany({
            where: {
                ...where,
                OR: [
                    { enderecoPartida: { not: null } },
                    { enderecoDestino: { not: null } }
                ]
            },
            select: {
                enderecoPartida: true,
                enderecoDestino: true,
                valorTotal: true,
                nomeCompleto: true,
                dataSolicitacao: true,
            }
        });

        // Função para converter qualquer valor para número
        const toNumber = (value: any): number => {
            if (value === null || value === undefined) return 0;
            if (typeof value === 'number') return value;
            if (typeof value === 'string') return parseFloat(value) || 0;
            if (value && typeof value.toNumber === 'function') return value.toNumber();
            return 0;
        };

        // Agrupar por endereço de partida
        const partidasMap = new Map<string, { total: number; valor: number; funcionarios: Set<string> }>();

        corridas.forEach(c => {
            if (c.enderecoPartida && c.enderecoPartida.trim() !== "") {
                const key = c.enderecoPartida;
                if (!partidasMap.has(key)) {
                    partidasMap.set(key, { total: 0, valor: 0, funcionarios: new Set() });
                }
                const item = partidasMap.get(key)!;
                item.total++;
                item.valor += toNumber(c.valorTotal);
                if (c.nomeCompleto) item.funcionarios.add(c.nomeCompleto);
            }
        });

        // Agrupar por endereço de destino
        const destinosMap = new Map<string, { total: number; valor: number; funcionarios: Set<string> }>();

        corridas.forEach(c => {
            if (c.enderecoDestino && c.enderecoDestino.trim() !== "") {
                const key = c.enderecoDestino;
                if (!destinosMap.has(key)) {
                    destinosMap.set(key, { total: 0, valor: 0, funcionarios: new Set() });
                }
                const item = destinosMap.get(key)!;
                item.total++;
                item.valor += toNumber(c.valorTotal);
                if (c.nomeCompleto) item.funcionarios.add(c.nomeCompleto);
            }
        });

        // Agrupar trajetos completos
        const trajetosMap = new Map<string, { partida: string; destino: string; total: number }>();

        corridas.forEach(c => {
            if (c.enderecoPartida && c.enderecoDestino) {
                const key = `${c.enderecoPartida}→${c.enderecoDestino}`;
                if (!trajetosMap.has(key)) {
                    trajetosMap.set(key, {
                        partida: c.enderecoPartida,
                        destino: c.enderecoDestino,
                        total: 0
                    });
                }
                trajetosMap.get(key)!.total++;
            }
        });

        // Ordenar e formatar resultados
        const partidasFrequentes = Array.from(partidasMap.entries())
            .map(([endereco, data]) => ({
                endereco,
                totalViagens: data.total,
                valorTotal: data.valor,
                valorMedio: data.total > 0 ? data.valor / data.total : 0,
                funcionarios: data.funcionarios.size
            }))
            .sort((a, b) => b.totalViagens - a.totalViagens)
            .slice(0, limit);

        const destinosFrequentes = Array.from(destinosMap.entries())
            .map(([endereco, data]) => ({
                endereco,
                totalViagens: data.total,
                valorTotal: data.valor,
                valorMedio: data.total > 0 ? data.valor / data.total : 0,
                funcionarios: data.funcionarios.size
            }))
            .sort((a, b) => b.totalViagens - a.totalViagens)
            .slice(0, limit);

        const trajetosMaisComuns = Array.from(trajetosMap.values())
            .sort((a, b) => b.total - a.total)
            .slice(0, limit);

        return NextResponse.json({
            partidasFrequentes,
            destinosFrequentes,
            trajetosMaisComuns,
            totalCorridas: corridas.length,
        });
    } catch (error) {
        console.error("Erro ao buscar trajetos recorrentes:", error);
        return NextResponse.json(
            { error: "Erro ao buscar dados" },
            { status: 500 }
        );
    }
}