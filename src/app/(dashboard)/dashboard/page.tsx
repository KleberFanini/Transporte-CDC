"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
    Users,
    DollarSign,
    MapPin,
    Clock,
    Globe,
    Briefcase,
    Filter,
    Download,
    ChevronUp,
    ChevronDown,
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

interface Cidade {
    nome: string;
    viagens: number;
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

    // Filtros APENAS para a aba de Funcionários
    const [filtroGrupo, setFiltroGrupo] = useState("todos");
    const [filtroPrograma, setFiltroPrograma] = useState("todos");

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
    const [cidades, setCidades] = useState<Cidade[]>([]);
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

            // Carregar grupos distintos
            const gruposRes = await fetch(`/api/dashboard/grupos?${params.toString()}`);
            const gruposData = await gruposRes.json();
            setGruposOptions([
                { value: "todos", label: "Todos os grupos" },
                ...gruposData.map((g: string) => ({ value: g, label: g }))
            ]);

            // Carregar programas
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

    // Abrir modal com valores atuais
    const handleAbrirFiltro = () => {
        setTempDataInicio(dataInicio);
        setTempDataFim(dataFim);
        setModalFiltroAberto(true);
    };

    // Aplicar filtro de data
    const handleAplicarFiltro = (novaDataInicio: string, novaDataFim: string) => {
        setDataInicio(novaDataInicio);
        setDataFim(novaDataFim);
    };

    // Resetar filtro de data
    const handleResetFiltro = () => {
        setDataInicio("");
        setDataFim("");
        toast.info("Filtro de data removido. Mostrando todos os dados.");
    };

    // Carregar dados do dashboard (exceto funcionários)
    const carregarDados = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (dataInicio) params.append('dataInicio', dataInicio);
            if (dataFim) params.append('dataFim', dataFim);
            if (plataforma && plataforma !== 'todos') params.append('plataforma', plataforma);

            // Carregar resumo
            const resumoRes = await fetch(`/api/dashboard/resumo?${params.toString()}`);
            const resumoData = await resumoRes.json();
            setResumo(resumoData);

            // Carregar programas
            const programasRes = await fetch(`/api/dashboard/programas?${params.toString()}`);
            const programasData = await programasRes.json();
            setProgramas(programasData);

            // Carregar últimas viagens
            const viagensRes = await fetch(`/api/dashboard/ultimas-viagens?limit=10&${params.toString()}`);
            const viagensData = await viagensRes.json();
            setUltimasViagens(viagensData);

            // Carregar dados por cidade
            const cidadesRes = await fetch(`/api/dashboard/cidades?${params.toString()}`);
            const cidadesData = await cidadesRes.json();
            setCidades(cidadesData);

            // Carregar serviços
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

    // Carregar funcionários (com filtros específicos)
    const carregarFuncionarios = async () => {
        try {
            const params = new URLSearchParams();
            if (dataInicio) params.append('dataInicio', dataInicio);
            if (dataFim) params.append('dataFim', dataFim);
            if (plataforma && plataforma !== 'todos') params.append('plataforma', plataforma);
            if (filtroGrupo && filtroGrupo !== 'todos') params.append('grupo', filtroGrupo);
            if (filtroPrograma && filtroPrograma !== 'todos') params.append('programa', filtroPrograma);

            const funcionariosRes = await fetch(`/api/dashboard/funcionarios?${params.toString()}`);
            const funcionariosData = await funcionariosRes.json();
            setFuncionarios(funcionariosData);
        } catch (error) {
            console.error("Erro ao carregar funcionários:", error);
        }
    };

    // Recarregar quando filtros mudarem
    useEffect(() => {
        carregarDados();
        carregarOpcoes();
    }, [dataInicio, dataFim, plataforma]);

    // Recarregar funcionários quando os filtros específicos mudarem
    useEffect(() => {
        carregarFuncionarios();
    }, [dataInicio, dataFim, plataforma, filtroGrupo, filtroPrograma]);

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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Mobilidade CDC</h1>
                    <p className="text-gray-600">Gestão de deslocamentos de funcionários</p>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                    <PlatformFilter value={plataforma} onChange={setPlataforma} />

