// middleware.js (Project Root)

export default async function middleware(req) {
  const url = new URL(req.url);
  const path = url.pathname;

  // 1. Exclude static files and the homepage
  // path === '/' -> The UI
  // path.includes('.') -> favicon.ico, assets, etc.
  if (path === "/" || path.includes(".")) {
    return Response.next();
  }

  // 2. Extract the hash (the part after the slash)
  const hash = path.split("/").filter(Boolean).pop();

  if (hash) {
    // 3. Redirect to your Supabase Edge Function
    // We use a 302 redirect here so the browser goes to the Supabase function
    const supabaseFunctionUrl = `https://cjkntiqdvzevlnyxovau.supabase.co/functions/v1/redirector/${hash}`;

    return Response.redirect(supabaseFunctionUrl, 302);
  }

  return Response.next();
}

// Ensure the middleware only runs on actual paths
export const config = {
  matcher: "/:path*",
};
