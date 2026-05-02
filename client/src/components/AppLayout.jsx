import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  BarChart3,
  GitCompareArrows,
  Home,
  LogOut,
  Menu,
  PanelLeftClose,
  Shield,
  SlidersHorizontal,
  Tags,
  Trophy,
  UserRound,
} from "lucide-react";

import { useAuth } from "../context/AuthContext.jsx";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/compare", label: "Pairwise", icon: GitCompareArrows },
  { to: "/rubric", label: "Rubric", icon: SlidersHorizontal },
  { to: "/label", label: "Labeling", icon: Tags },
  { to: "/dashboard", label: "Dashboard", icon: BarChart3, admin: true },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
];

function Sidebar({ onNavigate }) {
  const { logout, user } = useAuth();

  return (
    <aside className="flex h-full w-72 flex-col border-r border-white/10 bg-[#111119]/95 p-4 backdrop-blur">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-violet-500 text-lg font-black text-white">
          A
        </div>
        <div>
          <p className="text-lg font-extrabold tracking-normal text-white">AlignLab</p>
          <p className="text-xs font-medium text-slate-500">Preference Ops</p>
        </div>
      </div>

      <nav className="space-y-1">
        {navItems
          .filter((item) => !item.admin || user?.role === "admin")
          .map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={onNavigate}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold focus-ring",
                    isActive
                      ? "bg-violet-500 text-white shadow-glow"
                      : "text-slate-400 hover:bg-white/5 hover:text-white",
                  ].join(" ")
                }
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
                {item.admin && <Shield className="ml-auto h-4 w-4" />}
              </NavLink>
            );
          })}
      </nav>

      <div className="mt-auto rounded-lg border border-white/10 bg-white/[0.03] p-3">
        <div className="mb-3 flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-400/15 text-indigo-200">
            <UserRound className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{user?.username}</p>
            <p className="text-xs capitalize text-slate-500">{user?.role}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          className="focus-ring flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-slate-300 hover:border-violet-400/50 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}

export default function AppLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-ink text-slate-100">
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">
        <Sidebar />
      </div>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            aria-label="Close menu"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative h-full">
            <Sidebar onNavigate={() => setIsMobileOpen(false)} />
            <button
              type="button"
              className="focus-ring absolute right-4 top-4 rounded-lg border border-white/10 bg-panel p-2 text-slate-300"
              onClick={() => setIsMobileOpen(false)}
              aria-label="Close menu"
            >
              <PanelLeftClose className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-ink/90 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-violet-500 font-black text-white">A</div>
          <div>
            <p className="font-extrabold text-white">AlignLab</p>
            <p className="text-xs text-slate-500">{location.pathname === "/" ? "Home" : location.pathname.slice(1)}</p>
          </div>
        </div>
        <button
          type="button"
          className="focus-ring rounded-lg border border-white/10 bg-panel p-2 text-slate-200"
          onClick={() => setIsMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      <main className="px-4 py-6 sm:px-6 lg:ml-72 lg:px-8 lg:py-8">
        <Outlet />
      </main>
    </div>
  );
}
