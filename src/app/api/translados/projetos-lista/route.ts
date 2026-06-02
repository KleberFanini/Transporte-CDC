import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const dataInicio = searchParams.get("dataInicio");
        const dataFim = searchParams.get("dataFim");

        const where: any = {};

        if (dataInicio && dataInicio !== "") {
            const inicioDate = new Date(dataInicio);
            inicioDate.setHours(0, 0, 0, 0);
            where.dataVencimento = { gte: inicioDate };
        }

        if (dataFim && dataFim !== "") {
            const fimDate = new Date(dataFim);
            fimDate.setHours(23, 59, 59, 999);
            where.dataVencimento = { ...where.dataVencimento, lte: fimDate };
        }

        // Buscar projetos distintos que não sejam nulos ou vazios
        const projetos = await prisma.translado.findMany({
            where: {
                ...where,
                projetoOrigem: {
                    not: null
                }
            },
            select: {
                projetoOrigem: true,
            },
            distinct: ['projetoOrigem'],
        });

        // Filtrar e ordenar
        const projetosFiltrados = projetos
            .map(p => p.projetoOrigem)
            .filter(p => p && p !== null && p !== "" && p !== "null" && p !== "undefined")
            .sort();

        console.log("Projetos encontrados:", projetosFiltrados);

        return NextResponse.json(projetosFiltrados);
    } catch (error) {
        console.error("Erro ao buscar projetos:", error);
        return NextResponse.json([], { status: 500 });
    }
}