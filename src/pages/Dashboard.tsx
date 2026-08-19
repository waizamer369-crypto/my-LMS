import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  LayoutDashboard,
  BookOpen,
  TrendingUp,
  Award,
  MessageSquare,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  ChevronLeft,
  Play,
  Sunrise,
  Users,
  Flame,
  Trophy,
  GraduationCap,
} from "lucide-react";
import { trpc } from "../lib/trpc";
import { useAuth } from "../lib/useAuth";
import logo from "@/lms-site/assets/logo.png";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: BookOpen, label: "My Courses" },
  { icon: TrendingUp, label: "Progress" },
  { icon: Award, label: "Achievements" },
  { icon: MessageSquare, label: "Messages" },
  { icon: Settings, label: "Settings" },
];

const courses = [
  {
    title: "Tailoring & Stitching Basics",
    meta: "Lesson 7 of 10 · Mentor: Rukhsana Bibi",
    progress: 68,
    tag: "68% done",
    progressText: "68% complete",
  },
  {
    title: "Digital Literacy for Beginners",
    meta: "Lesson 3 of 8 · Mentor: Bilal Ahmed",
    progress: 32,
    tag: "32% done",
    progressText: "32% complete",
  },
  {
    title: "Spoken English Essentials",
    meta: "Lesson 1 of 12 · Mentor: Sana Malik",
    progress: 6,
    tag: "New",
    progressText: "Just started",
  },
];

const badges = [
  { icon: Sunrise, bg: "bg-gradient-to-br from-voe-gold to-voe-gold-deep", stroke: "#101B4A", title: "First Steps", desc: "Completed 1st course", locked: false },
  { icon: Users, bg: "bg-voe-navy", stroke: "#fff", title: "Community Helper", desc: "Referred 3 learners", locked: false },
  { icon: Flame, bg: "bg-gradient-to-br from-[#5FCB98] to-[#3FAE7C]", stroke: "#fff", title: "7-Day Streak", desc: "Learned all week", locked: false },
  { icon: Trophy, bg: "bg-gradient-to-br from-voe-sky to-voe-sky-deep", stroke: "#101B4A", title: "Skill Master", desc: "Complete 10 courses", locked: true },
  { icon: GraduationCap, bg: "bg-voe-navy", stroke: "#fff", title: "Mentor Track", desc: "Teach your first class", locked: true },
];

