import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'academico-secret-key-2026');

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;

  const isLoginPage = request.nextUrl.pathname === '/login';
  const isPublicApi = request.nextUrl.pathname.startsWith('/api/auth');

  if (isPublicApi) return NextResponse.next();

  if (!token) {
    if (isLoginPage) return NextResponse.next();
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const { payload } = await jwtVerify(token, SECRET);
    
    if (isLoginPage) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Role-based protection
    const role = payload.role as string;
    const path = request.nextUrl.pathname;

    return NextResponse.next();
  } catch (error) {
    if (isLoginPage) return NextResponse.next();
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.set('auth_token', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
      maxAge: 0
    });
    return response;
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
