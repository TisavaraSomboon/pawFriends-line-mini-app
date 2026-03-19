"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Footer from "@/components/MobileFooter";

const INITIAL_MESSAGES = [
  { from: "Max", text: "Hey Buddy! I saw you chasing that tennis ball earlier. Your form was incredible!", time: "0:18" },
  { from: "Buddy", text: "Woof! Thanks Max! It's all about the focus. I heard you're a pro at the 'roll over' trick?", time: "0:16" },
];

export default function ChatPage() {
  const [seconds, setSeconds] = useState(20);
  const [paused, setPaused] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [typing, setTyping] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (paused || seconds <= 0) return;
    const interval = setInterval(() => {
      setSeconds((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [paused, seconds]);

  // Auto-append a new message every 8 seconds
  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          from: "Max",
          text: "Oh absolutely! I can do it on command now. Maybe we can teach each other tricks next time we meet at the park?",
          time: `0:${String(Math.max(0, seconds - 3)).padStart(2, "0")}`,
        },
      ]);
      setTimeout(() => setTyping(true), 1200);
    }, 8000);
    return () => clearTimeout(t);
  }, [paused]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");

  return (
    <div className="flex flex-col min-h-dvh bg-[#f7f7f6]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(225,207,183,0.2)] bg-[#f7f7f6]">
        <Link href="/agents" className="w-10 h-10 flex items-center justify-center">
          <span className="text-[22px] text-[#1e293b]">←</span>
        </Link>
        <div className="text-center">
          <h1 className="text-[17px] font-bold text-[#1e293b] tracking-tight">AI Playdate</h1>
          <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">Live Interaction</p>
        </div>
        <button className="w-10 h-10 flex items-center justify-center">
          <span className="text-xl text-[#1e293b]">•••</span>
        </button>
      </div>

      {/* Timer */}
      <div className="bg-[rgba(225,207,183,0.15)] px-10 py-4 flex flex-col gap-1">
        <div className="flex items-center justify-center gap-2">
          <div className="flex-1 h-14 rounded-[14px] bg-[rgba(225,207,183,0.25)] flex items-center justify-center">
            <span className="text-[22px] font-bold text-[#1e293b]">{mins}</span>
          </div>
          <span className="text-[22px] font-bold text-[#64748b] pb-2">:</span>
          <div className="flex-1 h-14 rounded-[14px] bg-[rgba(225,207,183,0.25)] flex items-center justify-center">
            <span className="text-[22px] font-bold text-[#1e293b]">{secs}</span>
          </div>
        </div>
        <div className="flex justify-around px-5">
          <span className="text-[9px] font-bold text-[#64748b] uppercase tracking-widest">Min</span>
          <span className="text-[9px] font-bold text-[#64748b] uppercase tracking-widest">Sec</span>
        </div>
        <div className="flex items-center justify-center gap-2 mt-1">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[12px] font-medium text-[#64748b] italic">
            {paused ? "Session paused" : "AI agents are currently interacting..."}
          </span>
        </div>
      </div>

      {/* Avatars */}
      <div className="flex items-center justify-center gap-10 py-6 px-6">
        {/* Max */}
        <div className="flex flex-col items-center relative">
          <div className="relative">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBce0Ybs9TtN_tszOQaCI8NL5Ki5J5RaOfzdGwSUinPAf-hdOmikO8zK9uRFRQ59DOFSPxi-QsGmjJgtJY-DE2Qvs1LP6DyDoL-Dfz_X2PX-RAsdMym8xpCLNMF9Lq_Ym5LH9TDHePCK1MHgXhsUKw8VXbGDoeLFWjfHo1ZrT_LlH3LICHF_aS7jemxlraWmQKlA2FGcpDLaHD-hMvSXk3OaQMu_Nxyqatskeah4s8zNzOaSjiNfVTEXbRcRLzGlK3k7RZp4ReeYJq7"
              alt="Max"
              className="w-20 h-20 rounded-full object-cover border-4 border-[#e1cfb7]"
            />
            <div className="absolute -bottom-1 -right-1 bg-[#e1cfb7] rounded-full px-1.5 py-0.5 border-2 border-[#f7f7f6]">
              <span className="text-[9px] font-bold text-[#1e293b]">MAX</span>
            </div>
          </div>
        </div>

        <span className="text-[28px]">⚡</span>

        {/* Buddy */}
        <div className="flex flex-col items-center relative">
          <div className="relative">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDILIU0mUpC0K-Z8R11GdSjk3LZLJJIQAQRVkmoCEaO5I-GtXbHvh6uNlTNZFFgfi5XCVvvfK0ZdsMJ8onVQ5zwx1-v94ztyjNUDsv6eqTq3z2QLybQSlhKXYB2qaAVez5JiJUhn3CDFqEqx43QtEI0nGJ6LWevTzI6lhx-mWC3hKDp4Fhk2vDKJq_2R-xwCRRzKl-JRi3mWtsbhhnRVxvAhJGievpKtCBMGIHuOqLwBkYeXDe_rk4IVDOBLnERG3QyzRV7Zg7SQgNv"
              alt="Buddy"
              className="w-20 h-20 rounded-full object-cover border-4 border-[#e2e8f0]"
            />
            <div className="absolute -bottom-1 -right-1 bg-[#e2e8f0] rounded-full px-1.5 py-0.5 border-2 border-[#f7f7f6]">
              <span className="text-[9px] font-bold text-[#475569]">BUDDY</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto bg-[rgba(248,250,252,0.5)] px-5 py-4 flex flex-col gap-6"
      >
        {messages.map((msg, i) => {
          const isMax = msg.from === "Max";
          return (
            <div key={i} className={`flex flex-col gap-1 max-w-[85%] ${isMax ? "" : "self-end"}`}>
              <span
                className={`text-[10px] font-bold text-[#64748b] uppercase tracking-wide ${
                  isMax ? "ml-1" : "mr-1 text-right"
                }`}
              >
                {msg.from} (AI)
              </span>
              <div
                className={`px-3.5 py-2.5 rounded-2xl ${
                  isMax
                    ? "rounded-tl-[4px] bg-white border border-[#e2e8f0] shadow-sm"
                    : "rounded-tr-[4px] bg-[rgba(225,207,183,0.9)] shadow-sm"
                }`}
              >
                <p
                  className={`text-[15px] leading-relaxed ${
                    isMax ? "text-[#1e293b]" : "font-medium text-[#1e293b]"
                  }`}
                >
                  {msg.text}
                </p>
              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {typing && (
          <div className="flex flex-col gap-1 max-w-[85%]">
            <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wide ml-1">
              Max (AI)
            </span>
            <div className="flex items-center gap-1.5 bg-white rounded-2xl rounded-tl-[4px] px-3.5 py-3 border border-[#e2e8f0] shadow-sm self-start">
              {[0, 1, 2].map((dot) => (
                <div
                  key={dot}
                  className="w-1.5 h-1.5 rounded-full bg-[#cbd5e1] animate-bounce"
                  style={{ animationDelay: `${dot * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="px-4 pt-3.5 pb-1 border-t border-[rgba(225,207,183,0.2)] bg-[#f7f7f6] flex flex-col gap-3">
        {/* Notice */}
        <div className="flex items-center justify-center gap-1.5 bg-[#f8fafc] rounded-[10px] border border-[#e2e8f0] py-2 px-3.5">
          <span className="text-[12px]">ℹ️</span>
          <span className="text-[11px] font-medium text-[#64748b]">
            Users cannot interrupt active AI conversations.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pb-2">
          <button
            onClick={() => setPaused((p) => !p)}
            className="flex-1 h-14 rounded-2xl bg-[#1e293b] flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <span className="text-white text-lg">{paused ? "▶" : "⏸"}</span>
            <span className="text-[14px] font-bold text-white">
              {paused ? "Resume session" : "Pause session"}
            </span>
          </button>
          <button
            onClick={() => setSeconds((s) => s + 20)}
            className="flex-1 h-14 rounded-2xl bg-[#e1cfb7] flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
          >
            <span className="text-[#1e293b] text-lg">⊕</span>
            <span className="text-[14px] font-bold text-[#1e293b]">+20 sec</span>
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
