"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    Calendar,
    MapPin,
    Clock,
    Car,
    FileText,
    DollarSign,
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

export default function UsuariosPage() {
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
    const [modalAberto, setModalAberto] = useState(false);
    const [funcionarioSelecionado, setFuncionarioSelecionado] = useState<Funcionario | null>(null);
    const [corridasDetalhe, setCorridasDetalhe] = useState<CorridaDetalhe[]>([]);
    const [loadingDetalhe, setLoadingDetalhe] = useState(false);

    const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
    const [dataInicio, setDataInicio] = useState("");
    const [dataFim, setDataFim] = useState("");
    const [tempDataInicio, setTempDataInicio] = useState("");
    const [tempDataFim, setTempDataFim] = useState("");

    // Carregar funcionários
    const carregarFuncionarios = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (dataInicio) params.append('dataInicio', dataInicio);
            if (dataFim) params.append('dataFim', dataFim);

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
        carregarFuncionarios();
    }, [dataInicio, dataFim]);

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
        toast.info("Filtro removido. Mostrando todos os dados.");
    };

    // Filtrar funcionários
    const funcionariosFiltrados = funcionarios.filter((func) =>
        func.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        func.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        func.programa.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Funcionários</h1>
                    <p className="text-gray-600">Lista de funcionários e seus gastos</p>
                </div>

                {/* Botões de filtro */}
                <div className="flex flex-wrap gap-2 items-center">
                    {(dataInicio || dataFim) && (
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            Filtro ativo
                        </span>
                    )}

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAbrirFiltro}
                        className="flex items-center gap-2 hover:bg-[#bdb8ae] hover:text-gray-900 focus:bg-[#bdb8ae] focus:text-gray-900 data-[highlighted]:bg-[#bdb8ae] data-[highlighted]:text-gray-900"
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
                            Limpar Filtro
                        </Button>
                    )}
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

            {/* Modal de Filtro */}
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
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Email</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Programa</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Grupo</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Cidade</th>
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
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-sm">{func.email}</td>
                                        <td className="py-3 px-4 text-sm">{func.programa}</td>
                                        <td className="py-3 px-4 text-sm">{func.grupo || "-"}</td>
                                        <td className="py-3 px-4 text-sm">{func.cidade}</td>
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
                                                <Eye className="h-4 w-4 mr-1" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {funcionariosFiltrados.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="text-center py-8 text-gray-500">
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
                                                {format(new Date(corrida.dataSolicitacao), "dd/MM/yyyy", { locale: ptBR })}
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">
                                                {corrida.horaSolicitacao + " - " + corrida.horaChegada || "-"}
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
                </DialogContent>
            </Dialog>
        </div>
    );
}