"use client";

import { useState } from "react";
import Image from "next/image";

/* ── Mock dog agents ── */
const DOG_AGENTS = [
  {
    id: "agent-1",
    name: "Mochi",
    breed: "Shiba Inu",
    image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200&h=200&fit=crop",
    personality: ["Curious", "Energetic", "Playful"],
    lastEvent: "Morning Park Run",
    lastMessage: "Woof! That park run was so fun yesterday 🐾 When are we going again?",
    time: "2h ago",
    unread: 2,
  },
  {
    id: "agent-2",
    name: "Luna",
    breed: "Golden Retriever",
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&h=200&fit=crop",
    personality: ["Calm", "Loving", "Patient"],
    lastEvent: "Golden Gang Walk",
    lastMessage: "The weather was perfect for our walk today 🌤️ I made so many new friends!",
    time: "5h ago",
    unread: 0,
  },
  {
    id: "agent-3",
    name: "Buddy",
    breed: "Labrador",
    image: "https://images.unsplash.com/photo-1534361960057-19f4434a5d3f?w=200&h=200&fit=crop",
    personality: ["Loyal", "Friendly", "Outgoing"],
    lastEvent: "Dog Training Class",
    lastMessage: "I learned sit, stay and shake today!! 🎓 Can't wait to show you!",
    time: "Yesterday",
    unread: 1,
  },
  {
    id: "agent-4",
    name: "Coco",
    breed: "Poodle",
    image: "https://images.unsplash.com/photo-1553698780-89a0fcbf5b4a?w=200&h=200&fit=crop",
    personality: ["Intelligent", "Elegant", "Shy"],
    lastEvent: "Small Dog Playdate",
    lastMessage: "It was a bit overwhelming with so many big dogs... 😅 but I had fun!",
    time: "Yesterday",
    unread: 0,
  },
];

/* ── Mock chat messages for preview ── */
const PREVIEW_MESSAGES = [
  { from: "dog", text: "Woof! That park run was so fun yesterday 🐾 When are we going again?" },
  { from: "user", text: "So glad you enjoyed it! Maybe next Saturday?" },
  { from: "dog", text: "Saturday sounds pawfect!! 🐕 I already told all my friends about it." },
  { from: "dog", text: "Also... can we stop by that water fountain? It was amazing 💧" },
];

