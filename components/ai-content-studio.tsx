"use client";

import { useState } from "react";
import { Sparkles, WandSparkles, Копіювати, Check, LoaderCircle } from "lucide-react";
import { createContentDraft } from "@/app/actions";

type Project = { id: string; name: string };
type Draft = { title: string; hook: string; caption: string; hashtags: string[]; call_to_action: string; creative_direction: string };

export function AIContentStudio({ projects }: { projects: Project[] }) {
  const [topic, setTopic] = useState("");
  const [platform, setПлатформа] = useState("instagram");
  const [format, setФормат] = useState("post");
  const [tone, setТон] = useState("впевнений і захопливий");
  const [audience, setАудиторія] = useState("");
  const [goal, setМета] = useState("engagement");
  const [language, setМова] = useState("Англійська");
  const [projectId, setProjectId] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setСкопійовано] = useState(false);

  async function generate() {
    setError("");
    setDraft(null);
    setLoading(true);
    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, platform, format, tone, audience, goal, language }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Не вдалося згенерувати контент.");
      setDraft(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не вдалося згенерувати контент.");
    } finally { setLoading(false); }
  }

  async function copyDraft() {
    if (!draft) return;
    await navigator.clipboard.writeText([draft.hook, draft.caption, draft.hashtags.join(" "), draft.call_to_action].filter(Boolean).join("\n\n"));
    setСкопійовано(true);
    window.setTimeout(() => setСкопійовано(false), 1800);
  }

  return <section className="ai-generator">
    <div className="ai-generator-head"><div className="ai-generator-icon"><WandSparkles size={18}/></div><div><span>AI-ГЕНЕРАТОР КОНТЕНТУ</span><h2>Перетвори ідею на контент</h2><p>Створи контент для обраної платформи з урахуванням аудиторії та мети.</p></div></div>
    <div className="ai-generator-grid">
      <label>Що створюємо?<textarea value={topic} onChange={e=>setTopic(e.target.value)} maxLength={700} rows={3} placeholder="Наприклад, практичний допис про ранкові звички, які справді працюють"/></label>
      <div className="ai-generator-fields">
        <label>Платформа<select value={platform} onChange={e=>setПлатформа(e.target.value)}>{["instagram","tiktok","youtube","facebook","threads","linkedin","x","pinterest"].map(x=><option key={x} value={x}>{x[0].toUpperCase()+x.slice(1)}</option>)}</select></label>
        <label>Формат<select value={format} onChange={e=>setФормат(e.target.value)}>{["post","reel","story","carousel","short","video","image"].map(x=><option key={x} value={x}>{x[0].toUpperCase()+x.slice(1)}</option>)}</select></label>
        <label>Тон<select value={tone} onChange={e=>setТон(e.target.value)}><option>впевнений і захопливий</option><option>експертний та навчальний</option><option>дотепний і грайливий</option><option>сміливий і провокаційний</option><option>теплий і особистий</option><option>мінімалістичний і преміальний</option></select></label>
        <label>Мета<select value={goal} onChange={e=>setМета(e.target.value)}><option value="engagement">Залучення</option><option value="reach">Охоплення та впізнаваність</option><option value="leads">Залучення клієнтів</option><option value="sales">Збільшення продажів</option><option value="authority">Формування експертності</option></select></label>
        <label>Аудиторія<input value={audience} onChange={e=>setАудиторія(e.target.value)} maxLength={240} placeholder="Наприклад, засновники бізнесу та фрилансери"/></label>
        <label>Мова<select value={language} onChange={e=>setМова(e.target.value)}>{["Англійська","Італійська","Російська","Українська","Німецька","Французька","Іспанська"].map(x=><option key={x}>{x}</option>)}</select></label>
      </div>
    </div>
    <button className="ai-generate-button" type="button" onClick={generate} disabled={loading || topic.trim().length<3}>{loading?<LoaderCircle size={16} className="ai-spin"/>:<Sparkles size={16}/>} {loading?"Створюємо чернетку…":"Згенерувати контент"}</button>
    {error && <p className="ai-error">{error}</p>}
    {draft && <div className="ai-result">
      <div className="ai-result-head"><div><span>ТВОЯ ЗГЕНЕРОВАНА ЧЕРНЕТКА</span><h3>{draft.title}</h3></div><button type="button" onClick={copyDraft}>{copied?<Check size={14}/>:<Копіювати size={14}/>} {copied?"Скопійовано":"Копіювати"}</button></div>
      {draft.hook && <div className="ai-result-block"><b>Початковий гачок</b><p>{draft.hook}</p></div>}
      <label className="ai-result-block">Підпис<textarea name="body" form="ai-save-form" defaultValue={[draft.caption,draft.hashtags.join(" ")].filter(Boolean).join("\n\n")} rows={8} maxLength={5000}/></label>
      {draft.call_to_action && <div className="ai-result-block"><b>Заклик до дії</b><p>{draft.call_to_action}</p></div>}
      {draft.creative_direction && <div className="ai-result-block"><b>Творчий напрям</b><p>{draft.creative_direction}</p></div>}
      <form id="ai-save-form" action={createContentDraft} className="ai-save-form">
        <input type="hidden" name="title" value={draft.title}/>
        <input type="hidden" name="platform" value={platform}/>
        <input type="hidden" name="content_type" value={format}/>
        <input type="hidden" name="brand_project_id" value={projectId}/>
        <label>Зберегти до бренд-проєкту<select value={projectId} onChange={e=>setProjectId(e.target.value)}><option value="">Чернетка для всього простору</option>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
        <button type="submit">Зберегти згенеровану чернетку</button>
      </form>
    </div>}
  </section>;
}
