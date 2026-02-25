"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Users,
    DollarSign,
    MapPin,
    Calendar,
    Clock,
    Globe,
    Briefcase,
    UserCircle,
    Phone,
    Mail,
    Filter,
    Download,
    ChevronUp,
    ChevronDown,
    Car,
    Bike,
    Footprints
} from "lucide-react";

// Dados mockados baseados na imagem do Power BI
const dadosMobilidade = {
    // Resumo geral
    resumo: {
        totalViagens: 4342,
        valorTotal: 146277.17,
        funcionariosAtivos: 187,
        grupos: 7,
        distanciaTotal: 28450, // km
        tempoTotal: 42580 // minutos
    },

    // Dados por programa/grupo
    programas: [
        { nome: "ATITUDE CABO", valor: 37555.61, viagens: 1240, cor: "bg-purple-500" },
        { nome: "Articulação", valor: 30362.00, viagens: 987, cor: "bg-blue-500" },
        { nome: "ATITUDE RECIFE", valor: 24854.94, viagens: 823, cor: "bg-green-500" },
        { nome: "ATITUDE JABOATÃO", valor: 16598.59, viagens: 556, cor: "bg-yellow-500" },
        { nome: "Mais Vida Recife", valor: 8320.88, viagens: 278, cor: "bg-orange-500" },
        { nome: "Geral", valor: 8172.81, viagens: 267, cor: "bg-red-500" },
        { nome: "ATITUDE CARUARU", valor: 7303.40, viagens: 245, cor: "bg-indigo-500" },
    ],

    // Funcionários (dados baseados na imagem)
    funcionarios: [
        {
            id: 1,
            nome: "Maria",
            sobrenome: "Silva",
            nomeCompleto: "Maria Silva",
            email: "maria.silva@ong.org",
            titulo: "Coordenadora",
            grupo: "ATITUDE CABO",
            programa: "ATITUDE CABO",
            servico: "UberX",
            cidade: "Cabo de Santo Agostinho",
            pais: "Brasil",
            totalViagens: 45,
            valorTotal: 1250.80
        },
        {
            id: 2,
            nome: "João",
            sobrenome: "Santos",
            nomeCompleto: "João Santos",
            email: "joao.santos@ong.org",
            titulo: "Assistente Social",
            grupo: "Articulação",
            programa: "Articulação",
            servico: "Comfort",
            cidade: "Recife",
            pais: "Brasil",
            totalViagens: 38,
            valorTotal: 1420.50
        },
        {
            id: 3,
            nome: "Ana",
            sobrenome: "Oliveira",
            nomeCompleto: "Ana Oliveira",
            email: "ana.oliveira@ong.org",
            titulo: "Psicóloga",
            grupo: "ATITUDE RECIFE",
            programa: "ATITUDE RECIFE",
            servico: "UberX",
            cidade: "Recife",
            pais: "Brasil",
            totalViagens: 52,
            valorTotal: 1670.30
        },
        {
            id: 4,
            nome: "Carlos",
            sobrenome: "Ferreira",
            nomeCompleto: "Carlos Ferreira",
            email: "carlos.ferreira@ong.org",
            titulo: "Educador",
            grupo: "ATITUDE JABOATÃO",
            programa: "ATITUDE JABOATÃO",
            servico: "Moto",
            cidade: "Jaboatão dos Guararapes",
            pais: "Brasil",
            totalViagens: 67,
            valorTotal: 890.40
        },
        {
            id: 5,
            nome: "Patrícia",
            sobrenome: "Lima",
            nomeCompleto: "Patrícia Lima",
            email: "patricia.lima@ong.org",
            titulo: "Enfermeira",
            grupo: "Mais Vida Recife",
            programa: "Mais Vida Recife",
            servico: "UberX",
            cidade: "Recife",
            pais: "Brasil",
            totalViagens: 29,
            valorTotal: 980.60
        },
        {
            id: 6,
            nome: "Roberto",
            sobrenome: "Almeida",
            nomeCompleto: "Roberto Almeida",
            email: "roberto.almeida@ong.org",
            titulo: "Administrador",
            grupo: "Geral",
            programa: "Geral",
            servico: "Comfort",
            cidade: "Recife",
            pais: "Brasil",
            totalViagens: 41,
            valorTotal: 1560.20
        },
        {
            id: 7,
            nome: "Fernanda",
            sobrenome: "Costa",
            nomeCompleto: "Fernanda Costa",
            email: "fernanda.costa@ong.org",
            titulo: "Coordenadora",
            grupo: "ATITUDE CARUARU",
            programa: "ATITUDE CARUARU",
            servico: "UberX",
            cidade: "Caruaru",
            pais: "Brasil",
            totalViagens: 33,
            valorTotal: 1100.40
        },
    ],

    // Últimas viagens/solicitações
    ultimasViagens: [
        {
            id: 1,
            funcionario: "Maria Silva",
            grupo: "ATITUDE CABO",
            programa: "ATITUDE CABO",
            servico: "UberX",
            dataSolicitacao: "2024-02-25",
            horaSolicitacao: "08:30",
            dataChegada: "2024-02-25",
            horaChegada: "08:45",
            partida: "Rua A, 123 - Centro",
            destino: "Av. B, 456 - Boa Viagem",
            distancia: 8.5,
            duracao: 15,
            valor: 32.50,
            detalhamento: "Viagem para reunião externa"
        },
        {
            id: 2,
            funcionario: "João Santos",
            grupo: "Articulação",
            programa: "Articulação",
            servico: "Comfort",
            dataSolicitacao: "2024-02-25",
            horaSolicitacao: "09:15",
            dataChegada: "2024-02-25",
            horaChegada: "09:40",
            partida: "Rua C, 789 - Casa Forte",
            destino: "Av. D, 101 - Pina",
            distancia: 12.3,
            duracao: 25,
            valor: 45.80,
            detalhamento: "Visita domiciliar"
        },
        {
            id: 3,
            funcionario: "Ana Oliveira",
            grupo: "ATITUDE RECIFE",
            programa: "ATITUDE RECIFE",
            servico: "UberX",
            dataSolicitacao: "2024-02-25",
            horaSolicitacao: "10:00",
            dataChegada: "2024-02-25",
            horaChegada: "10:20",
            partida: "Rua E, 234 - Espinheiro",
            destino: "Rua F, 567 - Derby",
            distancia: 5.2,
            duracao: 20,
            valor: 28.90,
            detalhamento: "Acompanhamento de paciente"
        },
    ],

    // Serviços utilizados
    servicos: [
        { tipo: "UberX", viagens: 2648, valor: 45230.50, icone: Car },
        { tipo: "Comfort", viagens: 1186, valor: 28940.30, icone: Car },
        { tipo: "Moto", viagens: 207, valor: 8290.40, icone: Bike },
        { tipo: "Black", viagens: 21, valor: 1890.00, icone: Car },
        { tipo: "99Pop", viagens: 280, valor: 8920.30, icone: Car },
    ],

    // Dados por cidade
    cidades: [
        { nome: "Recife", viagens: 2450, valor: 82340.50 },
        { nome: "Cabo", viagens: 1240, valor: 37555.61 },
        { nome: "Jaboatão", viagens: 556, valor: 16598.59 },
        { nome: "Caruaru", viagens: 245, valor: 7303.40 },
    ]
};

