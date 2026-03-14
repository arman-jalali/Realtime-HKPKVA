# DentAI — Hackathon Frontend Spec

## Product Summary

An AI-powered assistant for German dental practices that lets dentists **voice-describe a treatment plan** and instantly generates a compliant cost estimate (HKP/Kostenvoranschlag) — presented in a **patient-friendly format** with alternative options at different price points.

**Core value proposition:** Dentists currently spend 10–15 minutes manually looking up BEMA/GOZ billing codes and calculating costs. DentAI collapses this to under 60 seconds via voice → AI → instant cost plan.

**Hackathon context:** This frontend integrates with an existing backend repo (`odontathon-2026`) that already provides a Hono API, a FHIR-based billing rule engine, GOZ/BEMA catalogs (500+ codes), 15 seed patients with dental findings, and Aidbox as FHIR store. The FE uses **real billing data** where possible (catalogs, rules, patients) and only mocks the voice/STT pipeline and scheduling data. The audience is hackathon judges evaluating innovation, UX clarity, and feasibility.

---

## Backend Integration (Existing Repo)

The frontend lives inside the `odontathon-2026` repo as a `web/` directory alongside the existing backend.

### What the repo already provides
| Asset | Location | Used for |
|-------|----------|----------|
| **GOZ catalog** (215 codes) | `aidbox/seed/goz-catalog.json` | Real billing codes, point values, multipliers |
| **BEMA catalog** (~230 codes) | `aidbox/seed/bema-catalog.json` | Statutory billing codes |
| **Festzuschuss catalog** (~50 classes) | `aidbox/seed/festzuschuss-catalog.json` | Insurance benefit tiers |
| **Rule engine** | `src/lib/billing/engine.ts` | Validate codes, check exclusions/inclusions/frequency/multipliers |
| **Billing patterns** | `src/lib/billing/patterns/` | ZE (crowns, bridges, implants), KCH, PAR templates |
| **15 seed patients** | `src/seed/patients.ts` | FHIR Patient + Coverage (GKV/PKV) resources |
| **Dental findings** | `src/seed/dental-findings.ts` | Tooth status observations per patient (FDI numbering) |
| **Practice data** | `src/seed/practice.ts` | Organizations, practitioners, locations |
| **API: GET /api/rules** | `src/index.ts` | All billing rules (exclusion, inclusion, requirement, frequency, multiplier) |
| **API: GET /api/catalogs/status** | `src/index.ts` | Catalog entry count from Aidbox |

### What remains mocked in the FE
- **Voice recording & STT** — Web Audio API for waveform visualization; transcription text is simulated with typewriter effect
- **AI treatment parsing** — The step-by-step "processing" animation is timed; mapping voice → billing codes is simulated (future: LLM integration)
- **Today's schedule** — Appointment times/status are mocked (no scheduling system yet)
- **HKP document generation** — Preview is stylized HTML, not a real KZV form
- **Cost calculation** — Hardcoded cost tiers for the demo; future: compute from real catalog point values + multipliers

### Architecture
```
odontathon-2026/
├── src/                  ← Hono backend (port 3001)
│   ├── index.ts          ← API routes
│   ├── lib/billing/      ← Rule engine, patterns, rules
│   ├── seed/             ← Patient/practice FHIR data
│   └── fhir/             ← Aidbox client
├── web/                  ← NEW: React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── data/         ← Mocked schedule + demo data
│   │   └── lib/          ← API client, shared types
│   └── vite.config.ts    ← Proxy /api → localhost:3001
├── etl/                  ← Catalog ETL pipelines
├── aidbox/seed/          ← Generated FHIR bundles
└── docker-compose.yaml   ← Aidbox + Postgres
```

### Running the full stack
```bash
docker compose up -d        # Aidbox + Postgres
bun run seed:catalogs       # Load GOZ/BEMA/Festzuschuss into Aidbox
bun run seed:practice       # Load patients + practice data
bun run dev                 # Hono API on :3001
cd web && bun run dev       # Vite dev server on :5173 (proxies /api → :3001)
```

