import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const dataInicio = searchParams.get("dataInicio");
        const dataFim = searchParams.get("dataFim");
        const plataforma = searchParams.get("plataforma");
        const status = searchParams.get("status");

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

        // Buscar fornecedores distintos
        const fornecedores = await prisma.corrida.findMany({
            where: {
                ...where,
                servico: {
                    not: null,
                },
            },
            select: {
                servico: true,
            },
            distinct: ['servico'],
        });

        const listaFornecedores = fornecedores
            .map(f => f.servico)
            .filter(f => f && f !== null && f !== "" && f !== "null" && f !== "undefined")
            .sort();

        return NextResponse.json(listaFornecedores);
    } catch (error) {
        console.error("Erro ao buscar fornecedores:", error);
        return NextResponse.json([], { status: 500 });
    }
}