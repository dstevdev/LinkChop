import { NextResponse } from "next/server";

export function middleware(req) {
  const url = req.nextUrl.clone();
  // Get the path (e.g., /abc123)
  const path = url.pathname;

  // 1. Skip the middleware if it's the homepage or a static asset (like images/favicon)
  if (path === "/" || path.includes(".") || path.startsWith("/api")) {
    return NextResponse.next();
  }

  // 2. Extract the hash
  const hash = path.split("/").filter(Boolean).pop();

  if (hash) {
    // 3. Silently proxy to your Supabase Edge Function
    // This keeps "linkchop.me" in the address bar while fetching from Supabase
    return NextResponse.rewrite(
      `https://cjkntiqdvzevlnyxovau.supabase.co/functions/v1/redirector/${hash}`
    );
  }

  return NextResponse.next();
}

// 4. Optional: Only run middleware on specific paths to save on execution time
export const config = {
  matcher: "/:path*",
};
