/**
 * Better Auth Configuration
 * Minimal, working config — no SMTP, no social providers unless keys are set
 */

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  secret: process.env.AUTH_SECRET || process.env.BETTER_AUTH_SECRET || "fallback-secret-change-this-in-production",

  // Base URL - required in production
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

  // Trusted origins - add your Vercel URL via TRUSTED_ORIGINS env var
  trustedOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    ...(process.env.NEXT_PUBLIC_APP_URL ? [process.env.NEXT_PUBLIC_APP_URL] : []),
    ...(process.env.TRUSTED_ORIGINS ? process.env.TRUSTED_ORIGINS.split(",").map(o => o.trim()) : []),
  ],

  // Email + password login — always enabled, no email verification needed
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },

  // Session config
  session: {
    expiresIn: 7 * 24 * 60 * 60,   // 7 days
    updateAge: 24 * 60 * 60,        // refresh every 24h
  },

  // Only add Google if both keys are present
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? {
        socialProviders: {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        },
      }
    : {}),
});
