import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { ArrowRight, GitCompareArrows, SlidersHorizontal, Tags } from "lucide-react";

import PageTransition from "../components/PageTransition.jsx";
import { Skeleton } from "../components/Skeleton.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { apiFetch } from "../services/api.js";

const tasks = [
  {
    key: "comparisons",
    title: "Pairwise Comparison",
    category: "RLHF",
    description: "Choose which model answer best satisfies the prompt.",
    href: "/compare",
    icon: GitCompareArrows,
  },
  {
    key: "ratings",
    title: "Response Rubric Rating",
    category: "Evals",
    description: "Score generated answers across five quality dimensions.",
    href: "/rubric",
    icon: SlidersHorizontal,
  },
  {
    key: "labels",
    title: "Text Labeling",
    category: "SFT",
    description: "Classify examples and tag important spans for dataset curation.",
    href: "/label",
    icon: Tags,
  },
];

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function loadStats() {
      try {
        const data = await apiFetch("/api/stats/me/today");
        if (!ignore) setStats(data);
      } catch (error) {
        toast.error(error.message);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    loadStats();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <PageTransition>
      <section className="mb-6 rounded-lg border border-violet-400/20 bg-violet-500/10 p-5 shadow-glow sm:p-7">
        <p className="text-sm font-semibold uppercase tracking-normal text-violet-200">Annotation Console</p>
        <h1 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">Welcome to AlignLab, {user?.username}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
          Collect preference data, evaluate model behavior, and prepare supervised fine-tuning examples from one
          focused workspace.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {tasks.map((task, index) => {
          const Icon = task.icon;
          return (
            <motion.article
              key={task.key}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              whileHover={{ y: -5, scale: 1.01 }}
              className="glass-panel rounded-lg p-5"
            >
              <div className="mb-5 flex items-center justify-between gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-lg bg-violet-500/15 text-violet-200">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="rounded-full border border-indigo-300/20 bg-indigo-400/10 px-3 py-1 text-xs font-bold text-indigo-200">
                  {task.category}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white">{task.title}</h2>
              <p className="mt-2 min-h-12 text-sm leading-6 text-slate-400">{task.description}</p>
              <div className="mt-5 rounded-lg border border-white/10 bg-black/15 p-3">
                <p className="text-xs font-medium uppercase tracking-normal text-slate-500">Completed Today</p>
                {isLoading ? (
                  <Skeleton className="mt-2 h-8 w-20" />
                ) : (
                  <p className="mt-1 text-3xl font-extrabold text-white">{stats?.[task.key] ?? 0}</p>
                )}
              </div>
              <Link
                to={task.href}
                className="focus-ring mt-5 flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-bold text-slate-950 hover:bg-violet-100"
              >
                Start Task
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.article>
          );
        })}
      </div>
    </PageTransition>
  );
}
