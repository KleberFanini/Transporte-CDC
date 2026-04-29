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

    const handleDataInicioChange = (value: string) => {
        setDataInicio(value);
        setErro("");

        // Validar se data início é maior que hoje
        if (value && value > hoje) {
            setErro("Data de início não pode ser futura");
        }

        // Validar se data início é maior que data fim
        if (value && dataFim && value > dataFim) {
            setErro("Data de início não pode ser maior que data de fim");
        }
    };

    const handleDataFimChange = (value: string) => {
        setDataFim(value);
        setErro("");

        // Validar se data fim é maior que hoje
        if (value && value > hoje) {
            setErro("Data de fim não pode ser futura");
        }

        // Validar se data fim é menor que data início
        if (value && dataInicio && value < dataInicio) {
            setErro("Data de fim não pode ser menor que data de início");
        }
    };

    const handleApply = () => {
        // Validar antes de aplicar
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
            <DialogContent className="sm:max-w-[425px] bg-white">
                <DialogHeader>
                    <DialogTitle>Filtrar por Data</DialogTitle>
                    <DialogDescription>
                        Selecione o período desejado. Deixe em branco para mostrar todos os dados.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
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