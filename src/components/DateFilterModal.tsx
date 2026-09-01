"use client";

import { useState, useEffect } from "react";
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

// Verifica se uma data em string (YYYY-MM-DD) é válida no calendário
const isDateValid = (dateString: string): boolean => {
    if (!dateString) return true;

    const parts = dateString.split('-');
    if (parts.length !== 3) return false;

    const ano = parseInt(parts[0], 10);
    const mes = parseInt(parts[1], 10);
    const dia = parseInt(parts[2], 10);

    if (isNaN(ano) || isNaN(mes) || isNaN(dia)) return false;

    // Garante que o ano seja válido (ex: evita ano 0002 enquanto digita)
    if (ano < 1900 || ano > 2099) return false;
    if (mes < 1 || mes > 12) return false;
    if (dia < 1 || dia > 31) return false;

    const testDate = new Date(ano, mes - 1, dia);
    return (
        testDate.getFullYear() === ano &&
        testDate.getMonth() === mes - 1 &&
        testDate.getDate() === dia
    );
};

// Converte DD/MM/YYYY para YYYY-MM-DD
const parseDateString = (value: string): string => {
    if (!value) return value;
    if (value.includes('-')) return value;

    if (value.includes('/')) {
        const parts = value.split('/');
        if (parts.length === 3) {
            const dia = parts[0].padStart(2, '0');
            const mes = parts[1].padStart(2, '0');
            const ano = parts[2];
            return `${ano}-${mes}-${dia}`;
        }
    }
    return value;
};

export function DateFilterModal({
    open,
    onOpenChange,
    onApply,
    dataInicioInicial,
    dataFimInicial,
}: DateFilterModalProps) {
    const [dataInicio, setDataInicio] = useState(dataInicioInicial);
    const [dataFim, setDataFim] = useState(dataFimInicial);

    // Estados independentes para erros específicos de cada campo e erros gerais
    const [erroInicio, setErroInicio] = useState("");
    const [erroFim, setErroFim] = useState("");
    const [erroGeral, setErroGeral] = useState("");

    const hoje = new Date().toISOString().split('T')[0];
    const anoAtual = new Date().getFullYear();
    const anos = Array.from({ length: anoAtual - 2022 }, (_, i) => 2023 + i);

    const limparErros = () => {
        setErroInicio("");
        setErroFim("");
        setErroGeral("");
    };

    useEffect(() => {
        if (open) {
            setDataInicio(dataInicioInicial);
            setDataFim(dataFimInicial);
            limparErros();
        }
    }, [open, dataInicioInicial, dataFimInicial]);

    const validarDatas = (inicio: string, fim: string): boolean => {
        let msgInicio = "";
        let msgFim = "";
        let msgGeral = "";
        let ehValido = true;

        // Validar Data de Início
        if (inicio) {
            const inicioParsed = parseDateString(inicio);
            if (!isDateValid(inicioParsed)) {
                msgInicio = "A data informada não consta no calendário.";
                ehValido = false;
            } else if (inicioParsed > hoje) {
                msgInicio = "Data de início não pode ser futura.";
                ehValido = false;
            }
        }

        // Validar Data de Fim
        if (fim) {
            const fimParsed = parseDateString(fim);
            if (!isDateValid(fimParsed)) {
                msgFim = "A data informada não consta no calendário.";
                ehValido = false;
            } else if (fimParsed > hoje) {
                msgFim = "Data de fim não pode ser futura.";
                ehValido = false;
            }
        }

        // Validar intervalo
        if (ehValido && inicio && fim) {
            const inicioParsed = parseDateString(inicio);
            const fimParsed = parseDateString(fim);
            if (inicioParsed > fimParsed) {
                msgGeral = "Data de início não pode ser maior que data de fim.";
                ehValido = false;
            }
        }

        setErroInicio(msgInicio);
        setErroFim(msgFim);
        setErroGeral(msgGeral);

        return ehValido;
    };

    const handleDataInicioChange = (value: string) => {
        setDataInicio(value);
        validarDatas(value, dataFim);
    };

    const handleDataFimChange = (value: string) => {
        setDataFim(value);
        validarDatas(dataInicio, value);
    };

    const handleYearFilter = (ano: number) => {
        if (ano > anoAtual) {
            setErroGeral("Não é possível filtrar por um ano futuro.");
            return;
        }

        const inicio = `${ano}-01-01`;
        const fim = `${ano}-12-31`;
        setDataInicio(inicio);
        setDataFim(fim);
        validarDatas(inicio, fim);
    };

    const handleCurrentYear = () => {
        const inicio = `${anoAtual}-01-01`;
        const fim = hoje;
        setDataInicio(inicio);
        setDataFim(fim);
        validarDatas(inicio, fim);
    };

    const handleCurrentMonth = () => {
        const hojeDate = new Date();
        const ano = hojeDate.getFullYear();
        const mes = String(hojeDate.getMonth() + 1).padStart(2, '0');
        const inicio = `${ano}-${mes}-01`;

        const ultimoDia = new Date(ano, hojeDate.getMonth() + 1, 0).getDate();
        const fim = `${ano}-${mes}-${String(ultimoDia).padStart(2, '0')}`;

        setDataInicio(inicio);
        setDataFim(fim);
        validarDatas(inicio, fim);
    };

    const handleLast30Days = () => {
        const hojeDate = new Date();
        const trintaDiasAtras = new Date(hojeDate);
        trintaDiasAtras.setDate(hojeDate.getDate() - 30);

        const inicio = trintaDiasAtras.toISOString().split('T')[0];
        const fim = hoje;

        setDataInicio(inicio);
        setDataFim(fim);
        validarDatas(inicio, fim);
    };

    const handleApply = () => {
        if (!validarDatas(dataInicio, dataFim)) return;

        onApply(dataInicio, dataFim);
        onOpenChange(false);
        limparErros();
    };

    const handleCancel = () => {
        setDataInicio(dataInicioInicial);
        setDataFim(dataFimInicial);
        limparErros();
        onOpenChange(false);
    };

    const handleReset = () => {
        setDataInicio("");
        setDataFim("");
        limparErros();
    };

    const isApplyDisabled = !!erroInicio || !!erroFim || !!erroGeral;

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
                    {/* Campo Data Início */}
                    <div>
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
                        {erroInicio && (
                            <div className="grid grid-cols-4 gap-4 mt-1">
                                <span className="col-start-2 col-span-3 text-red-500 text-xs font-medium">
                                    ⚠️ {erroInicio}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Campo Data Fim */}
                    <div>
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
                        {erroFim && (
                            <div className="grid grid-cols-4 gap-4 mt-1">
                                <span className="col-start-2 col-span-3 text-red-500 text-xs font-medium">
                                    ⚠️ {erroFim}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Mensagem de Erro Geral (Ex: Início > Fim) */}
                    {erroGeral && (
                        <div className="text-red-500 text-sm text-center font-medium mt-2">
                            ⚠️ {erroGeral}
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
                            disabled={isApplyDisabled}
                        >
                            Aplicar Filtro
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}