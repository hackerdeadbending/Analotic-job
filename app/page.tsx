import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, BarChart3, Bell,
  CalendarDays, Check, ChevronDown, CircleHelp, Clock3, Command, Compass,
  FileText, Flame, Grid2X2, Instagram, Layers3, MessageCircle, MoreHorizontal,
  Plus, Search, Settings2, Sparkles, Target, TrendingUp, Video, Zap,
} from "lucide-react";

const metrics = [
  { label: "Total reach", value: "128.4K", delta: "+18.6%", up: true, note: "vs. last 30 days", icon: Activity },
  { label: "Engagement rate", value: "6.82%", delta: "+1.24%", up: true, note: "vs. last 30 days", icon: TrendingUp },
  { label: "Followers", value: "24,891", delta: "+8.3%", up: true, note: "net audience growth", icon: Target },
  { label: "Published", value: "36", delta: "12 queued", up: true, note: "this month", icon: FileText },
];

const queue = [
  { time: "Today · 18:30", type: "Reel", title: "3 details that make an outfit look expensive", account: "@miarossi", state: "Ready", color: "violet" },
  { time: "Tomorrow · 12:00", type: "Carousel", title: "The Milan edit: places worth saving", account: "@miarossi", state: "In review", color: "blue" },
  { time: "Nov 01 · 19:15", type: "Post", title: "A little reminder to romanticise the everyday", account: "@personal.brand", state: "Draft", color: "orange" },
];

const nav = [
  { title: "WORKSPACE", items: [{ label: "Overview", icon: Grid2X2, active: true }, { label: "AI strategist", icon: Sparkles, badge: "AI" }, { label: "Content studio", icon: Video }, { label: "Planner", icon: CalendarDays }, { label: "Analytics", icon: BarChart3 }, { label: "Inbox", icon: MessageCircle, count: "4" }] },
  { title: "MANAGE", items: [{ label: "Brand projects", icon: Layers3 }, { label: "Social accounts", icon: Instagram }, { label: "Automations", icon: Zap }] },
];

function Sidebar() {
  return <aside className="sidebar">
    <div className="brand"><div className="brand-mark"><Sparkles size={19}/></div><span>socialpilot<span className="brand-ai">.ai</span></span></div>
    <button className="workspace-switch"><div className="workspace-avatar">S</div><span><b>Studio workspace</b><small>Free plan</small></span><ChevronDown size={15}/></button>
    <div className="side-scroll">{nav.map(group => <div className="nav-group" key={group.title}><p className="nav-label">{group.title}</p>{group.items.map(item => <a className={`nav-item ${item.active ? "active" : ""}`} href="#" key={item.label}><item.icon size={17}/><span>{item.label}</span>{item.badge && <em>{item.badge}</em>}{item.count && <small>{item.count}</small>}</a>)}</div>)}</div>
    <div className="sidebar-bottom"><div className="upgrade-card"><div className="upgrade-icon"><Flame size={16}/></div><b>Your growth, on autopilot.</b><p>Let AI find your next best move.</p><button>Explore AI autopilot <ArrowRight size={14}/></button></div><a className="nav-item" href="#"><Settings2 size={17}/>Settings</a><a className="nav-item" href="#"><CircleHelp size={17}/>Help center</a><div className="user-profile"><div className="user-avatar">D</div><span><b>David</b><small>Workspace owner</small></span><MoreHorizontal size={18}/></div></div>
  </aside>;
}

function Header() {
  return <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <b>Overview</b></div><div className="top-actions"><div className="search-box"><Search size={15}/><span>Search anything...</span><kbd>⌘ K</kbd></div><button className="icon-button"><Bell size={17}/><i/></button><div className="top-avatar">D</div></div></header>;
}

