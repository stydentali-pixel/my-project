type PrismaLike = { $disconnect: () => Promise<void> } & Record<string, unknown>;

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaLike | undefined;
}

export async function getPrisma() {
  if (!process.env.DATABASE_URL) return null;
  if (globalThis.prisma) return globalThis.prisma;
  const mod = await import("@prisma/client") as unknown as { PrismaClient?: new (options?: unknown) => PrismaLike };
  if (!mod.PrismaClient) throw new Error("PrismaClient is not generated. Run: npx prisma generate");
  const client = new mod.PrismaClient({ log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"] });
  if (process.env.NODE_ENV !== "production") globalThis.prisma = client;
  return client;
}

export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}
