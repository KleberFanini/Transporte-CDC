"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Download,
    Search,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Eye,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { DateFilterModal } from "@/components/DateFilterModal";
import { Filter } from "lucide-react";

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

export default function TransladoRelatoriosPage() {
    const [translados, setTranslados] = useState<TransladoItem[]>([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Filtros
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("todos");
    const [projetoFilter, setProjetoFilter] = useState("todos");
    const [projetos, setProjetos] = useState<string[]>([]);
    const [loadingProjetos, setLoadingProjetos] = useState(true);

    // Filtro de data
    const [dataInicio, setDataInicio] = useState("");
    const [dataFim, setDataFim] = useState("");
    const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
    const [tempDataInicio, setTempDataInicio] = useState("");
    const [tempDataFim, setTempDataFim] = useState("");

    const [modalAberto, setModalAberto] = useState(false);
    const [transladoSelecionado, setTransladoSelecionado] = useState<TransladoItem | null>(null);

    const itemsPerPage = 20;

    // Carregar TODOS os projetos (independente dos filtros)
    const carregarProjetos = async () => {
        setLoadingProjetos(true);
        try {
            // Busca todos os projetos sem filtros de data
            const response = await fetch("/api/translados/projetos-lista");
            if (response.ok) {
                const data = await response.json();
                console.log("Projetos carregados:", data);
                setProjetos(data);
            }
        } catch (error) {
            console.error("Erro ao carregar projetos:", error);
        } finally {
            setLoadingProjetos(false);
        }
    };

    const buildUrl = (baseUrl: string) => {
        const params = new URLSearchParams();
        if (dataInicio && dataInicio !== "") {
            params.append("dataInicio", dataInicio);
        }
        if (dataFim && dataFim !== "") {
            params.append("dataFim", dataFim);
        }
        if (statusFilter && statusFilter !== "todos") {
            params.append("status", statusFilter);
        }
        if (projetoFilter && projetoFilter !== "todos" && projetoFilter !== "") {
            params.append("projeto", projetoFilter);
        }
        params.append("page", currentPage.toString());
        const queryString = params.toString();
        const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;
        console.log("URL gerada:", url);
        return url;
    };

    const handleAbrirFiltro = () => {
        setTempDataInicio(dataInicio);
        setTempDataFim(dataFim);
        setModalFiltroAberto(true);
    };

    const handleAplicarFiltro = (novaDataInicio: string, novaDataFim: string) => {
        setDataInicio(novaDataInicio);
        setDataFim(novaDataFim);
        setCurrentPage(1);
    };

    const handleResetFiltro = () => {
        setDataInicio("");
        setDataFim("");
        setStatusFilter("todos");
        setProjetoFilter("todos");
        setCurrentPage(1);
        toast.info("Filtros removidos. Mostrando todos os dados.");
    };

    const handleVerDetalhes = (translado: TransladoItem) => {
        setTransladoSelecionado(translado);
        setModalAberto(true);
    };

    const carregarDados = async () => {
        if (!initialLoading) {
            setUpdating(true);
        }
        try {
            const url = buildUrl("/api/translados/lista");
            console.log("Fetching URL:", url);

            const response = await fetch(url);
            const data = await response.json();

            if (data.translados) {
                setTranslados(data.translados);
                setTotalItems(data.total);
                setTotalPages(data.totalPages);
            }
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            toast.error("Erro ao carregar dados dos relatórios");
        } finally {
            setInitialLoading(false);
            setUpdating(false);
        }
    };

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

    // Filtrar pelo searchTerm (client-side - apenas para busca textual)
    const transladosFiltrados = translados.filter((item) =>
        item.lancamento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.fornecedor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.projetoOrigem?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.historico?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Carregar projetos na montagem do componente
    useEffect(() => {
        carregarProjetos();
    }, []);

    // Carregar dados quando os filtros mudarem
    useEffect(() => {
        carregarDados();
    }, [currentPage, dataInicio, dataFim, statusFilter, projetoFilter]);

    const exportarCSV = () => {
        const headers = [
            "Lançamento",
            "Tipo",
            "Fornecedor",
            "CNPJ/CPF",
            "Histórico",
            "Competência",
            "Data Emissão",
            "Data Vencimento",
            "Status",
            "Valor Bruto",
            "Valor Líquido",
            "Projeto",
            "Tipo Pagamento",
            "Documento",
            "Observações",
        ];

        const csvRows = [headers.join(",")];
        for (const row of transladosFiltrados) {
            const values = headers.map(header => {
                let value = "";
                switch (header) {
                    case "Lançamento": value = row.lancamento; break;
                    case "Tipo": value = row.tipo; break;
                    case "Fornecedor": value = row.fornecedor; break;
                    case "CNPJ/CPF": value = row.cnpjCpfFornecedor; break;
                    case "Histórico": value = row.historico; break;
                    case "Competência": value = row.competencia; break;
                    case "Data Emissão": value = new Date(row.dataEmissao).toLocaleDateString("pt-BR"); break;
                    case "Data Vencimento": value = new Date(row.dataVencimento).toLocaleDateString("pt-BR"); break;
                    case "Status": value = row.statusAprovacao; break;
                    case "Valor Bruto": value = row.valorBruto?.toString(); break;
                    case "Valor Líquido": value = row.valorLiquido?.toString(); break;
                    case "Projeto": value = row.projetoOrigem; break;
                    case "Tipo Pagamento": value = row.tipoPagamento; break;
                    case "Documento": value = row.numeroDocumento; break;
                    case "Observações": value = row.observacoesGerais; break;
                }
                return `"${String(value || "").replace(/"/g, '""')}"`;
            });
            csvRows.push(values.join(","));
        }

        const blob = new Blob(["\uFEFF" + csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.setAttribute("download", `relatorio_translados_${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("Relatório exportado com sucesso!");
    };

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

    // Verificar se há filtros ativos
    const hasActiveFilters = dataInicio || dataFim || statusFilter !== "todos" || projetoFilter !== "todos";

    if (initialLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-[#5D2A1A]" />
                <span className="ml-2 text-gray-600">Carregando relatórios...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        Relatórios de Translados
                        {updating && <Loader2 className="h-5 w-5 animate-spin text-[#5D2A1A]" />}
                    </h1>
                    <p className="text-gray-600">
                        Lista detalhada de todos os translados ({totalItems} registros)
                    </p>
                    {hasActiveFilters && (
                        <p className="text-sm text-blue-600 mt-1">
                            {dataInicio && `Data início: ${dataInicio}`}
                            {dataFim && ` até ${dataFim}`}
                            {statusFilter !== "todos" && ` • Status: ${statusFilter}`}
                            {projetoFilter !== "todos" && ` • Projeto: ${projetoFilter}`}
                        </p>
                    )}
                </div>
                <div className="flex flex-wrap gap-3">
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
                    <Button
                        onClick={exportarCSV}
                        className="bg-[#5D2A1A] hover:bg-[#4A2214] text-white"
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Exportar CSV
                    </Button>
                </div>
            </div>

            <DateFilterModal
                open={modalFiltroAberto}
                onOpenChange={setModalFiltroAberto}
                onApply={handleAplicarFiltro}
                dataInicioInicial={tempDataInicio}
                dataFimInicial={tempDataFim}
            />

            {/* Filtros */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Buscar</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Lançamento, fornecedor ou projeto..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">Status</label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Todos" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todos">Todos</SelectItem>
                                    <SelectItem value="Autorizado">Autorizado</SelectItem>
                                    <SelectItem value="Não enviada">Não enviada</SelectItem>
                                    <SelectItem value="Pendente">Pendente</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">Projeto</label>
                            <Select value={projetoFilter} onValueChange={setProjetoFilter} disabled={loadingProjetos}>
                                <SelectTrigger>
                                    <SelectValue placeholder={loadingProjetos ? "Carregando..." : "Todos"} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todos">Todos os projetos</SelectItem>
                                    {projetos.map((projeto) => (
                                        <SelectItem key={projeto} value={projeto}>
                                            {projeto}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {loadingProjetos && (
                                <p className="text-xs text-gray-400 mt-1">Carregando projetos...</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

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

                    {/* Paginação */}
                    {totalPages > 1 && (
                        <div className="flex justify-between items-center p-4 border-t mt-4">
                            <p className="text-sm text-gray-500">
                                Mostrando {translados.length} de {totalItems} registros
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Anterior
                                </Button>
                                <span className="px-3 py-1 text-sm">
                                    Página {currentPage} de {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Próxima
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
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

                            <div className="border-t border-gray-200" />

                            {/* Seção 2: Tipo */}
                            <div>
                                <p className="text-xs text-muted-foreground">Tipo</p>
                                <p className="text-sm">{transladoSelecionado.tipo || "---"}</p>
                            </div>

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
                                </>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}