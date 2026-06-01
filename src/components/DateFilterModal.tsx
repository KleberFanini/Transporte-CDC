"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface DateFilterModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onApply: (dataInicio: string, dataFim: string) => void;
    dataInicioInicial: string;
    dataFimInicial: string;
}

export function DateFilterModal({
    open,
    onOpenChange,
    onApply,
    dataInicioInicial,
    dataFimInicial,
}: DateFilterModalProps) {
    const [dataInicio, setDataInicio] = useState(dataInicioInicial);
    const [dataFim, setDataFim] = useState(dataFimInicial);
    const [erro, setErro] = useState("");

    // Data máxima = hoje
    const hoje = new Date().toISOString().split('T')[0];

    // Anos disponíveis (2023 até ano atual)
    const anoAtual = new Date().getFullYear();
    const anos = Array.from({ length: anoAtual - 2022 }, (_, i) => 2023 + i);

    const handleDataInicioChange = (value: string) => {
        setDataInicio(value);
        setErro("");

        if (value && value > hoje) {
            setErro("Data de início não pode ser futura");
        }

        if (value && dataFim && value > dataFim) {
            setErro("Data de início não pode ser maior que data de fim");
        }
    };

    const handleDataFimChange = (value: string) => {
        setDataFim(value);
        setErro("");

        if (value && value > hoje) {
            setErro("Data de fim não pode ser futura");
        }

        if (value && dataInicio && value < dataInicio) {
            setErro("Data de fim não pode ser menor que data de início");
        }
    };

    const handleYearFilter = (ano: number) => {
        const inicio = `${ano}-01-01`;
        const fim = `${ano}-12-31`;

        // Validar se o ano é futuro
        if (ano > anoAtual) {
            setErro("Não é possível filtrar por um ano futuro");
            return;
        }

        setDataInicio(inicio);
        setDataFim(fim);
        setErro("");
    };

    const handleCurrentYear = () => {
        const inicio = `${anoAtual}-01-01`;
        const fim = hoje;
        setDataInicio(inicio);
        setDataFim(fim);
        setErro("");
    };

    const handleCurrentMonth = () => {
        const hojeDate = new Date();
        const ano = hojeDate.getFullYear();
        const mes = String(hojeDate.getMonth() + 1).padStart(2, '0');
        const inicio = `${ano}-${mes}-01`;

        // Último dia do mês atual
        const ultimoDia = new Date(ano, hojeDate.getMonth() + 1, 0).getDate();
        const fim = `${ano}-${mes}-${ultimoDia}`;

        setDataInicio(inicio);
        setDataFim(fim);
        setErro("");
    };

    const handleLast30Days = () => {
        const hojeDate = new Date();
        const trintaDiasAtras = new Date(hojeDate);
        trintaDiasAtras.setDate(hojeDate.getDate() - 30);

        const inicio = trintaDiasAtras.toISOString().split('T')[0];
        const fim = hoje;

        setDataInicio(inicio);
        setDataFim(fim);
        setErro("");
    };

    const handleApply = () => {
        if (dataInicio && dataInicio > hoje) {
            setErro("Data de início não pode ser futura");
            return;
        }

        if (dataFim && dataFim > hoje) {
            setErro("Data de fim não pode ser futura");
            return;
        }

        if (dataInicio && dataFim && dataInicio > dataFim) {
            setErro("Data de início não pode ser maior que data de fim");
            return;
        }

        onApply(dataInicio, dataFim);
        onOpenChange(false);
        setErro("");
    };

    const handleCancel = () => {
        setDataInicio(dataInicioInicial);
        setDataFim(dataFimInicial);
        setErro("");
        onOpenChange(false);
    };

    const handleReset = () => {
        setDataInicio("");
        setDataFim("");
        setErro("");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-white">
                <DialogHeader>
                    <DialogTitle>Filtrar por Data</DialogTitle>
                    <DialogDescription>
                        Selecione o período desejado ou use os atalhos rápidos.
                    </DialogDescription>
                </DialogHeader>

                {/* Atalhos rápidos */}
                <div className="space-y-3">
                    <div>
                        <Label className="text-sm font-medium mb-2 block">Atalhos Rápidos</Label>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleCurrentMonth}
                                className="text-xs"
                            >
                                Mês Atual
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleLast30Days}
                                className="text-xs"
                            >
                                Últimos 30 Dias
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleCurrentYear}
                                className="text-xs"
                            >
                                Ano Atual
                            </Button>
                        </div>
                    </div>

                    <div>
                        <Label className="text-sm font-medium mb-2 block">Anos</Label>
                        <div className="flex flex-wrap gap-2">
                            {anos.map((ano) => (
                                <Button
                                    key={ano}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleYearFilter(ano)}
                                    className="text-xs"
                                >
                                    {ano}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-muted-foreground">
                            Ou selecione manualmente
                        </span>
                    </div>
                </div>

                <div className="grid gap-4 py-2">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="dataInicio" className="text-right">
                            Data Início
                        </Label>
                        <Input
                            id="dataInicio"
                            type="date"
                            value={dataInicio}
                            onChange={(e) => handleDataInicioChange(e.target.value)}
                            max={hoje}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="dataFim" className="text-right">
                            Data Fim
                        </Label>
                        <Input
                            id="dataFim"
                            type="date"
                            value={dataFim}
                            onChange={(e) => handleDataFimChange(e.target.value)}
                            max={hoje}
                            className="col-span-3"
                        />
                    </div>

                    {erro && (
                        <div className="text-red-500 text-sm text-center">
                            {erro}
                        </div>
                    )}
                </div>

                <DialogFooter className="flex justify-between sm:justify-between">
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleReset}
                        >
                            Limpar
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            onClick={handleApply}
                            className="bg-[#5D2A1A] hover:bg-[#4A2214] text-white"
                            disabled={!!erro}
                        >
                            Aplicar Filtro
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}