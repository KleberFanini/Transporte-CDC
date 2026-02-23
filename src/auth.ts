import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const { handlers, signIn, signOut, auth } = NextAuth({
    session: { strategy: "jwt" },

    providers: [
        CredentialsProvider({
            credentials: {
                email: { label: "Email", type: "email" },
                senha: { label: "Senha", type: "password" },
            },
            authorize: async (cred) => {
                const schema = z.object({
                    email: z.string().email(),
                    senha: z.string().min(6)
                });

                const { email, senha } = schema.parse(cred);

                const usuario = await prisma.usuario.findUnique({
                    where: { email }
                });
                if (!usuario) return null;

                const ok = await bcrypt.compare(senha, usuario.senha);
                if (!ok) return null;

                return {
                    id: usuario.id,
                    email: usuario.email,
                    nome: usuario.nome,
                    perfil: usuario.perfil
                };
            },
        }),
    ],

    callbacks: {
        jwt: async ({ token, user }) => {
            if (user) token.perfil = (user as any).perfil;
            return token;
        },
        session: async ({ session, token }) => {
            if (session.user) (session.user as any).perfil = token.perfil;
            return session;
        },
    },
});