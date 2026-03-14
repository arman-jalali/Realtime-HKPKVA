export const patientData = {
  id: "patient-schmidt-klaus",
  name: "Klaus Schmidt",
  dob: "14.03.1991",
  insurance: "AOK Nordost",
  insuranceType: "GKV",
  bonus: "60% Bonus",
  insuranceNumber: "A100000002",
  history: [
    { date: "12.01.2026", text: "Kontrolluntersuchung, Zahnreinigung" },
    { date: "03.11.2025", text: "Füllung Zahn 36 (Komposit)" }
  ]
};

// FDI Numbering standard arrays
// Top Right (Patient Right) 18 to 11
export const topRightTeeth = [18, 17, 16, 15, 14, 13, 12, 11];
// Top Left (Patient Left) 21 to 28
export const topLeftTeeth = [21, 22, 23, 24, 25, 26, 27, 28];
// Bottom Right (Patient Right) 48 to 41
export const bottomRightTeeth = [48, 47, 46, 45, 44, 43, 42, 41];
// Bottom Left (Patient Left) 31 to 38
export const bottomLeftTeeth = [31, 32, 33, 34, 35, 36, 37, 38];

export const mockTranscription = "Patient braucht eine Krone auf Zahn 34, VMK-Krone, und auf Zahn 45 eine Vollkeramikkrone. Beide Zähne sind bereits beschliffen und abgeformt.";

export const processingSteps = [
  { id: 1, label: "Spracherkennung abgeschlossen" },
  { id: 2, label: "Behandlung erkannt: 2× Krone (Zahn 34, 45)" },
  { id: 3, label: "BEMA/GOZ Codes werden zugeordnet..." },
  { id: 4, label: "Kostenberechnung wird erstellt..." },
  { id: 5, label: "Regelvalidierung (Ausschlüsse, Frequenz)..." },
  { id: 6, label: "Alternativvorschläge werden generiert..." }
];

export const treatmentPlan = [
  { pos: 1, desc: "Präparation Krone Zahn 34", code: "BEMA 20a", type: "GKV" },
  { pos: 2, desc: "VMK-Krone Zahn 34", code: "BEL-II Nr. 1", type: "Labor" },
  { pos: 3, desc: "Präparation Krone Zahn 45", code: "BEMA 20a", type: "GKV" },
  { pos: 4, desc: "Vollkeramik-Krone Zahn 45", code: "GOZ 2210", type: "Privat" },
  { pos: 5, desc: "Abformung", code: "BEMA 19", type: "GKV" },
  { pos: 6, desc: "Provisorium", code: "GOZ 2260", type: "Privat" },
];

export const costOptions = [
  {
    id: "basis",
    name: "Basis",
    theme: "gray",
    total: 680,
    insurance: 480,
    patient: 200,
    summary: "NEM-Kronen (Nicht-Edelmetall), funktional aber eingeschränkte Ästhetik",
    features: ["Regelversorgung der Kassen", "Sichtbare Metallränder möglich", "Ausreichende Haltbarkeit"],
    breakdown: [
      { desc: "Krone Zahn 34 (NEM)", cost: 340, patientShare: 100 },
      { desc: "Krone Zahn 45 (NEM)", cost: 340, patientShare: 100 }
    ]
  },
  {
    id: "standard",
    name: "Standard",
    theme: "green",
    recommended: true,
    total: 1240,
    insurance: 480,
    patient: 760,
    summary: "Empfohlener Kompromiss: Metallkeramik im Seitenzahnbereich, Vollkeramik im sichtbaren Bereich",
    features: ["Zahnfarbene Verblendung", "Gute Ästhetik & Haltbarkeit", "Biokompatibel (Zahn 45)"],
    breakdown: [
      { desc: "Krone Zahn 34 (VMK)", cost: 520, patientShare: 280 },
      { desc: "Krone Zahn 45 (Vollkeramik)", cost: 720, patientShare: 480 }
    ]
  },
  {
    id: "premium",
    name: "Premium",
    theme: "amber",
    total: 1890,
    insurance: 480,
    patient: 1410,
    summary: "Beide Kronen in Vollkeramik (Zirkon), höchste Ästhetik und Verträglichkeit",
    features: ["Perfekte, natürliche Optik", "Keine dunklen Ränder", "Höchste Körperverträglichkeit"],
    breakdown: [
      { desc: "Krone Zahn 34 (Vollkeramik)", cost: 945, patientShare: 705 },
      { desc: "Krone Zahn 45 (Vollkeramik)", cost: 945, patientShare: 705 }
    ]
  }
];
