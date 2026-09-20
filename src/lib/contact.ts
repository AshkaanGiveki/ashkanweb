import "server-only";
import crypto from "node:crypto";

const env = (key: string) => process.env[key] || "";
const redis = async (command: unknown[]) => {
  const url = env("UPSTASH_REDIS_REST_URL"); const token = env("UPSTASH_REDIS_REST_TOKEN");
  if (!url || !token) throw new Error("Redis is not configured");
  const response = await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${token}`, "content-type": "application/json" }, body: JSON.stringify(command), cache: "no-store" });
  if (!response.ok) throw new Error("Redis request failed"); return (await response.json() as { result: unknown }).result;
};
const secret = () => env("CONTACT_SECURITY_SECRET");
export const digest = (value: string) => crypto.createHmac("sha256", secret()).update(value).digest("hex");
export const otpHash = (id: string, code: string) => digest(`otp:${id}:${code}`);
export const randomId = (bytes = 24) => crypto.randomBytes(bytes).toString("base64url");
export const normalizeIranPhone = (value: string) => { const compact = value.replace(/[\s()-]/g, ""); const normalized = compact.startsWith("+98") ? compact : compact.startsWith("0098") ? `+${compact.slice(2)}` : compact.startsWith("09") ? `+98${compact.slice(1)}` : compact.startsWith("9") ? `+98${compact}` : compact; return /^\+989\d{9}$/.test(normalized) ? normalized : null; };
export const mask = (value: string, method: "email" | "sms") => method === "sms" ? `${value.slice(0, 4)} *** ${value.slice(-4)}` : `${value[0]}••••${value.slice(value.indexOf("@") - 1)}${value.slice(value.indexOf("@"))}`;
export const getState = (key: string) => redis(["GET", key]);
export const setState = (key: string, value: unknown, ttl: number) => redis(["SET", key, JSON.stringify(value), "EX", ttl]);
export const delState = (key: string) => redis(["DEL", key]);
export async function sendSms(phone: string, code: string) {
  const apiKey = env("SMS_API_KEY"); const template = Number(env("SMS_VERIFY_TEMPLATE"));
  if (!apiKey) throw new Error("SMS.ir is not configured");
  let response: Response;
  if (template) {
    response = await fetch("https://api.sms.ir/v1/send/verify", { method: "POST", headers: { "Content-Type": "application/json", "x-api-key": apiKey }, body: JSON.stringify({ Mobile: phone, TemplateId: template, Parameters: [{ Name: "CODE", Value: code }] }) });
  } else {
    const username = env("SMS_USERNAME"); const line = env("SMS_LINE_NUMBER");
    if (!username || !line) throw new Error("SMS.ir generic sender is not configured");
    const query = new URLSearchParams({ username, password: apiKey, mobile: phone, line, text: `کد تأیید اشکان گیوکی: ${code}` });
    response = await fetch(`https://api.sms.ir/v1/send?${query.toString()}`, { headers: { Accept: "text/plain" } });
  }
  if (!response.ok) throw new Error("SMS provider failed");
}
export async function sendEmail() { throw new Error("Email provider is not configured"); }
export async function sendTelegram(message: string) { const token = env("TELEGRAM_BOT_TOKEN"); const chat = env("TELEGRAM_CHAT_ID"); if (!token || !chat) throw new Error("Telegram is not configured"); const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ chat_id: chat, text: message }) }); if (!response.ok) throw new Error("Telegram failed"); }
