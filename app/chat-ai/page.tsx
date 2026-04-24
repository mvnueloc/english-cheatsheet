"use client";

import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRef, useEffect, useState } from "react";
import { IconSend, IconSparkles } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

const SUGGESTIONS = [
  "Practice ordering a coffee.",
  "Simulate a conversation to meet someone new.",
  "Talk about hobbies and interests.",
  "Practice a job interview.",
];

export default function ChatPage() {
  const { messages, status, sendMessage } = useChat({
    onError: (e) => console.error("UI useChat Error:", e),
  });

  const isLoading = status === "submitted" || status === "streaming";
  const [input, setInput] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSuggestionClick = (suggestion: string) => {
    if (sendMessage) {
      sendMessage({
        id: Date.now().toString(),
        role: "user",
        parts: [{ type: "text", text: suggestion }],
      } as import("ai").UIMessage);
    }
  };

  const renderTextContent = (m: import("ai").UIMessage) => {
    if (m.parts && m.parts.length > 0) {
      return m.parts
        .filter((p) => p.type === "text")
        .map((p) => (p as { type: "text"; text: string }).text)
        .join("\n");
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    return (m as any).content || (m as any).text || "";
  };

  const submitForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input?.trim() || isLoading) return;
    if (sendMessage) {
      sendMessage({
        id: Date.now().toString(),
        role: "user",
        parts: [{ type: "text", text: input }],
      } as import("ai").UIMessage);
    }
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-neutral-50 bg-gradient-to-t from-cyan-500/10 via-transparent to-transparent dark:bg-neutral-900 dark:from-cyan-500/15 border-l border-neutral-200 dark:border-neutral-800">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <motion.div
              animate={{ y: [0, -10, 0], scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 text-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.3)] rounded-full flex items-center justify-center">
              <IconSparkles size={32} />
            </motion.div>
            <motion.div
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{
                repeat: Infinity,
                duration: 3,
                ease: "easeInOut",
                delay: 1.5,
              }}>
              <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100">
                AI Chatbot
              </h2>
              <p className="text-sm text-neutral-500 mt-2 max-w-md">
                Pregúntame dudas de inglés o cualquier otra cosa.
              </p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg mt-8">
              {SUGGESTIONS.map((suggestion, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="p-3 text-sm text-left border border-neutral-200 dark:border-neutral-800 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto w-full pb-20 pt-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "flex w-full",
                  m.role === "user" ? "justify-end" : "justify-start",
                )}>
                <div
                  className={cn(
                    "px-4 py-3 max-w-[85%] rounded-2xl text-sm whitespace-pre-wrap flex flex-col gap-1",
                    m.role === "user"
                      ? "bg-neutral-800 text-white rounded-br-sm"
                      : "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-bl-sm",
                  )}>
                  {m.role === "assistant" && (
                    <div className="flex items-center gap-2 mb-1 opacity-60">
                      <IconSparkles size={14} />
                      <span className="font-semibold text-xs">AI</span>
                    </div>
                  )}
                  {renderTextContent(m)}
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex w-full justify-start">
                <div className="px-4 py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl rounded-bl-sm text-neutral-500 text-xs flex items-center shadow-sm h-11">
                  Escribiendo...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="p-4 bg-transparent border-t border-neutral-200 dark:border-neutral-800">
        <form
          onSubmit={submitForm}
          className="max-w-3xl mx-auto relative flex items-center shadow-sm rounded-xl">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Mensaje..."
            className="min-h-[50px] w-full resize-none pr-12 rounded-xl pt-3 bg-white dark:bg-neutral-800/80 border-neutral-300 dark:border-neutral-600 shadow-md backdrop-blur-md focus-visible:ring-cyan-500/50 focus-visible:border-cyan-500"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submitForm(e as unknown as React.FormEvent<HTMLFormElement>);
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input?.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg shrink-0">
            <IconSend size={16} />
          </Button>
        </form>
      </div>
    </div>
  );
}
