"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Car, CarTaxiFront, CarFront } from "lucide-react";

interface PlatformFilterProps {
    value: string;
    onChange: (value: string) => void;
}

export function PlatformFilter({ value, onChange }: PlatformFilterProps) {
    return (
        <div className="flex items-center gap-2">
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger className="w-[140px] hover:bg-[#bdb8ae]">
                    <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="todos">
                        <div className="flex items-center gap-2">
                            <Car className="h-4 w-4" />
                            <span>Todos</span>
                        </div>
                    </SelectItem>
                    <SelectItem value="UBER">
                        <div className="flex items-center gap-2">
                            <CarFront className="h-4 w-4" />
                            <span>Uber</span>
                        </div>
                    </SelectItem>
                    <SelectItem value="NOVE_NOVE">
                        <div className="flex items-center gap-2">
                            <CarTaxiFront className="h-4 w-4" />
                            <span>99</span>
                        </div>
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}