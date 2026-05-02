import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Medal, Trophy } from "lucide-react";

import PageTransition from "../components/PageTransition.jsx";
import { CardSkeleton } from "../components/Skeleton.jsx";
import { apiFetch } from "../services/api.js";

const badgeStyles = {
  1: "border-yellow-300/30 bg-yellow-400/15 text-yellow-200",
  2: "border-slate-300/30 bg-slate-300/15 text-slate-200",
  3: "border-amber-700/30 bg-amber-700/20 text-amber-200",
};

export default function Leaderboard() {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function loadLeaderboard() {
      try {
        const data = await apiFetch("/api/stats/leaderboard");
        if (!ignore) setRows(data);
      } catch (error) {
        toast.error(error.message);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    loadLeaderboard();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <PageTransition>
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-normal text-violet-200">Leaderboard</p>
        <h1 className="mt-2 text-3xl font-extrabold text-white">Weekly Annotator Rankings</h1>
      </div>

      {isLoading ? (
        <CardSkeleton rows={10} />
      ) : (
        <section className="glass-panel rounded-lg p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-violet-500/15 text-violet-200">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Annotation Score</h2>
              <p className="text-sm text-slate-500">Comparisons + ratings + labels this week</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-white/10 text-xs uppercase tracking-normal text-slate-500">
                <tr>
                  <th className="py-3 pr-4">Rank</th>
                  <th className="py-3 pr-4">Username</th>
                  <th className="py-3 pr-4">Comparisons</th>
                  <th className="py-3 pr-4">Ratings</th>
                  <th className="py-3 pr-4">Labels</th>
                  <th className="py-3 pr-4">Total Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {rows.length ? (
                  rows.map((row) => (
                    <tr key={row.username} className="text-slate-300">
                      <td className="py-4 pr-4">
                        <motion.span
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 320, damping: 20, delay: row.rank * 0.04 }}
                          className={[
                            "inline-flex min-w-12 items-center justify-center gap-1 rounded-full border px-3 py-1 text-sm font-extrabold",
                            badgeStyles[row.rank] || "border-white/10 bg-white/[0.04] text-slate-300",
                          ].join(" ")}
                        >
                          {row.rank <= 3 && <Medal className="h-4 w-4" />}
                          {row.rank}
                        </motion.span>
                      </td>
                      <td className="py-4 pr-4 font-bold text-white">{row.username}</td>
                      <td className="py-4 pr-4">{row.comparisons}</td>
                      <td className="py-4 pr-4">{row.ratings}</td>
                      <td className="py-4 pr-4">{row.labels}</td>
                      <td className="py-4 pr-4 text-lg font-extrabold text-violet-200">{row.total_score}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-10 text-center text-slate-500">
                      No leaderboard data yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </PageTransition>
  );
}
