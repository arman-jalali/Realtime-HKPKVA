import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import {
  ArrowLeft, ChevronDown, ChevronUp, CheckCircle2, Shield,
  Info, Mic, Square, Loader2, Circle, Pencil, Sparkles
} from "lucide-react";
import {
  patientData, currentPlan, revisedPlan,
  mockRevisionTranscription, revisionSteps,
  TreatmentAlternative
} from "@/data/mock";
import { formatCurrency, cn } from "@/lib/utils";
import { resetSessionState } from "./SessionPage";

const typeColors: Record<string, string> = {
  GKV: "bg-emerald-100 text-emerald-800",
  Privat: "bg-amber-100 text-amber-800",
  Labor: "bg-blue-100 text-blue-800",
};

type EditState = 'idle' | 'recording' | 'processing';

// ─── Plan card ────────────────────────────────────────────────────────────────
function PlanCard({
  plan,
  planKey,
  isRevised,
}: {
  plan: TreatmentAlternative;
  planKey: number;
  isRevised: boolean;
}) {
  const [positionsExpanded, setPositionsExpanded] = useState(false);
  const coveragePercent = Math.round((plan.insurance / plan.total) * 100);

  return (
    <motion.div
      key={planKey}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-900/5 overflow-hidden mb-6"
    >
      {/* Header strip */}
      <div className={cn(
        "px-7 py-5 text-white",
        isRevised
          ? "bg-gradient-to-r from-amber-500 to-amber-400"
          : "bg-gradient-to-r from-teal-600 to-teal-500"
      )}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-widest opacity-80">
                {isRevised ? "Angepasste Versorgung" : "Empfohlene Versorgung"}
              </span>
              {isRevised && (
                <span className="bg-white/25 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  KI-angepasst
                </span>
              )}
            </div>
            <h2 className="text-2xl font-extrabold">{plan.name}</h2>
            <p className="opacity-80 text-sm mt-0.5">{plan.tagline}</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-2xl p-3 mt-1 shrink-0">
            <Shield className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      <div className="p-7">
        {/* Description */}
        <p className="text-slate-600 text-sm leading-relaxed mb-7">{plan.description}</p>

        {/* Cost breakdown */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 mb-7">
          <div className="flex items-end justify-between mb-5">
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Ihr Eigenanteil</div>
              <div className="text-5xl font-black text-slate-900 tracking-tight">{formatCurrency(plan.patient)}</div>
            </div>
            <div className="text-right space-y-1.5 text-sm">
              <div className="flex items-center gap-2 justify-end">
                <div className={cn("w-2.5 h-2.5 rounded-full", isRevised ? "bg-amber-500" : "bg-teal-500")}></div>
                <span className="text-slate-500">Kassenanteil</span>
                <span className={cn("font-bold", isRevised ? "text-amber-700" : "text-teal-700")}>
                  {formatCurrency(plan.insurance)}
                </span>
              </div>
              <div className="flex items-center gap-2 justify-end text-slate-400">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                <span>Gesamtkosten</span>
                <span className="font-semibold text-slate-600">{formatCurrency(plan.total)}</span>
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
                animate={{ width: `${coveragePercent}%` }}
                transition={{ duration: 1, delay: 0.15, ease: "easeOut" }}
                className={cn(
                  "h-full rounded-full",
                  isRevised
                    ? "bg-gradient-to-r from-amber-400 to-amber-500"
                    : "bg-gradient-to-r from-teal-400 to-teal-600"
                )}
              />
            </div>
          </div>
        </div>

        {/* Highlights */}
        <ul className="space-y-3 mb-7">
          {plan.highlights.map((h, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
              <CheckCircle2 className={cn("w-4 h-4 shrink-0 mt-0.5", isRevised ? "text-amber-500" : "text-teal-500")} />
              {h}
            </li>
          ))}
        </ul>

        {/* Expandable billing positions */}
        <div className="border-t border-slate-100 pt-5">
          <button
            onClick={() => setPositionsExpanded(!positionsExpanded)}
            className="flex items-center justify-between w-full text-xs font-semibold text-slate-400 hover:text-teal-700 transition-colors py-1"
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
  );
}

// ─── Edit drawer ──────────────────────────────────────────────────────────────
function EditDrawer({
  editState,
  typedText,
  stepIndex,
  onStartRecording,
  onStopRecording,
  onClose,
}: {
  editState: EditState;
  typedText: string;
  stepIndex: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onClose: () => void;
}) {
  const allDone = editState === 'processing' && stepIndex >= revisionSteps.length - 1;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30"
        onClick={editState === 'idle' ? onClose : undefined}
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 340 }}
        className="fixed bottom-0 left-0 right-0 z-40 bg-white rounded-t-3xl shadow-2xl"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        <div className="px-7 pb-10 pt-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">Plan anpassen</h3>
              <p className="text-sm text-slate-400 mt-0.5">Sprechen Sie Ihre Änderungswünsche</p>
            </div>
            {editState === 'idle' && (
              <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors text-sm font-medium">
                Abbrechen
              </button>
            )}
          </div>

          {/* Voice button + transcription */}
          <div className="flex flex-col items-center gap-5 mb-6">
            <div className="relative">
              {editState === 'recording' && (
                <motion.div
                  animate={{ scale: [1, 1.25, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute inset-0 rounded-full bg-red-400 opacity-30"
                />
              )}
              <button
                onClick={editState === 'recording' ? onStopRecording : onStartRecording}
                disabled={editState === 'processing'}
                data-testid="button-edit-record"
                className={cn(
                  "relative w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg",
                  editState === 'recording'
                    ? "bg-red-500 hover:bg-red-600 shadow-red-500/30"
                    : editState === 'processing'
                    ? "bg-slate-100 cursor-not-allowed"
                    : "bg-teal-600 hover:bg-teal-700 shadow-teal-600/25"
                )}
              >
                {editState === 'recording' ? (
                  <Square className="w-7 h-7 text-white" />
                ) : editState === 'processing' ? (
                  <Loader2 className="w-7 h-7 text-slate-400 animate-spin" />
                ) : (
                  <Mic className="w-7 h-7 text-white" />
                )}
              </button>
            </div>

            <p className="text-sm text-slate-500 text-center">
              {editState === 'idle'
                ? "Mikrofon starten und Änderung beschreiben"
                : editState === 'recording'
                ? "Aufnahme läuft — Stopp drücken wenn fertig"
                : "Plan wird angepasst…"}
            </p>
          </div>

          {/* Transcription (during recording) */}
          <AnimatePresence>
            {(editState === 'recording' || editState === 'processing') && typedText && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-5">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-2">Transkription</div>
                  <p className="text-sm text-slate-700 leading-relaxed font-mono">
                    {typedText}
                    {editState === 'recording' && (
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.5 }}
                        className="inline-block w-0.5 h-3.5 bg-teal-600 ml-0.5 align-middle"
                      />
                    )}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Processing steps */}
          <AnimatePresence>
            {editState === 'processing' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-2.5 mb-4">
                  {revisionSteps.map((step, i) => {
                    const done = i < stepIndex;
                    const active = i === stepIndex;
                    return (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: i <= stepIndex ? 1 : 0.3, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3"
                      >
                        {done ? (
                          <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" />
                        ) : active ? (
                          <Loader2 className="w-4 h-4 text-teal-500 animate-spin shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                        )}
                        <span className={cn(
                          "text-sm",
                          done ? "text-slate-400 line-through" : active ? "text-slate-900 font-semibold" : "text-slate-300"
                        )}>
                          {step.label}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PatientViewPage() {
  const [, navigate] = useLocation();
  const [isRevised, setIsRevised] = useState(false);
  const [planKey, setPlanKey] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [editState, setEditState] = useState<EditState>('idle');
  const [typedText, setTypedText] = useState("");
  const [stepIndex, setStepIndex] = useState(-1);

  const activePlan = isRevised ? revisedPlan : currentPlan;

  // Typewriter during recording
  useEffect(() => {
    if (editState !== 'recording') return;
    let i = 0;
    setTypedText("");
    const iv = setInterval(() => {
      if (i < mockRevisionTranscription.length) {
        setTypedText(prev => prev + mockRevisionTranscription.charAt(i));
        i++;
      } else {
        clearInterval(iv);
      }
    }, 30);
    return () => clearInterval(iv);
  }, [editState]);

  // Processing steps
  useEffect(() => {
    if (editState !== 'processing') return;
    setStepIndex(0);
    let step = 0;
    const iv = setInterval(() => {
      step++;
      if (step < revisionSteps.length) {
        setStepIndex(step);
      } else {
        clearInterval(iv);
        setTimeout(() => {
          setEditOpen(false);
          setEditState('idle');
          setIsRevised(true);
          setPlanKey(k => k + 1);
        }, 600);
      }
    }, 700);
    return () => clearInterval(iv);
  }, [editState]);

  const openEdit = () => {
    setEditState('idle');
    setTypedText("");
    setStepIndex(-1);
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setEditState('idle');
  };

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
            Zähne 34 & 45 · {activePlan.tagline} · Erstellt von Dr. Schmidt
          </p>
        </motion.div>

        {/* Plan card — remounts with new key on revision */}
        <PlanCard plan={activePlan} planKey={planKey} isRevised={isRevised} />

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="flex flex-col gap-3"
        >
          <button
            onClick={() => navigate('/submitted')}
            data-testid="button-submit"
            className="w-full py-4 bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white font-bold text-base rounded-2xl shadow-lg shadow-teal-600/20 transition-all flex items-center justify-center gap-2"
          >
            <Shield className="w-5 h-5" />
            Behandlungsplan bestätigen & einreichen
          </button>

          <button
            onClick={openEdit}
            data-testid="button-edit-plan"
            className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            <Mic className="w-4 h-4 text-slate-500" />
            Plan mit Sprache anpassen
          </button>
        </motion.div>

        <p className="text-center text-slate-400 text-sm mt-5 pb-8">
          Haben Sie Fragen? Wir besprechen den Plan gerne im Detail.
        </p>
      </div>

      {/* Edit drawer */}
      <AnimatePresence>
        {editOpen && (
          <EditDrawer
            editState={editState}
            typedText={typedText}
            stepIndex={stepIndex}
            onStartRecording={() => setEditState('recording')}
            onStopRecording={() => setEditState('processing')}
            onClose={closeEdit}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
