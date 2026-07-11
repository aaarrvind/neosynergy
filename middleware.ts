import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const pathname = request.nextUrl.pathname;
  const isLoginPath = pathname === "/admin-login";
  const isAdminPath = pathname.startsWith("/admin") && !isLoginPath;

  // Placeholder / unconfigured — let everything through but still set path header
  const isConfigured = supabaseUrl && !supabaseUrl.includes("placeholder");

  if (!isConfigured) {
    const response = NextResponse.next();
    response.headers.set("x-next-pathname", pathname);
    return response;
  }

  const { createServerClient } = await import("@supabase/ssr");
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request: { headers: request.headers } });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const { data: { session } } = await supabase.auth.getSession();

  if (isAdminPath && !session) {
    return NextResponse.redirect(new URL("/admin-login", request.url));
  }
  if (isLoginPath && session) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  response.headers.set("x-next-pathname", pathname);
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|images/).*)",
  ],
};

