import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import type { AuthOptions } from "next-auth"; // 👈 Importe o tipo

const authOptions: AuthOptions = { // 👈 Adicione : AuthOptions
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                senha: { label: "Senha", type: "password" },
            },
            async authorize(credentials) {
                const schema = z.object({
                    email: z.string().email(),
                    senha: z.string().min(6),
                });

                const { email, senha } = schema.parse(credentials);

                const usuario = await prisma.usuario.findUnique({
                    where: { email },
                });

                if (!usuario) return null;

                const senhaValida = await bcrypt.compare(senha, usuario.senha);
                if (!senhaValida) return null;

                return {
                    id: String(usuario.id),
                    email: usuario.email,
                    nome: usuario.nome,
                    perfil: usuario.perfil,
                };
            },
        }),
    ],
    pages: {
        signIn: "/auth",
    },
    session: {
        strategy: "jwt", // 👈 Agora o TypeScript vai aceitar
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };