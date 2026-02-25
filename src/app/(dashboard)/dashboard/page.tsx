'use client';

import { useState, useEffect } from 'react';

interface DashboardStats {
    totalUsuarios: number;
    transportesHoje: number;
    motoristasAtivos: number;
    veiculosDisponiveis: number;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats>({
        totalUsuarios: 0,
        transportesHoje: 0,
        motoristasAtivos: 0,
        veiculosDisponiveis: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simular busca de dados
        setTimeout(() => {
            setStats({
                totalUsuarios: 156,
                transportesHoje: 23,
                motoristasAtivos: 18,
                veiculosDisponiveis: 12,
            });
            setLoading(false);
        }, 1000);
    }, []);

    const cards = [
        { title: 'Total de Usuários', value: stats.totalUsuarios, icon: '👥', color: 'bg-blue-500' },
        { title: 'Transportes Hoje', value: stats.transportesHoje, icon: '🚛', color: 'bg-green-500' },
        { title: 'Motoristas Ativos', value: stats.motoristasAtivos, icon: '👤', color: 'bg-purple-500' },
        { title: 'Veículos Disponíveis', value: stats.veiculosDisponiveis, icon: '🚗', color: 'bg-yellow-500' },
    ];

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600 mb-8">Bem-vindo ao sistema CDC Transporte</p>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    {/* Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {cards.map((card, index) => (
                            <div key={index} className="bg-white rounded-lg shadow overflow-hidden">
                                <div className={`${card.color} h-2`} />
                                <div className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">{card.title}</p>
                                            <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
                                        </div>
                                        <span className="text-4xl opacity-50">{card.icon}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Gráficos e tabelas - Placeholder */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Últimos transportes */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold mb-4">Últimos Transportes</h2>
                            <div className="space-y-3">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                                        <div>
                                            <p className="font-medium">Transporte #{i}</p>
                                            <p className="text-sm text-gray-600">SP → RJ</p>
                                        </div>
                                        <span className="text-sm text-green-600">Concluído</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Atividades recentes */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold mb-4">Atividades Recentes</h2>
                            <div className="space-y-3">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="flex items-center py-2 border-b last:border-0">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                        <div>
                                            <p className="font-medium">Novo transporte criado</p>
                                            <p className="text-sm text-gray-600">Há 5 minutos</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}