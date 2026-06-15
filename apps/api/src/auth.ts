import { timingSafeEqual } from "crypto";
import type { NextFunction, Request, Response } from "express";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

let supabaseRemoteJwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function safeTokenEquals(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

function getSupabaseIssuer() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) return undefined;
  return supabaseUrl.replace(/\/$/, "") + "/auth/v1";
}

async function verifyBearerJWT(token: string): Promise<JWTPayload | null> {
  const issuer = getSupabaseIssuer();
  const secret = process.env.SUPABASE_JWT_SECRET;

  if (secret) {
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
        issuer,
        algorithms: ["HS256"]
      });
      return payload;
    } catch {
      // Fresh Supabase projects may use asymmetric JWTs; try JWKS below.
    }
  }

  if (!issuer) return null;

  try {
    supabaseRemoteJwks ??= createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`));
    const { payload } = await jwtVerify(token, supabaseRemoteJwks, {
      issuer,
      algorithms: ["ES256", "RS256"]
    });
    return payload;
  } catch {
    return null;
  }
}

function getServiceUser(req: Request) {
  const expectedToken = process.env.LIVING_REWARDS_SERVICE_TOKEN;
  if (!expectedToken) return null;

  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const headerToken = typeof req.headers["x-living-rewards-service-token"] === "string"
    ? req.headers["x-living-rewards-service-token"]
    : null;
  const supplied = [bearerToken, headerToken].filter((value): value is string => Boolean(value));
  if (!supplied.some((token) => safeTokenEquals(token, expectedToken))) return null;

  return {
    id: process.env.LIVING_REWARDS_SERVICE_USER_ID || "service-user",
    email: process.env.LIVING_REWARDS_SERVICE_EMAIL || undefined,
    role: "service"
  };
}

export function getUserId(req: Request) {
  return (req as any).user?.id || "demo-user";
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const serviceUser = getServiceUser(req);
  if (serviceUser) {
    (req as any).user = serviceUser;
    return next();
  }

  const allowDemo =
    process.env.DEMO_MODE === "1" ||
    process.env.VITE_DEMO_MODE === "1" ||
    process.env.NODE_ENV !== "production";

  if (allowDemo && req.headers["x-demo-mode"] === "true") {
    (req as any).user = { id: "demo-user", role: "demo" };
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const payload = await verifyBearerJWT(authHeader.slice(7));
  if (!payload?.sub) {
    return res.status(401).json({ message: "Invalid token" });
  }

  (req as any).user = {
    id: payload.sub,
    email: (payload as any).email,
    ...payload
  };
  return next();
}