export default function DashboardPage() {
    const [periodo, setPeriodo] = useState("mes");
    const [filtroGrupo, setFiltroGrupo] = useState("todos");

    // Calcular totais
    const totalProgramas = dadosMobilidade.programas.reduce((acc, item) => acc + item.valor, 0);

    return (
        <div className="space-y-6 p-6 ">
            {/* Header com título e filtros */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Mobilidade CDC</h1>
                    <p className="text-gray-600">Gestão de deslocamentos de funcionários</p>
                </div>

                <div className="flex gap-2">
                    <select
                        className="border rounded-lg px-4 py-2 text-sm"
                        value={periodo}
                        onChange={(e) => setPeriodo(e.target.value)}
                    >
                        <option value="hoje">Hoje</option>
                        <option value="semana">Esta Semana</option>
                        <option value="mes">Este Mês</option>
                        <option value="ano">Este Ano</option>
                    </select>

                    <button className="border rounded-lg px-4 py-2 text-sm flex items-center gap-2 hover:bg-gray-50">
                        <Filter className="h-4 w-4" />
                        Filtros
                    </button>

                    <button className="bg-[#5D2A1A] text-white rounded-lg px-4 py-2 text-sm flex items-center gap-2 hover:bg-[#4A2214]">
                        <Download className="h-4 w-4" />
                        Exportar
                    </button>
                </div>
            </div>

            {/* KPIs principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    R$ {dadosMobilidade.resumo.valorTotal.toLocaleString('pt-BR')}
                                </p>
                                <p className="text-xs text-green-600 mt-2 flex items-center">
                                    <ChevronUp className="h-3 w-3" /> +8.3% vs mês anterior
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
                                    {dadosMobilidade.resumo.totalViagens}
                                </p>
                                <p className="text-xs text-green-600 mt-2 flex items-center">
                                    <ChevronUp className="h-3 w-3" /> +124 vs mês anterior
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
                                    {dadosMobilidade.resumo.funcionariosAtivos}
                                </p>
                                <p className="text-xs text-gray-600 mt-2">
                                    de {dadosMobilidade.funcionarios.length} total
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
                                    R$ {(dadosMobilidade.resumo.valorTotal / dadosMobilidade.resumo.totalViagens).toFixed(2)}
                                </p>
                                <p className="text-xs text-red-600 mt-2 flex items-center">
                                    <ChevronDown className="h-3 w-3" /> -2.1% vs mês anterior
                                </p>
                            </div>
                            <div className="p-3 bg-yellow-100 rounded-full">
                                <Briefcase className="h-6 w-6 text-yellow-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs com diferentes visualizações */}
            <Tabs defaultValue="programas" className="space-y-4">
                <TabsList className="grid w-full max-w-2xl grid-cols-4">
                    <TabsTrigger value="programas">Programas</TabsTrigger>
                    <TabsTrigger value="funcionarios">Funcionários</TabsTrigger>
                    <TabsTrigger value="viagens">Viagens</TabsTrigger>
                    <TabsTrigger value="cidades">Cidades</TabsTrigger>
                </TabsList>

                {/* Aba de Programas */}
                <TabsContent value="programas" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Gastos por Programa</CardTitle>
                            <p className="text-sm text-gray-600">Total: R$ {totalProgramas.toLocaleString('pt-BR')}</p>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {dadosMobilidade.programas.map((programa) => (
                                    <div key={programa.nome} className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium">{programa.nome}</span>
                                            <span className="text-gray-600">
                                                R$ {programa.valor.toLocaleString('pt-BR')} • {programa.viagens} viagens
                                            </span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${programa.cor} rounded-full`}
                                                style={{ width: `${(programa.valor / totalProgramas) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Aba de Funcionários */}
                <TabsContent value="funcionarios">
                    <Card>
                        <CardHeader>
                            <CardTitle>Funcionários</CardTitle>
                            <div className="flex gap-2">
                                <select
                                    className="border rounded-lg px-3 py-1 text-sm"
                                    value={filtroGrupo}
                                    onChange={(e) => setFiltroGrupo(e.target.value)}
                                >
                                    <option value="todos">Todos os grupos</option>
                                    {dadosMobilidade.programas.map(p => (
                                        <option key={p.nome} value={p.nome}>{p.nome}</option>
                                    ))}
                                </select>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Nome Completo</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Título</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Grupo</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Programa</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Serviço</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Cidade</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Viagens</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Valor Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dadosMobilidade.funcionarios
                                            .filter(f => filtroGrupo === "todos" || f.grupo === filtroGrupo)
                                            .map((func) => (
                                                <tr key={func.id} className="border-b hover:bg-gray-50">
                                                    <td className="py-3 px-4">
                                                        <div>
                                                            <p className="font-medium">{func.nomeCompleto}</p>
                                                            <p className="text-xs text-gray-500">{func.email}</p>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-sm">{func.titulo}</td>
                                                    <td className="py-3 px-4 text-sm">{func.grupo}</td>
                                                    <td className="py-3 px-4 text-sm">{func.programa}</td>
                                                    <td className="py-3 px-4 text-sm">{func.servico}</td>
                                                    <td className="py-3 px-4 text-sm">{func.cidade}</td>
                                                    <td className="py-3 px-4 text-sm font-medium">{func.totalViagens}</td>
                                                    <td className="py-3 px-4 text-sm font-medium">R$ {func.valorTotal.toFixed(2)}</td>
                                                </tr>
                                            ))}
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
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Data Solicitação</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Hora</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Partida</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Destino</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Distância</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Duração</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Valor</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dadosMobilidade.ultimasViagens.map((viagem) => (
                                            <tr key={viagem.id} className="border-b hover:bg-gray-50">
                                                <td className="py-3 px-4 text-sm font-medium">{viagem.funcionario}</td>
                                                <td className="py-3 px-4 text-sm">{viagem.grupo}</td>
                                                <td className="py-3 px-4 text-sm">{viagem.programa}</td>
                                                <td className="py-3 px-4 text-sm">{viagem.servico}</td>
                                                <td className="py-3 px-4 text-sm">{viagem.dataSolicitacao}</td>
                                                <td className="py-3 px-4 text-sm">{viagem.horaSolicitacao}</td>
                                                <td className="py-3 px-4 text-sm max-w-xs truncate">{viagem.partida}</td>
                                                <td className="py-3 px-4 text-sm max-w-xs truncate">{viagem.destino}</td>
                                                <td className="py-3 px-4 text-sm">{viagem.distancia} km</td>
                                                <td className="py-3 px-4 text-sm">{viagem.duracao} min</td>
                                                <td className="py-3 px-4 text-sm font-medium">R$ {viagem.valor.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Aba de Cidades */}
                <TabsContent value="cidades">
                    <Card>
                        <CardHeader>
                            <CardTitle>Distribuição por Cidade</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {dadosMobilidade.cidades.map((cidade) => (
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
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Cards de Informações Adicionais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <Clock className="h-8 w-8 text-blue-500" />
                        <div>
                            <p className="text-sm text-gray-600">Tempo Médio</p>
                            <p className="text-lg font-bold">{(dadosMobilidade.resumo.tempoTotal / dadosMobilidade.resumo.totalViagens).toFixed(0)} min</p>
                            <p className="text-xs text-gray-500">por viagem</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <MapPin className="h-8 w-8 text-green-500" />
                        <div>
                            <p className="text-sm text-gray-600">Distância Média</p>
                            <p className="text-lg font-bold">{(dadosMobilidade.resumo.distanciaTotal / dadosMobilidade.resumo.totalViagens).toFixed(1)} km</p>
                            <p className="text-xs text-gray-500">por viagem</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <Globe className="h-8 w-8 text-purple-500" />
                        <div>
                            <p className="text-sm text-gray-600">Serviços</p>
                            <p className="text-lg font-bold">{dadosMobilidade.servicos.length}</p>
                            <p className="text-xs text-gray-500">Uber e 99</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}