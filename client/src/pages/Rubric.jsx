import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { RefreshCw, Send, SlidersHorizontal } from "lucide-react";

import PageTransition from "../components/PageTransition.jsx";
import { CardSkeleton, Skeleton } from "../components/Skeleton.jsx";
import { prompts } from "../data/prompts.js";
import { apiFetch } from "../services/api.js";

const dimensions = [
  { key: "helpfulness", label: "Helpfulness", weight: 0.25 },
  { key: "accuracy", label: "Accuracy", weight: 0.25 },
  { key: "safety", label: "Safety", weight: 0.2 },
  { key: "clarity", label: "Clarity", weight: 0.15 },
  { key: "conciseness", label: "Conciseness", weight: 0.15 },
];

const defaultScores = {
  helpfulness: 3,
  accuracy: 3,
  safety: 3,
  clarity: 3,
  conciseness: 3,
};

export default function Rubric() {
  const [item, setItem] = useState(null);
  const [scores, setScores] = useState(defaultScores);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasLoaded = useRef(false);

  const overall = useMemo(
    () => dimensions.reduce((sum, dimension) => sum + scores[dimension.key] * dimension.weight, 0).toFixed(2),
    [scores],
  );

  async function loadResponse() {
    setIsLoading(true);
    try {
      const prompt = prompts[Math.floor(Math.random() * prompts.length)];
      const data = await apiFetch("/api/generate-single", {
        method: "POST",
        body: { prompt },
      });
      setItem(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    loadResponse();
  }, []);

  async function submitRating(event) {
    event.preventDefault();
    if (!item) return;
    setIsSubmitting(true);
    try {
      await apiFetch("/api/feedback/rubric", {
        method: "POST",
        body: {
          prompt: item.prompt,
          response: item.response,
          ...scores,
          comment: comment.trim() || null,
        },
      });
      toast.success("Rubric rating saved");
      setScores(defaultScores);
      setComment("");
      await loadResponse();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageTransition>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-normal text-violet-200">Response Rubric Rating</p>
          <h1 className="mt-2 text-3xl font-extrabold text-white">Evaluation Rubric</h1>
        </div>
        <button
          type="button"
          onClick={loadResponse}
          disabled={isLoading || isSubmitting}
          className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-3 text-sm font-bold text-slate-200 hover:border-violet-400/60 hover:text-white"
        >
          <RefreshCw className="h-4 w-4" />
          New Response
        </button>
      </div>

      {isLoading ? (
        <div className="grid gap-5 xl:grid-cols-[1fr_26rem]">
          <CardSkeleton rows={9} />
          <CardSkeleton rows={8} />
        </div>
      ) : item ? (
        <form onSubmit={submitRating} className="grid gap-5 xl:grid-cols-[1fr_26rem]">
          <AnimatePresence mode="wait">
            <motion.section
              key={item.prompt_id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22 }}
              className="glass-panel rounded-lg p-5"
            >
              <div className="mb-4 rounded-lg border border-white/10 bg-black/20 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-normal text-slate-500">Prompt</p>
                <p className="text-sm leading-6 text-slate-200">{item.prompt}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-panel p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="text-lg font-bold text-white">AI Response</h2>
                  <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-xs font-bold text-violet-200">
                    {item.provider}
                  </span>
                </div>
                <p className="max-h-[34rem] overflow-y-auto whitespace-pre-line text-sm leading-7 text-slate-300">
                  {item.response}
                </p>
              </div>
            </motion.section>
          </AnimatePresence>

          <aside className="glass-panel rounded-lg p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-400">Overall Score</p>
                <p className="text-4xl font-extrabold text-white">{overall}</p>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-lg bg-violet-500/15 text-violet-200">
                <SlidersHorizontal className="h-6 w-6" />
              </div>
            </div>

            <div className="space-y-5">
              {dimensions.map((dimension) => (
                <div key={dimension.key}>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-semibold text-white" htmlFor={dimension.key}>
                      {dimension.label}
                    </label>
                    <span className="rounded-full bg-white/10 px-2 py-1 text-xs font-bold text-slate-200">
                      {scores[dimension.key]}
                    </span>
                  </div>
                  <input
                    id={dimension.key}
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={scores[dimension.key]}
                    onChange={(event) =>
                      setScores((current) => ({
                        ...current,
                        [dimension.key]: Number(event.target.value),
                      }))
                    }
                    className="w-full accent-violet-500"
                  />
                  <div className="mt-1 grid grid-cols-3 text-[11px] font-medium text-slate-500">
                    <span>1 Poor</span>
                    <span className="text-center">3 Average</span>
                    <span className="text-right">5 Excellent</span>
                  </div>
                </div>
              ))}
            </div>

            <label className="mb-2 mt-6 block text-sm font-semibold text-slate-300" htmlFor="comment">
              Optional feedback / reason for your ratings
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              className="focus-ring min-h-28 w-full resize-y rounded-lg border border-white/10 bg-black/20 p-3 text-sm leading-6 text-white placeholder:text-slate-600"
              placeholder="Add concise rationale"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="focus-ring mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-violet-500 px-4 py-3 text-sm font-bold text-white hover:bg-violet-400"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? "Saving..." : "Submit Rating"}
            </button>
          </aside>
        </form>
      ) : (
        <div className="glass-panel rounded-lg p-8 text-center text-slate-400">
          <Skeleton className="mx-auto mb-4 h-6 w-48" />
          No response is available right now.
        </div>
      )}
    </PageTransition>
  );
}
