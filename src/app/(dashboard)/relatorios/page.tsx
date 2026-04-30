"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
    Download,
    TrendingUp,
    BarChart3,
    MapPin,
    Car,
    Users,
    Loader2,
    Calendar,
    DollarSign,
    Filter,
} from "lucide-react";
import { toast } from "sonner";
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area,
} from "recharts";
import { PlatformFilter } from "@/components/PlatformFilter";
import { DateFilterModal } from "@/components/DateFilterModal";

// Cores para os gráficos
const COLORS = [
    "#5D2A1A",
    "#8B4513",
    "#A0522D",
    "#CD853F",
    "#DEB887",
    "#D2691E",
    "#F4A460",
    "#FFA07A",
];

interface ProgramasData {
    nome: string;
    valor: number;
    viagens: number;
}

interface CidadesData {
    nome: string;
    viagens: number;
    valor: number;
}

interface RankingFuncionario {
    nomeCompleto: string;
    totalViagens: number;
    valorTotal: number;
}

interface EvolucaoMensal {
    mes: string;
    valor: number;
    viagens: number;
}

interface DespesaDetalhe {
    tipo: string;
    valor: number;
    quantidade: number;
    porcentagem: number;
}

export default function RelatoriosPage() {
    const [loading, setLoading] = useState(true);
    const [programas, setProgramas] = useState<ProgramasData[]>([]);
    const [cidades, setCidades] = useState<CidadesData[]>([]);
    const [ranking, setRanking] = useState<RankingFuncionario[]>([]);
    const [evolucaoMensal, setEvolucaoMensal] = useState<EvolucaoMensal[]>([]);
    const [despesasDetalhe, setDespesasDetalhe] = useState<DespesaDetalhe[]>([]);

    // Filtros
    const [plataforma, setPlataforma] = useState("todos");
    const [dataInicio, setDataInicio] = useState("");
    const [dataFim, setDataFim] = useState("");
    const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
    const [tempDataInicio, setTempDataInicio] = useState("");
    const [tempDataFim, setTempDataFim] = useState("");

    // Construir URL com parâmetros
    const buildUrl = (baseUrl: string) => {
        const params = new URLSearchParams();
        if (plataforma && plataforma !== 'todos') {
            params.append('plataforma', plataforma);
        }
        if (dataInicio) {
            params.append('dataInicio', dataInicio);
        }
        if (dataFim) {
            params.append('dataFim', dataFim);
        }
        const queryString = params.toString();
        return queryString ? `${baseUrl}?${queryString}` : baseUrl;
    };

    // Abrir modal de filtro
    const handleAbrirFiltro = () => {
        setTempDataInicio(dataInicio);
        setTempDataFim(dataFim);
        setModalFiltroAberto(true);
    };

    // Aplicar filtro
    const handleAplicarFiltro = (novaDataInicio: string, novaDataFim: string) => {
        setDataInicio(novaDataInicio);
        setDataFim(novaDataFim);
    };

    // Resetar filtro
    const handleResetFiltro = () => {
        setDataInicio("");
        setDataFim("");
        toast.info("Filtro de data removido. Mostrando todos os dados.");
    };

    // Carregar dados
    const carregarDados = async () => {
        setLoading(true);
        try {
            // Programas
            const programasRes = await fetch(buildUrl("/api/dashboard/programas"));
            const programasData = await programasRes.json();
            setProgramas(programasData);

            // Cidades
            const cidadesRes = await fetch(buildUrl("/api/dashboard/cidades"));
            const cidadesData = await cidadesRes.json();
            setCidades(cidadesData);

            // Ranking de funcionários
            const rankingRes = await fetch(buildUrl("/api/dashboard/funcionarios"));
            const rankingData = await rankingRes.json();
            const top10 = rankingData.slice(0, 10);
            setRanking(top10);

            // Evolução Mensal
            const evolucaoRes = await fetch(buildUrl("/api/dashboard/evolucao-mensal"));
            const evolucaoData = await evolucaoRes.json();
            setEvolucaoMensal(evolucaoData);

            // Detalhamento de Despesas
            const despesasRes = await fetch(buildUrl("/api/dashboard/detalhamento-despesas"));
            const despesasData = await despesasRes.json();
            setDespesasDetalhe(despesasData);
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            toast.error("Erro ao carregar dados dos relatórios");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        carregarDados();
    }, [plataforma, dataInicio, dataFim]);

    const exportarCSV = (dados: any[], nomeArquivo: string, headers: string[]) => {
        const csvRows = [headers.join(",")];
        for (const row of dados) {
            const values = headers.map(header => {
                const value = row[header.toLowerCase()] || row[header] || "";
                return `"${String(value).replace(/"/g, '""')}"`;
            });
            csvRows.push(values.join(","));
        }
        const blob = new Blob(["\uFEFF" + csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.setAttribute("download", `${nomeArquivo}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success(`${nomeArquivo} exportado com sucesso!`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-[#5D2A1A]" />
                <span className="ml-2 text-gray-600">Carregando relatórios...</span>
            </div>
        );
    }

    // Ordenar programas por valor
    const programasOrdenados = [...programas].sort((a, b) => b.valor - a.valor).slice(0, 10);

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
                    <p className="text-gray-600">Análise de dados de mobilidade</p>
                    {(dataInicio || dataFim) && (
                        <p className="text-sm text-blue-600 mt-1">
                            Período: {dataInicio || 'início'} até {dataFim || 'hoje'}
                        </p>
                    )}
                </div>
                <div className="flex flex-wrap gap-4 items-center">
                    <PlatformFilter value={plataforma} onChange={setPlataforma} />

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

                    <Button
                        className="bg-[#5D2A1A] hover:bg-[#4A2214] text-white"
                        onClick={() => exportarCSV(programas, "relatorio_programas", ["nome", "valor", "viagens"])}
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Exportar Dados
                    </Button>
                </div>
            </div>

            {/* Modal de Filtro */}
            <DateFilterModal
                open={modalFiltroAberto}
                onOpenChange={setModalFiltroAberto}
                onApply={handleAplicarFiltro}
                dataInicioInicial={tempDataInicio}
                dataFimInicial={tempDataFim}
            />

            {/* Tabs de relatórios */}
            <Tabs defaultValue="programas" className="space-y-4">
                <TabsList className="grid w-full max-w-3xl grid-cols-4">
                    <TabsTrigger value="programas">Programas</TabsTrigger>
                    <TabsTrigger value="cidades">Cidades</TabsTrigger>
                    <TabsTrigger value="ranking">Ranking</TabsTrigger>
                    <TabsTrigger value="evolucao">Evolução</TabsTrigger>
                </TabsList>

                {/* Aba - Programas */}
                <TabsContent value="programas">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Ranking de Programas (Top 10)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart
                                    data={programasOrdenados}
                                    layout="vertical"
                                    margin={{ left: 100, right: 30, top: 20, bottom: 20 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        type="number"
                                        tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                                        label={{ value: 'Valor (R$ milhares)', position: 'bottom', offset: 0 }}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="nome"
                                        width={120}
                                        tick={{ fontSize: 11 }}
                                    />
                                    <Tooltip
                                        formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR')}`}
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px' }}
                                    />
                                    <Bar dataKey="valor" fill="#5D2A1A" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                            {programas.length === 0 && (
                                <p className="text-center text-gray-500 py-8">Nenhum programa encontrado</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Aba - Cidades */}
                <TabsContent value="cidades">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5" />
                                    Gastos por Cidade
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={320}>
                                    <BarChart data={cidades}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="nome" />
                                        <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                                        <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR')}`} />
                                        <Bar dataKey="valor" fill="#5D2A1A" />
                                    </BarChart>
                                </ResponsiveContainer>
                                {cidades.length === 0 && (
                                    <p className="text-center text-gray-500 py-8">Nenhuma cidade encontrada</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Top Cidades por Viagens</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {cidades.slice(0, 5).map((cidade) => (
                                        <div key={cidade.nome} className="flex justify-between items-center border-b pb-2">
                                            <div>
                                                <p className="font-medium">{cidade.nome}</p>
                                                <p className="text-sm text-gray-500">{cidade.viagens} viagens</p>
                                            </div>
                                            <p className="font-bold">R$ {cidade.valor.toLocaleString('pt-BR')}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Aba - Ranking de Funcionários */}
                <TabsContent value="ranking">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Top 10 Funcionários
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">#</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Funcionário</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Viagens</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Valor Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ranking.map((func, index) => (
                                            <tr key={func.nomeCompleto} className="border-b hover:bg-gray-50">
                                                <td className="py-3 px-4 font-bold text-lg">{index + 1}º</td>
                                                <td className="py-3 px-4 font-medium">{func.nomeCompleto}</td>
                                                <td className="py-3 px-4 text-right">{func.totalViagens}</td>
                                                <td className="py-3 px-4 text-right font-medium">
                                                    R$ {func.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Aba - Evolução Mensal */}
                <TabsContent value="evolucao">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    Evolução Mensal de Gastos
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={320}>
                                    <LineChart data={evolucaoMensal}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="mes" />
                                        <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                                        <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR')}`} />
                                        <Legend />
                                        <Line type="monotone" dataKey="valor" stroke="#5D2A1A" strokeWidth={2} dot={{ r: 4 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                                {evolucaoMensal.length === 0 && (
                                    <p className="text-center text-gray-500 py-8">Nenhum dado encontrado</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Evolução Mensal de Viagens
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={320}>
                                    <AreaChart data={evolucaoMensal}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="mes" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Area type="monotone" dataKey="viagens" fill="#8B4513" fillOpacity={0.3} stroke="#5D2A1A" />
                                    </AreaChart>
                                </ResponsiveContainer>
                                {evolucaoMensal.length === 0 && (
                                    <p className="text-center text-gray-500 py-8">Nenhum dado encontrado</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Seção de Detalhamento de Despesas */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Detalhamento de Despesas
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Distribuição por Tipo de Despesa</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={despesasDetalhe}
                                        dataKey="valor"
                                        nameKey="tipo"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                                        labelLine={true}
                                    >
                                        {despesasDetalhe.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR')}`} />
                                </PieChart>
                            </ResponsiveContainer>
                            {despesasDetalhe.length === 0 && (
                                <p className="text-center text-gray-500 py-8">Nenhuma despesa encontrada</p>
                            )}
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-4">Despesas por Categoria</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Categoria</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Quantidade</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Valor Total</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">%</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {despesasDetalhe.map((despesa) => (
                                            <tr key={despesa.tipo} className="border-b hover:bg-gray-50">
                                                <td className="py-3 px-4 font-medium">{despesa.tipo}</td>
                                                <td className="py-3 px-4 text-right">{despesa.quantidade}</td>
                                                <td className="py-3 px-4 text-right">
                                                    R$ {despesa.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="py-3 px-4 text-right">{despesa.porcentagem.toFixed(1)}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Rodapé */}
            <div className="text-center text-xs text-gray-500 py-4">
                Dados atualizados automaticamente a partir das planilhas importadas
            </div>
        </div>
    );
}