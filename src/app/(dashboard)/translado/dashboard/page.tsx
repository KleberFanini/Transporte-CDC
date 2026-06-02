'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DollarSign,
  Receipt,
  TrendingUp,
  Building2,
  Truck,
  Calendar,
  AlertCircle,
  Loader2,
} from 'lucide-react';
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
} from 'recharts';
import { Button } from '@/components/ui/button';
import { DateFilterModal } from '@/components/DateFilterModal';
import { Filter } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { ProjectFilter } from '@/components/ProjectFilter';

const COLORS = ['#5D2A1A', '#8B4513', '#A0522D', '#CD853F', '#DEB887'];

interface DashboardData {
  totalTranslados: number;
  valorTotal: number;
  valorMedio: number;
  valoresPorProjeto: Array<{
    projeto: string;
    valor: number;
    quantidade: number;
  }>;
  transladosPorMes: Array<{
    mes: string;
    valor: number;
    quantidade: number;
  }>;
  topFornecedores: Array<{
    fornecedor: string;
    valor: number;
    quantidade: number;
  }>;
  statusAprovacao: Array<{
    status: string;
    quantidade: number;
    valor: number;
  }>;
}

export default function TransladoDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
  const [tempDataInicio, setTempDataInicio] = useState("");
  const [tempDataFim, setTempDataFim] = useState("");
  const [projetosList, setProjetosList] = useState<string[]>([]);
  const [projetoSelecionado, setProjetoSelecionado] = useState("todos");

  const buildUrl = (baseUrl: string) => {
    const params = new URLSearchParams();
    if (dataInicio) params.append("dataInicio", dataInicio);
    if (dataFim) params.append("dataFim", dataFim);
    if (projetoSelecionado && projetoSelecionado !== 'todos') {
      params.append("projeto", projetoSelecionado);
    }
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
  };

  const handleResetFiltro = () => {
    setDataInicio("");
    setDataFim("");
    setProjetoSelecionado("todos");
    toast.info("Filtros removidos. Mostrando todos os dados.");
  };

  // Carregar lista de projetos para o filtro
  const carregarProjetos = async () => {
    try {
      const params = new URLSearchParams();
      if (dataInicio) params.append("dataInicio", dataInicio);
      if (dataFim) params.append("dataFim", dataFim);

      const response = await fetch(`/api/translados/projetos-lista?${params.toString()}`);
      if (response.ok) {
        const projetos = await response.json();
        setProjetosList(projetos);
      }
    } catch (error) {
      console.error("Erro ao carregar projetos:", error);
    }
  };

  useEffect(() => {
    carregarProjetos();
  }, [dataInicio, dataFim]);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await fetch(buildUrl("/api/translados/stats"));
        const result = await response.json();

        if (result.success) {
          setData(result.data);
        }
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        toast.error("Erro ao carregar dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [dataInicio, dataFim, projetoSelecionado]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-[#5D2A1A]" />
        <span className="ml-2 text-gray-600">Carregando dashboard...</span>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Translados</h1>
          <p className="text-gray-600 mt-1">
            Visão geral dos translados e despesas
          </p>
          {(dataInicio || dataFim || projetoSelecionado !== "todos") && (
            <p className="text-sm text-blue-600 mt-1">
              {dataInicio && `Data início: ${dataInicio}`}
              {dataFim && ` até ${dataFim}`}
              {projetoSelecionado !== "todos" && ` • Projeto: ${projetoSelecionado}`}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <ProjectFilter
            value={projetoSelecionado}
            onChange={setProjetoSelecionado}
            projetos={projetosList}
          />

          <Button
            variant="outline"
            size="sm"
            onClick={handleAbrirFiltro}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtrar por Data
          </Button>

          {(dataInicio || dataFim || projetoSelecionado !== "todos") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFiltro}
              className="text-red-600 hover:text-red-700"
            >
              Limpar Filtros
            </Button>
          )}

          <Link href="/translado/relatorios">
            <Button variant="outline" size="sm">
              Ver Relatórios Detalhados →
            </Button>
          </Link>
        </div>
      </div>

      <DateFilterModal
        open={modalFiltroAberto}
        onOpenChange={setModalFiltroAberto}
        onApply={handleAplicarFiltro}
        dataInicioInicial={tempDataInicio}
        dataFimInicial={tempDataFim}
      />

      {/* Cards principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Translados</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalTranslados}</div>
            <p className="text-xs text-muted-foreground">
              Registros no sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(data.valorTotal)}
            </div>
            <p className="text-xs text-muted-foreground">
              Soma de todos os translados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.valorMedio)}
            </div>
            <p className="text-xs text-muted-foreground">
              Por translado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.valoresPorProjeto.length}</div>
            <p className="text-xs text-muted-foreground">
              Projetos atendidos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Gastos por Projeto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.valoresPorProjeto.slice(0, 5)}
                  dataKey="valor"
                  nameKey="projeto"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  labelLine={true}
                >
                  {data.valoresPorProjeto.slice(0, 5).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Top Fornecedores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topFornecedores.slice(0, 5).map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium truncate max-w-[200px]">
                      {item.fornecedor}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.quantidade} translados
                    </p>
                  </div>
                  <p className="font-semibold text-green-600">
                    {formatCurrency(item.valor)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Evolução mensal */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Evolução Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.transladosPorMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis yAxisId="left" tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip formatter={(value, name) => {
                  if (name === 'valor') return formatCurrency(Number(value));
                  return value;
                }} />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="valor"
                  stroke="#DC2626"
                  strokeWidth={3}
                  name="Valor (R$)"
                  dot={{ fill: "#DC2626", r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="quantidade"
                  stroke="#2563EB"
                  strokeWidth={3}
                  name="Quantidade"
                  dot={{ fill: "#2563EB", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Status de aprovação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Status de Aprovação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.statusAprovacao.map((item) => (
              <div key={item.status} className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold">{item.quantidade}</p>
                <p className="text-sm text-gray-600">{item.status}</p>
                <p className="text-xs text-gray-500 mt-1">{formatCurrency(item.valor)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}