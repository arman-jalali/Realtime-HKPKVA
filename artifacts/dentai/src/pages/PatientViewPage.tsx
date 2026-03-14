import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { ArrowLeft, ChevronDown, ChevronUp, CheckCircle2, Shield, Sparkles } from "lucide-react";
import { patientData, treatmentAlternatives } from "@/data/mock";
import { formatCurrency, cn } from "@/lib/utils";
import { resetSessionState } from "./SessionPage";

let persistedSelectedAlternative = 'vollkeramik';

export function getSelectedAlternative() {
  return persistedSelectedAlternative;
}

export function resetSelectedAlternative() {
  persistedSelectedAlternative = 'vollkeramik';
}

export default function PatientViewPage() {
  const [, navigate] = useLocation();
  const [mounted, setMounted] = useState(false);
  const [selectedId, setSelectedId] = useState(persistedSelectedAlternative);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSelect = (id: string) => {
    persistedSelectedAlternative = id;
    setSelectedId(id);
  };

  const handleSubmit = () => {
    navigate('/submitted');
  };

  const typeColors: Record<string, string> = {
    GKV: "bg-emerald-100 text-emerald-800",
    Privat: "bg-amber-100 text-amber-800",
    Labor: "bg-blue-100 text-blue-800",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-white text-slate-900 font-sans">

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

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 border border-teal-200 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" />
            KI-generierter Behandlungsplan
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            Ihr Behandlungsplan, {patientData.name.split(' ')[0]}
          </h1>
          <p className="text-slate-500">
            Zähne 34 & 45 · Kronenversorgung · Erstellt von Dr. Schmidt
          </p>
        </motion.div>

        {/* Two plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {treatmentAlternatives.map((plan, idx) => {
            const isSelected = selectedId === plan.id;
            const isExpanded = expandedId === plan.id;
            const coveragePercent = Math.round((plan.insurance / plan.total) * 100);

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={mounted ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: idx * 0.12 }}
                className={cn(
                  "relative bg-white rounded-3xl border-2 flex flex-col transition-all duration-300 overflow-hidden",
                  isSelected
                    ? "border-teal-500 shadow-xl shadow-teal-600/10"
                    : "border-slate-200 shadow-md hover:border-teal-300 hover:shadow-lg"
                )}
              >
                {/* Recommended badge */}
                {plan.recommended && (
                  <div className="absolute top-0 right-0 bg-teal-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-2xl tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    EMPFOHLEN
                  </div>
                )}

                <div className="p-7 flex flex-col flex-1">

                  {/* Plan name & tagline */}
                  <div className="mb-6">
                    <h2 className="text-xl font-extrabold text-slate-900 mb-0.5">{plan.name}</h2>
                    <p className="text-sm font-semibold text-teal-700">{plan.tagline}</p>
                    <p className="text-sm text-slate-500 mt-3 leading-relaxed">{plan.description}</p>
                  </div>

                  {/* Cost */}
                  <div className="bg-slate-50 rounded-2xl p-5 mb-5 border border-slate-100">
                    <div className="flex items-end justify-between mb-4">
                      <div>
                        <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Ihr Eigenanteil</div>
                        <div className="text-4xl font-black text-slate-900 tracking-tight">{formatCurrency(plan.patient)}</div>
                      </div>
                      <div className="text-right text-xs text-slate-500 space-y-1">
                        <div className="flex items-center gap-1.5 justify-end">
                          <Shield className="w-3.5 h-3.5 text-teal-500" />
                          <span>Kassenanteil: <span className="font-semibold text-teal-700">{formatCurrency(plan.insurance)}</span></span>
                        </div>
                        <div>Gesamtkosten: <span className="font-semibold">{formatCurrency(plan.total)}</span></div>
                      </div>
                    </div>
                    {/* Insurance bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-slate-400 font-medium">
                        <span>Kassenanteil</span>
                        <span>{coveragePercent}% übernommen</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={mounted ? { width: `${coveragePercent}%` } : {}}
                          transition={{ duration: 0.9, delay: 0.4 + idx * 0.15 }}
                          className="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Highlights */}
                  <ul className="space-y-2.5 mb-6 flex-1">
                    {plan.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                        {h}
                      </li>
                    ))}
                  </ul>

                  {/* Expandable positions (dentist detail) */}
                  <div className="border-t border-slate-100 pt-4 mb-5">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : plan.id)}
                      className="flex items-center justify-between w-full text-xs font-semibold text-slate-500 hover:text-teal-700 transition-colors py-1"
                    >
                      <span>Abrechnungspositionen anzeigen</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
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
                                  <th className="px-3 py-2 text-left font-semibold">Position</th>
                                  <th className="px-3 py-2 text-left font-semibold">Code</th>
                                  <th className="px-3 py-2 text-left font-semibold">Typ</th>
                                  <th className="px-3 py-2 text-right font-semibold">Eigenanteil</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                {plan.positions.map((pos, i) => (
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
                                        <span className="text-emerald-600">—</span>
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

                  {/* Select button */}
                  <button
                    onClick={() => handleSelect(plan.id)}
                    data-testid={`button-select-${plan.id}`}
                    className={cn(
                      "w-full py-3.5 rounded-2xl font-bold text-sm transition-all duration-200",
                      isSelected
                        ? "bg-teal-600 text-white shadow-lg shadow-teal-600/20"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    )}
                  >
                    {isSelected ? "✓ Ausgewählt" : "Diesen Plan wählen"}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Submit bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl border border-slate-200 shadow-sm px-7 py-5"
        >
          <div>
            <div className="text-sm text-slate-500 mb-0.5">Gewählter Plan</div>
            <div className="font-bold text-slate-900 text-lg">
              {treatmentAlternatives.find(p => p.id === selectedId)?.name} ·{" "}
              <span className="text-teal-700">
                {formatCurrency(treatmentAlternatives.find(p => p.id === selectedId)?.patient ?? 0)} Eigenanteil
              </span>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            data-testid="button-submit"
            className="px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg shadow-teal-600/20 transition-all hover:-translate-y-0.5 text-sm flex items-center gap-2 shrink-0"
          >
            <Shield className="w-4 h-4" />
            An Krankenkasse senden
          </button>
        </motion.div>

        <p className="text-center text-slate-400 text-sm mt-6 pb-8">
          Haben Sie Fragen? Wir besprechen die Optionen gerne im Detail.
        </p>
      </div>
    </div>
  );
}
