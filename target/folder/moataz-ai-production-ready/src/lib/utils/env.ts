export function env(name: string, fallback = "") {
  return process.env[name] || fallback;
}

export function boolEnv(name: string, fallback = false) {
  const value = process.env[name];
  if (!value) return fallback;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

export function splitIds(value = "") {
  return value.split(",").map((x) => x.trim()).filter(Boolean);
}

export function publicBaseUrl() {
  return process.env.PUBLIC_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}
