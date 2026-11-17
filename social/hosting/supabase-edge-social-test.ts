// MangaLog Next TEST: Supabase's shared domains intentionally serve HTML as text/plain.
// Redirect outdated HTML link to the SAFE OFFLINE DEMO (no credentials).
// Real user authentication must use a separately hosted trusted static site.
const DESTINATION = "https://raw.githack.com/mangalog/MangaLog/mangalog-vnext-social-market/social-preview-standalone.html";
Deno.serve((req: Request) => {
 const headers = new Headers({
  "Location": DESTINATION,
  "Cache-Control": "no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "Referrer-Policy": "no-referrer",
  "Content-Type": "text/plain; charset=utf-8"
 });
 if (req.method !== "GET" && req.method !== "HEAD") return new Response("Method not allowed", {status:405,headers:{"Allow":"GET, HEAD"}});
 return new Response(req.method==="HEAD"?null:"Anteprima Social: reindirizzamento alla demo senza login.", {status:302,headers});
});
