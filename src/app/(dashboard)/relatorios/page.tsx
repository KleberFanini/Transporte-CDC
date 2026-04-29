"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
    Download,
    TrendingUp,
    PieChart as PieChartIcon,
    BarChart3,
    MapPin,
    Car,
    Users,
    FileText,
    Loader2,
    Calendar,
    DollarSign,
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

interface ServicosData {
    tipo: string;
    viagens: number;
    valor: number;
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
    const [servicos, setServicos] = useState<ServicosData[]>([]);
    const [cidades, setCidades] = useState<CidadesData[]>([]);
    const [ranking, setRanking] = useState<RankingFuncionario[]>([]);
    const [evolucaoMensal, setEvolucaoMensal] = useState<EvolucaoMensal[]>([]);
    const [despesasDetalhe, setDespesasDetalhe] = useState<DespesaDetalhe[]>([]);

    // Carregar dados
    const carregarDados = async () => {
        setLoading(true);
        try {
            // Programas
            const programasRes = await fetch("/api/dashboard/programas");
            const programasData = await programasRes.json();
            setProgramas(programasData);

            // Serviços
            const servicosRes = await fetch("/api/dashboard/servicos");
            const servicosData = await servicosRes.json();
            setServicos(servicosData);

            // Cidades
            const cidadesRes = await fetch("/api/dashboard/cidades");
            const cidadesData = await cidadesRes.json();
            setCidades(cidadesData);

            // Ranking de funcionários
            const rankingRes = await fetch("/api/dashboard/funcionarios");
            const rankingData = await rankingRes.json();
            const top10 = rankingData.slice(0, 10);
            setRanking(top10);

            // Evolução Mensal
            const evolucaoRes = await fetch("/api/dashboard/evolucao-mensal");
            const evolucaoData = await evolucaoRes.json();
            setEvolucaoMensal(evolucaoData);

            // Detalhamento de Despesas
            const despesasRes = await fetch("/api/dashboard/detalhamento-despesas");
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
    }, []);

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

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
                    <p className="text-gray-600">Análise de dados de mobilidade</p>
                </div>
                <Button
                    className="bg-[#5D2A1A] hover:bg-[#4A2214] text-white"
                    onClick={() => exportarCSV(programas, "relatorio_programas", ["nome", "valor", "viagens"])}
                >
                    <Download className="mr-2 h-4 w-4" />
                    Exportar Dados
                </Button>
            </div>

            {/* Tabs de relatórios */}
            <Tabs defaultValue="programas" className="space-y-4">
                <TabsList className="grid w-full max-w-3xl grid-cols-5">
                    <TabsTrigger value="programas">Programas</TabsTrigger>
                    <TabsTrigger value="servicos">Serviços</TabsTrigger>
                    <TabsTrigger value="cidades">Cidades</TabsTrigger>
                    <TabsTrigger value="ranking">Ranking</TabsTrigger>
                    <TabsTrigger value="evolucao">Evolução</TabsTrigger>
                </TabsList>

                {/* Aba - Programas */}
                <TabsContent value="programas">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <PieChartIcon className="h-5 w-5" />
                                    Gastos por Programa
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={320}>
                                    <PieChart>
                                        <Pie
                                            data={programas}
                                            dataKey="valor"
                                            nameKey="nome"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                                            labelLine={true}
                                        >
                                            {programas.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR')}`} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5" />
                                    Ranking de Programas
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={320}>
                                    <BarChart data={programas.slice(0, 10)} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                                        <YAxis type="category" dataKey="nome" width={100} />
                                        <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR')}`} />
                                        <Bar dataKey="valor" fill="#5D2A1A" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Aba - Serviços */}
                <TabsContent value="servicos">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <PieChartIcon className="h-5 w-5" />
                                    Distribuição por Serviço
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={320}>
                                    <PieChart>
                                        <Pie
                                            data={servicos}
                                            dataKey="viagens"
                                            nameKey="tipo"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                                            labelLine={true}
                                        >
                                            {servicos.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Detalhamento por Serviço</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {servicos.map((servico, index) => {
                                        const totalViagens = servicos.reduce((acc, s) => acc + s.viagens, 0);
                                        const percentual = (servico.viagens / totalViagens) * 100;
                                        return (
                                            <div key={servico.tipo} className="space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span className="font-medium">{servico.tipo}</span>
                                                    <span className="text-gray-600">
                                                        {servico.viagens} viagens • R$ {servico.valor.toLocaleString('pt-BR')}
                                                    </span>
                                                </div>
                                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full"
                                                        style={{
                                                            width: `${percentual}%`,
                                                            backgroundColor: COLORS[index % COLORS.length],
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
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
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Top Cidades por Viagens</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {cidades.slice(0, 5).map((cidade, index) => (
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
                        {/* Gráfico de Pizza - Detalhamento */}
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
                        </div>

                        {/* Tabela de Detalhamento */}
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
                                        {despesasDetalhe.map((despesa, index) => (
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