---

## Design Direction

**Aesthetic:** Clean, clinical-modern. Think of a premium medical SaaS — not sterile hospital white, but warm and trustworthy. Somewhere between a fintech dashboard and a medical tool.

**Color palette:**
- Primary: Deep teal (#0F766E) — trustworthy, medical, professional
- Accent: Warm amber (#F59E0B) — for CTAs, active states, highlights
- Background: Off-white (#F8FAFC) with white cards
- Text: Slate-900 (#0F172A) for headings, Slate-600 (#475569) for body
- Success green (#059669), Warning amber (#D97706), Info blue (#2563EB)
- Patient-facing views use softer, more approachable colors

**Typography:**
- Headings: A clean sans-serif (e.g., "Plus Jakarta Sans" or "DM Sans")
- Body: System font stack or "Inter" for readability in data-dense views
- Monospace for billing codes

**Layout principles:**
- Desktop-first (dentists use desktop/tablet in practice)
- Max-width container (1280px), generous whitespace
- Cards with subtle shadows, rounded corners (12px)
- Sidebar navigation on the left (collapsed icon state available)

---

## Application Structure

### Navigation (Left Sidebar)
- **Logo** (top) — "DentAI" with a tooth/AI icon
- **Patienten** — Patient list/search
- **Neue Sitzung** — Start new session (primary action, highlighted)
- **Behandlungspläne** — Treatment plans archive
- **Einstellungen** — Settings

---

## Screen 1: Patient Dashboard

**Route:** `/`

**Purpose:** Overview of today's patients and recent activity. This is the landing screen.

### Layout
- Top bar: "Guten Morgen, Dr. Schmidt" + date + quick stats
- Quick stats row (3 cards):
  - "Heutige Patienten" — count (e.g., 12)
  - "Offene HKPs" — pending cost plans (e.g., 3)
  - "Genehmigt" — approved plans this week (e.g., 7)
- Main content: Today's patient schedule as a list/table
  - Columns: Zeit (time), Patient (name), Grund (reason), Status (badge)
  - Status badges: "Wartend" (waiting, yellow), "Im Raum" (in room, green), "Abgeschlossen" (done, gray)
  - Clicking a patient row navigates to Screen 2

### Today's Schedule (Mocked — uses real seed patients)
The schedule/appointment times are mocked (no scheduling backend), but patient names and IDs reference the real seed data in `src/seed/patients.ts`. This allows clicking a patient row to load their real FHIR data (dental findings, insurance coverage, etc.).

```json
[
  { "time": "09:00", "patientId": "patient-braun-sophie", "name": "Sophie Braun", "reason": "Kontrolluntersuchung", "status": "done", "insurance": "GKV (Barmer)" },
  { "time": "09:30", "patientId": "patient-schmidt-klaus", "name": "Klaus Schmidt", "reason": "Brücke Zahn 34-36", "status": "in_room", "insurance": "GKV (AOK Nordost, 60% Bonus)" },
  { "time": "10:15", "patientId": "patient-mueller-anna", "name": "Anna Müller", "reason": "Brücke 3-gliedrig", "status": "waiting", "insurance": "GKV (TK)" },
  { "time": "11:00", "patientId": "patient-schulz-wolfgang", "name": "Wolfgang Schulz", "reason": "Implantologie Beratung", "status": "waiting", "insurance": "PKV (Signal Iduna)" },
  { "time": "11:45", "patientId": "patient-wagner-petra", "name": "Petra Wagner", "reason": "Kronenerneuerung", "status": "waiting", "insurance": "GKV (Barmer, 70% Bonus)" }
]
```

---

## Screen 2: Patient Session — The Hero Screen

**Route:** `/session/:patientId`

**Purpose:** This is where the magic happens. The dentist sees the patient info, speaks the treatment plan, and the AI generates everything in real-time.

### Layout — 2-Column

**Left Column (40%):** Patient Context Panel
- Patient card at top (loaded from real FHIR Patient + Coverage resources):
  - Name: "Klaus Schmidt" (seed: `patient-schmidt-klaus`)
  - Geburtsdatum: 14.03.1991 (computed from seed)
  - Versicherung: "AOK Nordost" (GKV badge — green, 60% Bonus)
  - Versichertennummer: A100000002
- Dental chart (simplified): A visual representation of upper and lower teeth (FDI numbering: 11-18, 21-28, 31-38, 41-48). Tooth status is loaded from real FHIR Observations in `src/seed/dental-findings.ts` — each patient has ~23 tooth findings with statuses like `crown-intact`, `carious`, `bridge-anchor`, `absent`, etc. Highlight the teeth relevant to today's treatment in amber. This can be a simplified SVG/diagram — doesn't need to be anatomically detailed, just schematic tooth positions.
- Recent history section (mocked):
  - "12.01.2026 — Kontrolluntersuchung, Zahnreinigung"
  - "03.11.2025 — Füllung Zahn 36 (Komposit)"

**Right Column (60%):** AI Session Panel — This is the core interaction

#### State 1: Ready to Record
- Large centered microphone button (circular, teal, pulsing subtly)
- Text: "Therapie per Sprache beschreiben"
- Subtitle: "Drücken Sie den Button und beschreiben Sie den Behandlungsplan"
- Below: Small text examples of what to say:
  - _"Krone auf Zahn 34, VMK, und Krone auf 45, Vollkeramik"_
  - _"Implantat regio 36 mit Keramikkrone"_

#### State 2: Recording (Active)
- Microphone button is now red, with animated sound wave/waveform visualization around it
- Live transcription appears below in a text area with a typing animation:
  - "Patient braucht eine Krone auf Zahn 34, VMK-Krone, und auf Zahn 45 eine Vollkeramikkrone. Beide Zähne sind bereits beschliffen und abgeformt..."
- Button text: "Aufnahme stoppen"
- Timer showing recording duration: "00:00:23"

#### State 3: AI Processing
- Transcription is complete and shown in a card (editable text area in case the dentist wants to correct)
- Below the transcription: Animated processing indicator
- Show a step-by-step progress with checkmarks appearing one by one:
  1. ✅ "Spracherkennung abgeschlossen"
  2. ✅ "Behandlung erkannt: 2× Krone (Zahn 34, 45)"
  3. ⏳ "BEMA/GOZ Codes werden zugeordnet..." (loading spinner)
  4. ○ "Kostenberechnung wird erstellt..."
  5. ○ "Regelvalidierung (Ausschlüsse, Frequenz)..."
  6. ○ "Alternativvorschläge werden generiert..."
- This should animate through over ~3 seconds (mocked timing)
- **Backend integration note:** Steps 3-5 can call real APIs in the future. The repo's `RuleEngine` (`src/lib/billing/engine.ts`) already supports `validate(items)` for exclusion/inclusion/frequency checks, `suggestPatterns(findings)` for pattern matching, and `checkMultiplier(code, factor)` for GOZ multiplier validation. Billing patterns in `src/lib/billing/patterns/ze-patterns.ts` define required/optional codes for crowns, bridges, implants, etc. For the hackathon demo, the animation is timed and results are pre-computed.

#### State 4: Plan Generated — Tabs View
After processing completes, show a tabbed interface:

**Tab: "Behandlungsplan"** (Treatment plan summary)
- Clean card showing:
  - Behandlung: Kronenversorgung
  - Zähne: 34 (VMK-Krone), 45 (Vollkeramik-Krone)
  - Erkannte Leistungen (table):
    | Position | Beschreibung | BEMA/GOZ Code | Typ |
    |----------|-------------|---------------|-----|
    | 1 | Präparation Krone Zahn 34 | BEMA 20a | GKV |
    | 2 | VMK-Krone Zahn 34 | BEL-II Nr. 1 | Labor |
    | 3 | Präparation Krone Zahn 45 | BEMA 20a | GKV |
    | 4 | Vollkeramik-Krone Zahn 45 | GOZ 2210 | Privat |
    | 5 | Abformung | BEMA 19 | GKV |
    | 6 | Provisorium | GOZ 2260 | Privat |

**Tab: "Kostenübersicht"** (Cost breakdown — the patient-friendly view)
- This is the key differentiator. Show costs in 3 tiers as visual cards:

**Option A — Standard (Recommended)** ⭐
- Visual: Green border card, "Empfohlen" badge
- Gesamtkosten: €1.240,00
- Davon Kassenanteil: €480,00
- Ihr Eigenanteil: €760,00
- Breakdown with simple icons:
  - 🦷 Krone Zahn 34 (VMK): €520 (Eigenanteil: €280)
  - 🦷 Krone Zahn 45 (Vollkeramik): €720 (Eigenanteil: €480)
- Optional: Simple tooth illustration showing where each crown goes

**Option B — Premium**
- Visual: Amber/gold border card
- Gesamtkosten: €1.890,00
- Davon Kassenanteil: €480,00
- Ihr Eigenanteil: €1.410,00
- Upgrade: Beide Kronen in Vollkeramik (Zirkon), höchste Ästhetik
- Same breakdown format

**Option C — Basis**
- Visual: Gray border card
- Gesamtkosten: €680,00
- Davon Kassenanteil: €480,00
- Ihr Eigenanteil: €200,00
- Note: NEM-Kronen (Nicht-Edelmetall), funktional aber eingeschränkte Ästhetik
- Same breakdown format

Each option card should have:
- A "Details anzeigen" expand/collapse for the full BEMA/GOZ code table
- A "Auswählen" button

**Tab: "HKP Dokument"** (Formal HKP document preview)
- Shows a preview of the formal Heil- und Kostenplan document
- This can be a simplified/stylized version — doesn't need to match the exact KZV form
- Key fields shown: Patient data, Befund (findings), Therapie (therapy), cost columns
- Buttons: "PDF herunterladen", "An Kasse senden"

### Action Bar (Bottom of Right Column, sticky)
- "Plan bearbeiten" (secondary button)
- "Patient zeigen" (primary button — switches to patient-friendly view, Screen 3)
- "An Kasse senden" (primary teal button)

---

## Screen 3: Patient-Friendly Cost View

**Route:** `/session/:patientId/patient-view`

**Purpose:** A simplified, visual presentation designed to be shown directly to the patient on a tablet or screen. This is what the dentist turns around to show the patient.

### Design Notes
- This view should feel COMPLETELY different from the clinical backend
- Warmer colors, larger text, friendly illustrations
- No billing codes visible — pure patient language
- Background: Soft gradient (light blue to white)

### Layout
- Header: "Ihr Behandlungsplan" + Patient name
- Subtitle: "Erstellt am 14.03.2026 von Dr. Schmidt"

- **Visual tooth diagram** showing which teeth are affected, with friendly labels pointing to them

- **Cost options as large, visual cards** (similar to pricing page on a SaaS):
  - Each card:
    - Option name (Standard / Premium / Basis)
    - Simple illustration or icon
    - "Was Sie bekommen" — 2-3 bullet points in plain German
    - Total cost in large text
    - "Ihr Anteil: €XXX" highlighted
    - "Kassenanteil: €XXX" in smaller text
    - Visual bar showing the ratio (insurance vs. patient share)
  - Cards are side by side, "Empfohlen" card is slightly elevated/highlighted

- Below cards: "Was passiert als nächstes?" timeline:
  1. "Sie wählen Ihren Plan"
  2. "Wir senden den Plan an Ihre Kasse"
  3. "Nach Genehmigung vereinbaren wir die Termine"
  4. "Behandlung beginnt"

- Footer: "Haben Sie Fragen? Sprechen Sie uns an."

---

## Screen 4: Submission Confirmation

**Route:** `/session/:patientId/submitted`

**Purpose:** Confirmation after the plan is sent to the insurance.

### Layout
- Success animation (checkmark)
- "HKP erfolgreich eingereicht!"
- Summary card:
  - Patient: Klaus Schmidt (from seed data)
  - Versicherung: AOK Nordost (GKV, 60% Bonus)
  - Gewählter Plan: Option A — Standard
  - Eigenanteil: €760,00
  - Voraussichtliche Bearbeitungszeit: 2-4 Wochen
- Actions:
  - "Zurück zur Übersicht"
  - "Nächster Patient"

---

## Data Reference

### Real Data (from repo)

The following are loaded from real FHIR catalogs in `aidbox/seed/`:

**GOZ Catalog** — 215 private billing codes with point values and multiplier ranges (1.0x → 2.3x threshold → 3.5x max)
**BEMA Catalog** — ~230 statutory billing codes
**Festzuschuss Catalog** — ~50 benefit classes with Regelversorgung definitions
**Billing Rules** — 95+ rules: exclusions, inclusions, requirements, frequency limits, multiplier tiers (via `GET /api/rules`)
**Billing Patterns** — Templates for common treatments: single crown (`goz-single-crown`), 3-unit bridge (`goz-bridge-3-unit`), implant (`goz-single-implant`), etc.
**Patients** — 15 FHIR patients with GKV/PKV coverage and ZE bonus percentages (0%, 60%, 70%)
**Dental Findings** — ~23 tooth observations per patient with FDI numbering and statuses (crown-intact, carious, absent, bridge-anchor, etc.)

### Codes Used in Demo

These codes exist in the real catalogs — no need to hardcode them:
```
BEMA 19   — Vollgusskrone (Regelversorgung)
BEMA 91b  — Brückenglied (Regelversorgung)
GOZ 0030  — HKP-Aufstellung
GOZ 2200  — Vollkrone Metall
GOZ 2210  — Vollkeramikkrone (Zirkon)
GOZ 2220  — Teilkrone
GOZ 5000  — Brückenglied (GOZ)
GOZ 5120  — Eingliedern Brücke
GOZ 9000  — Implantatinsertion
GOZ 2197  — Adhäsive Befestigung
```

### Sample Cost Calculation (Mocked for demo)
Cost calculation is currently hardcoded for the demo. In the future, it can be computed from the real catalog's point values + multiplier rules.
```
Standard VMK-Krone:
  Labor (BEL-II):     €320
  Zahnarzt (BEMA 20a): €200 (Kassenanteil: €200)
  Material:            €0 (in Labor enthalten)
  → Gesamt: €520, Kasse: €200, Eigen: €320

Vollkeramik-Krone (Privat):
  Labor:               €450
  Zahnarzt (GOZ 2210): €270 (2,3-facher Satz)
  Material:            €0 (in Labor enthalten)
  → Gesamt: €720, Kasse: €0*, Eigen: €720
  *Festzuschuss der Kasse: €280 (Regelversorgung)
```

---

## Interaction & Animation Notes

### Voice Recording
- Microphone button: CSS pulse animation when idle, active waveform when recording
- Use Web Audio API visualization for the waveform (or a simple CSS animation of bars)
- Transcription text should appear with a typewriter/streaming effect

### AI Processing Steps
- Steps appear one by one with ~800ms delay between each
- Checkmark icon animates in (scale from 0 to 1 with slight bounce)
- Loading spinner on the current step
- When all complete, the tabs section slides up from below

### Cost Option Cards
- Hover: Slight lift (translateY -2px) + shadow increase
- Selected: Teal border + filled radio indicator
- On mobile: Stack vertically with swipe between options

### Patient View
- Entrance animation: Cards fade in from bottom, staggered
- Cost bar (insurance vs patient) fills up like a progress bar on view

---

## Technical Notes for Prototyping

### Framework
- React + TypeScript (Vite as build tool)
- Tailwind CSS for styling
- Lucide React for icons
- Framer Motion or CSS animations
- React Router for client-side routing

### Integration with Existing Backend
- The Hono API runs on port 3001 (`bun run dev`)
- Vite dev server proxies `/api/*` requests to `localhost:3001`
- Patient data, dental findings, and billing catalogs come from Aidbox via the API
- For offline/demo mode: embed a fallback data layer using the same seed data structures from `src/seed/`

### State Management
- Simple React state (useState/useReducer)
- Session flow: `idle → recording → processing → plan_ready`
- Patient data: fetched from API or loaded from embedded seed data
- Schedule data: mocked inline (no scheduling backend)

### Data Flow
```
Seed patients (src/seed/patients.ts)  →  Aidbox FHIR  →  GET /api/patients/:id  →  FE
Dental findings (src/seed/dental-findings.ts)  →  Aidbox  →  GET /api/patients/:id/findings  →  DentalChart
Billing rules (src/lib/billing/rules/)  →  GET /api/rules  →  FE (validation display)
Billing patterns (src/lib/billing/patterns/)  →  POST /api/validate (future)  →  Processing results
```
Note: Some API endpoints (e.g., `/api/patients/:id`) need to be added to the Hono backend. For the hackathon, the FE can import seed data directly as a fallback.

### Key Components to Build
1. `Sidebar` — Navigation
2. `PatientDashboard` — Home screen with today's schedule
3. `PatientContextPanel` — Left column with patient info + dental chart
4. `VoiceRecorder` — Microphone button + waveform + transcription
5. `AIProcessingSteps` — Animated step-by-step progress
6. `TreatmentPlanTabs` — Tabbed view (Behandlungsplan / Kosten / HKP)
7. `CostOptionCard` — Reusable card for Standard/Premium/Basis
8. `PatientCostView` — Patient-friendly full-page view
9. `DentalChart` — Simplified SVG tooth diagram with highlighting (driven by real FHIR Observations)
10. `SubmissionConfirmation` — Success screen

### Responsive Behavior
- Primary: Desktop (1280px+)
- Tablet: Stack the 2-column session layout vertically
- Mobile: Not priority for hackathon

---

## Demo Script (Suggested Hackathon Flow)

1. **Open dashboard** → Show today's patients (real seed patients from Aidbox)
2. **Click "Klaus Schmidt"** → Patient is "Im Raum" (in room), GKV with 60% Bonus
3. **See dental chart** → Real tooth findings loaded from FHIR Observations
4. **Click microphone** → Voice recording starts
5. **Show transcription** appearing in real-time (mocked STT)
6. **Stop recording** → AI processing steps animate through (rule validation shown)
7. **Plan appears** → Browse the three tabs
8. **Switch to "Kostenübersicht"** → Show the three cost options
9. **Click "Patient zeigen"** → Full-screen patient-friendly view
10. **Select "Standard"** → Click "An Kasse senden"
11. **Success screen** → Plan submitted

**Key talking points during demo:**
- "The dentist just speaks naturally — no code lookups, no manual forms"
- "AI understands the treatment, maps the correct BEMA and GOZ codes"
- "This isn't just a UI mockup — it's backed by real GOZ/BEMA catalogs with 500+ billing codes and a rule engine that validates exclusions, frequency limits, and multiplier tiers"
- "Patients see costs they actually understand, not cryptic invoices"
- "Multiple options empower patient choice and increase treatment acceptance"
- "From voice to submitted HKP in under 60 seconds"
