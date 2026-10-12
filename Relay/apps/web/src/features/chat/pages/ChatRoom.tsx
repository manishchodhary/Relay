import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, LoaderCircle, MessageCircle, Send, Sparkles } from "lucide-react";
import { io, type Socket } from "socket.io-client";
import api, { apiBaseUrl } from "../../../lib/axios";

type Message = { id: string; conversationId: string; senderId: string; content: string; createdAt: string | Date };
type ApiResult<T> = { success: boolean; data: T; message?: string };
type SocketMessage = Omit<Message, "createdAt"> & { createdAt: string | Date };

export default function ChatRoom() {
  const { conversationId = "" } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const token = localStorage.getItem("accessToken");

  const loadMessages = useCallback(async () => {
    if (!token) {
      navigate("/auth/login", { replace: true });
      return;
    }
    try {
      const [messagesResponse, userResponse] = await Promise.all([
        api.get<ApiResult<Message[]>>("/api/conversations/" + conversationId + "/messages", { headers: { Authorization: "Bearer " + token } }),
        api.get<ApiResult<{ id: string }>>("/auth/user", { headers: { Authorization: "Bearer " + token } }),
      ]);
      setMessages(messagesResponse.data.data);
      setCurrentUserId(userResponse.data.data.id);
    } catch {
      setError("Could not load this conversation. You may not be a member of it.");
    } finally {
      setLoading(false);
    }
  }, [conversationId, navigate, token]);

  useEffect(() => { void loadMessages(); }, [loadMessages]);

  useEffect(() => {
    if (!token || !conversationId) return;
    const socket = io(apiBaseUrl, { auth: { token }, withCredentials: true });
    socketRef.current = socket;
    socket.on("connect", () => {
      socket.emit("conversation:join", conversationId, (result: { success: boolean; error?: string }) => {
        if (!result.success) setError(result.error || "Unable to join conversation.");
      });
    });
    socket.on("message:new", (message: SocketMessage) => {
      if (message.conversationId === conversationId) {
        setMessages((previous) => previous.some((item) => item.id === message.id) ? previous : [...previous, message]);
      }
    });
    socket.on("connect_error", () => setError("Realtime connection failed. Check your API and socket authentication."));
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [conversationId, token]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = draft.trim();
    const socket = socketRef.current;
    if (!content || !socket?.connected || sending) {
      if (!socket?.connected) setError("Realtime connection is not ready yet.");
      return;
    }
    setSending(true);
    setError("");
    socket.emit("message:send", { conversationId, content }, (result: { success: boolean; messageId?: string; error?: string }) => {
      setSending(false);
      if (!result.success) {
        setError(result.error || "Message could not be sent.");
        return;
      }
      setDraft("");
    });
  }

  return (
    <main className="relay-room flex min-h-screen flex-col text-slate-950">
      <header className="relay-room-header sticky top-0 z-20 border-b border-slate-200/90">
        <div className="mx-auto flex w-full max-w-[1440px] items-center gap-3 px-4 py-3.5 sm:px-7">
          <button onClick={() => navigate("/home")} aria-label="Back to conversations" className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"><ArrowLeft className="h-5 w-5" /></button>
          <button onClick={() => navigate("/home")} className="flex items-center gap-2.5" aria-label="Relay conversations">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500 text-white"><MessageCircle className="h-4 w-4" strokeWidth={2.5} /></span>
            <span className="text-xl font-black tracking-[-0.08em]">relay<span className="text-sky-500">.</span></span>
          </button>
          <span className="mx-1 hidden h-7 w-px bg-slate-200 sm:block" />
          <div className="min-w-0"><h1 className="truncate text-sm font-extrabold tracking-tight sm:text-base">Conversation</h1><p className="mt-0.5 truncate text-[11px] font-medium text-slate-500">Thread · {conversationId.slice(0, 10)}</p></div>
          <span className="ml-auto flex shrink-0 items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Realtime</span>
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-5 sm:px-7 sm:py-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div><p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-sky-700">Your space to talk</p><h2 className="mt-1 text-2xl font-black tracking-[-0.045em] sm:text-3xl">The conversation</h2></div>
          <div className="hidden items-center gap-2 text-xs font-semibold text-slate-400 sm:flex"><Sparkles className="h-4 w-4 text-amber-500" /> Good conversations start here</div>
        </div>

        {error && <p role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm font-semibold text-rose-700">{error}</p>}

        <div className="relay-room-messages flex min-h-[55vh] flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.045)]">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-7">
            <div><p className="text-sm font-bold text-slate-800">Messages</p><p className="mt-0.5 text-xs text-slate-400">Messages appear here in real time</p></div>
            <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-600">{messages.length} {messages.length === 1 ? "message" : "messages"}</span>
          </div>
          <div className="flex-1 space-y-5 overflow-y-auto px-4 py-6 sm:px-7 sm:py-8">
            {loading ? (
              <div className="flex min-h-56 items-center justify-center gap-3 text-sm font-semibold text-slate-500"><LoaderCircle className="h-5 w-5 animate-spin text-sky-600" /> Loading messages…</div>
            ) : messages.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-600"><MessageCircle className="h-6 w-6" /></span>
                <h3 className="mt-4 text-lg font-extrabold tracking-tight">Start the conversation</h3>
                <p className="mt-1.5 max-w-xs text-sm leading-6 text-slate-500">Send a message to get things moving. Your new messages will appear here.</p>
              </div>
            ) : messages.map((message) => {
              const mine = message.senderId === currentUserId;
              return (
                <div key={message.id} className={"flex message-enter " + (mine ? "justify-end" : "justify-start")}>
                  <div className={"max-w-[88%] sm:max-w-[72%] " + (mine ? "text-right" : "text-left")}>
                    <p className={"mb-1.5 px-1 text-[10px] font-bold tracking-wide " + (mine ? "text-sky-700" : "text-slate-400")}>{mine ? "You" : "Member"} <span className="mx-1 text-slate-300">·</span> {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                    <div className={"inline-block rounded-2xl px-4 py-3 text-left " + (mine ? "rounded-br-md bg-sky-600 text-white" : "rounded-bl-md bg-slate-100 text-slate-800")}>
                      <p className="whitespace-pre-wrap break-words text-sm leading-6">{message.content}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        </div>

        <form onSubmit={sendMessage} className="relay-room-composer mt-4 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_6px_20px_rgba(15,23,42,0.04)] sm:gap-3 sm:p-2.5">
          <span className="hidden h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700 sm:flex"><MessageCircle className="h-5 w-5" /></span>
          <input value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={500} placeholder="Write a message…" className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm font-medium outline-none placeholder:text-slate-400" aria-label="Message" />
          <button type="submit" disabled={sending || !draft.trim()} className="flex h-11 items-center gap-2 rounded-xl bg-sky-600 px-4 text-sm font-bold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"><Send className="h-4 w-4" /><span className="hidden sm:inline">{sending ? "Sending…" : "Send"}</span></button>
        </form>
        <p className="mt-3 text-center text-[10px] font-semibold tracking-wide text-slate-400">Private conversations · Realtime delivery</p>
      </section>
    </main>
  );
}