                    {(dataInicio || dataFim) && (
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

                    <Button className="bg-[#5D2A1A] text-white rounded-lg px-4 py-2 text-sm flex items-center gap-2 hover:bg-[#4A2214]">
                        <Download className="h-4 w-4" />
                        Exportar
                    </Button>
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

            {/* KPIs principais */}
            {resumo && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                        R$ {resumo.totalViagens > 0 ? (resumo.valorTotal / resumo.totalViagens).toFixed(2) : '0'}
                                    </p>
                                </div>
                                <div className="p-3 bg-yellow-100 rounded-full">
                                    <Briefcase className="h-6 w-6 text-yellow-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Tabs */}
            <Tabs defaultValue="programas" className="space-y-4">
                <TabsList className="grid w-full max-w-2xl grid-cols-4">
                    <TabsTrigger value="programas">Programas</TabsTrigger>
                    <TabsTrigger value="funcionarios">Funcionários</TabsTrigger>
                    <TabsTrigger value="viagens">Últimas Viagens</TabsTrigger>
                    <TabsTrigger value="cidades">Cidades</TabsTrigger>
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
                                {programas.map((programa) => {
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

                {/* Aba de Funcionários - COM FILTROS DE GRUPO E PROGRAMA */}
                <TabsContent value="funcionarios">
                    <Card>
                        <CardHeader>
                            <CardTitle>Funcionários</CardTitle>
                            <div className="flex flex-wrap gap-4 mt-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">Grupo:</span>
                                    <select
                                        className="border rounded-lg px-3 py-1 text-sm bg-[#F5F3EF] hover:bg-[#E8E4DF] transition-colors cursor-pointer"
                                        value={filtroGrupo}
                                        onChange={(e) => setFiltroGrupo(e.target.value)}
                                    >
                                        {gruposOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">Programa:</span>
                                    <select
                                        className="border rounded-lg px-3 py-1 text-sm bg-[#F5F3EF] hover:bg-[#E8E4DF] transition-colors cursor-pointer"
                                        value={filtroPrograma}
                                        onChange={(e) => setFiltroPrograma(e.target.value)}
                                    >
                                        {programasOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Nome Completo</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Email</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Grupo</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Programa</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Serviço</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Cidade</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Viagens</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Valor Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {funcionarios.map((func) => (
                                            <tr key={func.id} className="border-b hover:bg-gray-50">
                                                <td className="py-3 px-4">
                                                    <div>
                                                        <p className="font-medium">{func.nomeCompleto}</p>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-sm">{func.email}</td>
                                                <td className="py-3 px-4 text-sm">{func.grupo || "-"}</td>
                                                <td className="py-3 px-4 text-sm">{func.programa}</td>
                                                <td className="py-3 px-4 text-sm">{func.servico}</td>
                                                <td className="py-3 px-4 text-sm">{func.cidade}</td>
                                                <td className="py-3 px-4 text-right font-medium">{func.totalViagens}</td>
                                                <td className="py-3 px-4 text-right font-medium">
                                                    R$ {func.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        ))}
                                        {funcionarios.length === 0 && (
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
                </TabsContent>

                {/* Aba de Viagens */}
                <TabsContent value="viagens">
                    <Card>
                        <CardHeader>
                            <CardTitle>Últimas Viagens</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Funcionário</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Grupo</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Programa</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Serviço</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Data</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Hora</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Partida</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Destino</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Valor</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ultimasViagens.map((viagem) => (
                                            <tr key={viagem.id} className="border-b hover:bg-gray-50">
                                                <td className="py-3 px-4 text-sm font-medium">{viagem.funcionario}</td>
                                                <td className="py-3 px-4 text-sm">{viagem.grupo}</td>
                                                <td className="py-3 px-4 text-sm">{viagem.programa}</td>
                                                <td className="py-3 px-4 text-sm">{viagem.servico}</td>
                                                <td className="py-3 px-4 text-sm">{viagem.dataSolicitacao}</td>
                                                <td className="py-3 px-4 text-sm">{viagem.horaSolicitacao}</td>
                                                <td className="py-3 px-4 text-sm max-w-xs truncate">{viagem.partida}</td>
                                                <td className="py-3 px-4 text-sm max-w-xs truncate">{viagem.destino}</td>
                                                <td className="py-3 px-4 text-sm font-medium">R$ {viagem.valor.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                        {ultimasViagens.length === 0 && (
                                            <tr>
                                                <td colSpan={9} className="text-center py-8 text-gray-500">
                                                    Nenhuma viagem encontrada
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>

                        {/* Aba de Cidades */}
                        <TabsContent value="cidades">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Distribuição por Cidade</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {cidades.map((cidade) => (
                                            <div key={cidade.nome} className="p-4 border rounded-lg">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <MapPin className="h-5 w-5 text-[#5D2A1A]" />
                                                    <h3 className="font-medium">{cidade.nome}</h3>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <div>
                                                        <p className="text-gray-600">Viagens</p>
                                                        <p className="font-medium">{cidade.viagens}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-600">Valor</p>
                                                        <p className="font-medium">R$ {cidade.valor.toLocaleString('pt-BR')}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {cidades.length === 0 && (
                                            <p className="text-center text-gray-500 py-8 col-span-2">Nenhuma cidade encontrada</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Card>

                    {/* Cards de Informações Adicionais */}
                    {resumo && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card>
                                <CardContent className="p-4 flex items-center gap-3">
                                    <Clock className="h-8 w-8 text-blue-500" />
                                    <div>
                                        <p className="text-sm text-gray-600">Tempo Médio</p>
                                        <p className="text-lg font-bold">
                                            {resumo.totalViagens > 0 ? (resumo.tempoTotal / resumo.totalViagens).toFixed(0) : 0} min
                                        </p>
                                        <p className="text-xs text-gray-500">por viagem</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4 flex items-center gap-3">
                                    <MapPin className="h-8 w-8 text-green-500" />
                                    <div>
                                        <p className="text-sm text-gray-600">Distância Média</p>
                                        <p className="text-lg font-bold">
                                            {resumo.totalViagens > 0 ? (resumo.distanciaTotal / resumo.totalViagens).toFixed(1) : 0} km
                                        </p>
                                        <p className="text-xs text-gray-500">por viagem</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}