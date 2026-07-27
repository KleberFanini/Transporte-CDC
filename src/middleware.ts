import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas que não precisam de autenticação
const publicRoutes = [
    '/auth',
    '/api/auth/login',
    '/api/auth/cadastro',
    '/api/auth/recuperar-senha',
    '/api/auth/validar-token',
    '/api/auth/redefinir-senha',
];

// Rotas que apenas admin pode acessar
const adminOnlyRoutes = [
    '/importar',
    '/translado/importar',
    '/admin',
    '/api/importar-corridas',
    '/api/importar-translados',
];

// Rotas que precisam de autenticação (qualquer usuário logado)
const protectedRoutes = [
    '/dashboard',
    '/relatorios',
    '/translado',
    '/funcionarios',
    '/admin',
    '/importar',
];

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;

    console.log('=== MIDDLEWARE ===');
    console.log('Pathname:', pathname);
    console.log('Token existe:', !!token);

    // 1. Verificar se é rota pública
    const isPublicRoute = publicRoutes.some(route =>
        pathname === route || pathname.startsWith(route)
    );

    if (isPublicRoute) {
        console.log('Rota pública, permitindo acesso');
        return NextResponse.next();
    }

    // 2. Verificar se tem token
    if (!token) {
        console.log('Sem token, redirecionando para /auth');
        const loginUrl = new URL('/auth', request.url);
        return NextResponse.redirect(loginUrl);
    }

    // 3. Decodificar token para verificar perfil
    try {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        const userPerfil = tokenData.perfil;

        console.log('Usuário autenticado:', { email: tokenData.email, perfil: userPerfil });

        // 4. Verificar se é rota admin-only
        const isAdminRoute = adminOnlyRoutes.some(route =>
            pathname === route || pathname.startsWith(route)
        );

        if (isAdminRoute && userPerfil !== 'admin') {
            console.log('Acesso negado: rota admin-only para usuário não-admin');
            // Redirecionar para dashboard sem parâmetro de erro
            const dashboardUrl = new URL('/dashboard', request.url);
            return NextResponse.redirect(dashboardUrl);
        }

        // 5. Verificar se é rota protegida (qualquer usuário logado)
        const isProtectedRoute = protectedRoutes.some(route =>
            pathname === route || pathname.startsWith(route + '/')
        );

        if (isProtectedRoute) {
            console.log('Acesso permitido à rota protegida');
            return NextResponse.next();
        }

        // 6. Para qualquer outra rota, permitir acesso
        console.log('Acesso permitido');
        return NextResponse.next();

    } catch (error) {
        console.error('Erro ao decodificar token:', error);
        // Token inválido, redirecionar para login
        const loginUrl = new URL('/auth', request.url);
        return NextResponse.redirect(loginUrl);
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         * - logo-transporte.png (logo image)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};