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
    const [filteredTranslados, setFilteredTranslados] = useState<TransladoItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Filtros
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("todos");
    const [projetoFilter, setProjetoFilter] = useState("todos");
    const [projetos, setProjetos] = useState<string[]>([]);

    // Filtro de data
    const [dataInicio, setDataInicio] = useState("");
    const [dataFim, setDataFim] = useState("");
    const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
    const [tempDataInicio, setTempDataInicio] = useState("");
    const [tempDataFim, setTempDataFim] = useState("");

    const itemsPerPage = 20;

    const buildUrl = (baseUrl: string) => {
        const params = new URLSearchParams();
        if (dataInicio) params.append("dataInicio", dataInicio);
        if (dataFim) params.append("dataFim", dataFim);
        params.append("page", currentPage.toString());
        const queryString = params.toString();
        return queryString ? `${baseUrl}?${queryString}` : baseUrl;
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
        setCurrentPage(1);
        toast.info("Filtro de data removido.");
    };

    const carregarDados = async () => {
        setLoading(true);
        try {
            const response = await fetch(buildUrl("/api/translados/lista"));
            const data = await response.json();

            if (data.translados) {
                setTranslados(data.translados);
                setFilteredTranslados(data.translados);
                setTotalItems(data.total);
                setTotalPages(data.totalPages);

                // Extrair projetos únicos para filtro
                const projetosUnicos = Array.from(new Set(data.translados.map((t: TransladoItem) => t.projetoOrigem).filter(Boolean)));
                setProjetos(projetosUnicos as string[]);
            }
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            toast.error("Erro ao carregar dados dos relatórios");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        carregarDados();
    }, [currentPage, dataInicio, dataFim]);

    // Aplicar filtros locais
    useEffect(() => {
        let filtered = [...translados];

        if (searchTerm) {
            filtered = filtered.filter(t =>
                t.lancamento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.fornecedor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.projetoOrigem?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter !== "todos") {
            filtered = filtered.filter(t => t.statusAprovacao === statusFilter);
        }

        if (projetoFilter !== "todos") {
            filtered = filtered.filter(t => t.projetoOrigem === projetoFilter);
        }

        setFilteredTranslados(filtered);
    }, [searchTerm, statusFilter, projetoFilter, translados]);

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
        for (const row of filteredTranslados) {
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

    if (loading && currentPage === 1) {
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
                    <h1 className="text-3xl font-bold text-gray-900">Relatórios de Translados</h1>
                    <p className="text-gray-600">
                        Lista detalhada de todos os translados ({totalItems} registros)
                    </p>
                    {(dataInicio || dataFim) && (
                        <p className="text-sm text-blue-600 mt-1">
                            Período: {dataInicio || "início"} até {dataFim || "hoje"}
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
                    {(dataInicio || dataFim) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleResetFiltro}
                            className="text-red-600 hover:text-red-700"
                        >
                            Limpar Data
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
                            <Select value={projetoFilter} onValueChange={setProjetoFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Todos" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todos">Todos</SelectItem>
                                    {projetos.map((projeto) => (
                                        <SelectItem key={projeto} value={projeto}>
                                            {projeto}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabela */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left p-3 font-medium">Lançamento</th>
                                    <th className="text-left p-3 font-medium">Fornecedor</th>
                                    <th className="text-left p-3 font-medium">Projeto</th>
                                    <th className="text-right p-3 font-medium">Valor</th>
                                    <th className="text-left p-3 font-medium">Vencimento</th>
                                    <th className="text-left p-3 font-medium">Status</th>
                                    <th className="text-left p-3 font-medium">Competência</th>
                                    <th className="text-left p-3 font-medium">Documento</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTranslados.map((item) => (
                                    <tr key={item.id} className="border-t hover:bg-gray-50">
                                        <td className="p-3 font-mono text-xs">{item.lancamento}</td>
                                        <td className="p-3 max-w-[200px] truncate">{item.fornecedor}</td>
                                        <td className="p-3">{item.projetoOrigem || "-"}</td>
                                        <td className="p-3 text-right font-medium text-green-600">
                                            {formatCurrency(item.valorLiquido)}
                                        </td>
                                        <td className="p-3">{formatDate(item.dataVencimento)}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded-full text-xs ${item.statusAprovacao === "Autorizado"
                                                    ? "bg-green-100 text-green-700"
                                                    : item.statusAprovacao === "Não enviada"
                                                        ? "bg-yellow-100 text-yellow-700"
                                                        : "bg-gray-100 text-gray-700"
                                                }`}>
                                                {item.statusAprovacao || "Pendente"}
                                            </span>
                                        </td>
                                        <td className="p-3">{item.competencia || "-"}</td>
                                        <td className="p-3">{item.numeroDocumento || "-"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredTranslados.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            <Eye className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p>Nenhum translado encontrado</p>
                            <p className="text-sm">Tente ajustar os filtros de busca</p>
                        </div>
                    )}

                    {/* Paginação */}
                    {totalPages > 1 && (
                        <div className="flex justify-between items-center p-4 border-t">
                            <p className="text-sm text-gray-500">
                                Mostrando {filteredTranslados.length} de {totalItems} registros
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
            {filteredTranslados.length > 0 && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center">
                                <p className="text-sm text-gray-500">Total de Registros</p>
                                <p className="text-2xl font-bold">{filteredTranslados.length}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-gray-500">Valor Total</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {formatCurrency(filteredTranslados.reduce((sum, t) => sum + (t.valorLiquido || 0), 0))}
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-gray-500">Valor Médio</p>
                                <p className="text-2xl font-bold">
                                    {formatCurrency(filteredTranslados.reduce((sum, t) => sum + (t.valorLiquido || 0), 0) / filteredTranslados.length)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}