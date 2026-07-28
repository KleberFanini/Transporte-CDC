'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Upload, FileText, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ResultadoImportacao {
    total: number;
    importados: number;
    erros: { linha: number; erro: string }[];
}

export default function ImportarTransladosPage() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [resultado, setResultado] = useState<ResultadoImportacao | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResultado(null);
        }
    };

    const handleImport = async () => {
        if (!file) {
            toast.error('Selecione um arquivo primeiro');
            return;
        }

        setLoading(true);
        setResultado(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/importar-translados', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro na importação');
            }

            setResultado(data);

            if (data.importados > 0) {
                toast.success(`${data.importados} translados importados com sucesso!`);
            }
            if (data.erros?.length > 0) {
                toast.warning(`${data.erros.length} registros com erro`);
            }
        } catch (error: any) {
            console.error('Erro na importação:', error);
            toast.error(error.message || 'Erro ao importar arquivo');
        } finally {
            setLoading(false);
        }
    };

    const downloadModelo = () => {
        const headers = [
            'ID', 'TIPO', 'LANÇAMENTO', 'RESPONSÁVEL PELA CRIAÇÃO',
            'FORNECEDOR', 'DCTO FORNECEDOR', 'HISTÓRICO', 'COD CONTRATO',
            'CADASTRO', 'COMPETÊNCIA', 'EMISSÃO', 'VENCIMENTO',
            'APROVAÇÃO', 'PAGAMENTO', 'ORIGEM PAGAMENTO', 'TIPO PAGAMENTO',
            'VALOR BRUTO', 'VALOR LÍQUIDO', 'DOCUMENTO',
            'Categoria/Conta', 'Projeto/Centro de Custos', 'Subprojeto',
            'Atividade', 'OBSERVAÇÕES RATEIOS', 'OBSERVAÇÕES GERAIS'
        ];

        const exemplo = [
            '00010155', 'PRINC', 'CP010026', 'Giselle Patricia Barata de Lima',
            'LUCAS GONZALIS MARTINS', '24.585.223/0001-26',
            'SERVIÇO TRANSLADO - ATITUDE CARUARU', '',
            '2025-03-31', '03/2025', '2025-03-28', '2025-04-02',
            'Não enviada', '2025-04-02', 'Atitude Caruaru II: 719,50',
            'TED (Outra Titularidade)', '719,50', '719,50', '194',
            '', '', '', '', '', ''
        ];

        const delimiter = ';';
        const csvContent = [
            headers.join(delimiter),
            exemplo.map(value => `"${value}"`).join(delimiter)
        ].join('\n');

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.setAttribute('download', 'modelo_importacao_translados.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('Modelo baixado com sucesso!');
    };

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Importar Translados</h1>
                <p className="text-gray-600 mt-1">
                    Importe translados de planilhas CSV ou Excel
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Área de upload */}
                <Card>
                    <CardHeader>
                        <CardTitle>Upload de Arquivo</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <Label htmlFor="file-upload" className="cursor-pointer">
                                <div className="bg-[#5D2A1A] text-white px-4 py-2 rounded-lg inline-block hover:bg-[#4A2214]">
                                    Selecionar Arquivo
                                </div>
                                <Input
                                    id="file-upload"
                                    type="file"
                                    accept=".csv,.xlsx,.xls"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </Label>
                            <p className="text-sm text-gray-500 mt-2">
                                Formatos suportados: CSV, Excel (.xlsx, .xls)
                            </p>
                        </div>

                        {file && (
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-[#5D2A1A]" />
                                    <span className="text-sm font-medium">{file.name}</span>
                                    <span className="text-xs text-gray-500">
                                        {(file.size / 1024).toFixed(2)} KB
                                    </span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setFile(null)}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    <XCircle className="h-4 w-4" />
                                </Button>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <Button
                                onClick={handleImport}
                                disabled={!file || loading}
                                className="flex-1 bg-[#5D2A1A] hover:bg-[#4A2214] text-white"
                            >
                                {loading ? 'Importando...' : 'Importar Dados'}
                            </Button>
                            <Button
                                onClick={downloadModelo}
                                variant="outline"
                                className="flex-1"
                            >
                                Baixar Modelo
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Resultados */}
                {resultado && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Resultado da Importação</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-green-600">{resultado.importados}</p>
                                    <p className="text-sm text-gray-600">Importados</p>
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <FileText className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-gray-600">{resultado.total}</p>
                                    <p className="text-sm text-gray-600">Total Processado</p>
                                </div>
                            </div>

                            {resultado.erros && resultado.erros.length > 0 && (
                                <div className="mt-4">
                                    <h3 className="font-semibold text-red-600 mb-2 flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4" />
                                        Erros ({resultado.erros.length})
                                    </h3>
                                    <div className="max-h-48 overflow-y-auto space-y-1 text-sm">
                                        {resultado.erros.map((erro, idx) => (
                                            <div key={idx} className="text-red-500 bg-red-50 p-2 rounded">
                                                Linha {erro.linha}: {erro.erro}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Instruções */}
            <Card>
                <CardHeader>
                    <CardTitle className='text-center'>Instruções</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 text-center">
                        <li>Baixe o modelo de planilha usando o botão acima</li>
                        <li>Preencha os dados seguindo os cabeçalhos do modelo</li>
                        <li>O arquivo deve estar em formato CSV ou Excel</li>
                        <li>Campos obrigatórios: LANÇAMENTO, FORNECEDOR, VALOR BRUTO</li>
                        <li>Dados duplicados (mesmo LANÇAMENTO) serão atualizados automaticamente</li>
                        <li>A coluna ORIGEM PAGAMENTO deve estar no formato: "Projeto: Valor" (ex: "Atitude Caruaru II: 719,50")</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}