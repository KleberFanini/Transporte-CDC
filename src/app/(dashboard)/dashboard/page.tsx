"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
    Users,
    DollarSign,
    Filter,
    Download,
    Car,
    Loader2
} from "lucide-react";
import { toast } from "sonner";
import { DateFilterModal } from "@/components/DateFilterModal";
import { PlatformFilter } from "@/components/PlatformFilter";

// Tipos para os dados do banco
interface DashboardResumo {
    totalViagens: number;
    valorTotal: number;
    funcionariosAtivos: number;
    grupos: number;
    distanciaTotal: number;
    tempoTotal: number;
}

interface Programa {
    nome: string;
    valor: number;
    viagens: number;
}

interface Funcionario {
    id: string;
    nome: string;
    sobrenome: string;
    nomeCompleto: string;
    email: string;
    titulo: string;
    grupo: string;
    programa: string;
    servico: string;
    cidade: string;
    pais: string;
    totalViagens: number;
    valorTotal: number;
}

interface UltimaViagem {
    id: string;
    funcionario: string;
    grupo: string;
    programa: string;
    servico: string;
    dataSolicitacao: string;
    horaSolicitacao: string;
    dataChegada: string;
    horaChegada: string;
    partida: string;
    destino: string;
    distancia: number;
    duracao: number;
    valor: number;
}

