const requiredServerVars = [
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "OPENAI_API_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
] as const;

const requiredClientVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"] as const;

function getEnvValue(key: string, required = true): string {
  const value = process.env[key];
  if (!value && required) {
    throw new Error(`Missing env var: ${key}`);
  }
  return value ?? "";
}

export const env = {
  server: {
    SUPABASE_URL: getEnvValue("SUPABASE_URL", false),
    SUPABASE_ANON_KEY: getEnvValue("SUPABASE_ANON_KEY", false),
    SUPABASE_SERVICE_ROLE_KEY: getEnvValue("SUPABASE_SERVICE_ROLE_KEY", false),
    OPENAI_API_KEY: getEnvValue("OPENAI_API_KEY", false),
    STRIPE_SECRET_KEY: getEnvValue("STRIPE_SECRET_KEY", false),
    STRIPE_WEBHOOK_SECRET: getEnvValue("STRIPE_WEBHOOK_SECRET", false),
    STRIPE_PRICE_MONTHLY: getEnvValue("STRIPE_PRICE_MONTHLY", false),
    STRIPE_PRICE_YEARLY: getEnvValue("STRIPE_PRICE_YEARLY", false),
    NEXT_PUBLIC_APP_URL: getEnvValue("NEXT_PUBLIC_APP_URL", false),
    NEXT_PUBLIC_POSTHOG_KEY: getEnvValue("NEXT_PUBLIC_POSTHOG_KEY", false),
    NEXT_PUBLIC_POSTHOG_HOST: getEnvValue("NEXT_PUBLIC_POSTHOG_HOST", false),
  },
  client: {
    NEXT_PUBLIC_SUPABASE_URL: getEnvValue("NEXT_PUBLIC_SUPABASE_URL", false),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: getEnvValue("NEXT_PUBLIC_SUPABASE_ANON_KEY", false),
    NEXT_PUBLIC_POSTHOG_KEY: getEnvValue("NEXT_PUBLIC_POSTHOG_KEY", false),
    NEXT_PUBLIC_POSTHOG_HOST: getEnvValue("NEXT_PUBLIC_POSTHOG_HOST", false),
  },
};

export function assertServerEnv() {
  requiredServerVars.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Missing required server env: ${key}`);
    }
  });
}

export function assertClientEnv() {
  requiredClientVars.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Missing required client env: ${key}`);
    }
  });
}
