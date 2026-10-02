import dns from "node:dns/promises";
import net from "node:net";

function isPrivateIp(ip) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    return (
      a === 0 || a === 10 || a === 127 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168)
    );
  }
  if (net.isIPv6(ip)) {
    const v = ip.toLowerCase();
    return v === "::1" || v === "::" || v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80");
  }
  return false;
}

export async function checkUrl(rawUrl) {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return { ok: false, error: "That doesn't look like a valid URL. Include http:// or https://" };
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return { ok: false, error: "Only http and https URLs are supported." };
  }

  if (process.env.ALLOW_PRIVATE === "true") {
    return { ok: true, url: parsed };
  }

  try {
    const records = await dns.lookup(parsed.hostname, { all: true });
    if (records.some((r) => isPrivateIp(r.address))) {
      return { ok: false, error: "Requests to private or local addresses are blocked." };
    }
  } catch {
    return { ok: false, error: "Could not find that server. Check the domain name." };
  }

  return { ok: true, url: parsed };
}