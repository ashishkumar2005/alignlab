import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Ban, CheckCircle2, MessageCircle, Repeat, Send, Sparkles, Tags } from "lucide-react";

import PageTransition from "../components/PageTransition.jsx";
import { textSamples } from "../data/samples.js";
import { apiFetch } from "../services/api.js";

const labelOptions = [
  { label: "Helpful", icon: CheckCircle2, tone: "text-emerald-200 border-emerald-300/20 bg-emerald-400/10" },
  { label: "Needs Improvement", icon: AlertTriangle, tone: "text-amber-200 border-amber-300/20 bg-amber-400/10" },
  { label: "Harmful", icon: Ban, tone: "text-rose-200 border-rose-300/20 bg-rose-400/10" },
  { label: "Off-Topic", icon: MessageCircle, tone: "text-sky-200 border-sky-300/20 bg-sky-400/10" },
  { label: "Repetitive", icon: Repeat, tone: "text-indigo-200 border-indigo-300/20 bg-indigo-400/10" },
  { label: "Excellent", icon: Sparkles, tone: "text-violet-200 border-violet-300/20 bg-violet-400/10" },
];

const spanTags = ["Helpful span", "Needs work", "Safety issue", "Off-topic", "Repetition"];

function pickSample() {
  return textSamples[Math.floor(Math.random() * textSamples.length)];
}

function renderHighlightedText(text, spans) {
  if (!spans.length) return text;
  const sorted = [...spans].sort((a, b) => a.start - b.start);
  const parts = [];
  let cursor = 0;
  sorted.forEach((span, index) => {
    if (span.start < cursor) return;
    if (span.start > cursor) {
      parts.push(text.slice(cursor, span.start));
    }
    parts.push(
      <mark key={`${span.start}-${index}`} className="rounded bg-violet-400/30 px-1 text-violet-50">
        {text.slice(span.start, span.end)}
      </mark>,
    );
    cursor = span.end;
  });
  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts;
}

export default function Label() {
  const [sample, setSample] = useState(() => pickSample());
  const [selectedLabel, setSelectedLabel] = useState("");
  const [spans, setSpans] = useState([]);
  const [draftSpan, setDraftSpan] = useState(null);
  const [todayCount, setTodayCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const paragraphRef = useRef(null);
  const hasLoaded = useRef(false);

  const progress = useMemo(() => Math.min(100, Math.round((todayCount / 50) * 100)), [todayCount]);

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    apiFetch("/api/stats/me/today")
      .then((data) => setTodayCount(data.labels || 0))
      .catch((error) => toast.error(error.message));
  }, []);

  function handleSelection() {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();
    if (!selectedText || !paragraphRef.current) return;
    if (!paragraphRef.current.contains(selection.anchorNode) || !paragraphRef.current.contains(selection.focusNode)) {
      return;
    }
    const start = sample.indexOf(selectedText);
    if (start < 0) return;
    setDraftSpan({
      start,
      end: start + selectedText.length,
      text: selectedText,
    });
  }

  function addSpan(tag) {
    if (!draftSpan) return;
    setSpans((current) => [...current, { ...draftSpan, tag }]);
    setDraftSpan(null);
    window.getSelection()?.removeAllRanges();
  }

  function nextSample() {
    setSample(pickSample());
    setSelectedLabel("");
    setSpans([]);
    setDraftSpan(null);
  }

  async function submitLabel() {
    if (!selectedLabel) {
      toast.error("Select a label first");
      return;
    }
    setIsSubmitting(true);
    try {
      await apiFetch("/api/feedback/label", {
        method: "POST",
        body: {
          text_sample: sample,
          label: selectedLabel,
          highlighted_spans: spans,
        },
      });
      toast.success("Label saved");
      setTodayCount((count) => count + 1);
      nextSample();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageTransition>
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-normal text-violet-200">Text Labeling</p>
        <h1 className="mt-2 text-3xl font-extrabold text-white">SFT Dataset Curation</h1>
      </div>

      <div className="mb-5 rounded-lg border border-white/10 bg-panel p-4">
        <div className="mb-2 flex items-center justify-between gap-4 text-sm">
          <span className="font-semibold text-white">{todayCount} of 50 samples labeled today</span>
          <span className="font-bold text-violet-200">{progress}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-violet-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.35 }}
          />
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_24rem]">
        <AnimatePresence mode="wait">
          <motion.section
            key={sample}
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -32 }}
            transition={{ duration: 0.24 }}
            className="glass-panel rounded-lg p-5"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-white">Text Sample</h2>
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-violet-500/15 text-violet-200">
                <Tags className="h-5 w-5" />
              </div>
            </div>
            <p
              ref={paragraphRef}
              onMouseUp={handleSelection}
              className="min-h-52 rounded-lg border border-white/10 bg-black/20 p-5 text-lg leading-9 text-slate-200"
            >
              {renderHighlightedText(sample, spans)}
            </p>

            {draftSpan && (
              <div className="mt-4 rounded-lg border border-violet-400/20 bg-violet-500/10 p-3">
                <p className="mb-3 text-sm font-semibold text-violet-100">Tag selected span</p>
                <div className="flex flex-wrap gap-2">
                  {spanTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addSpan(tag)}
                      className="focus-ring rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-slate-200 hover:border-violet-300/50 hover:text-white"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {spans.map((span, index) => (
                <span
                  key={`${span.start}-${span.end}-${index}`}
                  className="rounded-full border border-violet-300/20 bg-violet-400/10 px-3 py-1 text-xs font-semibold text-violet-100"
                >
                  {span.tag}: {span.text}
                </span>
              ))}
            </div>
          </motion.section>
        </AnimatePresence>

        <aside className="glass-panel rounded-lg p-5">
          <h2 className="mb-4 text-lg font-bold text-white">Apply Label</h2>
          <div className="grid gap-3">
            {labelOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedLabel === option.label;
              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setSelectedLabel(option.label)}
                  className={[
                    "focus-ring flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm font-bold",
                    option.tone,
                    isSelected ? "ring-2 ring-violet-300/60" : "",
                  ].join(" ")}
                >
                  <Icon className="h-5 w-5" />
                  {option.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={submitLabel}
            className="focus-ring mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-violet-500 px-4 py-3 text-sm font-bold text-white hover:bg-violet-400"
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? "Saving..." : "Submit Label"}
          </button>
        </aside>
      </div>
    </PageTransition>
  );
}
