-- CreateEnum
CREATE TYPE "Perfil" AS ENUM ('admin', 'visualizador');

-- CreateEnum
CREATE TYPE "Plataforma" AS ENUM ('UBER', 'NOVE_NOVE');

-- CreateEnum
CREATE TYPE "corridaStatus" AS ENUM ('COMPLETA', 'CANCELADA', 'NAO_REALIZADA', 'EM_ANDAMENTO', 'DESCONHECIDO');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "perfil" "Perfil" NOT NULL DEFAULT 'visualizador',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Corrida" (
    "id" TEXT NOT NULL,
    "idCorridaPlataforma" TEXT,
    "plataforma" "Plataforma" NOT NULL,
    "status" "corridaStatus" NOT NULL DEFAULT 'DESCONHECIDO',
    "dataSolicitacaoLocal" TIMESTAMP(3),
    "dataChegadaLocal" TIMESTAMP(3),
    "detalhamentoDespesa" TEXT,
    "grupo" TEXT,
    "programa" TEXT,
    "servico" TEXT,
    "nome" TEXT,
    "sobrenome" TEXT,
    "nomeCompleto" TEXT,
    "tipoTransacao" TEXT,
    "valorTotal" DECIMAL(10,2),
    "distanciaMetros" INTEGER,
    "duracaoMinutos" INTEGER,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Corrida_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Corrida_idCorridaPlataforma_key" ON "Corrida"("idCorridaPlataforma");

-- CreateIndex
CREATE INDEX "Corrida_plataforma_idx" ON "Corrida"("plataforma");

-- CreateIndex
CREATE INDEX "Corrida_status_idx" ON "Corrida"("status");

-- CreateIndex
CREATE INDEX "Corrida_dataSolicitacaoLocal_idx" ON "Corrida"("dataSolicitacaoLocal");

-- CreateIndex
CREATE INDEX "Corrida_nomeCompleto_idx" ON "Corrida"("nomeCompleto");
