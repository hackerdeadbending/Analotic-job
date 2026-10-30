import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const platforms = ["instagram", "tiktok", "youtube", "facebook", "threads", "linkedin", "x", "pinterest"];
const formats = ["post", "reel", "story", "carousel", "short", "video", "image"];
const MODEL = "@cf/meta/llama-3.1-8b-instruct-fast";

type AiBinding = {
  run: (
    model: string,
    input: {
      messages: { role: "system" | "user"; content: string }[];
      temperature?: number;
      max_tokens?: number;
      response_format?: { type: "json_object" };
    },
  ) => Promise<{ response?: string }>;
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const { data: membership } = await supabase.from("workspace_members")
    .select("workspace_id").eq("user_id", user.id).limit(1).maybeSingle();
  if (!membership?.workspace_id) {
    return NextResponse.json({ error: "No workspace found for this account." }, { status: 403 });
  }

  let input: {
    topic?: string;
    platform?: string;
    format?: string;
    tone?: string;
    audience?: string;
    goal?: string;
    language?: string;
  };
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

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
    "Topic: " + topic,
    "Platform: " + platform,
    "Format: " + format,
    "Tone: " + tone,
    "Target audience: " + (audience || "not specified"),
    "Goal: " + goal,
    "Language: " + language,
    "For carousel, include slide-by-slide copy in caption. For video/reel/short, include a concise spoken hook and beat-by-beat outline.",
  ].join("\n");

  try {
    const { env } = getCloudflareContext();
    const ai = (env as typeof env & { AI: AiBinding }).AI;
    const result = await ai.run(MODEL, {
      messages: [
        { role: "system", content: "You create excellent, platform-native social content. Return valid JSON only." },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
      max_tokens: 900,
      response_format: { type: "json_object" },
    });

    if (!result.response) throw new Error("Empty AI response");
    const parsed = JSON.parse(result.response) as {
      title?: unknown;
      hook?: unknown;
      caption?: unknown;
      hashtags?: unknown;
      call_to_action?: unknown;
      creative_direction?: unknown;
    };

    return NextResponse.json({
      title: String(parsed.title ?? topic).slice(0, 160),
      hook: String(parsed.hook ?? "").slice(0, 500),
      caption: String(parsed.caption ?? "").slice(0, 5000),
      hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags.map((tag: unknown) => String(tag)).slice(0, 20) : [],
      call_to_action: String(parsed.call_to_action ?? "").slice(0, 500),
      creative_direction: String(parsed.creative_direction ?? "").slice(0, 1000),
    });
  } catch (error) {
    console.error("Cloudflare Workers AI generation failed", error);
    return NextResponse.json(
      { error: "AI is temporarily unavailable or its daily free allowance has been reached. Please try again later." },
      { status: 502 },
    );
  }
}