export default function Home() {
  return <div className="app-shell"><Sidebar/><main className="main-area"><Header/><div className="page-content">
    <section className="welcome-row"><div><div className="eyebrow"><span className="live-dot"/> YOUR GROWTH HQ</div><h1>Good evening, David <span>✳</span></h1><p className="subtitle">Here’s what’s happening across your social universe.</p></div><div className="welcome-actions"><button className="secondary-button"><CalendarDays size={15}/> Last 30 days <ChevronDown size={14}/></button><button className="primary-button"><Plus size={16}/> Create content</button></div></section>
    <section className="insight-banner"><div className="insight-symbol"><Sparkles size={20}/></div><div className="insight-copy"><span>YOUR AI GROWTH MANAGER · DAILY BRIEFING</span><b>Your Reels are outperforming static posts by 2.4× this month.</b><p>Double down on short-form video. Your audience is most active between 18:00–20:00.</p></div><button className="insight-link">See recommendations <ArrowRight size={15}/></button></section>
    <section className="section-heading"><div><h2>Performance snapshot</h2><p>Your combined results across connected channels</p></div><button className="text-button">Full analytics <ArrowRight size={14}/></button></section>
    <section className="metrics-grid">{metrics.map((metric) => <article className="metric-card" key={metric.label}><div className="metric-top"><span>{metric.label}</span><metric.icon size={17}/></div><div className="metric-value">{metric.value}</div><div className="metric-foot"><span className="metric-delta"><ArrowUpRight size={13}/>{metric.delta}</span><span>{metric.note}</span></div></article>)}</section>
    <div className="dashboard-grid"><section className="panel performance-panel"><div className="panel-heading"><div><h2>Audience growth</h2><p>Followers across all connected accounts</p></div><button className="more-button"><MoreHorizontal size={19}/></button></div><div className="chart-legend"><span><i className="legend-dot purple"/> Total followers</span><span className="chart-total">24,891 <small>+8.3%</small></span></div><div className="chart-wrap"><div className="chart-y"><span>26k</span><span>24k</span><span>22k</span><span>20k</span><span>18k</span></div><svg viewBox="0 0 640 190" preserveAspectRatio="none" className="growth-chart" role="img" aria-label="Audience growth trend rising over the last 30 days"><defs><linearGradient id="areaFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#9b87f5" stopOpacity=".22"/><stop offset="100%" stopColor="#9b87f5" stopOpacity="0"/></linearGradient></defs>{[20,60,100,140,180].map(y=><line key={y} x1="0" x2="640" y1={y} y2={y} stroke="#eeeef2" strokeDasharray="4 5"/>)}<path d="M0 157 C35 150 42 145 68 148 S112 133 137 137 S177 119 205 128 S246 112 275 115 S315 99 342 105 S378 88 410 94 S452 75 478 80 S519 59 548 66 S591 43 640 26 L640 190 L0 190Z" fill="url(#areaFill)"/><path d="M0 157 C35 150 42 145 68 148 S112 133 137 137 S177 119 205 128 S246 112 275 115 S315 99 342 105 S378 88 410 94 S452 75 478 80 S519 59 548 66 S591 43 640 26" fill="none" stroke="#8e78ed" strokeWidth="3" strokeLinecap="round"/></svg></div><div className="chart-x"><span>Oct 01</span><span>Oct 06</span><span>Oct 11</span><span>Oct 16</span><span>Oct 21</span><span>Oct 26</span><span>Oct 30</span></div></section>
    <section className="panel channels-panel"><div className="panel-heading"><div><h2>Connected channels</h2><p>Your social presence</p></div><button className="add-channel"><Plus size={14}/> Add</button></div><div className="channel-row"><div className="channel-icon instagram"><Instagram size={17}/></div><div className="channel-info"><b>Instagram</b><span>@miarossi</span></div><span className="connected"><i/>Connected</span></div><div className="channel-row"><div className="channel-icon youtube"><Video size={17}/></div><div className="channel-info"><b>YouTube</b><span>Personal channel</span></div><span className="connected"><i/>Connected</span></div><button className="connect-more"><Plus size={15}/> Connect another channel</button></section></div>
    <section className="panel queue-panel"><div className="panel-heading"><div><h2>Up next</h2><p>Your upcoming content, all in one place</p></div><button className="text-button">Open planner <ArrowRight size={14}/></button></div><div className="queue-list">{queue.map((item,i)=><div className="queue-item" key={item.title}><div className={`content-thumb thumb-${item.color}`}>{item.type === "Reel" ? <Video size={19}/> : item.type === "Carousel" ? <Layers3 size={19}/> : <FileText size={19}/>}</div><div className="queue-main"><div className="queue-meta"><span>{item.time}</span><i>·</i><span>{item.type}</span></div><b>{item.title}</b><small>{item.account}</small></div><span className={`status status-${item.state.toLowerCase().replace(" ","-")}`}>{item.state === "Ready" && <Check size={12} />}{item.state}</span><button className="more-button"><MoreHorizontal size={18}/></button></div>)}</div></section>
    <footer className="footer"><span>SocialPilot AI <span>·</span> Built for ambitious creators</span><span><span className="footer-live"/> All systems operational</span></footer>
  </div></main></div>;
}