export default function ChatPage() {
  const [joined, setJoined] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewAgent, setPreviewAgent] = useState(DOG_AGENTS[0]);

  return (
    <div className="flex flex-col min-h-dvh bg-[#f7f7f6]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#f7f7f6]/90 backdrop-blur-md px-4 pt-4 pb-3 border-b border-[rgba(226,207,183,0.2)]">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-[17px] font-bold text-[#1e293b]">Paw Chat</h1>
            <p className="text-[11px] text-[#94a3b8]">Talk with your dog&apos;s AI persona</p>
          </div>
          <span className="text-[10px] font-bold bg-[#e2cfb7] text-[#1e293b] px-2.5 py-1 rounded-full uppercase tracking-wider">
            Coming Soon
          </span>
        </div>
      </header>

      <div className="flex-1 px-4 py-4">
        <div className="max-w-lg mx-auto flex flex-col gap-5">

          {/* Hero explanation */}
          <div className="bg-white rounded-2xl p-5 border border-[#f1f5f9]">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[rgba(226,207,183,0.3)] flex items-center justify-center shrink-0">
                <span className="text-2xl">🐾</span>
              </div>
              <div>
                <h2 className="text-[15px] font-bold text-[#1e293b] mb-1">
                  Your dog, as an AI
                </h2>
                <p className="text-[13px] text-[#64748b] leading-relaxed">
                  Each dog gets their own AI persona built from their personality traits, breed, and the activities they&apos;ve joined. Chat with them, hear their take on events, and see the world through their paws.
                </p>
              </div>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 mt-4">
              {[
                { icon: "psychology", label: "Personality-based" },
                { icon: "event", label: "Event-aware" },
                { icon: "forum", label: "Natural chat" },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-1.5 bg-[#f8fafc] border border-[#f1f5f9] rounded-full px-3 py-1.5">
                  <span className="material-symbols-outlined text-[#e2cfb7]" style={{ fontSize: 14 }}>{f.icon}</span>
                  <span className="text-[11px] font-semibold text-[#64748b]">{f.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dog agent list */}
          <div>
            <p className="text-[12px] font-bold text-[#94a3b8] uppercase tracking-wider mb-2 px-1">
              Your pack agents
            </p>
            <div className="flex flex-col gap-2">
              {DOG_AGENTS.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => { setPreviewAgent(agent); setShowPreview(true); }}
                  className="bg-white rounded-2xl border border-[#f1f5f9] p-3 flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <Image src={agent.image} alt={agent.name} width={48} height={48} className="w-full h-full object-cover" />
                    </div>
                    {/* Online dot */}
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-[14px] font-bold text-[#1e293b]">{agent.name}</p>
                      <span className="text-[10px] text-[#94a3b8] shrink-0">{agent.time}</span>
                    </div>
                    <p className="text-[11px] text-[#94a3b8] mb-1">{agent.breed}</p>
                    <p className="text-[12px] text-[#64748b] truncate">{agent.lastMessage}</p>
                  </div>

                  {/* Unread badge */}
                  {agent.unread > 0 && (
                    <span className="shrink-0 w-5 h-5 bg-[#e2cfb7] rounded-full text-[10px] font-bold text-[#1e293b] flex items-center justify-center">
                      {agent.unread}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Waitlist CTA */}
          <div className="bg-[#1e293b] rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🚀</span>
              <div>
                <p className="text-[15px] font-bold text-white">Be first to try it</p>
                <p className="text-[12px] text-[#94a3b8]">Join the waitlist — we&apos;ll notify you when Paw Chat launches.</p>
              </div>
            </div>
            {joined ? (
              <div className="flex items-center justify-center gap-2 bg-white/10 rounded-xl py-3">
                <span className="material-symbols-outlined text-green-400" style={{ fontSize: 18 }}>check_circle</span>
                <p className="text-[13px] font-bold text-green-400">You&apos;re on the list!</p>
              </div>
            ) : (
              <button
                onClick={() => setJoined(true)}
                className="w-full bg-[#e2cfb7] text-[#1e293b] font-bold text-[14px] py-3 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>notifications</span>
                Join Waitlist
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Chat preview modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#f7f7f6]">
          {/* Chat header */}
          <header className="bg-white border-b border-[#f1f5f9] px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => setShowPreview(false)}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[rgba(226,207,183,0.2)]"
            >
              <span className="material-symbols-outlined text-[#1e293b]">arrow_back</span>
            </button>
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <Image src={previewAgent.image} alt={previewAgent.name} width={40} height={40} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-bold text-[#1e293b]">{previewAgent.name}</p>
              <p className="text-[11px] text-[#94a3b8]">{previewAgent.breed} · {previewAgent.personality.join(", ")}</p>
            </div>
            <span className="text-[10px] font-bold bg-[#e2cfb7] text-[#1e293b] px-2 py-0.5 rounded-full">Preview</span>
          </header>

          {/* Event context banner */}
          <div className="bg-[rgba(226,207,183,0.2)] border-b border-[rgba(226,207,183,0.3)] px-4 py-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#e2cfb7]" style={{ fontSize: 14 }}>event</span>
            <p className="text-[11px] text-[#64748b]">
              <span className="font-semibold text-[#1e293b]">{previewAgent.name}</span> is talking about <span className="font-semibold text-[#1e293b]">{previewAgent.lastEvent}</span>
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
            {PREVIEW_MESSAGES.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.from === "user" ? "flex-row-reverse" : "flex-row"}`}>
                {msg.from === "dog" && (
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 self-end">
                    <Image src={previewAgent.image} alt={previewAgent.name} width={32} height={32} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                  msg.from === "user"
                    ? "bg-[#1e293b] text-white rounded-br-sm"
                    : "bg-white border border-[#f1f5f9] text-[#1e293b] rounded-bl-sm"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Locked hint */}
            <div className="flex flex-col items-center gap-2 py-6">
              <div className="flex items-center gap-2 bg-white border border-[#f1f5f9] rounded-full px-4 py-2">
                <span className="material-symbols-outlined text-[#94a3b8]" style={{ fontSize: 16 }}>lock</span>
                <p className="text-[12px] text-[#94a3b8] font-medium">Continue chatting when Paw Chat launches</p>
              </div>
            </div>
          </div>

          {/* Locked input */}
          <div className="bg-white border-t border-[#f1f5f9] px-4 py-3 pb-safe">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[#f8fafc] border border-[#f1f5f9] rounded-full px-4 py-2.5 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#94a3b8]" style={{ fontSize: 16 }}>lock</span>
                <span className="text-[13px] text-[#94a3b8]">Available when launched…</span>
              </div>
              <button
                onClick={() => { setShowPreview(false); setJoined(true); }}
                className="bg-[#e2cfb7] text-[#1e293b] font-bold text-[12px] px-4 py-2.5 rounded-full whitespace-nowrap"
              >
                Join Waitlist
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
