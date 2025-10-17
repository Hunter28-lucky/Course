import crypto from "node:crypto";
import { serverEnv, isShopifyEnabled } from "@/lib/env-server";
import type { Course } from "@/types";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const ADMIN_API_VERSION = "2024-07";
const STOREFRONT_API_VERSION = "2024-07";

const assertShopifyEnabled = () => {
  if (!isShopifyEnabled()) {
    throw new Error("Shopify integration is not enabled");
  }
};

export const buildShopifyAdminUrl = (path: string) => {
  assertShopifyEnabled();
  return `https://${serverEnv.SHOPIFY_STORE_DOMAIN}/admin/api/${ADMIN_API_VERSION}${path}`;
};

const shopifyAdminFetch = async <T>(path: string, init: RequestInit = {}) => {
  assertShopifyEnabled();

  const response = await fetch(buildShopifyAdminUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token":
        serverEnv.SHOPIFY_ADMIN_ACCESS_TOKEN ?? "",
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Shopify admin request failed (${response.status}): ${body}`
    );
  }

  return response.json() as Promise<T>;
};

export const syncCourseToShopify = async (course: Course) => {
  assertShopifyEnabled();

  const supabase = await getSupabaseServerClient();
  const variantPayload = course.shopify_variant_id
    ? [
        {
          id: Number(course.shopify_variant_id),
          price: Number(course.price).toFixed(2),
          taxable: false,
        },
      ]
    : [
        {
          price: Number(course.price).toFixed(2),
          taxable: false,
        },
      ];

  const productPayload = {
    title: course.title,
    body_html: course.description,
    status: "active",
    product_type: "Course",
    tags: ["CourseCraft"],
    variants: variantPayload,
  };

  if (course.shopify_product_id) {
    const updated = await shopifyAdminFetch<{
      product: { variants: Array<{ id: number }> };
    }>(`/products/${course.shopify_product_id}.json`, {
      method: "PUT",
      body: JSON.stringify({
        product: {
          ...productPayload,
          id: Number(course.shopify_product_id),
        },
      }),
    });

    const variantId = course.shopify_variant_id
      ? course.shopify_variant_id
      : updated.product.variants[0]
        ? String(updated.product.variants[0].id)
        : null;

    if (!course.shopify_variant_id && variantId) {
      await supabase
        .from("courses")
        .update({ shopify_variant_id: variantId })
        .eq("id", course.id);
    }

    return { productId: course.shopify_product_id, variantId };
  }

  const created = await shopifyAdminFetch<{
    product: { id: number; variants: Array<{ id: number }> };
  }>(`/products.json`, {
    method: "POST",
    body: JSON.stringify({ product: productPayload }),
  });

  const productId = String(created.product.id);
  const variantId = created.product.variants[0]
    ? String(created.product.variants[0].id)
    : null;

  await supabase
    .from("courses")
    .update({
      shopify_product_id: productId,
      shopify_variant_id: variantId,
    })
    .eq("id", course.id);

  return { productId, variantId };
};

export const removeCourseFromShopify = async (course: Course) => {
  assertShopifyEnabled();
  if (!course.shopify_product_id) {
    return;
  }

  await shopifyAdminFetch(`/products/${course.shopify_product_id}.json`, {
    method: "DELETE",
  });

  const supabase = await getSupabaseServerClient();
  await supabase
    .from("courses")
    .update({ shopify_product_id: null, shopify_variant_id: null })
    .eq("id", course.id);
};

export const fetchShopifyProduct = async (productId: string) => {
  assertShopifyEnabled();
  return shopifyAdminFetch<{ product: Record<string, unknown> }>(
    `/products/${productId}.json`
  );
};

export const verifyShopifyWebhook = (
  rawBody: string,
  hmacHeader: string | null
) => {
  assertShopifyEnabled();
  if (!hmacHeader) return false;

  const hmac = crypto
    .createHmac("sha256", serverEnv.SHOPIFY_WEBHOOK_SECRET ?? "")
    .update(rawBody, "utf8")
    .digest("base64");

  const digestBuffer = Buffer.from(hmac, "base64");
  const headerBuffer = Buffer.from(hmacHeader, "base64");

  if (digestBuffer.length !== headerBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(digestBuffer, headerBuffer);
};

export const storefrontQuery = async <T>(query: string, variables?: object) => {
  assertShopifyEnabled();
  const response = await fetch(
    `https://${serverEnv.SHOPIFY_STORE_DOMAIN}/api/${STOREFRONT_API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token":
          serverEnv.SHOPIFY_STOREFRONT_ACCESS_TOKEN ?? "",
      },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: 120 },
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Shopify storefront request failed (${response.status}): ${body}`
    );
  }

  return (await response.json()) as T;
};
