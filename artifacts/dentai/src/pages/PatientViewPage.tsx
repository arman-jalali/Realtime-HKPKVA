import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { ArrowLeft, ChevronDown, ChevronUp, CheckCircle2, Shield, Info } from "lucide-react";
import { patientData, currentPlan } from "@/data/mock";
import { formatCurrency, cn } from "@/lib/utils";
import { resetSessionState } from "./SessionPage";

const typeColors: Record<string, string> = {
  GKV: "bg-emerald-100 text-emerald-800",
  Privat: "bg-amber-100 text-amber-800",
  Labor: "bg-blue-100 text-blue-800",
};

export default function PatientViewPage() {
  const [, navigate] = useLocation();
  const [mounted, setMounted] = useState(false);
  const [positionsExpanded, setPositionsExpanded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const coveragePercent = Math.round((currentPlan.insurance / currentPlan.total) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-white text-slate-900 font-sans">

      {/* Top nav */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-slate-100 px-6 py-3 flex items-center justify-between">
        <button
          data-testid="link-back-to-session"
          onClick={() => { resetSessionState(); navigate("/"); }}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück zur Sitzung
        </button>
        <div className="text-xs text-slate-400 font-mono">
          {patientData.name} · {patientData.insurance} GKV · 60% Bonus
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            Ihr Behandlungsplan
          </h1>
          <p className="text-slate-500">
            Zähne 34 & 45 · {currentPlan.tagline} · Erstellt von Dr. Schmidt
          </p>
        </motion.div>

        {/* Single plan card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-900/5 overflow-hidden mb-6"
        >
          {/* Card header strip */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-7 py-5 text-white">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-teal-100 mb-1">Empfohlene Versorgung</div>
                <h2 className="text-2xl font-extrabold">{currentPlan.name}</h2>
                <p className="text-teal-100 text-sm mt-0.5">{currentPlan.tagline}</p>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-2xl p-3 mt-1">
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="p-7">
            {/* Description */}
            <p className="text-slate-600 text-sm leading-relaxed mb-7">{currentPlan.description}</p>

            {/* Cost breakdown */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 mb-7">
              <div className="flex items-end justify-between mb-5">
                <div>
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Ihr Eigenanteil</div>
                  <div className="text-5xl font-black text-slate-900 tracking-tight">{formatCurrency(currentPlan.patient)}</div>
                </div>
                <div className="text-right space-y-1.5 text-sm">
                  <div className="flex items-center gap-2 justify-end">
                    <div className="w-2.5 h-2.5 rounded-full bg-teal-500"></div>
                    <span className="text-slate-500">Kassenanteil</span>
                    <span className="font-bold text-teal-700">{formatCurrency(currentPlan.insurance)}</span>
                  </div>
                  <div className="flex items-center gap-2 justify-end text-slate-400">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                    <span>Gesamtkosten</span>
                    <span className="font-semibold text-slate-600">{formatCurrency(currentPlan.total)}</span>
                  </div>
                </div>
              </div>

              {/* Coverage bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-400 font-medium">
                  <span>Kassenanteil</span>
                  <span>{coveragePercent}% der Gesamtkosten übernommen</span>
                </div>
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={mounted ? { width: `${coveragePercent}%` } : {}}
                    transition={{ duration: 1, delay: 0.35, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* Highlights */}
            <ul className="space-y-3 mb-7">
              {currentPlan.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                  {h}
                </li>
              ))}
            </ul>

            {/* Expandable billing positions */}
            <div className="border-t border-slate-100 pt-5">
              <button
                onClick={() => setPositionsExpanded(!positionsExpanded)}
                className="flex items-center justify-between w-full text-xs font-semibold text-slate-400 hover:text-teal-700 transition-colors py-1 group"
              >
                <span className="flex items-center gap-2">
                  <Info className="w-3.5 h-3.5" />
                  Abrechnungspositionen (für Arzt)
                </span>
                {positionsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              <AnimatePresence>
                {positionsExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 rounded-xl border border-slate-100 overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-50 text-slate-400 uppercase tracking-wider">
                          <tr>
                            <th className="px-3 py-2 text-left font-semibold">Zahn</th>
                            <th className="px-3 py-2 text-left font-semibold">Leistung</th>
                            <th className="px-3 py-2 text-left font-semibold">Code</th>
                            <th className="px-3 py-2 text-left font-semibold">Typ</th>
                            <th className="px-3 py-2 text-right font-semibold">Eigenanteil</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {currentPlan.positions.map((pos, i) => (
                            <tr key={i} className="hover:bg-slate-50/50">
                              <td className="px-3 py-2 font-mono font-bold text-slate-700">{pos.tooth}</td>
                              <td className="px-3 py-2 text-slate-600">{pos.patientDesc}</td>
                              <td className="px-3 py-2 font-mono text-teal-700">{pos.code}</td>
                              <td className="px-3 py-2">
                                <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold", typeColors[pos.type])}>
                                  {pos.type}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-right font-semibold text-slate-800">
                                {pos.patientShare === 0 ? (
                                  <span className="text-emerald-500">—</span>
                                ) : (
                                  formatCurrency(pos.patientShare)
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Confirm button */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={() => navigate('/submitted')}
            data-testid="button-submit"
            className="w-full py-4 bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white font-bold text-base rounded-2xl shadow-lg shadow-teal-600/20 transition-all flex items-center justify-center gap-2"
          >
            <Shield className="w-5 h-5" />
            Behandlungsplan bestätigen & einreichen
          </button>
          <p className="text-center text-slate-400 text-sm mt-4">
            Haben Sie Fragen? Wir besprechen den Plan gerne im Detail.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
