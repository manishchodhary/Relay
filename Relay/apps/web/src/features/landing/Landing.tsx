import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowDownRight, ArrowRight, ArrowUpRight, MessageCircle, MoveUpRight, Sparkles, Zap } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Landing() {
  const navigate = useNavigate();
  const pageRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const root = pageRef.current;
    if (!root) return;

    const context = gsap.context(() => {
      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
      intro
        .from(".landing-nav-item", { y: -18, opacity: 0, duration: 0.65, stagger: 0.08 })
        .from(".landing-kicker", { y: 18, opacity: 0, rotate: -3, duration: 0.55 }, "-=0.25")
        .from(".landing-title-line", { yPercent: 115, rotate: 2, opacity: 0, duration: 0.9, stagger: 0.12 }, "-=0.2")
        .from(".landing-copy, .landing-actions", { y: 22, opacity: 0, duration: 0.65, stagger: 0.12 }, "-=0.35")
        .from(".landing-chat-card", { y: 42, rotate: 3, opacity: 0, scale: 0.96, duration: 0.9 }, "-=0.55")
        .from(".landing-sticker", { scale: 0, rotate: -25, duration: 0.5, stagger: 0.1, ease: "back.out(1.8)" }, "-=0.45");

      gsap.utils.toArray<HTMLElement>(".landing-reveal").forEach((element) => {
        gsap.fromTo(element, { y: 42, opacity: 0 }, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: element, start: "top 86%", once: true },
        });
      });

      gsap.to(".landing-orbit", {
        y: -18,
        rotate: 7,
        duration: 3.8,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
      gsap.to(".landing-chat-float", {
        y: -8,
        duration: 2.4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        stagger: 0.25,
      });
    }, root);

    return () => context.revert();
  }, []);

  return (
    <main ref={pageRef} className="relay-paper landing-page overflow-hidden text-slate-950">
      <header className="relative z-20 mx-auto flex max-w-[1440px] items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="landing-nav-item group flex items-center gap-3" aria-label="Relay home">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-slate-950 bg-sky-500 text-white shadow-[4px_4px_0_#172554] transition duration-300 group-hover:-rotate-6 group-hover:scale-105">
            <MessageCircle className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <span className="text-2xl font-black tracking-[-0.09em]">relay<span className="text-sky-500">.</span></span>
        </button>
        <nav className="landing-nav-item hidden items-center gap-8 text-sm font-bold text-slate-600 md:flex">
          <a className="transition hover:text-sky-700" href="#why-relay">Why Relay</a>
          <a className="transition hover:text-sky-700" href="#the-feel">The feeling</a>
        </nav>
        <div className="landing-nav-item flex items-center gap-2 sm:gap-3">
          <button onClick={() => navigate("/auth/login")} className="rounded-full px-3 py-2.5 text-sm font-black transition hover:bg-white/70 sm:px-5">Log in</button>
          <button onClick={() => navigate("/auth/register")} className="group flex items-center gap-2 rounded-full border-2 border-slate-950 bg-sky-500 px-4 py-2.5 text-sm font-black text-white shadow-[3px_3px_0_#172554] transition hover:-translate-y-0.5 hover:bg-sky-600 hover:shadow-[5px_5px_0_#172554] sm:px-5">
            Get started <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </header>

      <section className="relative mx-auto grid min-h-[690px] max-w-[1440px] items-center gap-10 px-5 pb-20 pt-12 sm:px-8 md:grid-cols-[1.03fr_0.97fr] md:pb-28 md:pt-16 lg:px-12 lg:pb-32">
        <div className="relative z-10">
          <p className="landing-kicker mb-7 inline-flex -rotate-2 items-center gap-2 rounded-lg border-2 border-slate-950 bg-amber-300 px-4 py-2 text-[11px] font-black uppercase tracking-[0.17em] shadow-[4px_4px_0_#172554]">
            <Sparkles className="h-4 w-4" /> A little less distance
          </p>
          <h1 className="max-w-[760px] text-[clamp(3.8rem,8vw,7.8rem)] font-black leading-[0.83] tracking-[-0.095em]">
            <span className="landing-title-mask"><span className="landing-title-line block">Say more.</span></span>
            <span className="landing-title-mask mt-3 block"><span className="landing-title-line relay-title-blue block">Feel closer.</span></span>
          </h1>
          <p className="landing-copy mt-8 max-w-lg text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            The little messages, the late-night thoughts, the “you had to be there” moments. Keep your people close, one conversation at a time.
          </p>
          <div className="landing-actions mt-8 flex flex-wrap items-center gap-4">
            <button onClick={() => navigate("/auth/register")} className="group flex items-center gap-3 rounded-full border-2 border-slate-950 bg-slate-950 px-6 py-4 text-sm font-black text-white transition duration-300 hover:-translate-y-1 hover:bg-sky-600 hover:shadow-[5px_5px_0_#7dd3fc]">
              Start a conversation <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </button>
            <a href="#why-relay" className="flex items-center gap-2 px-3 py-3 text-sm font-black text-slate-600 transition hover:text-slate-950">
              Take a look <ArrowDownRight className="h-4 w-4" />
            </a>
          </div>
          <div className="landing-copy mt-10 flex items-center gap-3 text-xs font-bold text-slate-500">
            <span className="flex -space-x-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#f8f7f2] bg-amber-300 text-[10px] font-black">M</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#f8f7f2] bg-sky-300 text-[10px] font-black">A</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#f8f7f2] bg-rose-300 text-[10px] font-black">J</span>
            </span>
            <span>Made for your kind of people.</span>
          </div>
        </div>

        <div className="relative mx-auto flex min-h-[420px] w-full max-w-[590px] items-center justify-center md:min-h-[570px]">
          <div className="landing-orbit absolute h-[min(78vw,470px)] w-[min(78vw,470px)] rounded-full border border-sky-300/80 sm:h-[470px] sm:w-[470px]" />
          <div className="landing-orbit absolute h-[min(64vw,380px)] w-[min(64vw,380px)] rounded-full border border-dashed border-amber-400/90 sm:h-[380px] sm:w-[380px]" />
          <span className="landing-sticker absolute left-[3%] top-[12%] z-10 flex h-16 w-16 -rotate-12 items-center justify-center rounded-[1.4rem] border-2 border-slate-950 bg-amber-300 shadow-[4px_4px_0_#172554] sm:left-[4%] sm:h-20 sm:w-20"><Sparkles className="h-8 w-8" /></span>
          <span className="landing-sticker absolute right-[4%] top-[15%] z-10 flex h-14 w-14 rotate-12 items-center justify-center rounded-full border-2 border-slate-950 bg-rose-300 shadow-[4px_4px_0_#172554] sm:right-[2%] sm:h-[4.5rem] sm:w-[4.5rem]"><Zap className="h-6 w-6" /></span>
          <span className="landing-sticker absolute bottom-[9%] left-[7%] z-10 rounded-xl border-2 border-slate-950 bg-white px-4 py-2 text-xs font-black shadow-[4px_4px_0_#172554] sm:bottom-[8%]">hey, you ✳</span>

          <div className="landing-chat-card relative z-10 w-full max-w-[410px] rotate-[-2deg] rounded-[2rem] border-2 border-slate-950 bg-white p-4 shadow-[9px_10px_0_#172554] sm:p-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sm font-black text-sky-800">A</span>
                <div><p className="font-black">Alex Morgan</p><p className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold text-emerald-600"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> around right now</p></div>
              </div>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100"><MoveUpRight className="h-4 w-4" /></span>
            </div>
            <div className="space-y-4 py-5">
              <p className="text-center text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Today · 4:18 PM</p>
              <div className="landing-chat-float flex justify-start"><div className="max-w-[82%] rounded-[1.3rem] rounded-bl-md bg-[#f1f5f9] px-4 py-3 text-sm leading-6 text-slate-700">you will NOT believe what just happened 😭</div></div>
              <div className="landing-chat-float flex justify-end"><div className="max-w-[82%] rounded-[1.3rem] rounded-br-md bg-sky-500 px-4 py-3 text-sm font-medium leading-6 text-white">okay wait—I'm listening 👀</div></div>
              <div className="landing-chat-float flex justify-start"><div className="rounded-[1.3rem] rounded-bl-md bg-[#f1f5f9] px-4 py-3 text-sm leading-6 text-slate-700">so first of all, grab a snack.</div></div>
              <div className="flex justify-end"><div className="flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-2 text-[11px] font-bold text-sky-700"><span className="landing-typing-dot" /><span className="landing-typing-dot" /><span className="landing-typing-dot" /> typing something good</div></div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border-2 border-slate-200 bg-slate-50 p-2.5">
              <span className="flex-1 px-2 text-xs text-slate-400">Write the thing you were going to say…</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500 text-white"><ArrowUpRight className="h-4 w-4" /></span>
            </div>
          </div>
          <div className="landing-sticker absolute bottom-[17%] right-0 z-10 -rotate-6 rounded-xl border-2 border-slate-950 bg-[#d9f99d] px-4 py-3 text-center shadow-[4px_4px_0_#172554] sm:right-[-1%]">
            <span className="block text-[10px] font-black uppercase tracking-widest">good energy</span><span className="text-lg font-black">only ↗</span>
          </div>
        </div>
      </section>

      <div className="landing-marquee overflow-hidden border-y-2 border-slate-950 bg-amber-300 py-4">
        <div className="landing-marquee-track flex w-max items-center gap-8 whitespace-nowrap text-sm font-black uppercase tracking-[0.13em] sm:gap-12 sm:text-base">
          {Array.from({ length: 6 }, (_, index) => <span key={index} className="flex items-center gap-8 sm:gap-12">GOOD CONVERSATIONS <span className="text-sky-700">✳</span> REAL-TIME REPLIES <span className="text-sky-700">✳</span> YOUR PEOPLE, ALWAYS <span className="text-sky-700">✳</span></span>)}
        </div>
      </div>

      <section id="why-relay" className="mx-auto max-w-[1440px] px-5 py-24 sm:px-8 md:py-32 lg:px-12">
        <div className="landing-reveal mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div><p className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-sky-700">A better kind of inbox</p><h2 className="max-w-3xl text-5xl font-black leading-[0.92] tracking-[-0.075em] sm:text-6xl md:text-7xl">Less noise.<br /><span className="relay-title-blue">More you.</span></h2></div>
          <p className="max-w-sm text-base leading-7 text-slate-600">No performance. No pressure to be interesting. Just a place for the conversations that make an ordinary day better.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          <article className="landing-reveal group min-h-[285px] rounded-[2rem] border-2 border-slate-950 bg-white p-6 shadow-[5px_5px_0_#172554] transition duration-300 hover:-translate-y-2 hover:shadow-[9px_10px_0_#172554] sm:p-8">
            <span className="mb-12 flex h-14 w-14 rotate-[-7deg] items-center justify-center rounded-2xl border-2 border-slate-950 bg-sky-300"><MessageCircle className="h-7 w-7" /></span>
            <h3 className="text-2xl font-black tracking-tight">Talk like you.</h3><p className="mt-3 text-sm leading-6 text-slate-600">Start a direct conversation and let it go wherever the moment takes you.</p>
            <ArrowUpRight className="mt-6 h-5 w-5 transition group-hover:translate-x-1 group-hover:-translate-y-1" />
          </article>
          <article className="landing-reveal group min-h-[285px] rounded-[2rem] border-2 border-slate-950 bg-[#d9f99d] p-6 shadow-[5px_5px_0_#172554] transition duration-300 hover:-translate-y-2 hover:shadow-[9px_10px_0_#172554] sm:p-8">
            <span className="mb-12 flex h-14 w-14 rotate-[7deg] items-center justify-center rounded-2xl border-2 border-slate-950 bg-white"><Zap className="h-7 w-7" /></span>
            <h3 className="text-2xl font-black tracking-tight">Here, in real time.</h3><p className="mt-3 text-sm leading-6 text-slate-600">Messages move as the conversation happens, powered by Socket.IO.</p>
            <ArrowUpRight className="mt-6 h-5 w-5 transition group-hover:translate-x-1 group-hover:-translate-y-1" />
          </article>
          <article className="landing-reveal group min-h-[285px] rounded-[2rem] border-2 border-slate-950 bg-[#fed7aa] p-6 shadow-[5px_5px_0_#172554] transition duration-300 hover:-translate-y-2 hover:shadow-[9px_10px_0_#172554] sm:p-8">
            <span className="mb-12 flex h-14 w-14 rotate-[-4deg] items-center justify-center rounded-2xl border-2 border-slate-950 bg-white"><Sparkles className="h-7 w-7" /></span>
            <h3 className="text-2xl font-black tracking-tight">Make it a habit.</h3><p className="mt-3 text-sm leading-6 text-slate-600">From quick check-ins to long catch-ups, keep the good stuff going.</p>
            <ArrowUpRight className="mt-6 h-5 w-5 transition group-hover:translate-x-1 group-hover:-translate-y-1" />
          </article>
        </div>
      </section>

      <section id="the-feel" className="px-5 pb-24 sm:px-8 md:pb-32 lg:px-12">
        <div className="landing-reveal relative mx-auto max-w-[1360px] overflow-hidden rounded-[2.5rem] border-2 border-slate-950 bg-sky-500 px-6 py-16 text-center shadow-[8px_8px_0_#172554] sm:px-12 sm:py-20 md:py-28">
          <span className="pointer-events-none absolute -left-8 -top-10 h-44 w-44 rounded-full border-[24px] border-white/15" />
          <span className="pointer-events-none absolute -bottom-16 -right-8 h-56 w-56 rounded-full border-[30px] border-white/15" />
          <p className="relative mb-5 text-xs font-black uppercase tracking-[0.2em] text-sky-950">Your people are one hello away</p>
          <h2 className="relative mx-auto max-w-4xl text-5xl font-black leading-[0.9] tracking-[-0.08em] text-white sm:text-6xl md:text-8xl">Make room for<br />good conversations.</h2>
          <button onClick={() => navigate("/auth/register")} className="group relative mt-9 inline-flex items-center gap-3 rounded-full border-2 border-slate-950 bg-amber-300 px-7 py-4 text-sm font-black text-slate-950 shadow-[4px_4px_0_#172554] transition hover:-translate-y-1 hover:shadow-[7px_7px_0_#172554]">Find your people <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></button>
        </div>
      </section>

      <footer className="mx-auto flex max-w-[1440px] flex-col gap-4 border-t border-slate-950/10 px-5 py-8 text-xs font-semibold text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-2 self-start text-lg font-black tracking-[-0.08em] text-slate-950">relay<span className="text-sky-500">.</span><span className="text-xs font-semibold tracking-normal text-slate-500">Keep the good stuff going.</span></button>
        <div className="flex items-center gap-5"><button onClick={() => navigate("/auth/login")} className="transition hover:text-slate-950">Log in</button><button onClick={() => navigate("/auth/register")} className="transition hover:text-slate-950">Create account</button><span>© Relay 2026</span></div>
      </footer>
    </main>
  );
}
