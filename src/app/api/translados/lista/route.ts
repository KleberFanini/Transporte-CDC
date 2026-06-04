import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const dataInicio = searchParams.get("dataInicio");
        const dataFim = searchParams.get("dataFim");
        const status = searchParams.get("status");
        const projeto = searchParams.get("projeto");
        const page = parseInt(searchParams.get("page") || "1");
        const pageSize = 20;
        const skip = (page - 1) * pageSize;

        console.log("Parâmetros recebidos na API:", { dataInicio, dataFim, status, projeto, page });

        // Construir filtro
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

        if (status && status !== "todos" && status !== "") {
            where.statusAprovacao = status;
        }

        if (projeto && projeto !== "todos" && projeto !== "") {
            where.projetoOrigem = projeto;
        }

        console.log("Where clause:", JSON.stringify(where, null, 2));

        const [translados, total] = await Promise.all([
            prisma.translado.findMany({
                where,
                orderBy: {
                    dataVencimento: 'desc',
                },
                skip,
                take: pageSize,
            }),
            prisma.translado.count({ where }),
        ]);

        console.log(`Encontrados ${total} registros`);

        return NextResponse.json({
            translados,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        });
    } catch (error) {
        console.error("Erro ao buscar lista de translados:", error);
        return NextResponse.json({ error: "Erro ao buscar dados" }, { status: 500 });
    }
}