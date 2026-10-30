"use client";

import { useState } from "react";
import { Sparkles, WandSparkles, Copy, Check, LoaderCircle } from "lucide-react";
import { createContentDraft } from "@/app/actions";

type Project = { id: string; name: string };
type Draft = { title: string; hook: string; caption: string; hashtags: string[]; call_to_action: string; creative_direction: string };

export function AIContentStudio({ projects }: { projects: Project[] }) {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [format, setFormat] = useState("post");
  const [tone, setTone] = useState("confident and engaging");
  const [audience, setAudience] = useState("");
  const [goal, setGoal] = useState("engagement");
  const [language, setLanguage] = useState("English");
  const [projectId, setProjectId] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

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
      if (!response.ok) throw new Error(data.error || "Generation failed.");
      setDraft(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed.");
    } finally { setLoading(false); }
  }

  async function copyDraft() {
    if (!draft) return;
    await navigator.clipboard.writeText([draft.hook, draft.caption, draft.hashtags.join(" "), draft.call_to_action].filter(Boolean).join("\n\n"));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return <section className="ai-generator">
    <div className="ai-generator-head"><div className="ai-generator-icon"><WandSparkles size={18}/></div><div><span>AI CONTENT GENERATOR</span><h2>Turn an idea into content</h2><p>Generate a platform-native draft shaped around your audience and goal.</p></div></div>
    <div className="ai-generator-grid">
      <label>What should we create?<textarea value={topic} onChange={e=>setTopic(e.target.value)} maxLength={700} rows={3} placeholder="e.g. A practical post about building a morning routine that actually lasts"/></label>
      <div className="ai-generator-fields">
        <label>Platform<select value={platform} onChange={e=>setPlatform(e.target.value)}>{["instagram","tiktok","youtube","facebook","threads","linkedin","x","pinterest"].map(x=><option key={x} value={x}>{x[0].toUpperCase()+x.slice(1)}</option>)}</select></label>
        <label>Format<select value={format} onChange={e=>setFormat(e.target.value)}>{["post","reel","story","carousel","short","video","image"].map(x=><option key={x} value={x}>{x[0].toUpperCase()+x.slice(1)}</option>)}</select></label>
        <label>Tone<select value={tone} onChange={e=>setTone(e.target.value)}><option>confident and engaging</option><option>expert and educational</option><option>witty and playful</option><option>bold and provocative</option><option>warm and personal</option><option>minimal and premium</option></select></label>
        <label>Goal<select value={goal} onChange={e=>setGoal(e.target.value)}><option value="engagement">Engagement</option><option value="reach">Reach and discovery</option><option value="leads">Generate leads</option><option value="sales">Drive sales</option><option value="authority">Build authority</option></select></label>
        <label>Audience<input value={audience} onChange={e=>setAudience(e.target.value)} maxLength={240} placeholder="e.g. founders and freelancers"/></label>
        <label>Language<select value={language} onChange={e=>setLanguage(e.target.value)}>{["English","Italian","Russian","Ukrainian","German","French","Spanish"].map(x=><option key={x}>{x}</option>)}</select></label>
      </div>
    </div>
    <button className="ai-generate-button" type="button" onClick={generate} disabled={loading || topic.trim().length<3}>{loading?<LoaderCircle size={16} className="ai-spin"/>:<Sparkles size={16}/>} {loading?"Creating your draft…":"Generate content"}</button>
    {error && <p className="ai-error">{error}</p>}
    {draft && <div className="ai-result">
      <div className="ai-result-head"><div><span>YOUR GENERATED DRAFT</span><h3>{draft.title}</h3></div><button type="button" onClick={copyDraft}>{copied?<Check size={14}/>:<Copy size={14}/>} {copied?"Copied":"Copy"}</button></div>
      {draft.hook && <div className="ai-result-block"><b>Opening hook</b><p>{draft.hook}</p></div>}
      <label className="ai-result-block">Caption<textarea name="body" form="ai-save-form" defaultValue={[draft.caption,draft.hashtags.join(" ")].filter(Boolean).join("\n\n")} rows={8} maxLength={5000}/></label>
      {draft.call_to_action && <div className="ai-result-block"><b>Call to action</b><p>{draft.call_to_action}</p></div>}
      {draft.creative_direction && <div className="ai-result-block"><b>Creative direction</b><p>{draft.creative_direction}</p></div>}
      <form id="ai-save-form" action={createContentDraft} className="ai-save-form">
        <input type="hidden" name="title" value={draft.title}/>
        <input type="hidden" name="platform" value={platform}/>
        <input type="hidden" name="content_type" value={format}/>
        <input type="hidden" name="brand_project_id" value={projectId}/>
        <label>Save to brand project<select value={projectId} onChange={e=>setProjectId(e.target.value)}><option value="">Workspace-wide draft</option>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
        <button type="submit">Save generated draft</button>
      </form>
    </div>}
  </section>;
}
