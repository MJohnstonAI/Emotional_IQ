import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const payload = await req.json();
    const { productId, token } = payload ?? {};

    if (!productId || !token) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing productId or token" }),
        { status: 400 }
      );
    }

    // TODO: Validate token using Google Play Developer API.
    // This function is intentionally a skeleton for production verification.
    return new Response(JSON.stringify({ ok: true, verified: false }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
