import { ShieldAlert } from "lucide-react";

import { useAuth } from "../context/AuthContext.jsx";
import PageTransition from "./PageTransition.jsx";

export default function AdminOnly({ children }) {
  const { user } = useAuth();

  if (user?.role !== "admin") {
    return (
      <PageTransition>
        <div className="glass-panel rounded-lg p-8 text-center">
          <ShieldAlert className="mx-auto mb-4 h-10 w-10 text-violet-300" />
          <h1 className="text-2xl font-bold text-white">Admin access required</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400">
            This workspace is reserved for dataset operations, exports, and annotation analytics.
          </p>
        </div>
      </PageTransition>
    );
  }

  return children;
}
