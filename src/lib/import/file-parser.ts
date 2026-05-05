import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { PlanilhaCorrida } from './types';

export class FileParser {

    static async parseFile(file: File): Promise<PlanilhaCorrida[]> {
        const extension = file.name.split('.').pop()?.toLowerCase();

        if (extension === 'csv') {
            return this.parseCSV(file);
        } else if (extension === 'xlsx' || extension === 'xls') {
            return this.parseExcel(file);
        } else {
            throw new Error('Formato não suportado. Use CSV ou Excel (.xlsx, .xls)');
        }
    }

    private static parseCSV(file: File): Promise<PlanilhaCorrida[]> {
        return new Promise((resolve, reject) => {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const dados = results.data.map((row: any) => this.mapRowToCorrida(row));
                    resolve(dados);
                },
                error: (error) => reject(error),
            });
        });
    }

    private static async parseExcel(file: File): Promise<PlanilhaCorrida[]> {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(firstSheet);

        const dados = rows.map((row: any) => this.mapRowToCorrida(row));
        return dados;
    }

    // ✅ FUNÇÃO CORRIGIDA: aceita Date, número serial do Excel, e string
    private static parseDateValue(dateValue: any): Date | null {
        if (!dateValue) return null;

        // Se já é um objeto Date válido
        if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
            return dateValue;
        }

        // Se é número serial do Excel (dias desde 01/01/1900)
        if (typeof dateValue === 'number') {
            const excelEpoch = new Date(1899, 11, 30);
            const daysSinceEpoch = dateValue;
            const date = new Date(excelEpoch.getTime() + daysSinceEpoch * 86400000);
            if (!isNaN(date.getTime())) return date;
        }

        // Se é string, tenta converter
        if (typeof dateValue === 'string') {
            // Tenta DD/MM/YYYY ou DD-MM-YYYY
            let parts = dateValue.split(/[/-]/);
            if (parts.length === 3) {
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1;
                const year = parseInt(parts[2], 10);
                const date = new Date(year, month, day);
                if (!isNaN(date.getTime())) return date;
            }

            // Tenta formato ISO
            const isoDate = new Date(dateValue);
            if (!isNaN(isoDate.getTime())) return isoDate;
        }

        return null;
    }

    private static parseTimeValue(timeValue: any): string {
        if (!timeValue) return '00:00';

        // Se já é string
        if (typeof timeValue === 'string') {
            // Se tem formato HH:MM:SS, pega só HH:MM
            if (timeValue.includes(':')) {
                return timeValue.substring(0, 5);
            }
            return timeValue;
        }

        // Se é número serial do Excel para tempo
        if (typeof timeValue === 'number') {
            const totalSeconds = Math.round(timeValue * 86400);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }

        return '00:00';
    }

    private static parseFloatBr(value: any): number {
        if (!value) return 0;
        if (typeof value === 'number') return value;
        const str = String(value).replace(',', '.');
        return parseFloat(str) || 0;
    }

    private static mapRowToCorrida(row: any): PlanilhaCorrida {
        // Função auxiliar para converter data
        const parseDateValue = (dateValue: any): Date | null => {
            if (!dateValue) return null;
            if (dateValue instanceof Date && !isNaN(dateValue.getTime())) return dateValue;
            if (typeof dateValue === 'number') {
                const excelEpoch = new Date(1899, 11, 30);
                const date = new Date(excelEpoch.getTime() + dateValue * 86400000);
                if (!isNaN(date.getTime())) return date;
            }
            if (typeof dateValue === 'string') {
                let parts = dateValue.split(/[/-]/);
                if (parts.length === 3) {
                    const day = parseInt(parts[0], 10);
                    const month = parseInt(parts[1], 10) - 1;
                    const year = parseInt(parts[2], 10);
                    const date = new Date(year, month, day);
                    if (!isNaN(date.getTime())) return date;
                }
                const isoDate = new Date(dateValue);
                if (!isNaN(isoDate.getTime())) return isoDate;
            }
            return null;
        };

        const parseTimeValue = (timeValue: any): string => {
            if (!timeValue) return '00:00';
            if (typeof timeValue === 'string') {
                if (timeValue.includes(':')) return timeValue.substring(0, 5);
                return timeValue;
            }
            if (typeof timeValue === 'number') {
                const totalSeconds = Math.round(timeValue * 86400);
                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            }
            return '00:00';
        };

        const parseFloatBr = (value: any): number => {
            if (!value) return 0;
            if (typeof value === 'number') return value;
            const str = String(value).replace(',', '.');
            return parseFloat(str) || 0;
        };

        // Pegar valores das colunas
        const rawDataSolicitacao = row['Data Solicitação'] || row['data_solicitacao'] || row['Request Date'];
        const rawDataChegada = row['Data Chegada'] || row['data_chegada'] || row['Drop-off Date'];
        const rawHoraSolicitacao = row['Hora Solicitação'] || row['hora_solicitacao'] || row['Request Time'];
        const rawHoraChegada = row['Hora Chegada'] || row['hora_chegada'] || row['Drop-off Time'];

        // 👇 CORREÇÃO DA PLATAFORMA
        let plataforma: 'UBER' | 'NOVE_NOVE' = 'UBER';
        const plataformaRaw = row['Plataforma'] || row['plataforma'] || '';
        const plataformaStr = String(plataformaRaw).toUpperCase().trim();

        if (plataformaStr === 'NOVE_NOVE' || plataformaStr === '99' || plataformaStr === 'NOVENOVE' || plataformaStr === 'NOVE NOVE') {
            plataforma = 'NOVE_NOVE';
        } else if (plataformaStr === 'UBER') {
            plataforma = 'UBER';
        }

        const idCorrida = row['ID da Corrida'] || row['id_corrida'] || row['Trip ID'] || '';
        const idCorridaStr = String(idCorrida).replace('.0', '');

        return {
            idCorridaPlataforma: idCorridaStr,
            plataforma: plataforma,
            dataSolicitacao: parseDateValue(rawDataSolicitacao),
            horaSolicitacao: parseTimeValue(rawHoraSolicitacao),
            dataChegada: parseDateValue(rawDataChegada),
            horaChegada: parseTimeValue(rawHoraChegada),
            servico: row['Serviço'] || row['servico'] || row['Service'] || '',
            programa: row['Programa'] || row['programa'] || row['Program'] || '',
            grupo: row['Grupo'] || row['grupo'] || row['Group'] || '',
            nome: row['Nome'] || row['nome'] || row['First Name'] || '',
            sobrenome: row['Sobrenome'] || row['sobrenome'] || row['Last Name'] || '',
            nomeCompleto: row['Nome Completo'] || row['nome_completo'] || '',
            email: row['Email'] || row['email'] || row['E-mail'] || '',
            detalhamentoDespesa: row['Detalhamento da despesa'] || row['detalhamento_despesa'] || row['Expense Memo'] || '',
            valorTotal: parseFloatBr(row['Valor Total'] || row['valor_total'] || row['Amount']),
            distanciaKm: parseFloatBr(row['Distância (km)'] || row['distancia_km'] || row['Distance']),
            duracaoMin: Math.round(parseFloatBr(row['Duração (min)'] || row['duracao_min'] || row['Duration'])),
            enderecoPartida: row['Endereço Partida'] || row['endereco_partida'] || row['Pickup Address'] || '',
            enderecoDestino: row['Endereço Destino'] || row['endereco_destino'] || row['Drop-off Address'] || '',
            cidade: row['Cidade'] || row['cidade'] || row['City'] || '',
            pais: row['País'] || row['pais'] || row['Country'] || '',
            status: row['Status']?.toUpperCase() === 'CANCELADA' ? 'CANCELADA' : 'COMPLETA',
        };
    }
}