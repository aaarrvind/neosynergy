import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const pathname = request.nextUrl.pathname;
  const isLoginPath = pathname === "/admin-login";
  const isAdminPath = pathname.startsWith("/admin") && !isLoginPath;

  // Forward the pathname on the REQUEST so app/layout.tsx can read it via
  // headers(). Overwriting any client-sent value prevents spoofing.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-next-pathname", pathname);
  const passThrough = () =>
    NextResponse.next({ request: { headers: requestHeaders } });

  // Placeholder / unconfigured — let everything through
  const isConfigured = supabaseUrl && !supabaseUrl.includes("placeholder");

  // Public routes never need an auth check — skip the Supabase round-trip
  if (!isConfigured || (!isAdminPath && !isLoginPath)) {
    return passThrough();
  }

  const { createServerClient } = await import("@supabase/ssr");
  let response = passThrough();

  const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = passThrough();
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // getUser() revalidates the token with Supabase Auth — never trust
  // getSession() in server code, its JWT is read from the cookie unverified.
  const { data: { user } } = await supabase.auth.getUser();

  if (isAdminPath && !user) {
    return NextResponse.redirect(new URL("/admin-login", request.url));
  }
  if (isLoginPath && user) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

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
