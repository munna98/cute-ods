import { NextResponse, type NextRequest } from 'next/server'
import { getRoleDefaultPath } from '@/lib/auth-constants'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const userRole = request.cookies.get('ods_user_role')?.value

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  if (pathname === '/login') {
    return NextResponse.next()
  }

  if (!userRole && pathname !== '/login') {
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  if (pathname === '/') {
    return NextResponse.redirect(new URL(getRoleDefaultPath(userRole || 'SALES'), request.url))
  }

  if (userRole) {
    if (pathname.startsWith('/sales') && userRole !== 'SALES' && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL(getRoleDefaultPath(userRole), request.url))
    }

    if (pathname.startsWith('/design') && userRole !== 'DESIGN' && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL(getRoleDefaultPath(userRole), request.url))
    }

    if (pathname.startsWith('/production') && userRole !== 'PRODUCTION' && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL(getRoleDefaultPath(userRole), request.url))
    }

    if (pathname.startsWith('/admin') && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL(getRoleDefaultPath(userRole), request.url))
    }
  }

  return NextResponse.next()
}

export const middleware = proxy

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
