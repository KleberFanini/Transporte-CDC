import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
// @ts-ignore
import { Pool } from "pg";


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

async function main() {
  const email = "admin@cdc.com";
  const senha = "admin123";

  const existe = await prisma.usuario.findUnique({ where: { email } });
  if (existe) {
    console.log("Admin já existe:", email);
    return;
  }

  const hash = await bcrypt.hash(senha, 10);

  await prisma.usuario.create({
    data: {
      nome: "Admin CDC",
      email,
      senha: hash,
      perfil: "admin",
    },
  });

  console.log("Admin criado:", email, "senha:", senha);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });