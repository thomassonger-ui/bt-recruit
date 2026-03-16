"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

/* ── Conversation data ── */
interface Message {
  role: "agent" | "scout";
  text: string;
}

const conversation: Message[] = [
  {
    role: "agent",
    text: "Scout, write a listing description for a 3 bedroom home in Winter Park.",
  },
  {
    role: "scout",
    text: "Elegant 3-bedroom residence in the heart of Winter Park featuring updated interiors, natural light throughout, and a spacious backyard ideal for entertaining. Move-in ready with modern finishes and a prime location near shops and dining.",
  },
  {
    role: "agent",
    text: "What pricing strategy would you recommend?",
  },
  {
    role: "scout",
    text: "Based on 14 comparable sales within 0.8 miles over the past 90 days, a competitive listing range would be $410,000\u2013$425,000. Median price per sqft in this micro-market is $192. At $415k you\u2019d be positioned to generate multiple offers within 18 days on market.",
  },
  {
    role: "agent",
    text: "Create a social media post for the listing.",
  },
  {
    role: "scout",
    text: "Just listed in Winter Park. Beautiful 3-bedroom home with updated interiors and a private backyard perfect for entertaining. Priced to move. Message me for details or to schedule a private showing.",
  },
];

/* ── Phase state machine ──
   idle → (start) → agentDelay → agentShow → scoutThinking → scoutTyping → (next pair or done)
*/
type Phase =
  | "idle"
  | "agentDelay"
  | "agentShow"
  | "scoutThinking"
  | "scoutTyping"
  | "done";

/* ── Typing effect hook ── */
function useTypingEffect(
  fullText: string,
  isActive: boolean,
  speed: number = 16,
  onComplete?: () => void
) {
  const [displayed, setDisplayed] = useState("");
  const [isDone, setIsDone] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!isActive) {
      setDisplayed("");
      setIsDone(false);
      return;
    }

    let i = 0;
    setDisplayed("");
    setIsDone(false);

    const interval = setInterval(() => {
      i++;
      setDisplayed(fullText.slice(0, i));
      if (i >= fullText.length) {
        clearInterval(interval);
        setIsDone(true);
        onCompleteRef.current?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [fullText, isActive, speed]);

  return { displayed, isDone };
}

/* ── Pulsing dots ── */
function PulsingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: "var(--color-muted)" }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.2,
          }}
        />
      ))}
    </span>
  );
}

/* ── Thinking indicator ── */
function ThinkingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex items-center gap-3"
    >
      {/* Scout avatar */}
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
        style={{
          background: "var(--color-primary)",
          fontFamily: "Inter, sans-serif",
        }}
      >
        S
      </div>
      <div className="flex items-center gap-2">
        <span
          className="text-xs font-medium text-muted"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          Scout is thinking
        </span>
        <PulsingDots />
      </div>
    </motion.div>
  );
}

/* ── Agent bubble ── */
function AgentBubble({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex justify-end"
    >
      <div
        className="max-w-[80%] rounded-2xl rounded-br-md px-4 py-3 text-sm leading-relaxed"
        style={{
          background: "var(--color-primary)",
          color: "var(--color-text-light)",
        }}
      >
        {text}
      </div>
    </motion.div>
  );
}

/* ── Scout bubble with typing ── */
function ScoutTypingBubble({
  fullText,
  onComplete,
}: {
  fullText: string;
  onComplete: () => void;
}) {
  const { displayed, isDone } = useTypingEffect(fullText, true, 16, onComplete);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex justify-start"
    >
      <div
        className="max-w-[85%] rounded-2xl rounded-bl-md px-4 py-3 text-sm leading-relaxed text-foreground"
        style={{
          background: "var(--color-background)",
          border: "1px solid var(--color-border-light)",
        }}
      >
        {displayed}
        {!isDone && (
          <motion.span
            className="ml-0.5 inline-block h-3.5 w-[2px] align-text-bottom"
            style={{ background: "var(--color-primary)" }}
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
          />
        )}
      </div>
    </motion.div>
  );
}

/* ── Static scout bubble (already typed) ── */
function ScoutBubble({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex justify-start"
    >
      <div
        className="max-w-[85%] rounded-2xl rounded-bl-md px-4 py-3 text-sm leading-relaxed text-foreground"
        style={{
          background: "var(--color-background)",
          border: "1px solid var(--color-border-light)",
        }}
      >
        {text}
      </div>
    </motion.div>
  );
}

