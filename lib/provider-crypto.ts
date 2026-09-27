import crypto from "crypto";

const source = process.env.AUTH_SECRET || process.env.APP_ENCRYPTION_KEY || (process.env.NODE_ENV === "production" ? (()=>{throw new Error("AUTH_SECRET or APP_ENCRYPTION_KEY is required in production.")})() : "server-monitor-dev-secret");
const key = crypto.createHash("sha256").update(source).digest();

export function protect(value: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const data = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return [iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), data.toString("base64url")].join(".");
}

export function reveal(value: string) {
  const [iv, tag, data] = value.split(".");
  if (!iv || !tag || !data) throw new Error("Invalid provider credential");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(data, "base64url")), decipher.final()]).toString("utf8");
}
