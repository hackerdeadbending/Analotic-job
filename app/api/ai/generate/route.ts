import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const platforms = ["instagram","tiktok","youtube","facebook","threads","linkedin","x","pinterest"];
const formats = ["post","reel","story","carousel","short","video","image"];

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const { data: membership } = await supabase.from("workspace_members")
    .select("workspace_id").eq("user_id", user.id).limit(1).maybeSingle();
  if (!membership?.workspace_id) return NextResponse.json({ error: "No workspace found for this account." }, { status: 403 });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "AI is not configured yet. Add OPENAI_API_KEY to the Cloudflare Worker secrets." }, { status: 503 });

  let input: { topic?: string; platform?: string; format?: string; tone?: string; audience?: string; goal?: string; language?: string };
  try { input = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const topic = String(input.topic ?? "").trim().slice(0, 700);
  const platform = String(input.platform ?? "instagram");
  const format = String(input.format ?? "post");
  const tone = String(input.tone ?? "confident and engaging").slice(0, 100);
  const audience = String(input.audience ?? "").slice(0, 240);
  const goal = String(input.goal ?? "engagement").slice(0, 120);
  const language = String(input.language ?? "English").slice(0, 50);
  if (topic.length < 3 || !platforms.includes(platform) || !formats.includes(format)) {
    return NextResponse.json({ error: "Add a topic and choose a valid platform and format." }, { status: 400 });
  }

  const prompt = [
    "You are a senior social media strategist and conversion-focused copywriter.",
    "Create one original, useful social media content draft. Do not invent facts, statistics, testimonials, or claims.",
    "Return valid JSON only with keys: title, hook, caption, hashtags (array of strings), call_to_action, creative_direction.",
    "Make the result native to the selected platform and format. Avoid generic filler and overused clichés.",
    "Topic: " + topic, "Platform: " + platform, "Format: " + format, "Tone: " + tone,
    "Target audience: " + (audience || "not specified"), "Goal: " + goal, "Language: " + language,
    "For carousel, include slide-by-slide copy in caption. For video/reel/short, include a concise spoken hook and beat-by-beat outline.",
  ].join("\n");

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        temperature: 0.8,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You create excellent, platform-native social content. Return JSON only." },
          { role: "user", content: prompt },
        ],
      }),
    });
    if (!response.ok) {
      const details = await response.text();
      console.error("OpenAI generation failed", response.status, details.slice(0, 500));
      return NextResponse.json({ error: response.status === 429 ? "AI rate limit reached. Try again shortly." : "AI generation failed. Check the AI provider configuration." }, { status: 502 });
    }
    const result = await response.json() as { choices?: { message?: { content?: string } }[] };
    const raw = result.choices?.[0]?.message?.content;
    if (!raw) throw new Error("Empty AI response");
    const parsed = JSON.parse(raw);
    return NextResponse.json({
      title: String(parsed.title ?? topic).slice(0, 160),
      hook: String(parsed.hook ?? ""),
      caption: String(parsed.caption ?? "").slice(0, 5000),
      hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags.map((tag: unknown) => String(tag)).slice(0, 20) : [],
      call_to_action: String(parsed.call_to_action ?? ""),
      creative_direction: String(parsed.creative_direction ?? ""),
    });
  } catch (error) {
    console.error("Content generation error", error);
    return NextResponse.json({ error: "Couldn't generate content right now. Please try again." }, { status: 500 });
  }
}
