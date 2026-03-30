import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // Solo por si acaso - autenticación básica muy simple
  const basicAuth = req.headers.get('authorization');

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    const [user, pwd] = atob(authValue).split(':');

    // Cambia esto a tu contraseña preferida (ej: admin/admin123)
    if (user === 'admin' && pwd === (process.env.ADMIN_PASSWORD || 'neon2026')) {
      return NextResponse.next();
    }
  }

  const url = req.nextUrl;
  url.pathname = '/api/auth';

  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  });
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};
