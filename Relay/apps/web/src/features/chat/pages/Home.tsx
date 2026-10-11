import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, LogOut, MessageCircle, Plus, Search, Sparkles, Users, Zap } from "lucide-react";
import api from "../../../lib/axios";

type User = { id: string; name: string; email: string };
type Conversation = {
  id: string;
  type: "DIRECT" | "GROUP";
  conversationMembers: { user: User }[];
  messages: { id: string; content: string; senderId: string; createdAt: string }[];
};
type ApiResult<T> = { success: boolean; data: T; message?: string };

const avatarColors = [
  "bg-sky-100 text-sky-800",
  "bg-amber-100 text-amber-800",
  "bg-indigo-100 text-indigo-800",
  "bg-rose-100 text-rose-800",
];

export default function Home() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [creatingFor, setCreatingFor] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/auth/login", { replace: true });
      return;
    }
    try {
      const [usersResponse, conversationsResponse] = await Promise.all([
        api.get<ApiResult<User[]>>("/auth/users", { headers: { Authorization: "Bearer " + token } }),
        api.get<ApiResult<Conversation[]>>("/api/conversations", { headers: { Authorization: "Bearer " + token } }),
      ]);
      setUsers(usersResponse.data.data);
      setConversations(conversationsResponse.data.data);
    } catch {
      setError("Could not load your conversations. Please sign in again or check that the API is running.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { void load(); }, [load]);

  async function startConversation(user: User) {
    const token = localStorage.getItem("accessToken");
    if (!token) return navigate("/auth/login");
    setCreatingFor(user.id);
    setError("");
    try {
      const response = await api.post<ApiResult<{ id: string }>>(
        "/api/conversations/direct",
        { userId: user.id },
        { headers: { Authorization: "Bearer " + token } },
      );
      navigate("/chat/" + response.data.data.id);
    } catch {
      setError("Unable to start this conversation. Please try again.");
    } finally {
      setCreatingFor("");
    }
  }

  function signOut() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    navigate("/auth/login", { replace: true });
  }

  const filteredUsers = users.filter((user) =>
    (user.name + " " + user.email).toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <main className="relay-paper min-h-screen overflow-hidden text-slate-950">
      <header className="relative z-10 border-b border-slate-950/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <button onClick={() => navigate("/")} className="group flex items-center gap-3" aria-label="Back to Relay landing page">
            <span className="relay-logo flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500 text-white shadow-[4px_4px_0_#172554] transition-transform group-hover:-rotate-6">
              <MessageCircle className="h-5 w-5" strokeWidth={2.5} />
            </span>
            <span className="text-2xl font-black tracking-[-0.08em]">relay<span className="text-sky-500">.</span></span>
          </button>
          <div className="hidden items-center gap-2 rounded-full border border-slate-950/10 bg-white/70 px-4 py-2 text-xs font-semibold text-slate-600 sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-400 ring-4 ring-emerald-100" />
            YOUR LITTLE CORNER OF THE INTERNET
          </div>
          <button onClick={signOut} className="flex items-center gap-2 rounded-full border border-slate-950/10 bg-white/80 px-4 py-2.5 text-sm font-bold transition hover:-translate-y-0.5 hover:border-slate-950 hover:bg-white">
            <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      <div className="pointer-events-none absolute right-[7%] top-28 hidden rotate-12 text-sky-500/30 lg:block">
        <Sparkles size={76} strokeWidth={1.4} />
      </div>
      <div className="pointer-events-none absolute left-[5%] top-[34rem] hidden -rotate-12 text-amber-400/70 lg:block">
        <svg viewBox="0 0 100 100" className="h-20 w-20 fill-current"><path d="M50 2 61 35 96 35 68 56 79 91 50 70 21 91 32 56 4 35 39 35Z" /></svg>
      </div>

      <div className="relative mx-auto max-w-7xl px-5 pb-14 pt-10 sm:px-8 sm:pt-14">
        <section className="relay-pop-in relative mb-10 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="mb-5 inline-flex -rotate-2 items-center gap-2 rounded-lg bg-amber-300 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-slate-900 shadow-[3px_3px_0_#172554]">
              <Sparkles className="h-3.5 w-3.5" /> A little more human
            </p>
            <h1 className="max-w-3xl font-serif text-5xl font-black leading-[0.98] tracking-[-0.06em] sm:text-6xl md:text-7xl">
              Good things<br />start with <span className="relay-underline relative inline-block text-sky-600">hello.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Tiny check-ins, long conversations, random thoughts. Your people are just a message away.
            </p>
          </div>
          <div className="relative hidden rotate-3 items-center gap-3 rounded-[1.5rem] border-2 border-slate-950 bg-white px-5 py-4 shadow-[6px_6px_0_#172554] md:flex">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700"><Zap className="h-6 w-6" /></span>
            <div><p className="text-sm font-black">Real people. Real time.</p><p className="mt-1 text-xs text-slate-500">Powered by Socket.IO</p></div>
          </div>
        </section>

        {error && <p role="alert" className="mb-6 rounded-2xl border-2 border-rose-300 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</p>}

        <div className="grid gap-7 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="relay-panel relay-pop-in overflow-hidden rounded-[2rem] border-2 border-slate-950 bg-white shadow-[7px_7px_0_#172554]">
            <div className="flex items-start justify-between gap-4 border-b-2 border-dashed border-slate-200 px-6 py-6 sm:px-8">
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-sky-700"><MessageCircle className="h-4 w-4" /> Your inbox</div>
                <h2 className="text-2xl font-black tracking-tight sm:text-3xl">The conversation club</h2>
                <p className="mt-2 text-sm text-slate-500">Pick up where your last thought left off.</p>
              </div>
              <span className="flex h-12 min-w-12 items-center justify-center rounded-2xl bg-sky-100 px-3 text-lg font-black text-sky-800">{conversations.length.toString().padStart(2, "0")}</span>
            </div>
            <div className="p-4 sm:p-6">
              {loading ? (
                <div className="flex min-h-56 items-center justify-center gap-3 text-sm font-semibold text-slate-500"><span className="relay-loader" /> Gathering your conversations…</div>
              ) : conversations.length === 0 ? (
                <div className="rounded-[1.5rem] border-2 border-dashed border-slate-200 px-5 py-12 text-center">
                  <span className="mx-auto flex h-16 w-16 rotate-6 items-center justify-center rounded-[1.4rem] bg-amber-100 text-amber-700"><MessageCircle className="h-8 w-8" /></span>
                  <h3 className="mt-5 text-xl font-black">It’s quiet in here.</h3>
                  <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500">Every great conversation starts somewhere. Pick a person and say hey.</p>
                  <div className="mt-5 inline-flex -rotate-2 rounded-lg bg-amber-300 px-3 py-1.5 text-xs font-black uppercase tracking-wider">Your first hello awaits ↗</div>
                </div>
              ) : (
                <div className="space-y-2">
                  {conversations.map((conversation, index) => {
                    const other = conversation.conversationMembers[0]?.user;
                    const latest = conversation.messages[0];
                    return (
                      <button key={conversation.id} onClick={() => navigate("/chat/" + conversation.id)} className="group flex w-full items-center gap-4 rounded-2xl border border-transparent p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-200 hover:bg-sky-50/70 hover:shadow-[3px_3px_0_#bae6fd] sm:p-4">
                        <span className={"flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.2rem] text-lg font-black " + avatarColors[index % avatarColors.length]}>{(other?.name || "G").slice(0, 1).toUpperCase()}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-black tracking-tight">{other?.name || "Group conversation"}</span>
                          <span className="mt-1 block truncate text-sm text-slate-500">{latest?.content || "Start the conversation ✨"}</span>
                        </span>
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition group-hover:bg-sky-500 group-hover:text-white"><ArrowUpRight className="h-4 w-4" /></span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          <section className="relay-pop-in rounded-[2rem] border-2 border-slate-950 bg-[#e0f2fe] p-5 shadow-[7px_7px_0_#172554] sm:p-7">
            <div className="mb-6 flex items-start justify-between gap-3">
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-sky-800"><Users className="h-4 w-4" /> Meet your people</div>
                <h2 className="text-2xl font-black tracking-tight sm:text-3xl">New connections.</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">Find someone, start a thread, see where it goes.</p>
              </div>
              <span className="flex h-11 w-11 rotate-6 items-center justify-center rounded-2xl border-2 border-slate-950 bg-amber-300 text-slate-950"><Sparkles className="h-5 w-5" /></span>
            </div>
            <label className="relative mb-5 block">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a name or email…" className="w-full rounded-2xl border-2 border-slate-950 bg-white py-3.5 pl-11 pr-4 text-sm font-medium outline-none transition placeholder:text-slate-400 focus:-translate-y-0.5 focus:shadow-[3px_3px_0_#172554]" />
            </label>
            {loading ? (
              <p className="py-8 text-center text-sm font-semibold text-slate-500">Finding your people…</p>
            ) : filteredUsers.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-sky-300 bg-white/60 px-4 py-8 text-center text-sm leading-6 text-slate-600">No other users found yet.<br />Create another test account to try a chat.</div>
            ) : (
              <div className="space-y-2">
                {filteredUsers.map((user, index) => (
                  <div key={user.id} className="flex items-center gap-3 rounded-2xl border border-sky-200/80 bg-white/80 p-3 transition hover:border-slate-950 hover:bg-white">
                    <span className={"flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] text-sm font-black " + avatarColors[(index + 1) % avatarColors.length]}>{user.name.slice(0, 1).toUpperCase()}</span>
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-black">{user.name}</p><p className="truncate text-xs text-slate-500">{user.email}</p></div>
                    <button disabled={creatingFor === user.id} onClick={() => void startConversation(user)} aria-label={"Start chat with " + user.name} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-slate-950 bg-sky-500 text-white transition hover:-translate-y-0.5 hover:bg-sky-600 hover:shadow-[2px_2px_0_#172554] disabled:cursor-wait disabled:opacity-50">
                      {creatingFor === user.id ? <span className="relay-loader relay-loader-light" /> : <Plus className="h-5 w-5" />}
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-5 flex items-center justify-center gap-2 text-center text-[10px] font-black uppercase tracking-[0.18em] text-sky-800"><span className="h-px flex-1 bg-sky-300" /> made for the moments between <span className="h-px flex-1 bg-sky-300" /></p>
          </section>
        </div>
        <footer className="flex flex-col gap-2 px-1 pt-10 text-xs font-semibold text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <span>© Relay — keep the good conversations going.</span>
          <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400" /> PRIVATE BY DESIGN · REALTIME BY NATURE</span>
        </footer>
      </div>
    </main>
  );
}
