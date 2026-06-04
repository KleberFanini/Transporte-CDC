import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        // REMOVA os parâmetros de data - queremos TODOS os projetos
        // Buscar projetos distintos que não sejam nulos ou vazios, SEM FILTRO DE DATA
        const projetos = await prisma.translado.findMany({
            where: {
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

        console.log("Todos os projetos encontrados:", projetosFiltrados);

        return NextResponse.json(projetosFiltrados);
    } catch (error) {
        console.error("Erro ao buscar projetos:", error);
        return NextResponse.json([], { status: 500 });
    }
}