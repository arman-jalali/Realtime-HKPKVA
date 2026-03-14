import React from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Check } from "lucide-react";
import { patientData, currentPlan } from "@/data/mock";
import { resetSessionState } from "./SessionPage";
import { formatCurrency } from "@/lib/utils";

const rows = [
  { label: "Patient", value: (p: typeof patientData, c: typeof currentPlan) => p.name },
  { label: "Krankenkasse", value: (p: typeof patientData, c: typeof currentPlan) => p.insurance },
  { label: "Versorgungsart", value: (p: typeof patientData, c: typeof currentPlan) => c.name },
  { label: "Material", value: (p: typeof patientData, c: typeof currentPlan) => c.tagline },
  { label: "Eigenanteil", value: (p: typeof patientData, c: typeof currentPlan) => formatCurrency(c.patient) },
  { label: "Bearbeitungszeit", value: () => "ca. 2–4 Wochen" },
];

export default function SubmittedPage() {
  const [, navigate] = useLocation();

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    resetSessionState();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-sm w-full">

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          {/* Checkmark */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 260 }}
            className="w-12 h-12 bg-foreground flex items-center justify-center rounded-sm mb-7"
          >
            <Check className="w-6 h-6 text-background" strokeWidth={2.5} />
          </motion.div>

          <h1 className="text-2xl font-bold text-foreground mb-1">HKP eingereicht</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Der Plan wurde digital an die Krankenkasse übermittelt.
          </p>

          {/* Summary table — ruled, no card wrapper */}
          <div className="border border-border rounded-md overflow-hidden mb-7">
            {rows.map((row, i) => (
              <div
                key={row.label}
                className={`flex justify-between px-5 py-3 text-sm ${i < rows.length - 1 ? "border-b border-border" : ""}`}
              >
                <span className="text-muted-foreground">{row.label}</span>
                <span className="font-medium text-foreground text-right">{row.value(patientData, currentPlan)}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <a
              href="/"
              onClick={handleNext}
              data-testid="link-next-patient"
              className="w-full py-3 bg-foreground text-background font-semibold text-sm rounded-md text-center hover:bg-foreground/90 transition-colors cursor-pointer block"
            >
              Nächster Patient
            </a>
            <a
              href="/"
              onClick={handleNext}
              data-testid="link-back-overview"
              className="w-full py-3 border border-border text-foreground text-sm font-medium rounded-md text-center hover:bg-muted transition-colors cursor-pointer block"
            >
              Zurück zur Übersicht
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
