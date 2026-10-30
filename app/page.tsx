import Link from "next/link";
import { signOut } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Activity, ArrowRight, ArrowUpRight, BarChart3, Bell,
  CalendarDays, Check, ChevronDown, CircleHelp,
  FileText, Flame, Grid2X2, Instagram, Layers3, MessageCircle, MoreHorizontal,
  Plus, Search, Налаштування2, Sparkles, Target, TrendingUp, Video, Zap,
} from "lucide-react";

const metrics = [
  { label: "Загальне охоплення", value: "128.4K", delta: "+18.6%", up: true, note: "до попередніх 30 днів", icon: Activity },
  { label: "Рівень залучення", value: "6.82%", delta: "+1.24%", up: true, note: "до попередніх 30 днів", icon: TrendingUp },
  { label: "Підписники", value: "24,891", delta: "+8.3%", up: true, note: "чистий приріст аудиторії", icon: Target },
  { label: "Опубліковано", value: "36", delta: "12 у черзі", up: true, note: "цього місяця", icon: FileText },
];

const queue = [
  { time: "Сьогодні · 18:30", type: "Reel", title: "3 details that make an outfit look expensive", account: "@miarossi", state: "Готово", color: "violet" },
  { time: "Завтра · 12:00", type: "Carousel", title: "The Milan edit: places worth saving", account: "@miarossi", state: "На перевірці", color: "blue" },
  { time: "1 лист. · 19:15", type: "Post", title: "A little reminder to romanticise the everyday", account: "@personal.brand", state: "Чернетка", color: "orange" },
];

const nav = [
  { title: "РОБОЧИЙ ПРОСТІР", items: [{ label: "Огляд", icon: Grid2X2, active: true }, { label: "AI-стратег", icon: Sparkles, badge: "AI" }, { label: "Студія контенту", icon: Video }, { label: "Планувальник", icon: CalendarDays }, { label: "Аналітика", icon: BarChart3 }, { label: "Вхідні", icon: MessageCircle, count: "4" }] },
  { title: "КЕРУВАННЯ", items: [{ label: "Бренд-проєкти", icon: Layers3 }, { label: "Соцмережі", icon: Instagram }, { label: "Автоматизації", icon: Zap }] },
];

function Sidebar({ userName, workspaceName }: { userName: string; workspaceName: string }) {
  return <aside className="sidebar">
    <div className="brand"><div className="brand-mark"><Sparkles size={19}/></div><span>socialpilot<span className="brand-ai">.ai</span></span></div>
    <button className="workspace-switch"><div className="workspace-avatar">S</div><span><b>{workspaceName}</b><small>Безкоштовний план</small></span><ChevronDown size={15}/></button>
    <div className="side-scroll">{nav.map(group => <div className="nav-group" key={group.title}><p className="nav-label">{group.title}</p>{group.items.map(item => <a className={`nav-item ${item.active ? "active" : ""}`} href={item.label === "Огляд" ? "/" : item.label === "Бренд-проєкти" ? "/projects" : item.label === "Соцмережі" ? "/accounts" : item.label === "Студія контенту" ? "/studio" : "#"} key={item.label}><item.icon size={17}/><span>{item.label}</span>{item.badge && <em>{item.badge}</em>}{item.count && <small>{item.count}</small>}</a>)}</div>)}</div>
    <div className="sidebar-bottom"><div className="upgrade-card"><div className="upgrade-icon"><Flame size={16}/></div><b>Твоє зростання — на автопілоті.</b><p>Дозволь AI знайти твій наступний крок.</p><button>Увімкнути AI-автопілот <ArrowRight size={14}/></button></div><a className="nav-item" href="#"><Налаштування2 size={17}/>Налаштування</a><a className="nav-item" href="#"><CircleHelp size={17}/>Центр допомоги</a><div className="user-profile"><div className="user-avatar">{userName.slice(0, 1).toUpperCase()}</div><span><b>{userName}</b><small>Учасник простору</small></span><form action={signOut}><button className="signout-button" type="submit" aria-label="Вийти">Вийти</button></form></div></div>
  </aside>;
}

