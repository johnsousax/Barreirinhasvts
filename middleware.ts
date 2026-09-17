import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const PUBLIC_ADMIN = ['/admin/login', '/admin/recuperar'];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // renova a sessão e valida o token no servidor do Supabase
  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  if (path.startsWith('/admin') && !PUBLIC_ADMIN.some((p) => path.startsWith(p)) && !user) {
    const login = request.nextUrl.clone();
    login.pathname = '/admin/login';
    login.search = path === '/admin' ? '' : `?next=${encodeURIComponent(path)}`;
    return NextResponse.redirect(login);
  }
  if (path === '/admin/login' && user) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }
  return response;
}

export const config = { matcher: ['/admin/:path*', '/auth/:path*'] };
