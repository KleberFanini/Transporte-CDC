// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pgPool?: Pool;
};

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL não definida");
}

// Configura o pool de conexões
const pool = globalForPrisma.pgPool ?? new Pool({
  connectionString: process.env.DATABASE_URL,
  // Adicione estas configurações para melhor performance
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.pgPool = pool;
}

// Configura o adapter com o pool
const adapter = new PrismaPg(pool);

// Cria a instância do PrismaClient
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}