"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2 } from "lucide-react";

interface ProjectFilterProps {
    value: string;
    onChange: (value: string) => void;
    projetos?: string[];
}

export function ProjectFilter({ value, onChange, projetos = [] }: ProjectFilterProps) {
    return (
        <div className="flex items-center gap-2">
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger className="w-[200px] hover:bg-[#bdb8ae]">
                    <SelectValue placeholder="Selecione o projeto" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="todos">
                        <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            <span>Todos os projetos</span>
                        </div>
                    </SelectItem>
                    {projetos.map((projeto) => (
                        <SelectItem key={projeto} value={projeto}>
                            <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                <span>{projeto}</span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}