/* ── Main demo component ── */
export default function ScoutDemo({
  className = "",
}: {
  className?: string;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  // pairIndex tracks which agent/scout pair we're on (0, 1, 2)
  const [pairIndex, setPairIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  // Completed pairs stored for rendering
  const [completedPairs, setCompletedPairs] = useState<number[]>([]);

  const totalPairs = conversation.length / 2;

  // Auto-scroll
  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    });
  }, []);

  // Start when in view
  useEffect(() => {
    if (isInView && phase === "idle") {
      setPhase("agentDelay");
    }
  }, [isInView, phase]);

  // State machine
  useEffect(() => {
    if (phase === "idle" || phase === "done") return;
    if (pairIndex >= totalPairs) {
      setPhase("done");
      return;
    }

    let timer: ReturnType<typeof setTimeout>;

    switch (phase) {
      case "agentDelay":
        // Pause before showing agent message
        timer = setTimeout(
          () => {
            setPhase("agentShow");
            scrollToBottom();
          },
          pairIndex === 0 ? 500 : 1400
        );
        break;

      case "agentShow":
        // Show agent bubble, then start thinking
        timer = setTimeout(() => {
          setPhase("scoutThinking");
          scrollToBottom();
        }, 600);
        break;

      case "scoutThinking":
        // Show "Scout is thinking..." for 800–1200ms
        timer = setTimeout(() => {
          setPhase("scoutTyping");
          scrollToBottom();
        }, 900 + Math.random() * 400);
        break;

      case "scoutTyping":
        // Typing is handled by ScoutTypingBubble onComplete callback
        // No timer needed here
        break;
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [phase, pairIndex, totalPairs, scrollToBottom]);

  // Called when typing finishes
  const handleTypingComplete = useCallback(() => {
    setCompletedPairs((prev) => [...prev, pairIndex]);
    const nextPair = pairIndex + 1;
    if (nextPair >= totalPairs) {
      setPhase("done");
    } else {
      setPairIndex(nextPair);
      setPhase("agentDelay");
    }
    scrollToBottom();
  }, [pairIndex, totalPairs, scrollToBottom]);

  // Scroll when phase changes
  useEffect(() => {
    scrollToBottom();
  }, [phase, scrollToBottom]);

  // Derive what to render
  const agentMsgIndex = pairIndex * 2;
  const scoutMsgIndex = pairIndex * 2 + 1;

  return (
    <section
      ref={sectionRef}
      className={`px-4 py-24 sm:px-6 sm:py-32 lg:px-8 ${className}`}
    >
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <p
            className="mb-4 text-sm font-medium uppercase tracking-wider text-muted"
            style={{ letterSpacing: "0.08em" }}
          >
            AI-Powered
          </p>
          <h2
            className="text-heading mb-5 text-foreground"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Meet Scout
          </h2>
          <p className="text-lg leading-relaxed text-muted">
            Scout is the BearTeam AI assistant designed to help agents analyze
            deals, prepare listings, and move faster.
          </p>
        </motion.div>

        {/* Chat interface */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto max-w-2xl"
        >
          <div
            className="overflow-hidden"
            style={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-panel)",
              boxShadow: "var(--shadow-elevated)",
            }}
          >
            {/* Header bar */}
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: "1px solid var(--color-border-light)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-white"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  S
                </div>
                <div>
                  <p
                    className="text-sm font-semibold text-foreground"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Scout
                  </p>
                  <p className="text-xs text-muted">BearTeam AI Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-xs text-muted">Online</span>
              </div>
            </div>

            {/* Messages area */}
            <div
              ref={chatContainerRef}
              className="flex flex-col gap-4 overflow-y-auto p-6"
              style={{ minHeight: "340px", maxHeight: "520px" }}
            >
              {/* Completed pairs — rendered as static bubbles */}
              {completedPairs.map((pi) => {
                const aIdx = pi * 2;
                const sIdx = pi * 2 + 1;
                return (
                  <React.Fragment key={`pair-${pi}`}>
                    <AgentBubble text={conversation[aIdx].text} />
                    <ScoutBubble text={conversation[sIdx].text} />
                  </React.Fragment>
                );
              })}

              {/* Current pair — active animations */}
              <AnimatePresence mode="popLayout">
                {/* Agent bubble for current pair */}
                {(phase === "agentShow" ||
                  phase === "scoutThinking" ||
                  phase === "scoutTyping") &&
                  !completedPairs.includes(pairIndex) && (
                    <AgentBubble
                      key={`agent-${pairIndex}`}
                      text={conversation[agentMsgIndex].text}
                    />
                  )}

                {/* Thinking indicator */}
                {phase === "scoutThinking" && (
                  <ThinkingIndicator key={`thinking-${pairIndex}`} />
                )}

                {/* Scout typing bubble */}
                {phase === "scoutTyping" &&
                  !completedPairs.includes(pairIndex) && (
                    <ScoutTypingBubble
                      key={`scout-${pairIndex}`}
                      fullText={conversation[scoutMsgIndex].text}
                      onComplete={handleTypingComplete}
                    />
                  )}
              </AnimatePresence>

              {/* Empty state */}
              {phase === "idle" && (
                <div className="flex flex-1 items-center justify-center py-12">
                  <p className="text-sm text-muted/40">
                    Scroll to see Scout in action
                  </p>
                </div>
              )}
            </div>

            {/* Input bar */}
            <div
              className="flex items-center gap-3 px-6 py-4"
              style={{ borderTop: "1px solid var(--color-border-light)" }}
            >
              <div
                className="flex-1 rounded-xl px-4 py-2.5 text-sm text-muted"
                style={{
                  background: "var(--color-background)",
                  border: "1px solid var(--color-border-light)",
                }}
              >
                Ask Scout anything...
              </div>
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                style={{
                  background: "var(--color-primary)",
                  cursor: "default",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M14 2L7 9M14 2L9.5 14L7 9M14 2L2 6.5L7 9"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Try Scout Live CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mx-auto mt-8 max-w-2xl text-center"
        >
          <a
            href="/chat"
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{
              background: "var(--color-primary)",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Try Scout Live
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M1 7h12M8 2l5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </motion.div>

        {/* Capabilities row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mt-12 grid max-w-2xl grid-cols-2 gap-6 sm:grid-cols-4"
        >
          {[
            "Deal analysis",
            "Listing preparation",
            "Market insights",
            "Production tracking",
          ].map((capability) => (
            <div key={capability} className="text-center">
              <p
                className="text-sm font-medium text-foreground"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {capability}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
