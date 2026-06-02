"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Search,
    Eye,
    Loader2,
    Filter,
} from "lucide-react";
import { toast } from "sonner";
import { DateFilterModal } from "@/components/DateFilterModal";

interface TransladoItem {
    id: string;
    lancamento: string;
    tipo: string;
    responsavelCriacao: string;
    fornecedor: string;
    cnpjCpfFornecedor: string;
    historico: string;
    competencia: string;
    dataEmissao: Date;
    dataVencimento: Date;
    statusAprovacao: string;
    dataPagamento: Date;
    valorBruto: number;
    valorLiquido: number;
    projetoOrigem: string;
    tipoPagamento: string;
    numeroDocumento: string;
    observacoesGerais: string;
}

// Opções para os selects
interface SelectOption {
    value: string;
    label: string;
}

// Função para pegar a cor do status
const getStatusColor = (status: string) => {
    switch (status) {
        case "Autorizado":
            return "bg-green-100 text-green-700 border-green-200";
        case "Não enviada":
            return "bg-yellow-100 text-yellow-700 border-yellow-200";
        default:
            return "bg-gray-100 text-gray-700 border-gray-200";
    }
};

export default function TransladoRelatoriosPage() {
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [translados, setTranslados] = useState<TransladoItem[]>([]);
    const [modalAberto, setModalAberto] = useState(false);
    const [transladoSelecionado, setTransladoSelecionado] = useState<TransladoItem | null>(null);

    // Estados para filtros
    const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
    const [dataInicio, setDataInicio] = useState("");
    const [dataFim, setDataFim] = useState("");
    const [tempDataInicio, setTempDataInicio] = useState("");
    const [tempDataFim, setTempDataFim] = useState("");
    const [statusSelecionado, setStatusSelecionado] = useState("todos");
    const [projetoSelecionado, setProjetoSelecionado] = useState("todos");

    // Opções para os selects
    const [statusOptions, setStatusOptions] = useState<SelectOption[]>([
        { value: "todos", label: "Todos os status" },
        { value: "Autorizado", label: "Autorizado" },
        { value: "Não enviada", label: "Não enviada" },
        { value: "Pendente", label: "Pendente" },
    ]);
    const [projetosOptions, setProjetosOptions] = useState<SelectOption[]>([{ value: "todos", label: "Todos os projetos" }]);

    // Carregar opções de projetos
    const carregarOpcoes = async () => {
        try {
            const params = new URLSearchParams();
            if (dataInicio) params.append('dataInicio', dataInicio);
            if (dataFim) params.append('dataFim', dataFim);

            const projetosRes = await fetch(`/api/translados/projetos-lista?${params.toString()}`);
            if (projetosRes.ok) {
                const projetosData = await projetosRes.json();
                setProjetosOptions([
                    { value: "todos", label: "Todos os projetos" },
                    ...projetosData.map((p: string) => ({ value: p, label: p }))
                ]);
            }
        } catch (error) {
            console.error("Erro ao carregar projetos:", error);
        }
    };

    // Carregar translados
    const carregarTranslados = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();

            if (dataInicio && dataInicio.trim() !== '') {
                params.append('dataInicio', dataInicio);
            }
            if (dataFim && dataFim.trim() !== '') {
                params.append('dataFim', dataFim);
            }
            if (statusSelecionado && statusSelecionado !== 'todos') {
                params.append('status', statusSelecionado);
            }
            if (projetoSelecionado && projetoSelecionado !== 'todos') {
                params.append('projeto', projetoSelecionado);
            }

            const url = `/api/translados/lista?${params.toString()}`;
            console.log('📡 URL:', url);

            const response = await fetch(url);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Erro da API:', errorData);
                throw new Error(errorData.error || "Erro ao carregar translados");
            }

            const data = await response.json();
            setTranslados(data.translados || []);
        } catch (error) {
            console.error("Erro:", error);
            toast.error(error instanceof Error ? error.message : "Erro ao carregar translados");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        carregarOpcoes();
        carregarTranslados();
    }, [dataInicio, dataFim, statusSelecionado, projetoSelecionado]);

    const handleVerDetalhes = (translado: TransladoItem) => {
        setTransladoSelecionado(translado);
        setModalAberto(true);
    };

    const handleAbrirFiltro = () => {
        setTempDataInicio(dataInicio);
        setTempDataFim(dataFim);
        setModalFiltroAberto(true);
    };

    const handleAplicarFiltro = (novaDataInicio: string, novaDataFim: string) => {
        setDataInicio(novaDataInicio);
        setDataFim(novaDataFim);
    };

    const handleResetFiltro = () => {
        setDataInicio("");
        setDataFim("");
        setStatusSelecionado("todos");
        setProjetoSelecionado("todos");
        toast.info("Filtros removidos. Mostrando todos os dados.");
    };

    // Filtrar translados pelo searchTerm (client-side)
    const transladosFiltrados = translados.filter((item) =>
        item.lancamento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.fornecedor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.projetoOrigem?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.historico?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Verificar se há filtros ativos
    const hasActiveFilters = dataInicio || dataFim || statusSelecionado !== "todos" || projetoSelecionado !== "todos";

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value || 0);
    };

    const formatDate = (date: Date) => {
        if (!date) return "-";
        return new Date(date).toLocaleDateString("pt-BR");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-[#5D2A1A]" />
                <span className="ml-2 text-gray-600">Carregando translados...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Relatórios de Translados</h1>
                        <p className="text-gray-600">Lista detalhada de todos os translados</p>
                        {hasActiveFilters && (
                            <p className="text-sm text-blue-600 mt-1">
                                {dataInicio && `Data início: ${dataInicio}`}
                                {dataFim && ` até ${dataFim}`}
                                {statusSelecionado !== "todos" && ` • Status: ${statusSelecionado}`}
                                {projetoSelecionado !== "todos" && ` • Projeto: ${projetoSelecionado}`}
                            </p>
                        )}
                    </div>

                    {/* Botões de filtro */}
                    <div className="flex flex-wrap gap-2 items-center">
                        <select
                            className="border rounded-lg px-3 py-2 text-sm bg-[#F5F3EF] hover:bg-[#E8E4DF] transition-colors cursor-pointer min-w-[180px]"
                            value={statusSelecionado}
                            onChange={(e) => setStatusSelecionado(e.target.value)}
                        >
                            {statusOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>

                        <select
                            className="border rounded-lg px-3 py-2 text-sm bg-[#F5F3EF] hover:bg-[#E8E4DF] transition-colors cursor-pointer min-w-[180px]"
                            value={projetoSelecionado}
                            onChange={(e) => setProjetoSelecionado(e.target.value)}
                        >
                            {projetosOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>

                        {hasActiveFilters && (
                            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                Filtro ativo
                            </span>
                        )}

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleAbrirFiltro}
                            className="flex items-center gap-2"
                        >
                            <Filter className="h-4 w-4" />
                            Filtrar por Data
                        </Button>

                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleResetFiltro}
                                className="text-red-600 hover:text-red-700"
                            >
                                Limpar Filtros
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Barra de pesquisa */}
            <Card>
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Buscar por lançamento, fornecedor, projeto ou histórico..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Modal de Filtro de Data */}
            <DateFilterModal
                open={modalFiltroAberto}
                onOpenChange={setModalFiltroAberto}
                onApply={handleAplicarFiltro}
                dataInicioInicial={tempDataInicio}
                dataFimInicial={tempDataFim}
            />

            {/* Tabela de translados */}
            <Card>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Lançamento</TableHead>
                                    <TableHead className="min-w-[200px]">Fornecedor</TableHead>
                                    <TableHead className="min-w-[150px]">Projeto</TableHead>
                                    <TableHead className="w-[120px] text-right">Valor</TableHead>
                                    <TableHead className="w-[100px]">Vencimento</TableHead>
                                    <TableHead className="w-[100px]">Status</TableHead>
                                    <TableHead className="w-[100px]">Competência</TableHead>
                                    <TableHead className="w-[80px] text-center">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transladosFiltrados.map((item) => (
                                    <TableRow key={item.id} className="hover:bg-gray-50">
                                        <TableCell className="font-mono text-xs">{item.lancamento}</TableCell>
                                        <TableCell className="max-w-[200px] truncate">{item.fornecedor}</TableCell>
                                        <TableCell>{item.projetoOrigem || "-"}</TableCell>
                                        <TableCell className="text-right font-medium text-green-600">
                                            {formatCurrency(item.valorLiquido)}
                                        </TableCell>
                                        <TableCell>{formatDate(item.dataVencimento)}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={getStatusColor(item.statusAprovacao || '')}>
                                                {item.statusAprovacao || "Pendente"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{item.competencia || "-"}</TableCell>
                                        <TableCell className="text-center">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleVerDetalhes(item)}
                                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                title="Ver detalhes"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {transladosFiltrados.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                                            Nenhum translado encontrado
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Resumo */}
            {transladosFiltrados.length > 0 && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center">
                                <p className="text-sm text-gray-500">Total de Registros</p>
                                <p className="text-2xl font-bold">{transladosFiltrados.length}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-gray-500">Valor Total</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {formatCurrency(transladosFiltrados.reduce((sum, t) => sum + (t.valorLiquido || 0), 0))}
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-gray-500">Valor Médio</p>
                                <p className="text-2xl font-bold">
                                    {formatCurrency(transladosFiltrados.reduce((sum, t) => sum + (t.valorLiquido || 0), 0) / transladosFiltrados.length)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Modal de detalhes do translado */}
            <Dialog open={modalAberto} onOpenChange={setModalAberto}>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl">
                            Detalhes do Translado
                        </DialogTitle>
                        <DialogDescription>
                            Informações completas do translado {transladoSelecionado?.lancamento}
                        </DialogDescription>
                    </DialogHeader>

                    {transladoSelecionado && (
                        <div className="space-y-4 mt-4">
                            {/* Seção 1: Identificação */}
                            <div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Lançamento</p>
                                        <p className="text-sm font-medium">{transladoSelecionado.lancamento}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Status</p>
                                        <Badge variant="outline" className={getStatusColor(transladoSelecionado.statusAprovacao || '')}>
                                            {transladoSelecionado.statusAprovacao || "Pendente"}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Separador */}
                            <div className="border-t border-gray-200" />

                            {/* Seção 2: Tipo */}
                            <div>
                                <p className="text-xs text-muted-foreground">Tipo</p>
                                <p className="text-sm">{transladoSelecionado.tipo || "---"}</p>
                            </div>

                            {/* Separador */}
                            <div className="border-t border-gray-200" />

                            {/* Seção 3: Fornecedor */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground">Fornecedor</p>
                                    <p className="text-sm font-medium">{transladoSelecionado.fornecedor}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">CNPJ/CPF</p>
                                    <p className="text-sm">{transladoSelecionado.cnpjCpfFornecedor || "---"}</p>
                                </div>
                            </div>

                            {/* Separador */}
                            <div className="border-t border-gray-200" />

                            {/* Seção 4: Projeto e Responsável */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground">Projeto Origem</p>
                                    <p className="text-sm">{transladoSelecionado.projetoOrigem || "---"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Responsável Criação</p>
                                    <p className="text-sm">{transladoSelecionado.responsavelCriacao || "---"}</p>
                                </div>
                            </div>

                            {/* Separador */}
                            <div className="border-t border-gray-200" />

                            {/* Seção 5: Datas */}
                            <div>
                                <p className="text-xs text-muted-foreground mb-2">Datas</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Data Emissão</p>
                                        <p className="text-sm">{formatDate(transladoSelecionado.dataEmissao)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Data Vencimento</p>
                                        <p className="text-sm">{formatDate(transladoSelecionado.dataVencimento)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Data Pagamento</p>
                                        <p className="text-sm">{formatDate(transladoSelecionado.dataPagamento)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Competência</p>
                                        <p className="text-sm">{transladoSelecionado.competencia || "---"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Separador */}
                            <div className="border-t border-gray-200" />

                            {/* Seção 6: Valores */}
                            <div>
                                <p className="text-xs text-muted-foreground mb-2">Valores</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Valor Bruto</p>
                                        <p className="text-sm font-medium">{formatCurrency(transladoSelecionado.valorBruto)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Valor Líquido</p>
                                        <p className="text-sm font-bold text-primary">{formatCurrency(transladoSelecionado.valorLiquido)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Separador */}
                            <div className="border-t border-gray-200" />

                            {/* Seção 7: Pagamento */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground">Tipo Pagamento</p>
                                    <p className="text-sm">{transladoSelecionado.tipoPagamento || "---"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Número Documento</p>
                                    <p className="text-sm">{transladoSelecionado.numeroDocumento || "---"}</p>
                                </div>
                            </div>

                            {/* Separador */}
                            <div className="border-t border-gray-200" />

                            {/* Seção 8: Descrições */}
                            {(transladoSelecionado.historico || transladoSelecionado.observacoesGerais) && (
                                <>
                                    <div>
                                        {transladoSelecionado.historico && (
                                            <div className="mb-3">
                                                <p className="text-xs text-muted-foreground">Histórico</p>
                                                <p className="text-sm bg-muted/30 p-3 rounded-md">{transladoSelecionado.historico}</p>
                                            </div>
                                        )}
                                        {transladoSelecionado.observacoesGerais && (
                                            <div>
                                                <p className="text-xs text-muted-foreground">Observações Gerais</p>
                                                <p className="text-sm bg-muted/30 p-3 rounded-md">{transladoSelecionado.observacoesGerais}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="border-t border-gray-200" />
                                </>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}