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
export const topRightTeeth = [18, 17, 16, 15, 14, 13, 12, 11];
export const topLeftTeeth = [21, 22, 23, 24, 25, 26, 27, 28];
export const bottomRightTeeth = [48, 47, 46, 45, 44, 43, 42, 41];
export const bottomLeftTeeth = [31, 32, 33, 34, 35, 36, 37, 38];

export const mockTranscription = "Patient braucht eine Krone auf Zahn 34, VMK-Krone, und auf Zahn 45 eine Vollkeramikkrone. Beide Zähne sind bereits beschliffen und abgeformt.";

export const processingSteps = [
  { id: 1, label: "Spracherkennung abgeschlossen" },
  { id: 2, label: "Behandlung erkannt: 2× Krone (Zahn 34, 45)" },
  { id: 3, label: "BEMA/GOZ Codes werden zugeordnet..." },
  { id: 4, label: "Kassenleistung & Eigenanteil berechnet..." },
  { id: 5, label: "Regelvalidierung (Ausschlüsse, Frequenz)..." },
  { id: 6, label: "Behandlungsplan wird erstellt..." }
];

export type TreatmentAlternative = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  recommended?: boolean;
  total: number;
  insurance: number;
  patient: number;
  highlights: string[];
  positions: {
    tooth: number;
    desc: string;
    patientDesc: string;
    code: string;
    type: "GKV" | "Privat" | "Labor";
    cost: number;
    patientShare: number;
  }[];
};

export const treatmentAlternatives: TreatmentAlternative[] = [
  {
    id: "kassenversorgung",
    name: "Kassenversorgung",
    tagline: "Metallkeramik-Krone (NEM)",
    description: "Die bewährte Regelversorgung der Kasse. Funktional und langlebig — die Krankenkasse übernimmt den Festzuschuss.",
    total: 680,
    insurance: 480,
    patient: 200,
    highlights: [
      "Von der Kasse voll anerkannt",
      "Bewährtes, robustes Material",
      "Metallrand am Zahnfleisch sichtbar möglich",
      "Lieferzeit: ca. 2 Wochen"
    ],
    positions: [
      { tooth: 34, desc: "Präparation Krone Zahn 34", patientDesc: "Vorbereitung des Zahns für die Krone", code: "BEMA 20a", type: "GKV", cost: 60, patientShare: 0 },
      { tooth: 34, desc: "NEM-Metallkeramik-Krone Zahn 34", patientDesc: "Metallkeramik-Krone (NEM-Legierung)", code: "BEL-II Nr. 1", type: "Labor", cost: 280, patientShare: 100 },
      { tooth: 45, desc: "Präparation Krone Zahn 45", patientDesc: "Vorbereitung des Zahns für die Krone", code: "BEMA 20a", type: "GKV", cost: 60, patientShare: 0 },
      { tooth: 45, desc: "NEM-Metallkeramik-Krone Zahn 45", patientDesc: "Metallkeramik-Krone (NEM-Legierung)", code: "BEL-II Nr. 1", type: "Labor", cost: 280, patientShare: 100 }
    ]
  },
  {
    id: "vollkeramik",
    name: "Vollkeramik",
    tagline: "Zirkonoxid-Krone (privat)",
    description: "Höchste Ästhetik und Biokompatibilität. Vollkeramische Zirkonkronen sind unsichtbar, metallgrei und ideal für sichtbare Zähne.",
    recommended: true,
    total: 1890,
    insurance: 480,
    patient: 1410,
    highlights: [
      "Metallfreie, hochwertige Keramik",
      "Natürliche Zahnfarbe, kein dunkler Rand",
      "Höchste Biokompatibilität",
      "Lieferzeit: ca. 2 Wochen"
    ],
    positions: [
      { tooth: 34, desc: "Präparation Krone Zahn 34", patientDesc: "Vorbereitung des Zahns für die Krone", code: "BEMA 20a", type: "GKV", cost: 60, patientShare: 0 },
      { tooth: 34, desc: "Vollkeramik-Zirkondioxidkrone Zahn 34", patientDesc: "Hochwertige Zirkonkrone (metallgrei)", code: "GOZ 2210", type: "Privat", cost: 885, patientShare: 705 },
      { tooth: 45, desc: "Präparation Krone Zahn 45", patientDesc: "Vorbereitung des Zahns für die Krone", code: "BEMA 20a", type: "GKV", cost: 60, patientShare: 0 },
      { tooth: 45, desc: "Vollkeramik-Zirkondioxidkrone Zahn 45", patientDesc: "Hochwertige Zirkonkrone (metallgrei)", code: "GOZ 2210", type: "Privat", cost: 885, patientShare: 705 }
    ]
  }
];

// The single dentist-approved plan shown to the patient
export const currentPlan = treatmentAlternatives[1]; // Vollkeramik — dentist decision

export const treatmentPlan = [
  { pos: 1, desc: "Präparation Krone Zahn 34", code: "BEMA 20a", type: "GKV" },
  { pos: 2, desc: "VMK-Krone Zahn 34", code: "BEL-II Nr. 1", type: "Labor" },
  { pos: 3, desc: "Präparation Krone Zahn 45", code: "BEMA 20a", type: "GKV" },
  { pos: 4, desc: "Vollkeramik-Krone Zahn 45", code: "GOZ 2210", type: "Privat" },
  { pos: 5, desc: "Abformung", code: "BEMA 19", type: "GKV" },
  { pos: 6, desc: "Provisorium", code: "GOZ 2260", type: "Privat" },
];
