import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Mic, Square, CheckCircle2, Circle, Loader2, Download, Send, ChevronDown, ChevronUp, User } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { DentalChart } from "@/components/DentalChart";
import { cn, formatCurrency } from "@/lib/utils";
import { 
  patientData, 
  mockTranscription, 
  processingSteps, 
  treatmentPlan, 
  costOptions 
} from "@/data/mock";

type SessionState = 'idle' | 'recording' | 'processing' | 'plan_ready';

let persistedState: SessionState = 'idle';

export function resetSessionState() {
  persistedState = 'idle';
}

export default function SessionPage() {
  const [sessionState, setSessionStateRaw] = useState<SessionState>(persistedState);

  const setSessionState = (s: SessionState) => {
    persistedState = s;
    setSessionStateRaw(s);
  };
  const [recordingTime, setRecordingTime] = useState(0);
  const [typedTranscription, setTypedTranscription] = useState("");
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [activeTab, setActiveTab] = useState<'plan' | 'kosten' | 'hkp'>('plan');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>("standard");

  // Timer logic
  useEffect(() => {
    let interval: number;
    if (sessionState === 'recording') {
      interval = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [sessionState]);

  // Typewriter effect
  useEffect(() => {
    if (sessionState === 'recording') {
      let i = 0;
      setTypedTranscription("");
      const typeInterval = setInterval(() => {
        if (i < mockTranscription.length) {
          setTypedTranscription(prev => prev + mockTranscription.charAt(i));
          i++;
        } else {
          clearInterval(typeInterval);
        }
      }, 30);
      return () => clearInterval(typeInterval);
    }
  }, [sessionState]);

  // Processing steps logic
  useEffect(() => {
    if (sessionState === 'processing') {
      setCurrentStepIndex(0);
      let step = 0;
      const interval = setInterval(() => {
        step++;
        if (step < processingSteps.length) {
          setCurrentStepIndex(step);
        } else {
          clearInterval(interval);
          setTimeout(() => {
            setSessionState('plan_ready');
          }, 800);
        }
      }, 800);
      return () => clearInterval(interval);
    }
  }, [sessionState]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `00:${m}:${s}`;
  };

  const startRecording = () => setSessionState('recording');
  const stopRecording = () => setSessionState('processing');

  return (
    <div className="min-h-screen bg-background flex pl-64">
      <Sidebar />
      
      <main className="flex-1 p-8 h-screen overflow-hidden flex gap-8">
        
        {/* LEFT COLUMN: Context */}
        <div className="w-[40%] flex flex-col gap-6 h-full overflow-y-auto pb-24 pr-2">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Patientensitzung</h1>
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{patientData.name}</h2>
                <p className="text-slate-500 mt-1">geb. {patientData.dob}</p>
              </div>
              <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium border border-emerald-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Im Raum
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-2 pt-4 border-t border-slate-100">
              <div>
                <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider font-semibold">Versicherung</p>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900">{patientData.insurance}</span>
                  <span className="bg-teal-50 text-teal-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase">{patientData.insuranceType}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider font-semibold">Zuschuss</p>
                <p className="font-medium text-amber-600">{patientData.bonus}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider font-semibold">Versichertennummer</p>
                <p className="font-mono text-sm text-slate-700">{patientData.insuranceNumber}</p>
              </div>
            </div>
          </div>

          <DentalChart highlightedTeeth={[34, 45]} darkTeeth={[36]} />

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Letzte Besuche</h3>
            <div className="flex flex-col gap-3">
              {patientData.history.map((h, i) => (
                <div key={i} className="flex gap-4">
                  <div className="text-sm text-slate-500 font-mono shrink-0">{h.date}</div>
                  <div className="text-sm text-slate-700">{h.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Interaction */}
        <div className="w-[60%] flex flex-col h-full relative">
          <AnimatePresence mode="wait">
            
            {/* STATE 1: IDLE */}
            {sessionState === 'idle' && (
              <motion.div 
                key="idle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex-1 flex flex-col items-center justify-center text-center bg-white rounded-3xl shadow-sm border border-slate-200 p-12"
              >
                <button 
                  onClick={startRecording}
                  data-testid="button-start-recording"
                  className="mic-pulse w-32 h-32 rounded-full bg-teal-600 flex items-center justify-center text-white shadow-xl shadow-teal-600/20 hover:bg-teal-700 transition-colors cursor-pointer"
                >
                  <Mic className="w-12 h-12" />
                </button>
                <h2 className="mt-8 text-2xl font-bold text-slate-900">Therapie per Sprache beschreiben</h2>
                <p className="mt-3 text-slate-500 max-w-md">
                  Drücken Sie den Button und beschreiben Sie den Behandlungsplan natürlich. Die KI ordnet automatisch alle BEMA/GOZ Codes zu.
                </p>
                
                <div className="mt-12 bg-slate-50 p-6 rounded-2xl border border-slate-100 max-w-lg">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Beispiele:</p>
                  <p className="text-sm text-slate-600 italic">"Krone auf Zahn 34, VMK, und Krone auf 45, Vollkeramik"</p>
                  <p className="text-sm text-slate-600 italic mt-2">"Implantat regio 36 mit Keramikkrone"</p>
                </div>
              </motion.div>
            )}

            {/* STATE 2: RECORDING */}
            {sessionState === 'recording' && (
              <motion.div 
                key="recording"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex flex-col items-center justify-center text-center bg-white rounded-3xl shadow-sm border border-slate-200 p-12 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-red-50/50"></div>
                
                <div className="relative z-10 flex flex-col items-center w-full max-w-xl">
                  <div className="flex items-center gap-2 h-24 mb-8">
                    {[...Array(7)].map((_, i) => (
                      <div key={i} className="waveform-bar w-3 bg-red-500 rounded-full h-full transform origin-bottom"></div>
                    ))}
                  </div>

                  <div className="text-4xl font-mono font-light text-red-600 mb-8 tracking-widest">
                    {formatTime(recordingTime)}
                  </div>

                  <div className="w-full bg-white/80 backdrop-blur rounded-2xl p-6 border border-red-100 shadow-sm min-h-[120px] text-left mb-10">
                    <p className="text-lg text-slate-800 leading-relaxed">
                      {typedTranscription}
                      <span className="inline-block w-2 h-5 bg-teal-500 ml-1 animate-pulse"></span>
                    </p>
                  </div>

                  <button 
                    onClick={stopRecording}
                    data-testid="button-stop-recording"
                    className="flex items-center gap-3 px-8 py-4 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-lg shadow-lg shadow-red-600/20 transition-all hover:-translate-y-1 active:translate-y-0"
                  >
                    <Square className="w-5 h-5 fill-current" />
                    Aufnahme stoppen
                  </button>
                </div>
              </motion.div>
            )}

            {/* STATE 3: PROCESSING */}
            {sessionState === 'processing' && (
              <motion.div 
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col justify-center bg-white rounded-3xl shadow-sm border border-slate-200 p-16"
              >
                <h2 className="text-2xl font-bold text-slate-900 mb-10 text-center">KI erstellt Heil- und Kostenplan</h2>
                
                <div className="max-w-md mx-auto w-full space-y-6">
                  {processingSteps.map((step, index) => {
                    const isCompleted = index < currentStepIndex;
                    const isActive = index === currentStepIndex;
                    const isPending = index > currentStepIndex;
                    
                    return (
                      <motion.div 
                        key={step.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: isPending ? 0.3 : 1, x: 0 }}
                        className={cn(
                          "flex items-center gap-4 transition-all duration-300",
                          isActive ? "scale-105" : "scale-100"
                        )}
                      >
                        <div className="w-8 h-8 flex items-center justify-center shrink-0">
                          {isCompleted && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                            </motion.div>
                          )}
                          {isActive && (
                            <Loader2 className="w-7 h-7 text-teal-600 animate-spin" />
                          )}
                          {isPending && (
                            <Circle className="w-7 h-7 text-slate-300" />
                          )}
                        </div>
                        <span className={cn(
                          "text-lg font-medium",
                          isCompleted ? "text-slate-700" : isActive ? "text-teal-700" : "text-slate-400"
                        )}>
                          {step.label}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STATE 4: PLAN READY */}
            {sessionState === 'plan_ready' && (
              <motion.div 
                key="plan_ready"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 flex flex-col bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden"
              >
                {/* Tabs Header */}
                <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 pt-4 gap-6">
                  <button 
                    onClick={() => setActiveTab('plan')}
                    className={cn("pb-4 text-sm font-bold border-b-2 transition-colors", activeTab === 'plan' ? "border-teal-600 text-teal-700" : "border-transparent text-slate-500 hover:text-slate-700")}
                  >
                    Behandlungsplan
                  </button>
                  <button 
                    onClick={() => setActiveTab('kosten')}
                    className={cn("pb-4 text-sm font-bold border-b-2 transition-colors", activeTab === 'kosten' ? "border-teal-600 text-teal-700" : "border-transparent text-slate-500 hover:text-slate-700")}
                  >
                    Kostenübersicht
                  </button>
                  <button 
                    onClick={() => setActiveTab('hkp')}
                    className={cn("pb-4 text-sm font-bold border-b-2 transition-colors", activeTab === 'hkp' ? "border-teal-600 text-teal-700" : "border-transparent text-slate-500 hover:text-slate-700")}
                  >
                    HKP Dokument
                  </button>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-6 pb-32">
                  
                  {/* TAB: PLAN */}
                  {activeTab === 'plan' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="bg-teal-50 border border-teal-100 rounded-xl p-5 mb-6">
                        <div className="text-teal-800 font-semibold mb-1">Geplante Behandlung: Kronenversorgung</div>
                        <div className="text-teal-600 text-sm">Zähne: 34 (VMK-Krone), 45 (Vollkeramik-Krone)</div>
                      </div>

                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <table className="w-full text-left">
                          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                            <tr>
                              <th className="p-4 border-b">Pos</th>
                              <th className="p-4 border-b">Beschreibung</th>
                              <th className="p-4 border-b">Code</th>
                              <th className="p-4 border-b">Typ</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {treatmentPlan.map((item) => (
                              <tr key={item.pos} className="hover:bg-slate-50/50">
                                <td className="p-4 text-slate-500">{item.pos}</td>
                                <td className="p-4 font-medium text-slate-900">{item.desc}</td>
                                <td className="p-4 font-mono text-sm text-teal-700 bg-teal-50/30">{item.code}</td>
                                <td className="p-4">
                                  <span className={cn(
                                    "text-xs px-2 py-1 rounded-md font-medium",
                                    item.type === 'GKV' ? "bg-emerald-100 text-emerald-800" : 
                                    item.type === 'Privat' ? "bg-amber-100 text-amber-800" : 
                                    "bg-blue-100 text-blue-800"
                                  )}>
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

                  {/* TAB: KOSTEN */}
                  {activeTab === 'kosten' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 grid grid-cols-1 gap-6">
                      {costOptions.map((option) => (
                        <div 
                          key={option.id}
                          onClick={() => setSelectedPlan(option.id)}
                          className={cn(
                            "relative rounded-2xl border-2 transition-all duration-300 cursor-pointer p-6",
                            selectedPlan === option.id ? "shadow-md scale-[1.02]" : "hover:shadow-md",
                            option.theme === 'green' && selectedPlan === option.id ? "border-teal-500 bg-teal-50/30" : 
                            option.theme === 'amber' && selectedPlan === option.id ? "border-amber-500 bg-amber-50/30" :
                            option.theme === 'gray' && selectedPlan === option.id ? "border-slate-400 bg-slate-50" :
                            "border-slate-200 bg-white"
                          )}
                        >
                          {option.recommended && (
                            <div className="absolute -top-3 left-6 bg-teal-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                              Empfohlen
                            </div>
                          )}
                          
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-slate-900">{option.name}</h3>
                              <p className="text-sm text-slate-500 mt-1 max-w-md">{option.summary}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-slate-500 font-semibold uppercase mb-1">Ihr Eigenanteil</div>
                              <div className="text-3xl font-bold text-slate-900">{formatCurrency(option.patient)}</div>
                            </div>
                          </div>

                          <div className="flex gap-4 text-sm bg-white rounded-lg p-3 border border-slate-100 mb-4">
                            <div className="flex-1">
                              <span className="text-slate-500">Gesamtkosten:</span> <span className="font-semibold">{formatCurrency(option.total)}</span>
                            </div>
                            <div className="flex-1">
                              <span className="text-slate-500">Kassenanteil:</span> <span className="font-semibold text-emerald-600">{formatCurrency(option.insurance)}</span>
                            </div>
                          </div>

                          <div className="border-t border-slate-100 pt-4">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedCard(expandedCard === option.id ? null : option.id);
                              }}
                              className="flex items-center justify-between w-full text-sm font-medium text-slate-600 hover:text-slate-900"
                            >
                              <span>Positionen Details ansehen</span>
                              {expandedCard === option.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                            
                            <AnimatePresence>
                              {expandedCard === option.id && (
                                <motion.div 
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="pt-4 space-y-3">
                                    {option.breakdown.map((item, idx) => (
                                      <div key={idx} className="flex justify-between text-sm items-center">
                                        <div className="flex items-center gap-2">
                                          <span className="text-xl">🦷</span>
                                          <span className="text-slate-700">{item.desc}</span>
                                        </div>
                                        <div className="text-right">
                                          <div className="font-medium">{formatCurrency(item.cost)}</div>
                                          <div className="text-[10px] text-slate-400">Eigenanteil: {formatCurrency(item.patientShare)}</div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                          
                          {/* Selection indicator */}
                          <div className="absolute top-6 right-6">
                             <div className={cn(
                               "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                               selectedPlan === option.id ? "border-teal-600 bg-teal-600" : "border-slate-300"
                             )}>
                               {selectedPlan === option.id && <CheckCircle2 className="w-4 h-4 text-white" />}
                             </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* TAB: HKP */}
                  {activeTab === 'hkp' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="bg-[#fcfbf9] border border-stone-200 rounded-xl p-8 shadow-inner font-serif text-stone-800">
                        <div className="text-center border-b-2 border-stone-800 pb-4 mb-6">
                          <h2 className="text-2xl font-bold tracking-widest uppercase">Heil- und Kostenplan</h2>
                          <p className="text-stone-500 mt-1 font-sans text-sm">Zahnärztliche Versorgung</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-8 mb-8 font-sans text-sm">
                          <div>
                            <div className="font-bold border-b border-stone-300 mb-2 pb-1">Patientendaten</div>
                            <div>Name: {patientData.name}</div>
                            <div>Geboren: {patientData.dob}</div>
                            <div>Kasse: {patientData.insurance}</div>
                          </div>
                          <div>
                            <div className="font-bold border-b border-stone-300 mb-2 pb-1">Praxis</div>
                            <div>Dr. med. dent. Schmidt</div>
                            <div>Musterstraße 123</div>
                            <div>10115 Berlin</div>
                          </div>
                        </div>

                        <div className="mb-8 font-sans text-sm">
                          <div className="font-bold border-b border-stone-300 mb-2 pb-1">Befund & Therapieplanung</div>
                          <table className="w-full text-left">
                            <thead>
                              <tr className="text-xs text-stone-500">
                                <th className="pb-2">Zahn</th>
                                <th className="pb-2">Befund</th>
                                <th className="pb-2">Therapie</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-t border-stone-100">
                                <td className="py-2 font-bold">34</td>
                                <td className="py-2">ww</td>
                                <td className="py-2">KM (BEMA 20a, BEL-II)</td>
                              </tr>
                              <tr className="border-t border-stone-100">
                                <td className="py-2 font-bold">45</td>
                                <td className="py-2">ww</td>
                                <td className="py-2">KM (GOZ 2210)</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        <div className="flex justify-center gap-4 mt-10 font-sans">
                          <button className="flex items-center gap-2 px-4 py-2 border border-stone-300 rounded hover:bg-stone-100 transition-colors text-sm">
                            <Download className="w-4 h-4" />
                            PDF herunterladen
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sticky Action Bar */}
                <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-slate-200 p-6 flex justify-between items-center z-10">
                  <button className="px-6 py-3 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                    Plan bearbeiten
                  </button>
                  <div className="flex gap-4">
                    <Link 
                      href="/patient-view"
                      data-testid="link-patient-view"
                      className="px-6 py-3 font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition-colors flex items-center gap-2"
                    >
                      <User className="w-5 h-5" />
                      Patient zeigen
                    </Link>
                    <Link 
                      href="/submitted"
                      data-testid="link-submit"
                      className="px-8 py-3 font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-lg shadow-teal-600/20 transition-all hover:-translate-y-0.5 flex items-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                      An Kasse senden
                    </Link>
                  </div>
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

