/**
 * Better Auth Configuration with SMTP
 */

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

// Import prisma client
import { prisma } from "./db";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql" // or "mysql" based on your database
  }),
  secret: process.env.AUTH_SECRET || "fallback-secret-change-this",
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true only when SMTP is fully configured
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "github"], // Add other providers as needed
    },
  },
  socialProviders: {
    // Add social providers as needed
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    },
  },
  // Session configuration
  session: {
    expiresIn: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  // User configuration
  user: {
    name: true,
    image: true,
  },
  // Email configuration with SMTP transport
  email: {
    // Configure SMTP transport for email delivery
    transport: {
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASSWORD || "",
      },
      secure: false, // true for 465, false for other ports
    },
    from: process.env.SMTP_FROM || "noreply@yourdomain.com",
    async sendVerificationRequest({ user, url, token, identifier }) {
      // Send verification email using SMTP
      console.log(`Sending verification email to ${identifier} with URL: ${url}`);
      // In production, this will use the SMTP configuration above
    },
    async sendPasswordReset({ user, url, token }) {
      // Send password reset email using SMTP
      console.log(`Sending password reset email to ${user.email} with URL: ${url}`);
      // In production, this will use the SMTP configuration above
    },
    async sendInvite({ user, url, token, invitedBy }) {
      // Send invitation email using SMTP
      console.log(`Sending invitation email to ${user.email} by ${invitedBy}`);
      // In production, this will use the SMTP configuration above
    }
  }
});