import { NextRequest, NextResponse } from 'next/server';
import { FileParser } from '@/lib/import/file-parser';
import { ImportService } from '@/lib/import/import.service';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json(
                { error: 'Nenhum arquivo foi enviado.' },
                { status: 400 }
            );
        }

        // Parse do arquivo
        const dados = await FileParser.parseFile(file);

        // Importação
        const importService = new ImportService();
        const resultado = await importService.importarCorridas(dados);

        return NextResponse.json(resultado);
    } catch (error: any) {
        console.error('Erro na importação:', error);
        return NextResponse.json(
            { error: error.message || 'Erro interno no servidor' },
            { status: 500 }
        );
    }
}

// GET para testes (opcional)
export async function GET() {
    return NextResponse.json({
        message: 'API de importação de corridas',
        method: 'POST',
        instructions: 'Envie um arquivo CSV ou Excel via POST com o campo "file"',
    });
}