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

    private static parseDateValue(dateValue: any): Date | null {
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
    }

    private static parseTimeValue(timeValue: any): string {
        if (!timeValue) return '00:00';
        if (typeof timeValue === 'string') {
            if (timeValue.includes(':')) {
                return timeValue.substring(0, 5);
            }
            return timeValue;
        }
        if (typeof timeValue === 'number') {
            const totalSeconds = Math.round(timeValue * 86400);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
        return '00:00';
    }

    private static parseFloatBr(value: any): number {
        if (!value || value === '') return 0;
        if (typeof value === 'number') return value;

        let str = String(value).trim();

        // Substitui vírgula por ponto (decimal)
        str = str.replace(',', '.');

        // Remove caracteres não numéricos exceto ponto e sinal de menos
        str = str.replace(/[^0-9.-]/g, '');

        const num = parseFloat(str);

        return isNaN(num) ? 0 : num;
    }

    // 👇 FUNÇÃO CORRIGIDA: Converte Milhas para KM
    private static parseMilhasToKm(milhasValue: any): number {
        const MILHAS_PARA_KM = 1.60934;

        // Primeiro, converte o valor para número (tratando vírgula)
        let milhas = 0;

        if (typeof milhasValue === 'number') {
            milhas = milhasValue;
        } else if (typeof milhasValue === 'string') {
            // Substitui vírgula por ponto
            const str = milhasValue.replace(',', '.').trim();
            milhas = parseFloat(str);
        } else {
            milhas = 0;
        }

        const km = milhas * MILHAS_PARA_KM;

        console.log(`📏 Milhas: ${milhas} mi -> ${km.toFixed(2)} km`);

        return Number(km.toFixed(2));
    }

    private static mapRowToCorrida(row: any): PlanilhaCorrida {
        // Pegar valores das colunas
        const rawDataSolicitacao = row['Data Solicitação'] || row['data_solicitacao'] || row['Request Date'];
        const rawDataChegada = row['Data Chegada'] || row['data_chegada'] || row['Drop-off Date'];
        const rawHoraSolicitacao = row['Hora Solicitação'] || row['hora_solicitacao'] || row['Request Time'];
        const rawHoraChegada = row['Hora Chegada'] || row['hora_chegada'] || row['Drop-off Time'];

        // Correção da plataforma
        let plataforma: 'UBER' | 'NOVE_NOVE' = 'UBER';
        const plataformaRaw = row['Plataforma'] || row['plataforma'] || '';
        const plataformaStr = String(plataformaRaw).toUpperCase().trim();

        if (plataformaStr === 'NOVE_NOVE' || plataformaStr === '99' || plataformaStr === 'NOVENOVE' || plataformaStr === 'NOVE NOVE') {
            plataforma = 'NOVE_NOVE';
        }

        // ID da corrida
        const idCorrida = row['ID da Corrida'] || row['id_corrida'] || row['Trip ID'] || '';
        const idCorridaStr = String(idCorrida).replace('.0', '');

        // 👇 OBTÉM O VALOR CRU DA DISTÂNCIA
        const distanciaRaw = row['Distância (km)'] || row['distancia_km'] || row['Distance'] || 0;

        // 👇 CONVERTE APENAS SE FOR UBER (milhas para km)
        let distanciaKm = 0;
        const MILHAS_PARA_KM = 1.60934;

        // Converte o valor para número (tratando vírgula)
        let valorNumerico = 0;
        if (typeof distanciaRaw === 'number') {
            valorNumerico = distanciaRaw;
        } else if (typeof distanciaRaw === 'string') {
            const str = distanciaRaw.replace(',', '.').trim();
            valorNumerico = parseFloat(str);
        }

        if (plataforma === 'UBER') {
            // UBER: está em MILHAS → converter para KM
            distanciaKm = valorNumerico * MILHAS_PARA_KM;
            console.log(`📏 UBER: ${valorNumerico} milhas → ${distanciaKm.toFixed(2)} km`);
        } else {
            // 99 (NOVE_NOVE): já está em KM
            distanciaKm = valorNumerico;
            console.log(`📏 99: ${distanciaKm.toFixed(2)} km (já em km)`);
        }

        // Duração
        let duracaoMin = 0;
        const duracaoRaw = row['Duração (min)'] || row['duracao_min'] || row['Duration'];
        if (duracaoRaw) {
            if (typeof duracaoRaw === 'string' && duracaoRaw.includes(':')) {
                const parts = duracaoRaw.split(':');
                duracaoMin = parseInt(parts[0]) * 60 + parseInt(parts[1]);
                if (parts.length > 2) duracaoMin += parseInt(parts[2]);
            } else {
                duracaoMin = Math.round(this.parseFloatBr(duracaoRaw));
            }
        }

        return {
            idCorridaPlataforma: idCorridaStr,
            plataforma: plataforma,
            dataSolicitacao: this.parseDateValue(rawDataSolicitacao),
            horaSolicitacao: this.parseTimeValue(rawHoraSolicitacao),
            dataChegada: this.parseDateValue(rawDataChegada),
            horaChegada: this.parseTimeValue(rawHoraChegada),
            servico: row['Serviço'] || row['servico'] || row['Service'] || '',
            programa: row['Programa'] || row['programa'] || row['Program'] || '',
            grupo: row['Grupo'] || row['grupo'] || row['Group'] || '',
            nome: row['Nome'] || row['nome'] || row['First Name'] || '',
            sobrenome: row['Sobrenome'] || row['sobrenome'] || row['Last Name'] || '',
            nomeCompleto: row['Nome Completo'] || row['nome_completo'] || '',
            email: row['Email'] || row['email'] || row['E-mail'] || '',
            detalhamentoDespesa: row['Detalhamento da despesa'] || row['detalhamento_despesa'] || row['Expense Memo'] || '',
            valorTotal: this.parseFloatBr(row['Valor Total'] || row['valor_total'] || row['Amount']),
            distanciaKm: Number(distanciaKm.toFixed(2)),
            duracaoMin: duracaoMin,
            enderecoPartida: row['Endereço Partida'] || row['endereco_partida'] || row['Pickup Address'] || '',
            enderecoDestino: row['Endereço Destino'] || row['endereco_destino'] || row['Drop-off Address'] || '',
            cidade: row['Cidade'] || row['cidade'] || row['City'] || '',
            pais: row['País'] || row['pais'] || row['Country'] || '',
            status: row['Status']?.toUpperCase() === 'CANCELADA' ? 'CANCELADA' : 'COMPLETA',
        };
    }
}