import { debug } from "debug";
const log = debug("app:api:chat:validate-api-key-with-cache");

const cache = new Map<
  string,
  {
    isValid: boolean;
    timestamp: number;
  }
>();

const CACHE_TTL = 5 * 60 * 1000;

export async function validateApiKeyWithCache({ apiKey }: { apiKey: string }) {
  const cached = cache.get(apiKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TTL) return cached.isValid;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/credits", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    const isValid = response.ok;

    cache.set(apiKey, {
      isValid,
      timestamp: now,
    });
    return isValid;
  } catch (e) {
    log("Error validating API Key:", e);
    return false;
  }
}