function Header() {
  return <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <b>Огляд</b></div><div className="top-actions"><div className="search-box"><Search size={15}/><span>Пошук...</span><kbd>⌘ K</kbd></div><button className="icon-button"><Bell size={17}/><i/></button><div className="top-avatar">D</div></div></header>;
}

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const [{ data: profile }, { data: membership }] = await Promise.all([
    supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle(),
    supabase.from("workspace_members").select("workspace_id").eq("user_id", user.id).limit(1).maybeSingle(),
  ]);
  const { data: workspace } = membership?.workspace_id
    ? await supabase.from("workspaces").select("name").eq("id", membership.workspace_id).maybeSingle()
    : { data: null };
  const userName = profile?.display_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Creator";
  const workspaceName = workspace?.name || "My workspace";
  const { data: connectedAccounts } = membership?.workspace_id
    ? await supabase.from("social_accounts").select("id,platform,username,display_name,connection_status").eq("workspace_id", membership.workspace_id).order("created_at", { ascending: false })
    : { data: [] };
  return <div className="app-shell"><Sidebar userName={userName} workspaceName={workspaceName}/><main className="main-area"><Header/><div className="page-content">
    <section className="welcome-row"><div><div className="eyebrow"><span className="live-dot"/> ЦЕНТР ТВОГО ЗРОСТАННЯ</div><h1>Добрий вечір, {userName} <span>✳</span></h1><p className="subtitle">Ось що відбувається у твоїх соціальних мережах.</p></div><div className="welcome-actions"><button className="secondary-button"><CalendarDays size={15}/> Останні 30 днів <ChevronDown size={14}/></button><Link className="primary-button" href="/studio"><Plus size={16}/> Створити контент</Link></div></section>
    <section className="insight-banner"><div className="insight-symbol"><Sparkles size={20}/></div><div className="insight-copy"><span>AI GROWTH КЕРУВАННЯR · SAMPLE INSIGHT</span><b>Цього місяця твої Reels працюють у 2,4 раза краще за звичайні дописи.</b><p>Зосередься на коротких відео. Найбільше аудиторія активна з 18:00 до 20:00.</p></div><button className="insight-link">Переглянути рекомендації <ArrowRight size={15}/></button></section>
    <section className="section-heading"><div><h2>Показники ефективності</h2><p>Приклад даних — підключи акаунти, щоб бачити реальну статистику</p></div><button className="text-button">Уся аналітика <ArrowRight size={14}/></button></section>
    <section className="metrics-grid">{metrics.map((metric) => <article className="metric-card" key={metric.label}><div className="metric-top"><span>{metric.label}</span><metric.icon size={17}/></div><div className="metric-value">{metric.value}</div><div className="metric-foot"><span className="metric-delta"><ArrowUpRight size={13}/>{metric.delta}</span><span>{metric.note}</span></div></article>)}</section>
    <div className="dashboard-grid"><section className="panel performance-panel"><div className="panel-heading"><div><h2>Зростання аудиторії</h2><p>Підписники across all connected accounts</p></div><button className="more-button"><MoreHorizontal size={19}/></button></div><div className="chart-legend"><span><i className="legend-dot purple"/> Total followers</span><span className="chart-total">24,891 <small>+8.3%</small></span></div><div className="chart-wrap"><div className="chart-y"><span>26k</span><span>24k</span><span>22k</span><span>20k</span><span>18k</span></div><svg viewBox="0 0 640 190" preserveAspectRatio="none" className="growth-chart" role="img" aria-label="Зростання аудиторії trend rising over the last 30 days"><defs><linearGradient id="areaFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#9b87f5" stopOpacity=".22"/><stop offset="100%" stopColor="#9b87f5" stopOpacity="0"/></linearGradient></defs>{[20,60,100,140,180].map(y=><line key={y} x1="0" x2="640" y1={y} y2={y} stroke="#eeeef2" strokeDasharray="4 5"/>)}<path d="M0 157 C35 150 42 145 68 148 S112 133 137 137 S177 119 205 128 S246 112 275 115 S315 99 342 105 S378 88 410 94 S452 75 478 80 S519 59 548 66 S591 43 640 26 L640 190 L0 190Z" fill="url(#areaFill)"/><path d="M0 157 C35 150 42 145 68 148 S112 133 137 137 S177 119 205 128 S246 112 275 115 S315 99 342 105 S378 88 410 94 S452 75 478 80 S519 59 548 66 S591 43 640 26" fill="none" stroke="#8e78ed" strokeWidth="3" strokeLinecap="round"/></svg></div><div className="chart-x"><span>Oct 01</span><span>Oct 06</span><span>Oct 11</span><span>Oct 16</span><span>Oct 21</span><span>Oct 26</span><span>Oct 30</span></div></section>
    <section className="panel channels-panel"><div className="panel-heading"><div><h2>Підключені канали</h2><p>Активні підключення у твоєму просторі</p></div><Link className="add-channel" href="/accounts"><Plus size={14}/> Add</Link></div>{connectedAccounts?.length ? connectedAccounts.map((account) => <div className="channel-row" key={account.id}><div className={`channel-icon ${account.platform}`}>{account.platform === "instagram" ? <Instagram size={17}/> : <Video size={17}/>}</div><div className="channel-info"><b>{account.display_name || account.platform}</b><span>{account.username ? `@${account.username}` : account.platform}</span></div><span className={`connected ${account.connection_status}`}><i/>{account.connection_status}</span></div>) : <div className="channel-empty"><span>Ще не підключено жодного акаунта.</span><Link href="/accounts">Підключити Instagram <ArrowRight size={13}/></Link></div>}<Link className="connect-more" href="/accounts"><Plus size={15}/> Керувати соцмережами</Link></section></div>
    <section className="panel queue-panel"><div className="panel-heading"><div><h2>Найближчі публікації</h2><p>Увесь запланований контент в одному місці</p></div><button className="text-button">Відкрити планувальник <ArrowRight size={14}/></button></div><div className="queue-list">{queue.map((item)=><div className="queue-item" key={item.title}><div className={`content-thumb thumb-${item.color}`}>{item.type === "Reel" ? <Video size={19}/> : item.type === "Carousel" ? <Layers3 size={19}/> : <FileText size={19}/>}</div><div className="queue-main"><div className="queue-meta"><span>{item.time}</span><i>·</i><span>{item.type}</span></div><b>{item.title}</b><small>{item.account}</small></div><span className={`status status-${item.state.toLowerCase().replace(" ","-")}`}>{item.state === "Готово" && <Check size={12} />}{item.state}</span><button className="more-button"><MoreHorizontal size={18}/></button></div>)}</div></section>
    <footer className="footer"><span>SocialPilot AI <span>·</span> Створено для тих, хто прагне більшого</span><span><span className="footer-live"/> Усі системи працюють</span></footer>
  </div></main></div>;
}
