import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

interface TransladoRow {
    TIPO?: string;
    LANÇAMENTO?: string;
    "RESPONSÁVEL PELA CRIAÇÃO"?: string;
    FORNECEDOR?: string;
    "DCTO FORNECEDOR"?: string;
    HISTÓRICO?: string;
    "COD CONTRATO"?: string;
    CADASTRO?: string | Date;
    COMPETÊNCIA?: string;
    EMISSÃO?: string | Date;
    VENCIMENTO?: string | Date;
    APROVAÇÃO?: string;
    PAGAMENTO?: string | Date;
    "ORIGEM PAGAMENTO"?: string;
    "TIPO PAGAMENTO"?: string;
    "VALOR BRUTO"?: number | string;
    "VALOR LÍQUIDO"?: number | string;
    DOCUMENTO?: number | string;
    "OBSERVAÇÕES RATEIOS"?: string;
    "OBSERVAÇÕES GERAIS"?: string;
}

function parseExcelDate(value: any): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value === 'number') {
        const date = new Date((value - 25569) * 86400 * 1000);
        return isNaN(date.getTime()) ? null : date;
    }
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
}

function parseNumber(value: any): number | null {
    if (!value) return null;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        const cleaned = value.replace(/\./g, '').replace(',', '.');
        const num = parseFloat(cleaned);
        return isNaN(num) ? null : num;
    }
    return null;
}

function parseDocumento(value: any): string | null {
    if (!value) return null;
    // Converte para string e remove espaços extras
    return String(value).trim();
}

function parseProjetoEValor(origemPagamento: string): { projeto: string | null, valor: number | null } {
    if (!origemPagamento) return { projeto: null, valor: null };

    const match = origemPagamento.match(/^([^:]+):\s*([\d.,]+)$/);
    if (match) {
        const projeto = match[1].trim();
        const valorStr = match[2].replace(/\./g, '').replace(',', '.');
        const valor = parseFloat(valorStr);
        return { projeto, valor: isNaN(valor) ? null : valor };
    }

    return { projeto: origemPagamento, valor: null };
}

export async function POST(req: NextRequest) {
    const resultados: { linha: number; erro: string }[] = [];
    let importados = 0;
    let totalProcessados = 0;

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                { error: "Nenhum arquivo enviado" },
                { status: 400 }
            );
        }

        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json<TransladoRow>(worksheet);

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const linhaNumero = i + 2;

            // Pular linha vazia
            if (!row.LANÇAMENTO && !row.FORNECEDOR) continue;

            totalProcessados++;

            try {
                // Validar campos obrigatórios
                if (!row.LANÇAMENTO || !row.FORNECEDOR) {
                    resultados.push({
                        linha: linhaNumero,
                        erro: "Campos obrigatórios: LANÇAMENTO e FORNECEDOR"
                    });
                    continue;
                }

                const { projeto, valor } = parseProjetoEValor(row["ORIGEM PAGAMENTO"] || "");

                const dadosTranslado = {
                    tipo: row.TIPO || null,
                    lancamento: row.LANÇAMENTO,
                    responsavelCriacao: row["RESPONSÁVEL PELA CRIAÇÃO"] || null,
                    fornecedor: row.FORNECEDOR,
                    cnpjCpfFornecedor: row["DCTO FORNECEDOR"] || null,
                    historico: row.HISTÓRICO || null,
                    codigoContrato: row["COD CONTRATO"] || null,
                    dataCadastro: parseExcelDate(row.CADASTRO),
                    competencia: row.COMPETÊNCIA || null,
                    dataEmissao: parseExcelDate(row.EMISSÃO),
                    dataVencimento: parseExcelDate(row.VENCIMENTO),
                    statusAprovacao: row.APROVAÇÃO || null,
                    dataPagamento: parseExcelDate(row.PAGAMENTO),
                    valorBruto: parseNumber(row["VALOR BRUTO"]),
                    valorLiquido: parseNumber(row["VALOR LÍQUIDO"]),
                    projetoOrigem: projeto,
                    valorPorProjeto: valor,
                    tipoPagamento: row["TIPO PAGAMENTO"] || null,
                    numeroDocumento: parseDocumento(row.DOCUMENTO),
                    observacoesRateios: row["OBSERVAÇÕES RATEIOS"] || null,
                    observacoesGerais: row["OBSERVAÇÕES GERAIS"] || null,
                };

                // Verificar se já existe
                const existing = await prisma.translado.findFirst({
                    where: { lancamento: row.LANÇAMENTO }
                });

                if (existing) {
                    // Atualizar
                    await prisma.translado.update({
                        where: { id: existing.id },
                        data: dadosTranslado,
                    });
                } else {
                    // Criar novo
                    await prisma.translado.create({
                        data: dadosTranslado,
                    });
                }
                importados++;
            } catch (error) {
                console.error(`Erro na linha ${linhaNumero}:`, error);
                resultados.push({
                    linha: linhaNumero,
                    erro: error instanceof Error ? error.message : "Erro desconhecido"
                });
            }
        }

        return NextResponse.json({
            total: totalProcessados,
            importados: importados,
            erros: resultados,
        });
    } catch (error) {
        console.error("Erro na importação:", error);
        return NextResponse.json(
            { error: "Erro interno ao processar o arquivo" },
            { status: 500 }
        );
    }
}