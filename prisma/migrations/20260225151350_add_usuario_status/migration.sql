-- CreateEnum
CREATE TYPE "UsuarioStatus" AS ENUM ('ATIVO', 'DESATIVADO');

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "status" "UsuarioStatus" NOT NULL DEFAULT 'ATIVO';
