import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, RefreshCw, Shuffle, SkipForward, Sparkles, ThumbsUp } from "lucide-react";

import PageTransition from "../components/PageTransition.jsx";
import { CardSkeleton } from "../components/Skeleton.jsx";
import { prompts } from "../data/prompts.js";
import { apiFetch } from "../services/api.js";

function wordCount(text = "") {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function ResponseCard({ label, text, onPrefer, disabled }) {
  return (
    <article className="flex min-h-[26rem] flex-col rounded-lg border border-white/10 bg-panel p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-white">Response {label}</h2>
        <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-xs font-bold text-violet-200">
          {wordCount(text)} words
        </span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-white/10 bg-black/20 p-4 text-sm leading-7 text-slate-300">
        {text}
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={onPrefer}
        className="focus-ring mt-4 flex items-center justify-center gap-2 rounded-lg bg-violet-500 px-4 py-3 text-sm font-bold text-white hover:bg-violet-400"
      >
        <ThumbsUp className="h-4 w-4" />
        Prefer This
      </button>
    </article>
  );
}

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 18 }, (_, index) => ({
        id: index,
        x: (index % 6) * 18 - 45,
        color: ["#8b5cf6", "#818cf8", "#22c55e", "#facc15"][index % 4],
      })),
    [],
  );

  return (
    <div className="pointer-events-none absolute left-1/2 top-8">
      {pieces.map((piece) => (
        <motion.span
          key={piece.id}
          initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          animate={{ opacity: 0, x: piece.x, y: 80 + (piece.id % 5) * 10, scale: 0.5, rotate: 160 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="absolute h-2 w-2 rounded-sm"
          style={{ background: piece.color }}
        />
      ))}
    </div>
  );
}

export default function Compare() {
  const [prompt, setPrompt] = useState("");
  const [comparison, setComparison] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [completed, setCompleted] = useState(false);

  function pickRandomPrompt() {
    const nextPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    setPrompt(nextPrompt);
  }

  async function generate(nextPrompt = prompt) {
    setCompleted(false);
    setIsGenerating(true);
    try {
      const data = await apiFetch("/api/generate", {
        method: "POST",
        body: { prompt: nextPrompt },
      });
      setComparison(data);
      setPrompt(data.prompt);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsGenerating(false);
    }
  }

  async function savePreference(preferred, skipped = false) {
    if (!comparison) return;
    setIsSaving(true);
    try {
      await apiFetch("/api/feedback/compare", {
        method: "POST",
        body: {
          prompt: comparison.prompt,
          response_a: comparison.response_a,
          response_b: comparison.response_b,
          preferred,
          skipped,
        },
      });
      setCompleted(true);
      toast.success(skipped ? "Skipped" : "Preference saved");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function nextComparison() {
    const nextPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    setPrompt(nextPrompt);
    await generate(nextPrompt);
  }

  return (
    <PageTransition>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-normal text-violet-200">Pairwise Comparison</p>
          <h1 className="mt-2 text-3xl font-extrabold text-white">RLHF Preference Collection</h1>
        </div>
        <button
          type="button"
          onClick={nextComparison}
          disabled={isGenerating}
          className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-3 text-sm font-bold text-slate-200 hover:border-violet-400/60 hover:text-white"
        >
          <RefreshCw className="h-4 w-4" />
          Next Comparison
        </button>
      </div>

      <section className="glass-panel mb-5 rounded-lg p-4">
        <label className="mb-2 block text-sm font-semibold text-slate-300" htmlFor="prompt">
          Prompt
        </label>
        <textarea
          id="prompt"
          className="focus-ring min-h-28 w-full resize-y rounded-lg border border-white/10 bg-black/20 p-3 text-sm leading-6 text-white placeholder:text-slate-600"
          placeholder="Enter a prompt for Response A and Response B"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
        />
        <div className="mt-3 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={pickRandomPrompt}
            className="focus-ring inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 hover:border-indigo-300/50 hover:text-white"
          >
            <Shuffle className="h-4 w-4" />
            Random Prompt
          </button>
          <button
            type="button"
            onClick={() => generate()}
            disabled={isGenerating}
            className="focus-ring inline-flex items-center gap-2 rounded-lg bg-violet-500 px-4 py-2 text-sm font-bold text-white hover:bg-violet-400"
          >
            <Sparkles className="h-4 w-4" />
            {isGenerating ? "Generating..." : "Generate Responses"}
          </button>
        </div>
      </section>

      {isGenerating ? (
        <div className="grid gap-4 xl:grid-cols-2">
          <CardSkeleton rows={8} />
          <CardSkeleton rows={8} />
        </div>
      ) : comparison ? (
        <section className="relative">
          <AnimatePresence>
            {completed && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="glass-panel relative mb-5 overflow-hidden rounded-lg p-5"
              >
                <Confetti />
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-8 w-8 text-emerald-300" />
                    <div>
                      <h2 className="text-lg font-bold text-white">Great! Your feedback helps align AI</h2>
                      <p className="text-sm text-slate-400">Saved as {comparison.provider === "claude" ? "Claude" : "offline mock"} data.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={nextComparison}
                    className="focus-ring rounded-lg bg-white px-4 py-3 text-sm font-bold text-slate-950 hover:bg-violet-100"
                  >
                    Next Comparison
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid gap-4 xl:grid-cols-2">
            <ResponseCard
              label="A"
              text={comparison.response_a}
              disabled={isSaving || completed}
              onPrefer={() => savePreference("A")}
            />
            <ResponseCard
              label="B"
              text={comparison.response_b}
              disabled={isSaving || completed}
              onPrefer={() => savePreference("B")}
            />
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              disabled={isSaving || completed}
              onClick={() => savePreference("TIE")}
              className="focus-ring rounded-lg border border-white/10 px-4 py-3 text-sm font-bold text-slate-200 hover:border-violet-400/60 hover:text-white"
            >
              Too Close to Call
            </button>
            <button
              type="button"
              disabled={isSaving || completed}
              onClick={() => savePreference(null, true)}
              className="focus-ring inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-3 text-sm font-bold text-slate-400 hover:border-white/20 hover:text-white"
            >
              <SkipForward className="h-4 w-4" />
              Skip
            </button>
          </div>
        </section>
      ) : (
        <div className="glass-panel rounded-lg p-8 text-center text-slate-400">
          Enter a prompt or draw a random one to start a comparison.
        </div>
      )}
    </PageTransition>
  );
}
