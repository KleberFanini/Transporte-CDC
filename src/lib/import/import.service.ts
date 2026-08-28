import { prisma } from '@/lib/prisma';
import { PlanilhaCorrida } from './types';
import { Prisma } from '@prisma/client';

export class ImportService {

    async importarCorridas(dados: PlanilhaCorrida[]): Promise<{
        total: number;
        importados: number;
        erros: { linha: number; erro: string }[];
        ajustados99?: number;  // Adicionado
    }> {
        const erros: { linha: number; erro: string }[] = [];
        let importados = 0;
        let ajustados99 = 0;  // Contador para viagens da 99

        console.log(`📊 Iniciando importação de ${dados.length} registros...`);

        for (let i = 0; i < dados.length; i++) {
            try {
                const item = dados[i];

                if (!item.idCorridaPlataforma || !item.valorTotal) {
                    erros.push({ linha: i + 1, erro: 'Dados obrigatórios faltando' });
                    continue;
                }

                // Verificar se é viagem da 99 (já veio com o valor ajustado do parser)
                if (item.plataforma === 'NOVE_NOVE') {
                    ajustados99++;
                }

                let distanciaKm: number | null = null;
                if (item.distanciaKm !== null && item.distanciaKm !== undefined) {
                    distanciaKm = parseFloat(String(item.distanciaKm));
                }

                let dataSolicitacaoDate: Date | null = null;
                let dataChegadaDate: Date | null = null;
                let horaSolicitacaoStr: string | null = null;
                let horaChegadaStr: string | null = null;

                if (item.dataSolicitacao) {
                    const dateObj = this.extractDateOnly(item.dataSolicitacao);
                    if (dateObj) {
                        dataSolicitacaoDate = dateObj;
                        horaSolicitacaoStr = item.horaSolicitacao?.slice(0, 5) || null;
                    }
                }

                if (item.dataChegada) {
                    const dateObj = this.extractDateOnly(item.dataChegada);
                    if (dateObj) {
                        dataChegadaDate = dateObj;
                        horaChegadaStr = item.horaChegada?.slice(0, 5) || null;
                    }
                }

                const statusMap: Record<string, any> = {
                    'COMPLETA': 'COMPLETA',
                    'CANCELADA': 'CANCELADA',
                    'EM_ANDAMENTO': 'EM_ANDAMENTO',
                };

                const distanciaDecimal = distanciaKm !== null ? new Prisma.Decimal(distanciaKm) : null;

                console.log(`📏 Salvando no banco: ${distanciaDecimal?.toString()} (tipo: ${typeof distanciaDecimal})`);

                await prisma.corrida.upsert({
                    where: { idCorridaPlataforma: item.idCorridaPlataforma },
                    update: {
                        plataforma: item.plataforma,
                        status: statusMap[item.status] || 'COMPLETA',
                        dataSolicitacao: dataSolicitacaoDate,
                        horaSolicitacao: horaSolicitacaoStr,
                        dataChegada: dataChegadaDate,
                        horaChegada: horaChegadaStr,
                        servico: item.servico,
                        programa: item.programa,
                        grupo: item.grupo,
                        nome: item.nome,
                        sobrenome: item.sobrenome,
                        nomeCompleto: item.nomeCompleto,
                        email: item.email,
                        detalhamentoDespesa: item.detalhamentoDespesa,
                        valorTotal: new Prisma.Decimal(item.valorTotal),
                        distanciaMetros: distanciaDecimal,
                        duracaoMinutos: item.duracaoMin,
                        enderecoPartida: item.enderecoPartida,
                        enderecoDestino: item.enderecoDestino,
                        cidade: item.cidade,
                        pais: item.pais,
                    },
                    create: {
                        idCorridaPlataforma: item.idCorridaPlataforma,
                        plataforma: item.plataforma,
                        status: statusMap[item.status] || 'COMPLETA',
                        dataSolicitacao: dataSolicitacaoDate,
                        horaSolicitacao: horaSolicitacaoStr,
                        dataChegada: dataChegadaDate,
                        horaChegada: horaChegadaStr,
                        servico: item.servico,
                        programa: item.programa,
                        grupo: item.grupo,
                        nome: item.nome,
                        sobrenome: item.sobrenome,
                        nomeCompleto: item.nomeCompleto,
                        email: item.email,
                        detalhamentoDespesa: item.detalhamentoDespesa,
                        valorTotal: new Prisma.Decimal(item.valorTotal),
                        distanciaMetros: distanciaDecimal,
                        duracaoMinutos: item.duracaoMin,
                        enderecoPartida: item.enderecoPartida,
                        enderecoDestino: item.enderecoDestino,
                        cidade: item.cidade,
                        pais: item.pais,
                    },
                });

                importados++;
            } catch (error) {
                console.error(`❌ Erro na linha ${i + 1}:`, error);
                erros.push({ linha: i + 1, erro: error instanceof Error ? error.message : 'Erro desconhecido' });
            }
        }

        console.log(`✅ Importação concluída: ${importados} registros importados, ${erros.length} erros`);
        if (ajustados99 > 0) {
            console.log(`🟢 R$1 adicionado a ${ajustados99} viagens da 99`);
        }

        return {
            total: dados.length,
            importados,
            erros,
            ajustados99: ajustados99 > 0 ? ajustados99 : undefined
        };
    }

    private extractDateOnly(dateValue: Date | string | null): Date | null {
        if (!dateValue) return null;

        let date: Date;
        if (dateValue instanceof Date) {
            date = dateValue;
        } else {
            date = new Date(dateValue);
        }

        if (isNaN(date.getTime())) return null;

        return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    }
}