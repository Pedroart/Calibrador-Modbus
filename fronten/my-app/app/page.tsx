"use client"

import { useState } from "react"
import { Dashboard } from "@/components/dashboard"
import { EntryPoints } from "@/components/entry-points"

type View = "dashboard" | "entrypoints"

export default function Home() {
  const [activeView, setActiveView] = useState<View>("dashboard")

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <nav className="flex gap-8 px-6 py-4 border-b border-slate-800 bg-slate-950">
        <button
          onClick={() => setActiveView("dashboard")}
          className={`py-2 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeView === "dashboard"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveView("entrypoints")}
          className={`py-2 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeView === "entrypoints"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          Entry Points
        </button>
      </nav>

      {/* Main Content */}
      <main className="p-6">
        {activeView === "dashboard" && <Dashboard />}
        {activeView === "entrypoints" && <EntryPoints />}
      </main>
    </div>
  )
}