// Opções para os selects
interface SelectOption {
    value: string;
    label: string;
}

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
    const [plataforma, setPlataforma] = useState("todos");
    const [programaGlobal, setProgramaGlobal] = useState("todos");

    // Filtro APENAS para a aba de Funcionários (apenas grupo)
    const [filtroGrupo, setFiltroGrupo] = useState("todos");

    // Estados para datas (global)
    const [dataInicio, setDataInicio] = useState("");
    const [dataFim, setDataFim] = useState("");
    const [tempDataInicio, setTempDataInicio] = useState("");
    const [tempDataFim, setTempDataFim] = useState("");

    // Estados para os dados
    const [resumo, setResumo] = useState<DashboardResumo | null>(null);
    const [programas, setProgramas] = useState<Programa[]>([]);
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
    const [ultimasViagens, setUltimasViagens] = useState<UltimaViagem[]>([]);
    const [servicos, setServicos] = useState<{ tipo: string; viagens: number; valor: number }[]>([]);

    // Opções para os selects
    const [gruposOptions, setGruposOptions] = useState<SelectOption[]>([{ value: "todos", label: "Todos os grupos" }]);
    const [programasOptions, setProgramasOptions] = useState<SelectOption[]>([{ value: "todos", label: "Todos os programas" }]);

    // Carregar opções de grupos e programas
    const carregarOpcoes = async () => {
        try {
            const params = new URLSearchParams();
            if (dataInicio) params.append('dataInicio', dataInicio);
            if (dataFim) params.append('dataFim', dataFim);
            if (plataforma && plataforma !== 'todos') params.append('plataforma', plataforma);
            if (programaGlobal && programaGlobal !== 'todos') params.append('programa', programaGlobal);

            const gruposRes = await fetch(`/api/dashboard/grupos?${params.toString()}`);
            const gruposData = await gruposRes.json();
            setGruposOptions([
                { value: "todos", label: "Todos os grupos" },
                ...gruposData.map((g: string) => ({ value: g, label: g }))
            ]);

            const programasRes = await fetch(`/api/dashboard/programas-lista?${params.toString()}`);
            const programasData = await programasRes.json();
            setProgramasOptions([
                { value: "todos", label: "Todos os programas" },
                ...programasData.map((p: string) => ({ value: p, label: p }))
            ]);
        } catch (error) {
            console.error("Erro ao carregar opções:", error);
        }
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
        setPlataforma("todos");
        setProgramaGlobal("todos");
        setFiltroGrupo("todos");
        toast.info("Todos os filtros foram removidos.");
    };

    // Carregar dados do dashboard
    const carregarDados = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (dataInicio) params.append('dataInicio', dataInicio);
            if (dataFim) params.append('dataFim', dataFim);
            if (plataforma && plataforma !== 'todos') params.append('plataforma', plataforma);
            if (programaGlobal && programaGlobal !== 'todos') params.append('programa', programaGlobal);

            const resumoRes = await fetch(`/api/dashboard/resumo?${params.toString()}`);
            const resumoData = await resumoRes.json();
            setResumo(resumoData);

            const programasRes = await fetch(`/api/dashboard/programas?${params.toString()}`);
            const programasData = await programasRes.json();
            setProgramas(programasData);

            const viagensRes = await fetch(`/api/dashboard/ultimas-viagens?limit=10&${params.toString()}`);
            const viagensData = await viagensRes.json();
            setUltimasViagens(viagensData);

            const servicosRes = await fetch(`/api/dashboard/servicos?${params.toString()}`);
            const servicosData = await servicosRes.json();
            setServicos(servicosData);

        } catch (error) {
            console.error("Erro ao carregar dashboard:", error);
            toast.error("Erro ao carregar dados do dashboard");
        } finally {
            setLoading(false);
        }
    };

    // Carregar funcionários
    const carregarFuncionarios = async () => {
        try {
            const params = new URLSearchParams();
            if (dataInicio) params.append('dataInicio', dataInicio);
            if (dataFim) params.append('dataFim', dataFim);
            if (plataforma && plataforma !== 'todos') params.append('plataforma', plataforma);
            if (programaGlobal && programaGlobal !== 'todos') params.append('programa', programaGlobal);
            if (filtroGrupo && filtroGrupo !== 'todos') params.append('grupo', filtroGrupo);

            const funcionariosRes = await fetch(`/api/dashboard/funcionarios?${params.toString()}`);
            const funcionariosData = await funcionariosRes.json();
            setFuncionarios(funcionariosData);
        } catch (error) {
            console.error("Erro ao carregar funcionários:", error);
        }
    };

    useEffect(() => {
        carregarDados();
        carregarOpcoes();
    }, [dataInicio, dataFim, plataforma, programaGlobal]);

    useEffect(() => {
        carregarFuncionarios();
    }, [dataInicio, dataFim, plataforma, programaGlobal, filtroGrupo]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-[#5D2A1A]" />
                <span className="ml-2 text-gray-600">Carregando dados...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Mobilidade CDC</h1>
                        <p className="text-gray-600">Gestão de deslocamentos de funcionários</p>
                    </div>

                    {/* Filtros */}
                    <div className="flex flex-wrap gap-3 items-center">
                        <PlatformFilter value={plataforma} onChange={setPlataforma} />
                        <select
                            className="border rounded-lg px-3 py-2 text-sm bg-[#F5F3EF] hover:bg-[#E8E4DF] transition-colors cursor-pointer"
                            value={programaGlobal}
                            onChange={(e) => setProgramaGlobal(e.target.value)}
                        >
                            {programasOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleAbrirFiltro}
                            className="flex items-center gap-2"
                        >
                            <Filter className="h-4 w-4" />
                            Filtrar por Data
                        </Button>

                        {(dataInicio || dataFim || plataforma !== 'todos' || programaGlobal !== 'todos' || filtroGrupo !== 'todos') && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleResetFiltro}
                                className="text-red-600 hover:text-red-700"
                            >
                                Limpar Filtros
                            </Button>
                        )}

                        {(dataInicio || dataFim) && (
                            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                Período: {dataInicio || 'início'} a {dataFim || 'hoje'}
                            </span>
                        )}

                        <Button className="bg-[#5D2A1A] text-white rounded-lg px-4 py-2 text-sm flex items-center gap-2 hover:bg-[#4A2214]">
                            <Download className="h-4 w-4" />
                            Exportar
                        </Button>
                    </div>
                </div>
            </div>

            {/* Modal de Filtro de Data */}
            <DateFilterModal
                open={modalFiltroAberto}
                onOpenChange={setModalFiltroAberto}
                onApply={handleAplicarFiltro}
                dataInicioInicial={tempDataInicio}
                dataFimInicial={tempDataFim}
            />

            {/* KPIs principais - REMOVIDOS: Ticket Médio */}
            {resumo && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Valor Total</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                        R$ {resumo.valorTotal.toLocaleString('pt-BR')}
                                    </p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-full">
                                    <DollarSign className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total de Viagens</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                        {resumo.totalViagens}
                                    </p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-full">
                                    <Car className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Funcionários Ativos</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                        {resumo.funcionariosAtivos}
                                    </p>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-full">
                                    <Users className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Tabs */}
            <Tabs defaultValue="programas" className="space-y-4">
                <TabsList className="grid w-full max-w-2xl grid-cols-1">
                    <TabsTrigger value="programas"> Gastos por Programa</TabsTrigger>
                </TabsList>

                {/* Aba de Programas */}
                <TabsContent value="programas" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Gastos por Programa</CardTitle>
                            <p className="text-sm text-gray-600">
                                Total: R$ {programas.reduce((acc, p) => acc + p.valor, 0).toLocaleString('pt-BR')}
                            </p>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[...programas].sort((a, b) => b.valor - a.valor).map((programa) => {
                                    const total = programas.reduce((acc, p) => acc + p.valor, 0);
                                    const percentual = total > 0 ? (programa.valor / total) * 100 : 0;
                                    return (
                                        <div key={programa.nome} className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span className="font-medium">{programa.nome}</span>
                                                <span className="text-gray-600">
                                                    R$ {programa.valor.toLocaleString('pt-BR')} • {programa.viagens} viagens
                                                </span>
                                            </div>
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-500 rounded-full"
                                                    style={{ width: `${percentual}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                                {programas.length === 0 && (
                                    <p className="text-center text-gray-500 py-8">Nenhum dado encontrado</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}