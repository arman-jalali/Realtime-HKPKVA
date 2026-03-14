import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, CheckCircle2, Star } from "lucide-react";
import { patientData, costOptions } from "@/data/mock";
import { formatCurrency, cn } from "@/lib/utils";

export default function PatientViewPage() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const timelineSteps = [
    "Sie wählen Ihren Plan",
    "Wir senden den Plan an Ihre Kasse",
    "Nach Genehmigung vereinbaren wir die Termine",
    "Behandlung beginnt"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-white text-slate-900 font-sans selection:bg-teal-200">
      
      {/* Top Nav (Subtle) */}
      <div className="absolute top-6 left-6">
        <Link href="/" data-testid="link-back-to-session" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium">
          <ArrowLeft className="w-5 h-5" />
          Zurück zur Sitzung
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col min-h-screen">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Ihr Behandlungsplan, {patientData.name.split(' ')[0]}
          </h1>
          <p className="text-lg text-slate-500 font-medium">
            Erstellt am 14.03.2026 von Dr. Schmidt
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end mb-20 px-4">
          {costOptions.map((option, idx) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 50 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className={cn(
                "bg-white rounded-3xl p-8 relative flex flex-col h-full border transition-all duration-300 hover:-translate-y-2 hover:shadow-xl",
                option.recommended 
                  ? "shadow-2xl shadow-teal-900/10 border-teal-500 md:-translate-y-4" 
                  : "shadow-lg shadow-slate-200/50 border-white"
              )}
            >
              {option.recommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-teal-500 text-white px-4 py-1.5 rounded-full text-sm font-bold tracking-wider flex items-center gap-1.5 shadow-md">
                  <Star className="w-4 h-4 fill-current" />
                  EMPFOHLEN
                </div>
              )}

              <div className="text-center mb-8 mt-2">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{option.name}</h3>
                <div className="text-5xl font-black text-slate-900 tracking-tight my-4">
                  {formatCurrency(option.patient)}
                </div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Ihr Eigenanteil</p>
              </div>

              {/* Progress Bar for ratio */}
              <div className="mb-8">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-teal-700 font-semibold">Kasse: {formatCurrency(option.insurance)}</span>
                  <span className="text-slate-600">Gesamt: {formatCurrency(option.total)}</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={mounted ? { width: `${(option.insurance / option.total) * 100}%` } : {}}
                    transition={{ duration: 1, delay: 0.5 + (idx * 0.1) }}
                    className="h-full bg-gradient-to-r from-teal-400 to-teal-500 rounded-full"
                  />
                </div>
              </div>

              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900 mb-4">Was Sie bekommen:</p>
                <ul className="space-y-4 mb-8">
                  {option.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
                      <span className="text-slate-600 leading-snug">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </motion.div>
          ))}
        </div>

        {/* Timeline */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="max-w-4xl mx-auto w-full bg-white/60 backdrop-blur rounded-3xl p-10 border border-slate-100 shadow-sm mt-auto"
        >
          <h4 className="text-xl font-bold text-slate-900 mb-8 text-center">Was passiert als nächstes?</h4>
          
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-200 hidden md:block" />
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {timelineSteps.map((step, i) => (
                <div key={i} className="relative z-10 flex flex-row md:flex-col items-center md:text-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center shrink-0 shadow-md shadow-teal-600/20">
                    {i + 1}
                  </div>
                  <div className="font-medium text-slate-700 leading-tight">
                    {step}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="text-center mt-12 text-slate-500 pb-8">
          Haben Sie Fragen? Wir besprechen die Optionen gerne im Detail.
        </div>
      </div>
    </div>
  );
}
