import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, Download, Filter, GitCompareArrows, Tags, UsersRound, SlidersHorizontal } from "lucide-react";

import PageTransition from "../components/PageTransition.jsx";
import { CardSkeleton, Skeleton } from "../components/Skeleton.jsx";
import { apiFetch, downloadCsv } from "../services/api.js";

const chartColors = ["#8b5cf6", "#818cf8", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4"];

function tooltipStyle() {
  return {
    background: "#1a1a24",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "8px",
    color: "#f8fafc",
  };
}

function StatCard({ title, value, icon: Icon }) {
  return (
    <article className="glass-panel rounded-lg p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-400">{title}</p>
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-violet-500/15 text-violet-200">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="text-3xl font-extrabold text-white">{value?.toLocaleString?.() ?? value}</p>
    </article>
  );
}

function ChartShell({ title, children }) {
  return (
    <section className="glass-panel rounded-lg p-5">
      <h2 className="mb-4 text-lg font-bold text-white">{title}</h2>
      <div className="h-72">{children}</div>
    </section>
  );
}

export default function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [wins, setWins] = useState([]);
  const [rubricStats, setRubricStats] = useState({});
  const [labels, setLabels] = useState([]);
  const [daily, setDaily] = useState([]);
  const [recent, setRecent] = useState([]);
  const [filter, setFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRecentLoading, setIsRecentLoading] = useState(false);

  const radarData = useMemo(
    () =>
      Object.entries(rubricStats).map(([dimension, score]) => ({
        dimension: dimension.charAt(0).toUpperCase() + dimension.slice(1),
        score,
      })),
    [rubricStats],
  );

  async function loadRecent(nextFilter = filter) {
    setIsRecentLoading(true);
    try {
      const suffix = nextFilter ? `?task_type=${nextFilter}` : "";
      const data = await apiFetch(`/api/stats/recent${suffix}`);
      setRecent(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsRecentLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;
    async function loadDashboard() {
      setIsLoading(true);
      try {
        const [overviewData, winsData, rubricData, labelData, dailyData, recentData] = await Promise.all([
          apiFetch("/api/stats/overview"),
          apiFetch("/api/stats/compare-wins"),
          apiFetch("/api/feedback/rubric/stats"),
          apiFetch("/api/feedback/label/distribution"),
          apiFetch("/api/stats/daily"),
          apiFetch("/api/stats/recent"),
        ]);
        if (ignore) return;
        setOverview(overviewData);
        setWins(winsData);
        setRubricStats(rubricData);
        setLabels(labelData);
        setDaily(dailyData);
        setRecent(recentData);
      } catch (error) {
        toast.error(error.message);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    loadDashboard();
    return () => {
      ignore = true;
    };
  }, []);

  async function handleExport(path, filename) {
    try {
      await downloadCsv(path, filename);
      toast.success("CSV export started");
    } catch (error) {
      toast.error(error.message);
    }
  }

  function updateFilter(nextFilter) {
    setFilter(nextFilter);
    loadRecent(nextFilter);
  }

  return (
    <PageTransition>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-normal text-violet-200">Analytics Dashboard</p>
          <h1 className="mt-2 text-3xl font-extrabold text-white">Annotation Operations</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleExport("/api/export/compare", "alignlab_comparisons.csv")}
            className="focus-ring inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-bold text-slate-200 hover:border-violet-300/50 hover:text-white"
          >
            <Download className="h-4 w-4" />
            Export Comparisons CSV
          </button>
          <button
            type="button"
            onClick={() => handleExport("/api/export/rubric", "alignlab_rubric.csv")}
            className="focus-ring inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-bold text-slate-200 hover:border-violet-300/50 hover:text-white"
          >
            <Download className="h-4 w-4" />
            Export Rubric Ratings CSV
          </button>
          <button
            type="button"
            onClick={() => handleExport("/api/export/labels", "alignlab_labels.csv")}
            className="focus-ring inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-bold text-slate-200 hover:border-violet-300/50 hover:text-white"
          >
            <Download className="h-4 w-4" />
            Export Labels CSV
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <CardSkeleton key={index} rows={2} />
            ))}
          </div>
          <div className="grid gap-5 xl:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <CardSkeleton key={index} rows={7} />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Comparisons Collected"
              value={overview?.total_comparisons || 0}
              icon={GitCompareArrows}
            />
            <StatCard title="Total Rubric Ratings" value={overview?.total_rubric_ratings || 0} icon={SlidersHorizontal} />
            <StatCard title="Total Labels Applied" value={overview?.total_labels || 0} icon={Tags} />
            <StatCard title="Active Annotators Today" value={overview?.active_annotators_today || 0} icon={UsersRound} />
          </section>

          <section className="grid gap-5 xl:grid-cols-2">
            <ChartShell title="Response A vs B Win Rate">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wins}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                  <Tooltip contentStyle={tooltipStyle()} />
                  <Bar dataKey="A" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="B" fill="#818cf8" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Tie" fill="#64748b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartShell>

            <ChartShell title="Average Rubric Scores">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.14)" />
                  <PolarAngleAxis dataKey="dimension" stroke="#cbd5e1" />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} stroke="#64748b" />
                  <Radar dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.45} />
                  <Tooltip contentStyle={tooltipStyle()} />
                </RadarChart>
              </ResponsiveContainer>
            </ChartShell>

            <ChartShell title="Label Distribution">
              {labels.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={labels} dataKey="count" nameKey="label" outerRadius={96} label>
                      {labels.map((entry, index) => (
                        <Cell key={entry.label} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle()} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="grid h-full place-items-center text-sm text-slate-500">No labels collected yet.</div>
              )}
            </ChartShell>

            <ChartShell title="Daily Annotation Activity">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={daily}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle()} />
                  <Line type="monotone" dataKey="total" stroke="#8b5cf6" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="comparisons" stroke="#818cf8" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="ratings" stroke="#22c55e" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="labels" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartShell>
          </section>

          <section className="glass-panel rounded-lg p-5">
            <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-violet-200" />
                <h2 className="text-lg font-bold text-white">Recent Activity</h2>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-500" />
                <select
                  value={filter}
                  onChange={(event) => updateFilter(event.target.value)}
                  className="focus-ring rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-slate-200"
                >
                  <option value="">All task types</option>
                  <option value="comparison">Comparison</option>
                  <option value="rubric">Rubric</option>
                  <option value="label">Label</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-white/10 text-xs uppercase tracking-normal text-slate-500">
                  <tr>
                    <th className="py-3 pr-4">Annotator</th>
                    <th className="py-3 pr-4">Task Type</th>
                    <th className="py-3 pr-4">Prompt Preview</th>
                    <th className="py-3 pr-4">Result</th>
                    <th className="py-3 pr-4">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {isRecentLoading ? (
                    <tr>
                      <td colSpan="5" className="py-6">
                        <Skeleton className="h-8 w-full" />
                      </td>
                    </tr>
                  ) : recent.length ? (
                    recent.map((row, index) => (
                      <tr key={`${row.task_type}-${row.time}-${index}`} className="text-slate-300">
                        <td className="py-3 pr-4 font-semibold text-white">{row.annotator}</td>
                        <td className="py-3 pr-4 capitalize">{row.task_type}</td>
                        <td className="max-w-md py-3 pr-4 text-slate-400">{row.prompt_preview}</td>
                        <td className="py-3 pr-4">{row.result}</td>
                        <td className="py-3 pr-4 text-slate-500">{new Date(row.time).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-500">
                        No recent annotations.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </PageTransition>
  );
}
