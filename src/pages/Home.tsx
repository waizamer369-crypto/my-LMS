import { useEffect } from "react";
import { Link } from "react-router";
import logo from "@/lms-site/assets/logo.png";

const dove = (fill: string, style: React.CSSProperties) => (
  <svg className="dove" style={style} viewBox="0 0 60 40">
    <path
      d="M2 20 Q15 2 30 14 Q45 2 58 20 Q45 14 30 22 Q15 14 2 20 Z"
      fill={fill}
    />
  </svg>
);

export default function Home() {
  useEffect(() => {
    const revealEls = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    revealEls.forEach((el) => io.observe(el));

    const counters = document.querySelectorAll(".stat-num");
    const counterIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const target = parseInt(el.dataset.target || "0", 10);
            const dur = 1400;
            const start = performance.now();
            function tick(now: number) {
              const p = Math.min((now - start) / dur, 1);
              const eased = 1 - Math.pow(1 - p, 3);
              el.textContent = Math.floor(eased * target).toLocaleString();
              if (p < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
            counterIO.unobserve(el);
          }
        });
      },
      { threshold: 0.4 },
    );
    counters.forEach((c) => counterIO.observe(c));

    return () => {
      io.disconnect();
      counterIO.disconnect();
    };
  }, []);

  return (
    <div className="voe-home font-sans bg-voe-cream text-voe-navy-deep overflow-x-hidden">
      <style>{`
        .voe-home .rise{
          background:linear-gradient(100deg, #F5871F, #FDB913 60%);
          -webkit-background-clip:text; background-clip:text; color:transparent;
        }
        .voe-home .hero-mark{ position:relative; width:420px; height:420px; flex-shrink:0; }
        @media (max-width:960px){ .voe-home .hero-mark{ width:280px; height:280px; } }
        .voe-home .sun{
          position:absolute; left:50%; top:44%; transform:translate(-50%,-50%);
          width:180px; height:180px; border-radius:50%;
          background:radial-gradient(circle at 40% 35%, #FFE59A, #FDB913 55%, #F5871F 100%);
          animation: voe-sunrise 1.4s cubic-bezier(.2,.8,.2,1) both, voe-pulse-glow 3.5s ease-in-out infinite 1.4s;
        }
        @keyframes voe-sunrise{
          0%{ transform:translate(-50%,10%) scale(0.6); opacity:0; }
          100%{ transform:translate(-50%,-50%) scale(1); opacity:1; }
        }
        @keyframes voe-pulse-glow{
          0%,100%{ box-shadow:0 0 40px 0px rgba(253,185,19,0.35); }
          50%{ box-shadow:0 0 65px 12px rgba(253,185,19,0.5); }
        }
        .voe-home .triangle{
          position:absolute; left:50%; top:50%; transform:translate(-50%,-42%);
          width:0; height:0;
          border-left:130px solid transparent;
          border-right:130px solid transparent;
          border-top:230px solid #1B2A6B;
          filter:drop-shadow(0 18px 30px rgba(16,27,74,0.35));
          animation: voe-settle 1.2s cubic-bezier(.2,.8,.2,1) both 0.3s;
        }
        @keyframes voe-settle{
          0%{ opacity:0; transform:translate(-50%,-30%) scale(0.85); }
          100%{ opacity:1; transform:translate(-50%,-42%) scale(1); }
        }
        .voe-home .dove{ position:absolute; width:34px; height:auto; opacity:0; animation: voe-fly 1.6s cubic-bezier(.16,.8,.3,1) forwards; }
        @keyframes voe-fly{
          0%{ opacity:0; transform:translate(0,0) scale(0.6) rotate(0deg); }
          15%{ opacity:1; }
          100%{ opacity:0.92; transform:var(--end) scale(1) rotate(var(--rot,0deg)); }
        }
        .voe-home .dove-fly{ position:absolute; width:26px; opacity:0.5; animation: voe-drift 14s linear infinite; }
        @keyframes voe-drift{
          0%{ transform:translate(-10vw, 0) scale(0.8); opacity:0; }
          10%{ opacity:0.55; }
          90%{ opacity:0.4; }
          100%{ transform:translate(110vw, -60px) scale(1.1); opacity:0; }
        }
        .voe-home .marquee{ display:flex; width:max-content; gap:48px; animation:voe-scroll-left 26s linear infinite; }
        @keyframes voe-scroll-left{ from{ transform:translateX(0); } to{ transform:translateX(-50%); } }
        .voe-home .reveal{ opacity:0; transform:translateY(26px); transition:opacity .7s ease, transform .7s ease; }
        .voe-home .reveal.in{ opacity:1; transform:translateY(0); }
      `}</style>

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-[6vw] py-4 bg-voe-cream/85 backdrop-blur-md border-b border-voe-navy/10">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="Voice of Eden Pakistan" className="h-9" />
        </div>
        <div className="hidden md:flex items-center gap-9">
          <a href="#features" className="font-semibold text-sm text-voe-navy hover:text-voe-gold-deep transition-colors">Why Us</a>
          <a href="#courses" className="font-semibold text-sm text-voe-navy hover:text-voe-gold-deep transition-colors">Courses</a>
          <a href="#impact" className="font-semibold text-sm text-voe-navy hover:text-voe-gold-deep transition-colors">Impact</a>
          <Link to="/login" className="bg-voe-navy text-voe-cream px-5 py-2.5 rounded-full font-bold text-sm hover:-translate-y-0.5 transition-transform">
            Sign In
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-voe-cream to-[#F3EFE3] px-[6vw] pt-[140px] pb-[100px] overflow-hidden">
        <svg className="dove-fly" style={{ top: "18%", left: 0, animationDelay: "0s" }} viewBox="0 0 60 40">
          <path d="M2 20 Q15 2 30 14 Q45 2 58 20 Q45 14 30 22 Q15 14 2 20 Z" fill="#A9C6E8" />
        </svg>
        <svg className="dove-fly" style={{ top: "70%", left: 0, animationDelay: "6s" }} viewBox="0 0 60 40">
          <path d="M2 20 Q15 2 30 14 Q45 2 58 20 Q45 14 30 22 Q15 14 2 20 Z" fill="#6E93C9" />
        </svg>

        <div className="flex items-center justify-between gap-14 max-w-[1240px] w-full mx-auto relative z-[3] flex-wrap">
          <div className="max-w-[540px]">
            <div className="inline-flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-voe-gold-deep bg-voe-gold/15 px-3.5 py-1.5 rounded-full mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-voe-gold-deep" />
              Community Development with Skills &amp; Education
            </div>
            <h1 className="font-display text-[clamp(2.4rem,5.2vw,3.9rem)] leading-[1.05] font-semibold text-voe-navy-deep mb-5 tracking-tight">
              Learn a skill.<br />
              <span className="rise">Rise with</span> your community.
            </h1>
            <p className="text-lg leading-relaxed text-[#3a4270] mb-8 max-w-[460px]">
              Voice of Eden Pakistan's learning platform gives you free, practical courses built by and for communities — so every skill you gain lifts the people around you too.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link
                to="/login"
                className="bg-gradient-to-br from-voe-gold to-voe-gold-deep text-voe-navy-deep font-extrabold px-8 py-4 rounded-full shadow-lg hover:-translate-y-1 hover:scale-[1.02] transition-transform"
              >
                Start Learning — It's Free
              </Link>
              <a href="#courses">
                <button className="bg-transparent text-voe-navy font-bold px-7 py-4 rounded-full border-2 border-voe-navy hover:bg-voe-navy hover:text-voe-cream transition-colors">
                  Explore Courses
                </button>
              </a>
            </div>
          </div>

          <div className="hero-mark" aria-hidden="true">
            <div className="sun" />
            <div className="triangle" />
            {dove("#3B57A6", { top: "46%", left: "48%", ["--end" as any]: "translate(-180px,-150px)", animationDelay: ".9s" })}
            {dove("#3B57A6", { top: "40%", left: "52%", ["--end" as any]: "translate(-90px,-210px)", animationDelay: "1.05s" })}
            {dove("#3B57A6", { top: "38%", left: "56%", ["--end" as any]: "translate(20px,-235px)", animationDelay: "1.2s" })}
            {dove("#5872BC", { top: "44%", left: "58%", ["--end" as any]: "translate(140px,-190px)", animationDelay: "1.0s" })}
            {dove("#A9C6E8", { top: "58%", left: "22%", ["--end" as any]: "translate(-150px,-40px)", animationDelay: "1.3s" })}
            {dove("#A9C6E8", { top: "62%", left: "74%", ["--end" as any]: "translate(150px,-30px)", animationDelay: "1.4s" })}
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="bg-voe-navy py-4.5 overflow-hidden border-y border-white/10">
        <div className="marquee">
          {["Tailoring & Stitching", "Digital Literacy", "English Speaking", "Handicrafts", "Basic Accounting", "Health & Hygiene"]
            .concat(["Tailoring & Stitching", "Digital Literacy", "English Speaking", "Handicrafts", "Basic Accounting", "Health & Hygiene"])
            .map((t, i) => (
              <span key={i} className="text-voe-sky font-bold text-sm tracking-wide whitespace-nowrap flex items-center gap-2.5">
                {t}
                <span className="text-voe-gold text-xs">✦</span>
              </span>
            ))}
        </div>
      </div>

      {/* FEATURES */}
      <section className="max-w-[1240px] mx-auto px-[6vw] py-28" id="features">
        <div className="reveal text-center max-w-[620px] mx-auto mb-16">
          <div className="inline-flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-voe-gold-deep bg-voe-gold/15 px-3.5 py-1.5 rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-voe-gold-deep" />
            Why Voice of Eden
          </div>
          <h2 className="font-display text-[clamp(1.9rem,3.4vw,2.6rem)] text-voe-navy-deep font-semibold mb-3.5">
            Built for real communities, not just resumes
          </h2>
          <p className="text-[#4a5280] text-lg leading-relaxed">
            Every course exists because a community asked for it. No fluff, no paywalls — just skills people can use the same week they learn them.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {[
            {
              bg: "bg-gradient-to-br from-voe-gold to-voe-gold-deep",
              title: "Always Free",
              body: "Every course, every certificate, every mentor session — free, forever. Education shouldn't have a price tag on hope.",
              icon: (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#101B4A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v6" /><path d="M4.93 10.93l1.41 1.41" /><path d="M2 18h2" /><path d="M20 18h2" /><path d="M19.07 10.93l-1.41 1.41" /><path d="M22 22H1" /><path d="M8 6l4-4 4 4" /><path d="M16 18a4 4 0 0 0-8 0" />
                </svg>
              ),
            },
            {
              bg: "bg-voe-navy",
              title: "Community-Taught",
              body: "Courses are built with local mentors and community leaders, so what you learn actually fits where you live and work.",
              icon: (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9.5" cy="7" r="4" /><path d="M22.5 21v-2a4 4 0 0 0-3-3.87" /><path d="M15.5 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              ),
            },
            {
              bg: "bg-gradient-to-br from-voe-sky to-voe-sky-deep",
              title: "Skills You Can Use",
              body: "From tailoring to digital literacy, every lesson ends with something you can do — not just something you know.",
              icon: (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#101B4A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.4-3.4a6 6 0 0 1-7.3 7.3l-6.6 6.6a2.1 2.1 0 0 1-3-3l6.6-6.6a6 6 0 0 1 7.3-7.3z" />
                </svg>
              ),
            },
          ].map((f, i) => (
            <div key={i} className="reveal bg-white rounded-[22px] p-9 border border-voe-navy/10 shadow-sm hover:-translate-y-2 hover:shadow-xl transition-all">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${f.bg}`}>{f.icon}</div>
              <h3 className="text-xl text-voe-navy-deep mb-2.5 font-semibold">{f.title}</h3>
              <p className="text-[#5a6188] text-base leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="bg-voe-navy-deep relative overflow-hidden" id="impact">
        <div className="relative z-[2] px-[6vw] py-24 max-w-[1100px] mx-auto">
          <div className="reveal text-center max-w-[620px] mx-auto mb-14">
            <div className="inline-flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-voe-gold bg-voe-gold/15 px-3.5 py-1.5 rounded-full mb-4">
              Our Impact
            </div>
            <h2 className="font-display text-[clamp(1.9rem,3.4vw,2.6rem)] text-white font-semibold">
              Rising together, one skill at a time
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-7 text-center">
            {[
              { target: 12000, label: "Learners Reached" },
              { target: 48, label: "Free Courses" },
              { target: 120, label: "Community Mentors" },
              { target: 30, label: "Cities in Pakistan" },
            ].map((s, i) => (
              <div key={i} className="reveal">
                <div className="stat-num font-display text-[clamp(2.1rem,4vw,3rem)] text-voe-gold font-semibold" data-target={s.target}>0</div>
                <div className="text-voe-sky text-sm mt-1.5 font-semibold tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="reveal mx-[6vw] my-28 rounded-[32px] overflow-hidden relative bg-gradient-to-br from-voe-navy to-[#24357f] px-[8vw] py-20 text-center" id="courses">
        <h2 className="relative font-display text-[clamp(1.9rem,3.6vw,2.7rem)] text-white font-semibold mb-4">
          Your community is waiting for what you'll learn
        </h2>
        <p className="relative text-voe-sky text-lg mb-8">
          Join thousands of learners across Pakistan building real skills, together.
        </p>
        <Link
          to="/login"
          className="relative inline-block bg-gradient-to-br from-voe-gold to-voe-gold-deep text-voe-navy-deep font-extrabold px-8 py-4 rounded-full shadow-lg hover:-translate-y-1 hover:scale-[1.02] transition-transform"
        >
          Create Your Free Account
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="px-[6vw] pt-12 pb-10 border-t border-voe-navy/10">
        <div className="max-w-[1240px] mx-auto flex justify-between items-center flex-wrap gap-5">
          <img src={logo} alt="Voice of Eden Pakistan" className="h-[30px]" />
          <p className="text-[#6a7099] text-sm">
            © {new Date().getFullYear()} Voice of Eden Pakistan. Community Development with Skills &amp; Education.
          </p>
        </div>
      </footer>
    </div>
  );
}