import React from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Check, ArrowRight } from "lucide-react";
import { patientData } from "@/data/mock";
import { resetSessionState } from "./SessionPage";

export default function SubmittedPage() {
  const [, navigate] = useLocation();

  const handleNextPatient = (e: React.MouseEvent) => {
    e.preventDefault();
    resetSessionState();
    navigate("/");
  };
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-10 text-center relative overflow-hidden"
        >
          {/* Confetti / background decoration abstract */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-teal-100 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-100 rounded-full blur-3xl opacity-50"></div>

          <div className="relative z-10">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-500/30"
            >
              <Check className="w-12 h-12 text-white" strokeWidth={3} />
            </motion.div>

            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">HKP erfolgreich eingereicht!</h1>
            <p className="text-slate-500 mb-10">Der Plan wurde digital an die Krankenkasse übermittelt.</p>

            <div className="bg-slate-50 rounded-2xl p-6 text-left border border-slate-100 mb-10">
              <div className="space-y-4">
                <div className="flex justify-between border-b border-slate-200 pb-3">
                  <span className="text-slate-500">Patient</span>
                  <span className="font-bold text-slate-900">{patientData.name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-3">
                  <span className="text-slate-500">Kasse</span>
                  <span className="font-medium text-slate-900">{patientData.insurance}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-3">
                  <span className="text-slate-500">Gewählter Plan</span>
                  <span className="font-medium text-teal-700">Option A — Standard</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-3">
                  <span className="text-slate-500">Eigenanteil</span>
                  <span className="font-bold text-slate-900">760,00 €</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="text-slate-500">Bearbeitungszeit</span>
                  <span className="font-medium text-amber-600">ca. 2-4 Wochen</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <a 
                href="/"
                onClick={handleNextPatient}
                data-testid="link-next-patient"
                className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 cursor-pointer"
              >
                Nächster Patient
                <ArrowRight className="w-5 h-5" />
              </a>
              <Link 
                href="/"
                data-testid="link-back-overview"
                className="w-full py-4 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl font-semibold transition-colors"
              >
                Zurück zur Übersicht
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
