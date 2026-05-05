"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateFilterModal } from "@/components/DateFilterModal";

interface Funcionario {
    id: string;
    nome: string;
    sobrenome: string;
    nomeCompleto: string;
    email: string;
    grupo: string;
    programa: string;
    servico: string;
    cidade: string;
    pais: string;
    totalViagens: number;
    valorTotal: number;
}

interface CorridaDetalhe {
    id: string;
    dataSolicitacao: string;
    horaSolicitacao: string;
    horaChegada: string;
    enderecoPartida: string;
    enderecoDestino: string;
    servico: string;
    detalhamentoDespesa: string;
    valorTotal: number;
}

// Opções para os selects
interface SelectOption {
    value: string;
    label: string;
}

export default function UsuariosPage() {
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
    const [modalAberto, setModalAberto] = useState(false);
    const [funcionarioSelecionado, setFuncionarioSelecionado] = useState<Funcionario | null>(null);
    const [corridasDetalhe, setCorridasDetalhe] = useState<CorridaDetalhe[]>([]);
    const [loadingDetalhe, setLoadingDetalhe] = useState(false);

    // Estados para filtros
    const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
    const [dataInicio, setDataInicio] = useState("");
    const [dataFim, setDataFim] = useState("");
    const [tempDataInicio, setTempDataInicio] = useState("");
    const [tempDataFim, setTempDataFim] = useState("");
    const [programaSelecionado, setProgramaSelecionado] = useState("todos");

    // Opções para o select de programas
    const [programasOptions, setProgramasOptions] = useState<SelectOption[]>([{ value: "todos", label: "Todos os programas" }]);

    // Carregar opções de programas
    const carregarOpcoes = async () => {
        try {
            const params = new URLSearchParams();
            if (dataInicio) params.append('dataInicio', dataInicio);
            if (dataFim) params.append('dataFim', dataFim);

            const programasRes = await fetch(`/api/dashboard/programas-lista?${params.toString()}`);
            const programasData = await programasRes.json();
            setProgramasOptions([
                { value: "todos", label: "Todos os programas" },
                ...programasData.map((p: string) => ({ value: p, label: p }))
            ]);
        } catch (error) {
            console.error("Erro ao carregar programas:", error);
        }
    };

    // Carregar funcionários
    const carregarFuncionarios = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (dataInicio) params.append('dataInicio', dataInicio);
            if (dataFim) params.append('dataFim', dataFim);
            if (programaSelecionado && programaSelecionado !== 'todos') params.append('programa', programaSelecionado);

            const url = `/api/dashboard/funcionarios?${params.toString()}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error("Erro ao carregar funcionários");
            const data = await response.json();
            setFuncionarios(data);
        } catch (error) {
            console.error("Erro:", error);
            toast.error("Erro ao carregar funcionários");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        carregarOpcoes();
        carregarFuncionarios();
    }, [dataInicio, dataFim, programaSelecionado]);

    // Carregar detalhes das corridas do funcionário
    const carregarDetalhesCorridas = async (funcionario: Funcionario) => {
        setLoadingDetalhe(true);
        setFuncionarioSelecionado(funcionario);
        setModalAberto(true);

        try {
            const params = new URLSearchParams();
            params.append('nomeCompleto', funcionario.nomeCompleto);
            if (dataInicio) params.append('dataInicio', dataInicio);
            if (dataFim) params.append('dataFim', dataFim);
            if (programaSelecionado && programaSelecionado !== 'todos') params.append('programa', programaSelecionado);

            const response = await fetch(`/api/dashboard/corridas-por-funcionario?${params.toString()}`);
            if (!response.ok) throw new Error("Erro ao carregar corridas");
            const data = await response.json();
            setCorridasDetalhe(data);
        } catch (error) {
            console.error("Erro:", error);
            toast.error("Erro ao carregar detalhes das corridas");
            setCorridasDetalhe([]);
        } finally {
            setLoadingDetalhe(false);
        }
    };

    const handleVerDetalhes = (funcionario: Funcionario) => {
        carregarDetalhesCorridas(funcionario);
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
        setProgramaSelecionado("todos");
        toast.info("Filtros removidos. Mostrando todos os dados.");
    };

    // Filtrar funcionários pelo searchTerm (client-side)
    const funcionariosFiltrados = funcionarios.filter((func) =>
        func.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        func.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        func.programa.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Verificar se há filtros ativos
    const hasActiveFilters = dataInicio || dataFim || programaSelecionado !== "todos";

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-[#5D2A1A]" />
                <span className="ml-2 text-gray-600">Carregando funcionários...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Funcionários</h1>
                        <p className="text-gray-600">Lista de funcionários e seus gastos</p>
                        {hasActiveFilters && (
                            <p className="text-sm text-blue-600 mt-1">
                                {dataInicio && `Data início: ${dataInicio}`}
                                {dataFim && ` até ${dataFim}`}
                                {programaSelecionado !== "todos" && ` • Programa: ${programaSelecionado}`}
                            </p>
                        )}
                    </div>

                    {/* Botões de filtro */}
                    <div className="flex flex-wrap gap-2 items-center">
                        <select
                            className="border rounded-lg px-3 py-2 text-sm bg-[#F5F3EF] hover:bg-[#E8E4DF] transition-colors cursor-pointer min-w-[180px]"
                            value={programaSelecionado}
                            onChange={(e) => setProgramaSelecionado(e.target.value)}
                        >
                            {programasOptions.map((opt) => (
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
            <CardContent className="p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Buscar por nome, email ou programa..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </CardContent>

            {/* Modal de Filtro de Data */}
            <DateFilterModal
                open={modalFiltroAberto}
                onOpenChange={setModalFiltroAberto}
                onApply={handleAplicarFiltro}
                dataInicioInicial={tempDataInicio}
                dataFimInicial={tempDataFim}
            />

            {/* Tabela de funcionários */}
            <Card>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Nome</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Programa</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Grupo</th>
                                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Viagens</th>
                                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Valor Total</th>
                                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {funcionariosFiltrados.map((func) => (
                                    <tr key={func.id} className="border-b hover:bg-gray-50">
                                        <td className="py-3 px-4">
                                            <div>
                                                <p className="font-medium">{func.nomeCompleto}</p>
                                                <p className="text-xs text-gray-500">{func.email}</p>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-sm">{func.programa}</td>
                                        <td className="py-3 px-4 text-sm">{func.grupo || "-"}</td>
                                        <td className="py-3 px-4 text-right font-medium">{func.totalViagens}</td>
                                        <td className="py-3 px-4 text-right font-medium">
                                            R$ {func.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleVerDetalhes(func)}
                                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                title="Ver detalhes"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {funcionariosFiltrados.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-gray-500">
                                            Nenhum funcionário encontrado
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Modal de detalhes das corridas */}
            <Dialog open={modalAberto} onOpenChange={setModalAberto}>
                <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto bg-gray-50">
                    <DialogHeader>
                        <DialogTitle className="text-xl">
                            Corridas de {funcionarioSelecionado?.nomeCompleto}
                        </DialogTitle>
                        <DialogDescription>
                            Histórico completo de viagens do funcionário
                        </DialogDescription>
                    </DialogHeader>

                    {/* Tabs dentro do modal */}
                    <Tabs defaultValue="corridas" className="w-full">
                        <TabsList className="grid w-full max-w-md grid-cols-2">
                            <TabsTrigger value="corridas">Detalhes das Corridas</TabsTrigger>
                            <TabsTrigger value="servicos">Serviços Utilizados</TabsTrigger>
                        </TabsList>

                        {/* Aba 1 - Detalhes das Corridas */}
                        <TabsContent value="corridas" className="mt-4">
                            {loadingDetalhe ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-[#5D2A1A]" />
                                    <span className="ml-2 text-gray-600">Carregando corridas...</span>
                                </div>
                            ) : corridasDetalhe.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    Nenhuma corrida encontrada para este funcionário
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[100px]">Data</TableHead>
                                                <TableHead className="w-[80px]">Hora</TableHead>
                                                <TableHead>Endereço de Partida</TableHead>
                                                <TableHead>Endereço de Destino</TableHead>
                                                <TableHead>Serviço</TableHead>
                                                <TableHead>Detalhamento</TableHead>
                                                <TableHead className="text-right">Valor</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {corridasDetalhe.map((corrida) => (
                                                <TableRow key={corrida.id}>
                                                    <TableCell className="font-mono text-sm">
                                                        {corrida.dataSolicitacao
                                                            ? format(new Date(corrida.dataSolicitacao), "dd/MM/yyyy", { locale: ptBR })
                                                            : "-"}
                                                    </TableCell>
                                                    <TableCell className="font-mono text-sm">
                                                        {corrida.horaSolicitacao && corrida.horaChegada
                                                            ? `${corrida.horaSolicitacao} → ${corrida.horaChegada}`
                                                            : corrida.horaSolicitacao || corrida.horaChegada || "-"}
                                                    </TableCell>
                                                    <TableCell className="max-w-[200px] truncate" title={corrida.enderecoPartida}>
                                                        {corrida.enderecoPartida || "-"}
                                                    </TableCell>
                                                    <TableCell className="max-w-[200px] truncate" title={corrida.enderecoDestino}>
                                                        {corrida.enderecoDestino || "-"}
                                                    </TableCell>
                                                    <TableCell>{corrida.servico || "-"}</TableCell>
                                                    <TableCell className="max-w-[200px] truncate" title={corrida.detalhamentoDespesa}>
                                                        {corrida.detalhamentoDespesa || "-"}
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        R$ {corrida.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </TabsContent>

                        {/* Aba 2 - Serviços Utilizados */}
                        <TabsContent value="servicos" className="mt-4">
                            {loadingDetalhe ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-[#5D2A1A]" />
                                    <span className="ml-2 text-gray-600">Carregando serviços...</span>
                                </div>
                            ) : corridasDetalhe.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    Nenhum serviço encontrado para este funcionário
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {(() => {
                                            // Agrupar por serviço
                                            const servicosMap = new Map();
                                            const totalGeral = corridasDetalhe.reduce((acc, c) => acc + c.valorTotal, 0);
                                            const colors = [
                                                "from-[#5D2A1A] to-[#7A3B24]",
                                                "from-[#8B4513] to-[#A0522D]",
                                                "from-[#CD853F] to-[#DEB887]",
                                                "from-[#D2691E] to-[#E5984C]",
                                                "from-[#F4A460] to-[#FFB347]",
                                                "from-[#8B5A2B] to-[#A0522D]",
                                                "from-[#6B3410] to-[#8B4513]",
                                                "from-[#9B5C3D] to-[#B87C4F]",
                                            ];

                                            corridasDetalhe.forEach(corrida => {
                                                const servico = corrida.servico && corrida.servico.trim() !== '' ? corrida.servico : 'Não categorizado';
                                                if (!servicosMap.has(servico)) {
                                                    servicosMap.set(servico, { quantidade: 0, valor: 0 });
                                                }
                                                const item = servicosMap.get(servico);
                                                item.quantidade++;
                                                item.valor += corrida.valorTotal;
                                            });

                                            // Ordenar por quantidade (maior para menor)
                                            const servicosOrdenados = Array.from(servicosMap.entries())
                                                .map(([nome, dados]) => ({ nome, ...dados }))
                                                .sort((a, b) => b.quantidade - a.quantidade);

                                            return servicosOrdenados.map((servico, index) => (
                                                <Card key={servico.nome} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                                                    <div className={`bg-gradient-to-r ${colors[index % colors.length]} p-3 text-white`}>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-lg font-bold truncate flex-1 mr-2">{servico.nome}</span>
                                                            <span className="text-2xl font-bold">{servico.quantidade}</span>
                                                        </div>
                                                    </div>
                                                    <CardContent className="p-4">
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-sm text-gray-600">Valor Total:</span>
                                                                <span className="font-semibold text-gray-900">
                                                                    R$ {servico.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-sm text-gray-600">Ticket Médio:</span>
                                                                <span className="font-semibold text-gray-900">
                                                                    R$ {(servico.valor / servico.quantidade).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-sm text-gray-600">Percentual:</span>
                                                                <span className="font-semibold text-gray-900">
                                                                    {totalGeral > 0 ? ((servico.valor / totalGeral) * 100).toFixed(1) : 0}%
                                                                </span>
                                                            </div>
                                                            <div className="mt-2">
                                                                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                                    <div
                                                                        className="h-full rounded-full"
                                                                        style={{
                                                                            width: `${totalGeral > 0 ? (servico.valor / totalGeral) * 100 : 0}%`,
                                                                            backgroundColor: colors[index % colors.length].split(' ')[0].replace('from-[', '').replace(']', '')
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ));
                                        })()}
                                    </div>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>
        </div>
    );
}