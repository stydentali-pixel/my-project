import { AGENTS } from "@/lib/ai/agents";
export default function AgentsPage(){return <section className="section"><h1>الوكلاء</h1><div className="grid">{AGENTS.map(a=><div className="card" key={a.slug}><span className="badge">{a.slug}</span><h2>{a.name}</h2><p>{a.description}</p></div>)}</div></section>}
