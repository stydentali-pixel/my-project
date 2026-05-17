import { AGENTS } from "../src/lib/ai/agents";
import { DATAFLOW_PIPELINES } from "../src/lib/dataflow/pipelines";

async function main() {
  const mod = await import("@prisma/client") as any;
  const prisma = new mod.PrismaClient();
  try {
  for (const agent of AGENTS) {
    await prisma.agent.upsert({
      where: { slug: agent.slug },
      update: {
        name: agent.name,
        description: agent.description,
        systemPrompt: agent.systemPrompt,
        enabled: true
      },
      create: {
        slug: agent.slug,
        name: agent.name,
        description: agent.description,
        systemPrompt: agent.systemPrompt,
        enabled: true
      }
    });
  }


  for (const pipeline of DATAFLOW_PIPELINES) {
    await prisma.dataFlowPipeline.upsert({
      where: { slug: pipeline.slug },
      update: { name: pipeline.name, description: pipeline.description, enabled: true },
      create: { slug: pipeline.slug, name: pipeline.name, description: pipeline.description, enabled: true }
    });
  }

  const providers = [
    { slug: "openrouter", name: "OpenRouter", model: process.env.OPENROUTER_MODEL || "openrouter/free", priority: 10 },
    { slug: "gemini", name: "Google Gemini", model: process.env.GEMINI_MODEL || "gemini-1.5-flash", priority: 20 },
    { slug: "groq", name: "Groq", model: process.env.GROQ_MODEL || "llama-3.1-8b-instant", priority: 30 },
    { slug: "huggingface", name: "Hugging Face", model: process.env.HF_MODEL || "", priority: 40 },
    { slug: "pollinations", name: "Pollinations", model: process.env.POLLINATIONS_TEXT_MODEL || "openai", priority: 50 },
    { slug: "openai", name: "OpenAI", model: process.env.OPENAI_MODEL || "gpt-4o-mini", priority: 90 }
  ];

  for (const p of providers) {
    await prisma.provider.upsert({
      where: { slug: p.slug },
      update: p,
      create: p
    });
  }
} finally {
    await prisma.$disconnect();
  }
}

main();