function initials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const utils = trpc.useUtils();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [videoTitle, setVideoTitle] = useState<string | null>(null);

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      toast.success("Signed out");
      navigate("/login");
    },
  });

  const firstName = user?.name?.split(" ")[0] ?? "";

  return (
    <div className="min-h-screen flex bg-voe-cream font-sans text-voe-navy-deep">
      <style>{`
        @keyframes voe-pulse-glow-sm{
          0%,100%{ box-shadow:0 0 18px 0px rgba(253,185,19,0.4); }
          50%{ box-shadow:0 0 30px 8px rgba(253,185,19,0.55); }
        }
        .voe-w-sun{ animation: voe-pulse-glow-sm 3.5s ease-in-out infinite; }
        .voe-fade-up{ animation: voe-fadeup .5s cubic-bezier(.2,.8,.2,1) both; }
        @keyframes voe-fadeup{ from{opacity:0; transform:translateY(16px);} to{opacity:1; transform:translateY(0);} }
      `}</style>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-voe-navy-deep/50 z-[55] md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          bg-voe-navy-deep text-white flex flex-col py-6 relative z-[60]
          transition-all duration-300 ease-out flex-shrink-0
          ${collapsed ? "md:w-[84px] md:px-3.5" : "md:w-[250px] md:px-5"}
          fixed md:sticky top-0 h-screen
          ${mobileOpen ? "translate-x-0 w-[250px] px-5" : "-translate-x-full md:translate-x-0 w-[250px] px-5"}
        `}
      >
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="hidden md:flex absolute top-6 -right-3.5 w-7 h-7 rounded-full bg-voe-gold border-[3px] border-voe-cream items-center justify-center text-voe-navy-deep shadow-md transition-transform"
          style={{ transform: collapsed ? "rotate(180deg)" : "none" }}
          aria-label="Collapse sidebar"
        >
          <ChevronLeft size={13} strokeWidth={3} />
        </button>

        <div className="flex items-center gap-2.5 mb-10 px-1.5">
          <img src={logo} alt="Voice of Eden Pakistan" className="h-8 flex-shrink-0" />
          {!collapsed && (
            <span className="font-display font-semibold text-sm leading-tight whitespace-nowrap">
              Voice of Eden<br />Pakistan
            </span>
          )}
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(({ icon: Icon, label, active }) => (
            <a
              key={label}
              href="#"
              className={`
                flex items-center gap-3 px-3.5 py-3 rounded-xl font-semibold text-sm whitespace-nowrap transition-colors
                ${active ? "bg-gradient-to-br from-voe-gold to-voe-gold-deep text-voe-navy-deep" : "text-voe-sky hover:bg-white/10 hover:text-white"}
                ${collapsed ? "md:justify-center md:px-0" : ""}
              `}
            >
              <Icon size={19} className="flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </a>
          ))}
        </nav>

        <div className="border-t border-white/10 pt-4 mt-4">
          <button
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-semibold text-sm text-voe-sky hover:bg-white/10 hover:text-white transition-colors w-full ${collapsed ? "md:justify-center md:px-0" : ""}`}
          >
            <LogOut size={19} className="flex-shrink-0" />
            {!collapsed && <span>Log Out</span>}
          </button>
          <div className={`flex items-center gap-2.5 px-1.5 pt-2 ${collapsed ? "md:justify-center" : ""}`}>
            <div className="w-[38px] h-[38px] rounded-full bg-gradient-to-br from-voe-sky to-voe-sky-deep flex items-center justify-center font-display font-bold text-voe-navy-deep text-sm flex-shrink-0">
              {initials(user?.name)}
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <b className="block text-sm whitespace-nowrap truncate">{user?.name ?? "Learner"}</b>
                <span className="text-xs text-voe-sky whitespace-nowrap">Learner</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 md:px-9 py-5 bg-voe-cream/90 backdrop-blur-md border-b border-voe-navy/10">
          <div className="flex items-center">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden w-10 h-10 rounded-xl bg-white border border-voe-navy/10 flex items-center justify-center mr-3"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-display font-semibold text-voe-navy-deep">My Dashboard</h1>
              <div className="text-sm text-[#6a7099] mt-0.5">Let's pick up where you left off</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-full bg-white border border-voe-navy/10 flex items-center justify-center relative hover:-translate-y-0.5 transition-transform">
              <Bell size={18} className="text-voe-navy" />
              <span className="absolute top-1.5 right-[7px] w-2 h-2 rounded-full bg-voe-gold-deep ring-2 ring-white" />
            </button>
            <div className="w-[38px] h-[38px] rounded-full bg-gradient-to-br from-voe-sky to-voe-sky-deep flex items-center justify-center font-display font-bold text-voe-navy-deep text-sm">
              {initials(user?.name)}
            </div>
          </div>
        </div>

        <div className="px-6 md:px-9 py-8 pb-16">
          {/* Welcome banner */}
          <div className="voe-fade-up relative overflow-hidden rounded-3xl px-8 py-9 bg-gradient-to-br from-voe-navy to-[#24357f] text-white mb-7 flex items-center justify-between gap-6 flex-wrap">
            <div
              className="absolute w-[340px] h-[340px] rounded-full -right-[60px] -top-[90px]"
              style={{ background: "radial-gradient(circle, rgba(253,185,19,0.3), transparent 68%)" }}
            />
            <div className="relative">
              <h2 className="text-2xl font-semibold mb-2 font-display">
                Good to see you{firstName ? `, ${firstName}` : ""} 👋
              </h2>
              <p className="text-voe-sky text-sm max-w-[420px]">
                You're 68% through "Tailoring &amp; Stitching Basics" — one more lesson and you'll earn your next badge.
              </p>
            </div>
            <div className="relative w-[110px] h-[110px] flex-shrink-0" aria-hidden="true">
              <div
                className="voe-w-sun absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 w-[60px] h-[60px] rounded-full"
                style={{ background: "radial-gradient(circle at 40% 35%, #FFE59A, #FDB913 55%, #F5871F 100%)" }}
              />
              <div
                className="absolute left-1/2 top-1/2"
                style={{
                  transform: "translate(-50%,-42%)",
                  width: 0,
                  height: 0,
                  borderLeft: "44px solid transparent",
                  borderRight: "44px solid transparent",
                  borderTop: "78px solid #101B4A",
                }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="voe-fade-up grid grid-cols-2 md:grid-cols-4 gap-5 mb-9" style={{ animationDelay: "60ms" }}>
            {[
              { icon: BookOpen, bg: "bg-gradient-to-br from-voe-gold to-voe-gold-deep", stroke: "#101B4A", num: "3", label: "Courses In Progress" },
              { icon: Award, bg: "bg-gradient-to-br from-[#5FCB98] to-[#3FAE7C]", stroke: "#fff", num: "5", label: "Courses Completed" },
              { icon: TrendingUp, bg: "bg-gradient-to-br from-voe-sky to-voe-sky-deep", stroke: "#101B4A", num: "42h", label: "Hours Learned" },
              { icon: Award, bg: "bg-voe-navy", stroke: "#fff", num: "6", label: "Certificates Earned" },
            ].map((s, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-5 border border-voe-navy/[0.07] shadow-sm flex items-center gap-3.5 hover:-translate-y-1 hover:shadow-lg transition-all"
              >
                <div className={`w-[46px] h-[46px] rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg}`}>
                  <s.icon size={21} color={s.stroke} />
                </div>
                <div>
                  <div className="font-display text-2xl font-semibold text-voe-navy-deep leading-none">{s.num}</div>
                  <div className="text-xs text-[#7278a0] mt-1 font-semibold">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Continue learning */}
          <div className="flex items-center justify-between mb-4.5">
            <h3 className="text-lg font-display font-semibold text-voe-navy-deep">Continue Learning</h3>
            <a href="#" className="text-sm font-bold text-voe-gold-deep">View all courses →</a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5.5 mb-10">
            {courses.map((c, i) => (
              <div
                key={i}
                onClick={() => setVideoTitle(`${c.title} — continue lesson`)}
                className="bg-white rounded-[20px] overflow-hidden border border-voe-navy/[0.07] shadow-sm hover:-translate-y-1.5 hover:shadow-xl transition-all cursor-pointer"
              >
                <div className="relative h-[140px] bg-gradient-to-br from-voe-navy to-[#2c3f92] flex items-center justify-center overflow-hidden">
                  <div
                    className="absolute inset-0"
                    style={{ background: "radial-gradient(circle at 70% 20%, rgba(253,185,19,0.35), transparent 60%)" }}
                  />
                  <span className="absolute top-2.5 left-2.5 bg-voe-gold/95 text-voe-navy-deep text-[0.68rem] font-extrabold px-2.5 py-1 rounded-full z-[2]">
                    {c.tag}
                  </span>
                  <div className="w-12 h-12 rounded-full bg-white/95 flex items-center justify-center relative z-[2] shadow-lg">
                    <Play size={18} className="text-voe-navy-deep ml-0.5" fill="#101B4A" />
                  </div>
                </div>
                <div className="px-4.5 pt-4 pb-4.5">
                  <h4 className="text-[0.98rem] font-bold text-voe-navy-deep mb-1">{c.title}</h4>
                  <div className="text-xs text-[#8288ac] mb-3">{c.meta}</div>
                  <div className="h-[7px] rounded-full bg-[#EFEBDD] overflow-hidden mb-1.5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-voe-gold to-voe-gold-deep transition-all"
                      style={{ width: `${c.progress}%` }}
                    />
                  </div>
                  <div className="text-xs font-bold text-voe-gold-deep">{c.progressText}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Achievements */}
          <div className="flex items-center justify-between mb-4.5">
            <h3 className="text-lg font-display font-semibold text-voe-navy-deep">Your Achievements</h3>
            <a href="#" className="text-sm font-bold text-voe-gold-deep">View all →</a>
          </div>
          <div className="flex gap-4 flex-wrap">
         {badges.map((b, i) => (
  <div
    key={i}
    className={`flex-1 min-w-[150px] bg-white rounded-2xl p-4.5 text-center border border-voe-navy/[0.07] shadow-sm hover:-translate-y-1 hover:scale-[1.02] transition-transform ${b.locked ? "opacity-45 grayscale" : ""}`}
  >
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-2.5 ${b.bg}`}>
      <b.icon size={20} color={b.stroke} />
    </div>
    <b className="block text-[0.82rem] text-voe-navy-deep mb-0.5">{b.title}</b>
    <span className="text-[0.7rem] text-[#8288ac]">{b.desc}</span>
  </div>
))}

          </div>
        </div>
      </div>

      {/* Video modal */}
      {videoTitle && (
        <div
          className="fixed inset-0 bg-voe-navy-deep/70 backdrop-blur-sm flex items-center justify-center z-[100] p-6"
          onClick={(e) => {
            if (e.target === e.currentTarget) setVideoTitle(null);
          }}
        >
          <div className="bg-voe-navy-deep rounded-[20px] overflow-hidden w-full max-w-[760px]">
            <div className="flex items-center justify-between px-5 py-4">
              <h4 className="text-white text-[0.98rem] font-bold">{videoTitle}</h4>
              <button
                onClick={() => setVideoTitle(null)}
                className="bg-white/10 text-white w-8 h-8 rounded-full flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>
            <video controls className="w-full block max-h-[60vh] bg-black">
              <source
                src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                type="video/mp4"
              />
            </video>
            <div className="px-5 pt-3.5 pb-5 text-voe-sky text-sm">
              Placeholder video — swap this source once real lesson recordings are ready.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}