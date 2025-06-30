import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  
  // Если пользователь не авторизован, пропускаем
  if (!token) {
    return NextResponse.next();
  }

  // Если это магазин и оформление не завершено
  if (token.role === 'SHOP' && !token.isSetupComplete) {
    // Разрешаем доступ к странице оформления и API
    if (request.nextUrl.pathname.startsWith('/shop/onboarding') || 
        request.nextUrl.pathname.startsWith('/api/shop/onboarding')) {
      return NextResponse.next();
    }
    
    // Для всех остальных страниц редиректим на оформление
    return NextResponse.redirect(new URL('/shop/onboarding', request.url));
  }

  // Если это мастер и оформление не завершено
  /* if (token.role === 'MASTER' && !token.isSetupComplete) {
    // Разрешаем доступ к странице оформления и API
    if (request.nextUrl.pathname.startsWith('/profile/setup') || 
        request.nextUrl.pathname.startsWith('/api/profile/services')) {
      return NextResponse.next();
    }
    
    // Для всех остальных страниц редиректим на оформление
    return NextResponse.redirect(new URL('/profile/setup', request.url));
  } */

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 