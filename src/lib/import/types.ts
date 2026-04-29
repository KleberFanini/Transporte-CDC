export interface PlanilhaCorrida {
    idCorridaPlataforma: string;
    plataforma: 'UBER' | 'NOVE_NOVE';
    dataSolicitacao: Date | null;
    horaSolicitacao: string;
    dataChegada: Date | null;
    horaChegada: string;
    servico: string;
    programa: string;
    grupo: string;
    nome: string;
    sobrenome: string;
    nomeCompleto: string;
    valorTotal: number;
    distanciaKm: number;
    duracaoMin: number;
    enderecoPartida: string;
    enderecoDestino: string;
    cidade: string;
    pais: string;
    status: 'COMPLETA' | 'CANCELADA' | 'EM_ANDAMENTO';
}