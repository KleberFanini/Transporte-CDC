"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, Clock, HelpCircle } from "lucide-react";

interface StatusFilterProps {
    value: string;
    onChange: (value: string) => void;
}

const statusOptions = [
    { value: "todos", label: "Todos os status", icon: null },
    { value: "COMPLETA", label: "Completa", icon: CheckCircle, color: "text-green-600" },
    { value: "CANCELADA", label: "Cancelada", icon: XCircle, color: "text-red-600" },
    { value: "NAO_REALIZADA", label: "Não Realizada", icon: HelpCircle, color: "text-gray-600" },
    { value: "DESCONHECIDO", label: "Desconhecido", icon: HelpCircle, color: "text-gray-400" },
];

export function StatusFilter({ value, onChange }: StatusFilterProps) {
    const selectedOption = statusOptions.find(opt => opt.value === value) || statusOptions[0];

    return (
        <div className="flex items-center gap-2">
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger className="w-[160px] bg-[#F5F3EF]">
                    <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                    {statusOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                            <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center gap-2">
                                    {Icon && <Icon className={`h-4 w-4 ${option.color}`} />}
                                    <span>{option.label}</span>
                                </div>
                            </SelectItem>
                        );
                    })}
                </SelectContent>
            </Select>
        </div>
    );
}