import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { validarToken } from '@/lib/jwt';

// Rotas que não precisam de autenticação
const rotasPublicas = [
    '/auth',
    '/api/auth/login',
    '/api/auth/cadastro'
];

// Rota que só pode ser acessada quando NÃO logado
const rotaApenasNaoLogado = '/auth';

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Verifica se é rota pública
    const isPublicPath = rotasPublicas.some(rota => path.startsWith(rota));

    // Verifica se é a rota de autenticação
    const isAuthPath = path === '/auth';

    // Pega o token dos cookies
    const token = request.cookies.get('token')?.value;

    // Verifica se o token é válido
    let usuarioLogado = false;
    if (token) {
        try {
            const payload = await validarToken(token);
            usuarioLogado = !!payload;
        } catch {
            usuarioLogado = false;
        }
    }

    // Caso 1: Usuário logado tentando acessar página de auth
    if (usuarioLogado && isAuthPath) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Caso 2: Usuário não logado tentando acessar rota privada
    if (!usuarioLogado && !isPublicPath) {
        return NextResponse.redirect(new URL('/auth', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};