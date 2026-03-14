import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { ArrowLeft, ChevronDown, ChevronUp, Mic, Square, Loader2, Circle, CheckCircle2 } from "lucide-react";
import {
  patientData, currentPlan, revisedPlan,
  mockRevisionTranscription, revisionSteps,
  TreatmentAlternative
} from "@/data/mock";
import { formatCurrency, cn } from "@/lib/utils";
import { resetSessionState } from "./SessionPage";

const typeColors: Record<string, string> = {
  GKV: "bg-blue-50 text-blue-700",
  Privat: "bg-slate-100 text-slate-700",
  Labor: "bg-neutral-100 text-neutral-600",
};

type EditState = 'idle' | 'recording' | 'processing';

// ─── Plan display ─────────────────────────────────────────────────────────────
function PlanCard({
  plan,
  planKey,
  isRevised,
}: {
  plan: TreatmentAlternative;
  planKey: number;
  isRevised: boolean;
}) {
  const [positionsOpen, setPositionsOpen] = useState(false);
  const coveragePct = Math.round((plan.insurance / plan.total) * 100);

  return (
    <motion.div
      key={planKey}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="border border-border rounded-md bg-card overflow-hidden mb-5"
    >
      {/* Heading row */}
      <div className="px-6 pt-6 pb-4 border-b border-border">
        {isRevised && (
          <div className="text-[10px] font-semibold uppercase tracking-widest text-blue-600 mb-2">
            Angepasst von Dr. Schmidt
          </div>
        )}
        <h2 className="text-2xl font-bold text-foreground">{plan.name}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{plan.tagline}</p>
      </div>

      {/* Description */}
      <div className="px-6 py-4 border-b border-border">
        <p className="text-sm text-foreground/70 leading-relaxed">{plan.description}</p>
      </div>

      {/* Cost — ruled two-column */}
      <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
        <div className="px-6 py-4">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Ihr Eigenanteil</div>
          <div className="text-3xl font-bold text-foreground font-mono tabular-nums">{formatCurrency(plan.patient)}</div>
        </div>
        <div className="px-6 py-4">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Kassenanteil</div>
          <div className="text-lg font-semibold text-foreground font-mono">{formatCurrency(plan.insurance)}</div>
        </div>
        <div className="px-6 py-4">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Gesamtkosten</div>
          <div className="text-lg font-semibold text-foreground font-mono">{formatCurrency(plan.total)}</div>
        </div>
      </div>

      {/* Coverage bar */}
      <div className="px-6 py-3 border-b border-border">
        <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5">
          <span>Kassendeckung</span>
          <span>{coveragePct}%</span>
        </div>
        <div className="w-full h-1 bg-border rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${coveragePct}%` }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="h-full bg-foreground rounded-full"
          />
        </div>
      </div>

      {/* Highlights — plain ruled list */}
      <div className="px-6 py-4 border-b border-border">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Details</div>
        <ul className="space-y-2">
          {plan.highlights.map((h, i) => (
            <li key={i} className="text-sm text-foreground/80 flex gap-2">
              <span className="text-muted-foreground select-none">–</span>
              {h}
            </li>
          ))}
        </ul>
      </div>

      {/* Expandable billing positions */}
      <div className="px-6 py-3">
        <button
          onClick={() => setPositionsOpen(!positionsOpen)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Abrechnungspositionen (für Arzt)
          {positionsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        <AnimatePresence>
          {positionsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3 border border-border rounded-sm overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-muted text-muted-foreground uppercase tracking-wider">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold">Zahn</th>
                      <th className="px-3 py-2 text-left font-semibold">Leistung</th>
                      <th className="px-3 py-2 text-left font-semibold">Code</th>
                      <th className="px-3 py-2 text-left font-semibold">Typ</th>
                      <th className="px-3 py-2 text-right font-semibold">Eigenanteil</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {plan.positions.map((pos, i) => (
                      <tr key={i} className="hover:bg-muted/40">
                        <td className="px-3 py-2 font-mono font-medium">{pos.tooth}</td>
                        <td className="px-3 py-2 text-foreground/80">{pos.patientDesc}</td>
                        <td className="px-3 py-2 font-mono text-blue-700">{pos.code}</td>
                        <td className="px-3 py-2">
                          <span className={cn("px-1.5 py-0.5 rounded-sm text-[10px] font-bold", typeColors[pos.type])}>
                            {pos.type}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right font-mono font-medium">
                          {pos.patientShare === 0 ? "—" : formatCurrency(pos.patientShare)}
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
    </motion.div>
  );
}

// ─── Edit drawer ──────────────────────────────────────────────────────────────
function EditDrawer({
  editState,
  typedText,
  stepIndex,
  onStart,
  onStop,
  onClose,
}: {
  editState: EditState;
  typedText: string;
  stepIndex: number;
  onStart: () => void;
  onStop: () => void;
  onClose: () => void;
}) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-foreground/30 z-30"
        onClick={editState === 'idle' ? onClose : undefined}
      />

      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 320 }}
        className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3">
          <div className="w-8 h-0.5 bg-border rounded-full" />
        </div>

        <div className="max-w-xl mx-auto px-6 pt-5 pb-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Sprachrevision</div>
              <h3 className="text-lg font-bold text-foreground">Plan anpassen</h3>
            </div>
            {editState === 'idle' && (
              <button onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Abbrechen
              </button>
            )}
          </div>

          {/* Mic / stop button */}
          <div className="flex items-center gap-4 mb-5">
            <button
              onClick={editState === 'recording' ? onStop : onStart}
              disabled={editState === 'processing'}
              data-testid="button-edit-record"
              className={cn(
                "w-12 h-12 rounded-full border-2 flex items-center justify-center transition-colors shrink-0",
                editState === 'recording'
                  ? "border-red-600 bg-red-600 text-white"
                  : editState === 'processing'
                  ? "border-border text-muted-foreground cursor-not-allowed"
                  : "border-foreground text-foreground hover:bg-foreground hover:text-background"
              )}
            >
              {editState === 'recording' ? (
                <Square className="w-4 h-4 fill-current" />
              ) : editState === 'processing' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
            <p className="text-sm text-muted-foreground">
              {editState === 'idle' && "Mikrofon starten und Änderung beschreiben"}
              {editState === 'recording' && "Aufnahme läuft — stoppen wenn fertig"}
              {editState === 'processing' && "Plan wird angepasst…"}
            </p>
          </div>

          {/* Transcription */}
          <AnimatePresence>
            {typedText && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="border border-border rounded-sm p-3 mb-4 bg-background">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">Transkription</div>
                  <p className="text-sm font-mono text-foreground leading-relaxed">
                    {typedText}
                    {editState === 'recording' && (
                      <span className="inline-block w-px h-3.5 bg-foreground ml-0.5 animate-pulse align-middle" />
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-2.5"
              >
                {revisionSteps.map((step, i) => {
                  const done = i < stepIndex;
                  const active = i === stepIndex;
                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: i <= stepIndex ? 1 : 0.25 }}
                      className="flex items-center gap-2.5"
                    >
                      <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                        {done && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                        {active && <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />}
                        {!done && !active && <Circle className="w-3.5 h-3.5 text-border" />}
                      </div>
                      <span className={cn(
                        "text-xs",
                        done ? "text-muted-foreground line-through" : active ? "text-foreground font-medium" : "text-muted-foreground"
                      )}>
                        {step.label}
                      </span>
                    </motion.div>
                  );
                })}
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

  useEffect(() => {
    if (editState !== 'recording') return;
    let i = 0;
    setTypedText("");
    const iv = setInterval(() => {
      if (i < mockRevisionTranscription.length) {
        setTypedText(prev => prev + mockRevisionTranscription.charAt(i));
        i++;
      } else clearInterval(iv);
    }, 30);
    return () => clearInterval(iv);
  }, [editState]);

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
        }, 500);
      }
    }, 700);
    return () => clearInterval(iv);
  }, [editState]);

  const openEdit = () => {
    setTypedText("");
    setStepIndex(-1);
    setEditState('idle');
    setEditOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">

      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-card border-b border-border px-6 py-3 flex items-center justify-between">
        <button
          data-testid="link-back-to-session"
          onClick={() => { resetSessionState(); navigate("/"); }}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück zur Sitzung
        </button>
        <div className="text-xs font-mono text-muted-foreground">
          {patientData.name} · {patientData.insurance} · {patientData.bonus}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-1">Ihr Behandlungsplan</h1>
          <p className="text-sm text-muted-foreground">Zähne 34 & 45 — erstellt von Dr. Schmidt</p>
        </div>

        <PlanCard plan={activePlan} planKey={planKey} isRevised={isRevised} />

        {/* Actions */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => navigate('/submitted')}
            data-testid="button-submit"
            className="w-full py-3.5 bg-foreground text-background font-semibold text-sm rounded-md hover:bg-foreground/90 transition-colors"
          >
            Behandlungsplan bestätigen & einreichen
          </button>

          <button
            onClick={openEdit}
            data-testid="button-edit-plan"
            className="w-full py-3.5 border border-border text-foreground text-sm font-medium rounded-md hover:bg-muted transition-colors flex items-center justify-center gap-2"
          >
            <Mic className="w-4 h-4 text-muted-foreground" />
            Plan mit Sprache anpassen
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-5">
          Haben Sie Fragen? Wir besprechen den Plan gerne im Detail.
        </p>
      </div>

      <AnimatePresence>
        {editOpen && (
          <EditDrawer
            editState={editState}
            typedText={typedText}
            stepIndex={stepIndex}
            onStart={() => setEditState('recording')}
            onStop={() => setEditState('processing')}
            onClose={() => { setEditOpen(false); setEditState('idle'); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
