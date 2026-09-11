import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { passkey } from "@better-auth/passkey";
import { getDb } from "./db";

export function createAuth() {
  if (
    !process.env.BETTER_AUTH_SECRET ||
    process.env.BETTER_AUTH_SECRET.length < 32
  )
    throw new Error(
      "Set BETTER_AUTH_SECRET to a random value of at least 32 characters.",
    );
  const baseURL = process.env.BETTER_AUTH_URL || "http://localhost:3000";
  return betterAuth({
    appName: "Bookmarks",
    baseURL,
    secret: process.env.BETTER_AUTH_SECRET,
    database: getDb(),
    emailAndPassword: { enabled: false },
    rateLimit: { enabled: true },
    plugins: [
      emailOTP({
        otpLength: 6,
        expiresIn: 300,
        allowedAttempts: 3,
        storeOTP: "hashed",
        async sendVerificationOTP({ email, otp }) {
          if (!process.env.RESEND_API_KEY || !process.env.AUTH_EMAIL_FROM)
            throw new Error("Email delivery is not configured.");
          const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: process.env.AUTH_EMAIL_FROM,
              to: [email],
              subject: "Your Bookmarks sign-in code",
              text: `Your sign-in code is ${otp}. It expires in 5 minutes. If you didn’t request this, ignore this email.`,
            }),
            signal: AbortSignal.timeout(10000),
          });
          if (!response.ok) throw new Error("Couldn’t send the sign-in email.");
        },
      }),
      passkey({
        rpID: new URL(baseURL).hostname,
        rpName: "Bookmarks",
        origin: new URL(baseURL).origin,
      }),
    ],
  });
}
let instance: ReturnType<typeof createAuth> | undefined;
export function getAuth() {
  return (instance ??= createAuth());
}
