import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Mic, Square, CheckCircle2, Circle, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { DentalChart } from "@/components/DentalChart";
import { cn, formatCurrency } from "@/lib/utils";
import {
  patientData,
  mockTranscription,
  processingSteps,
  treatmentPlan,
  treatmentAlternatives
} from "@/data/mock";

type SessionState = 'idle' | 'recording' | 'processing' | 'plan_ready';

let persistedState: SessionState = 'idle';
let persistedSelectedPlan = 'standard';

export function resetSessionState() {
  persistedState = 'idle';
  persistedSelectedPlan = 'standard';
}

export function getSelectedPlan() {
  return persistedSelectedPlan;
}

export function setPersistedSelectedPlan(plan: string) {
  persistedSelectedPlan = plan;
}

export default function SessionPage() {
  const [, navigate] = useLocation();
  const [sessionState, setSessionStateRaw] = useState<SessionState>(persistedState);

  const setSessionState = (s: SessionState) => {
    persistedState = s;
    setSessionStateRaw(s);
  };

  const [recordingTime, setRecordingTime] = useState(0);
  const [typedTranscription, setTypedTranscription] = useState("");
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [activeTab, setActiveTab] = useState<'plan' | 'kosten'>('plan');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlanRaw] = useState<string>(persistedSelectedPlan);

  const setSelectedPlan = (plan: string) => {
    persistedSelectedPlan = plan;
    setSelectedPlanRaw(plan);
  };

  useEffect(() => {
    let interval: number;
    if (sessionState === 'recording') {
      interval = window.setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [sessionState]);

  useEffect(() => {
    if (sessionState !== 'recording') return;
    let i = 0;
    setTypedTranscription("");
    const iv = setInterval(() => {
      if (i < mockTranscription.length) {
        setTypedTranscription(prev => prev + mockTranscription.charAt(i));
        i++;
      } else {
        clearInterval(iv);
      }
    }, 30);
    return () => clearInterval(iv);
  }, [sessionState]);

  useEffect(() => {
    if (sessionState !== 'processing') return;
    setCurrentStepIndex(0);
    let step = 0;
    const iv = setInterval(() => {
      step++;
      if (step < processingSteps.length) {
        setCurrentStepIndex(step);
      } else {
        clearInterval(iv);
        setTimeout(() => {
          setSessionState('plan_ready');
          navigate('/patient-view');
        }, 800);
      }
    }, 800);
    return () => clearInterval(iv);
  }, [sessionState]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const typeColors: Record<string, string> = {
    GKV: "bg-blue-50 text-blue-700",
    Privat: "bg-slate-100 text-slate-700",
    Labor: "bg-neutral-100 text-neutral-600",
  };

  return (
    <div className="min-h-screen bg-background flex pl-56">
      <Sidebar />

      <main className="flex-1 p-8 h-screen overflow-hidden flex gap-8">

        {/* LEFT: Patient context */}
        <div className="w-[38%] flex flex-col gap-0 h-full overflow-y-auto pb-20">
          <h1 className="text-xl font-bold text-foreground mb-6">Patientensitzung</h1>

          {/* Patient card — flat, ruled, no shadow */}
          <div className="border border-border rounded-md bg-card mb-5">
            <div className="px-5 py-4 flex justify-between items-start border-b border-border">
              <div>
                <div className="text-base font-bold text-foreground">{patientData.name}</div>
                <div className="text-sm text-muted-foreground mt-0.5">geb. {patientData.dob}</div>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                Im Raum
              </div>
            </div>

            <div className="grid grid-cols-2 divide-x divide-border">
              <div className="px-5 py-3 border-b border-border">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Versicherung</div>
                <div className="text-sm font-medium text-foreground flex items-center gap-2">
                  {patientData.insurance}
                  <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-sm">{patientData.insuranceType}</span>
                </div>
              </div>
              <div className="px-5 py-3 border-b border-border">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Zuschuss</div>
                <div className="text-sm font-semibold text-foreground">{patientData.bonus}</div>
              </div>
              <div className="px-5 py-3 col-span-2">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Versichertennummer</div>
                <div className="font-mono text-sm text-foreground">{patientData.insuranceNumber}</div>
              </div>
            </div>
          </div>

          <DentalChart highlightedTeeth={[34, 45]} darkTeeth={[36]} />

          {/* Visit history — no card wrapper, just ruled list */}
          <div className="mt-5 border border-border rounded-md bg-card">
            <div className="px-5 py-3 border-b border-border">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Letzte Besuche</div>
            </div>
            <div className="divide-y divide-border">
              {patientData.history.map((h, i) => (
                <div key={i} className="px-5 py-3 flex gap-5">
                  <div className="text-xs font-mono text-muted-foreground shrink-0 pt-0.5">{h.date}</div>
                  <div className="text-sm text-foreground">{h.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Interaction */}
        <div className="flex-1 flex flex-col h-full relative">
          <AnimatePresence mode="wait">

            {/* IDLE */}
            {sessionState === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center border border-border rounded-md bg-card"
              >
                <button
                  onClick={() => setSessionState('recording')}
                  data-testid="button-start-recording"
                  className="w-16 h-16 rounded-full border-2 border-foreground flex items-center justify-center text-foreground hover:bg-foreground hover:text-background transition-colors cursor-pointer"
                >
                  <Mic className="w-6 h-6" />
                </button>

                <h2 className="mt-7 text-xl font-bold text-foreground">Therapie per Sprache beschreiben</h2>
                <p className="mt-2 text-sm text-muted-foreground max-w-sm text-center leading-relaxed">
                  Drücken Sie den Button und beschreiben Sie den Behandlungsplan natürlich. Die KI ordnet automatisch alle BEMA/GOZ Codes zu.
                </p>

                <div className="mt-10 border-t border-border w-full max-w-sm">
                  <p className="text-xs text-muted-foreground mt-4 mb-2">Beispiele</p>
                  <p className="text-sm text-foreground/70 italic">"Krone auf Zahn 34, VMK, und Krone auf 45, Vollkeramik"</p>
                  <p className="text-sm text-foreground/70 italic mt-1.5">"Implantat regio 36 mit Keramikkrone"</p>
                </div>
              </motion.div>
            )}

            {/* RECORDING */}
            {sessionState === 'recording' && (
              <motion.div
                key="recording"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center border border-red-300 rounded-md bg-card"
              >
                <div className="w-full max-w-lg px-8 flex flex-col items-center">
                  {/* Waveform */}
                  <div className="flex items-center gap-1.5 h-12 mb-6">
                    {[...Array(7)].map((_, i) => (
                      <div key={i} className="waveform-bar w-1.5 bg-foreground rounded-full h-full origin-bottom" />
                    ))}
                  </div>

                  <div className="font-mono text-3xl font-medium text-red-600 mb-6 tabular-nums tracking-widest">
                    {formatTime(recordingTime)}
                  </div>

                  {/* Transcription */}
                  <div className="w-full border border-border rounded-md p-4 min-h-[100px] mb-8 bg-background">
                    <p className="text-sm text-foreground leading-relaxed">
                      {typedTranscription}
                      <span className="inline-block w-px h-4 bg-foreground ml-0.5 align-middle animate-pulse" />
                    </p>
                  </div>

                  <button
                    onClick={() => setSessionState('processing')}
                    data-testid="button-stop-recording"
                    className="flex items-center gap-2.5 px-6 py-2.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors"
                  >
                    <Square className="w-4 h-4 fill-current" />
                    Aufnahme stoppen
                  </button>
                </div>
              </motion.div>
            )}

            {/* PROCESSING */}
            {sessionState === 'processing' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col justify-center border border-border rounded-md bg-card px-16"
              >
                <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">KI analysiert</div>
                <h2 className="text-xl font-bold text-foreground mb-8">Heil- und Kostenplan wird erstellt</h2>

                <div className="space-y-4 max-w-sm">
                  {processingSteps.map((step, i) => {
                    const done = i < currentStepIndex;
                    const active = i === currentStepIndex;
                    return (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: i <= currentStepIndex ? 1 : 0.25 }}
                        className="flex items-center gap-3"
                      >
                        <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                          {done && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                          {active && <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />}
                          {!done && !active && <Circle className="w-4 h-4 text-border" />}
                        </div>
                        <span className={cn(
                          "text-sm",
                          done ? "text-muted-foreground line-through" : active ? "text-foreground font-medium" : "text-muted-foreground"
                        )}>
                          {step.label}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* PLAN READY — dead state, navigation goes to /patient-view */}
            {sessionState === 'plan_ready' && (
              <motion.div
                key="plan_ready"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col border border-border rounded-md bg-card overflow-hidden"
              >
                {/* Tabs */}
                <div className="flex border-b border-border px-6 gap-6 bg-background/50">
                  {(['plan', 'kosten'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "py-3.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                        activeTab === tab
                          ? "border-foreground text-foreground"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {tab === 'plan' ? 'Behandlungsplan' : 'Kostenübersicht'}
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto p-6">

                  {activeTab === 'plan' && (
                    <div>
                      <div className="border border-border rounded-md overflow-hidden">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-muted text-muted-foreground text-xs uppercase tracking-wider">
                            <tr>
                              <th className="px-4 py-3 border-b border-border font-semibold">Pos</th>
                              <th className="px-4 py-3 border-b border-border font-semibold">Beschreibung</th>
                              <th className="px-4 py-3 border-b border-border font-semibold">Code</th>
                              <th className="px-4 py-3 border-b border-border font-semibold">Typ</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {treatmentPlan.map((item) => (
                              <tr key={item.pos} className="hover:bg-muted/40">
                                <td className="px-4 py-3 text-muted-foreground font-mono">{item.pos}</td>
                                <td className="px-4 py-3 font-medium text-foreground">{item.desc}</td>
                                <td className="px-4 py-3 font-mono text-xs text-blue-700">{item.code}</td>
                                <td className="px-4 py-3">
                                  <span className={cn("text-xs px-2 py-0.5 rounded-sm font-medium", typeColors[item.type])}>
                                    {item.type}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {activeTab === 'kosten' && (
                    <div className="space-y-4">
                      {treatmentAlternatives.map((option) => (
                        <div
                          key={option.id}
                          onClick={() => setSelectedPlan(option.id)}
                          className={cn(
                            "border rounded-md p-5 cursor-pointer transition-all",
                            selectedPlan === option.id
                              ? "border-foreground bg-card"
                              : "border-border bg-card hover:border-foreground/40"
                          )}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="font-semibold text-foreground">{option.name}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">{option.tagline}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-muted-foreground mb-0.5">Eigenanteil</div>
                              <div className="text-2xl font-bold text-foreground font-mono">{formatCurrency(option.patient)}</div>
                            </div>
                          </div>

                          <div className="flex gap-6 text-xs text-muted-foreground mb-3">
                            <span>Gesamt: <span className="text-foreground font-medium">{formatCurrency(option.total)}</span></span>
                            <span>Kasse: <span className="text-foreground font-medium">{formatCurrency(option.insurance)}</span></span>
                          </div>

                          <button
                            onClick={(e) => { e.stopPropagation(); setExpandedCard(expandedCard === option.id ? null : option.id); }}
                            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                          >
                            Positionen
                            {expandedCard === option.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>

                          {expandedCard === option.id && (
                            <div className="mt-3 border-t border-border pt-3 space-y-2">
                              {option.positions.map((pos, i) => (
                                <div key={i} className="flex justify-between text-xs">
                                  <span className="text-muted-foreground">
                                    Zahn {pos.tooth} — {pos.desc}
                                    <span className="ml-2 font-mono text-blue-700">{pos.code}</span>
                                  </span>
                                  <span className="font-mono font-medium text-foreground">{formatCurrency(pos.patientShare)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
