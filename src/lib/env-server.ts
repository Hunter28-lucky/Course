import { z } from "zod";

const cleanEnvValue = (value: string | undefined | null) => {
  if (!value || value.trim().length === 0) {
    return undefined;
  }
  return value;
};

const serverEnvSchema = z.object({
  SHOPIFY_STORE_DOMAIN: z.string().min(1).optional(),
  SHOPIFY_STOREFRONT_ACCESS_TOKEN: z.string().min(1).optional(),
  SHOPIFY_ADMIN_ACCESS_TOKEN: z.string().min(1).optional(),
  SHOPIFY_WEBHOOK_SECRET: z.string().min(1).optional(),
  SHOPIFY_APP_URL: z.string().url().optional(),
});

export const serverEnv = serverEnvSchema.parse({
  SHOPIFY_STORE_DOMAIN: cleanEnvValue(process.env.SHOPIFY_STORE_DOMAIN),
  SHOPIFY_STOREFRONT_ACCESS_TOKEN: cleanEnvValue(
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN
  ),
  SHOPIFY_ADMIN_ACCESS_TOKEN: cleanEnvValue(
    process.env.SHOPIFY_ADMIN_ACCESS_TOKEN
  ),
  SHOPIFY_WEBHOOK_SECRET: cleanEnvValue(process.env.SHOPIFY_WEBHOOK_SECRET),
  SHOPIFY_APP_URL: cleanEnvValue(process.env.SHOPIFY_APP_URL),
});

export const isShopifyEnabled = () =>
  Boolean(
    serverEnv.SHOPIFY_STORE_DOMAIN &&
      serverEnv.SHOPIFY_STOREFRONT_ACCESS_TOKEN &&
      serverEnv.SHOPIFY_ADMIN_ACCESS_TOKEN &&
      serverEnv.SHOPIFY_WEBHOOK_SECRET
  );
