import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const dataInicio = searchParams.get("dataInicio");
        const dataFim = searchParams.get("dataFim");
        const page = parseInt(searchParams.get("page") || "1");
        const pageSize = 20;
        const skip = (page - 1) * pageSize;

        // Construir filtro de data
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

        console.log("Filtros aplicados na lista:", { dataInicio, dataFim, where });

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