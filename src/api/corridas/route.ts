import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { exigirPerfil } from "@/lib/autorizacao";

const querySchema = z.object({
  plataforma: z.enum(["UBER", "NOVE_NOVE"]).optional(),
  status: z.enum(["FINALIZADA", "CANCELADA", "NAO_REALIZADA", "EM_ANDAMENTO", "DESCONHECIDO"]).optional(),
  nome: z.string().min(1).optional(),
  de: z.string().optional(),
  ate: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export async function GET(req: Request) {
  await exigirPerfil(["admin", "visualizador"]);

  const url = new URL(req.url);
  const parsed = querySchema.parse(Object.fromEntries(url.searchParams));

  const { plataforma, status, nome, de, ate, page, pageSize } = parsed;

  const where: any = {};

  if (plataforma) where.plataforma = plataforma;
  if (status) where.status = status;

  if (nome) {
    where.OR = [
      { nomeCompleto: { contains: nome, mode: "insensitive" } },
      { nome: { contains: nome, mode: "insensitive" } },
      { sobrenome: { contains: nome, mode: "insensitive" } },
    ];
  }

  if (de || ate) {
    where.dataSolicitacao = {};
    if (de) where.dataSolicitacao.gte = new Date(`${de}T00:00:00`);
    if (ate) where.dataSolicitacao.lte = new Date(`${ate}T23:59:59`);
  }

  const [total, corridas] = await Promise.all([
    prisma.corrida.count({ where }),
    prisma.corrida.findMany({
      where,
      orderBy: { dataSolicitacao: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({
    total,
    page,
    pageSize,
    corridas,
  });
}