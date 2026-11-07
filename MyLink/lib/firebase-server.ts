import { createSign } from "node:crypto";

const tokenUrl = "https://oauth2.googleapis.com/token";
let cached: { token: string; expiresAt: number } | undefined;
let pending: Promise<string> | undefined;

async function serviceToken() {
  const email = process.env.FIREBASE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!email || !key) throw new Error("Firestore service account is not configured.");
  const now = Math.floor(Date.now() / 1000);
  const encode = (data: object) => Buffer.from(JSON.stringify(data)).toString("base64url");
  const payload = `${encode({ alg: "RS256", typ: "JWT" })}.${encode({
    iss: email, scope: "https://www.googleapis.com/auth/datastore", aud: tokenUrl, iat: now, exp: now + 3600,
  })}`;
  const assertion = `${payload}.${createSign("RSA-SHA256").update(payload).sign(key).toString("base64url")}`;
  const response = await fetch(tokenUrl, { method: "POST", body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }), cache: "no-store" });
  if (!response.ok) throw new Error("Could not obtain a Firestore access token.");
  const result: { access_token: string; expires_in: number } = await response.json();
  cached = { token: result.access_token, expiresAt: Date.now() + result.expires_in * 1000 };
  return cached.token;
}

export async function getServiceToken() {
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.token;
  pending ??= serviceToken().finally(() => { pending = undefined; });
  return pending;
}
