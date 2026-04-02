import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const authCookie = req.cookies.get('clabes_auth');
  const path = req.nextUrl.pathname;
  
  const isLoginPage = path.startsWith('/login');
  const isAuthApi = path.startsWith('/api/auth');

  // Si no hay cookie y trata de acceder a rutas protegidas (ni login, ni api/auth públicas)
  if (!authCookie && !isLoginPage && !isAuthApi) {
    if (path.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Si ya está autenticado e intenta ir al login, redigir al inicio
  if (authCookie && isLoginPage) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
