// middleware.js (at the project root)

export default function middleware(req) {
  const url = new URL(req.url);
  const path = url.pathname;

  // 1. Identify shortlink candidates
  // We ignore the homepage ('/') and files with extensions (like .js, .css, .png)
  const isInternalFile = path.includes(".");
  const isHomepage = path === "/";

  if (!isHomepage && !isInternalFile) {
    const hash = path.split("/").filter(Boolean).pop();

    if (hash) {
      const destination = `https://cjkntiqdvzevlnyxovau.supabase.co/functions/v1/chop-redirector/${hash}`;

      // Perform a 307 (Temporary Redirect) to the Supabase Edge Function
      return Response.redirect(destination, 307);
    }
  }

  // 2. Fallback: If we return nothing, Vercel continues to the React App
  return;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
