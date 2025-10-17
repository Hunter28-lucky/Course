import { NextResponse } from "next/server";
import { isShopifyEnabled, serverEnv } from "@/lib/env-server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { verifyShopifyWebhook } from "@/lib/shopify";

type ShopifyProductWebhookPayload = {
  id: number;
  title: string;
  body_html?: string | null;
  product_type?: string | null;
  image?: { src?: string | null } | null;
  images?: Array<{ src?: string | null }>;
  variants?: Array<{ id: number; price?: string | null }>;
};

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isShopifyEnabled()) {
    return NextResponse.json({ ok: true });
  }

  const rawBody = await request.text();
  const hmac = request.headers.get("X-Shopify-Hmac-Sha256");
  const topic = request.headers.get("X-Shopify-Topic");

  if (!verifyShopifyWebhook(rawBody, hmac)) {
    return new NextResponse("Invalid HMAC", { status: 401 });
  }

  const payload = JSON.parse(rawBody) as ShopifyProductWebhookPayload;

  if (topic === "products/create" || topic === "products/update") {
    const productId = String(payload.id);
    const title = payload.title as string;
    const description = payload.body_html ?? "";
    const basePrice = Number.parseFloat(payload.variants?.[0]?.price ?? "0");
    const price = Number.isFinite(basePrice) ? Math.round(basePrice) : 0;
    const thumbnail =
      payload.image?.src || payload.images?.[0]?.src || null;

    const supabase = await getSupabaseServerClient();
    await supabase
      .from("courses")
      .upsert(
        {
          title,
          description,
          price,
          thumbnail_url: thumbnail,
          category: payload.product_type || "General",
          rating: 4.8,
          shopify_product_id: productId,
          shopify_variant_id: payload.variants?.[0]
            ? String(payload.variants[0].id)
            : null,
        },
        {
          onConflict: "shopify_product_id",
        }
      );
  }

  if (topic === "products/delete") {
    const productId = String(payload.id);
    const supabase = await getSupabaseServerClient();
    await supabase
      .from("courses")
      .update({ shopify_product_id: null, shopify_variant_id: null })
      .eq("shopify_product_id", productId);
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  if (!serverEnv.SHOPIFY_APP_URL) {
    return NextResponse.json({ status: "ok" });
  }

  return NextResponse.json({
    status: "ok",
    webhookUrl: `${serverEnv.SHOPIFY_APP_URL}/api/shopify/webhooks`,
  });
}
