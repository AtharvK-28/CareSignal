<div align="center">

# 🏥 CareSignal

### Hybrid AI-Powered Medical Triage & Decision Support

**Bridging the gap between symptom onset and clinical consultation.**

[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Firebase](https://img.shields.io/badge/Firebase-Auth_%26_Firestore-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com)
[![Gemini](https://img.shields.io/badge/Google_Gemini-1.5_Pro-4285F4?logo=google&logoColor=white)](https://deepmind.google/technologies/gemini)

> ⚠️ **Medical Disclaimer:** CareSignal is a decision-support tool for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider.

</div>

---

## The Problem

When symptoms appear, most people face the same impossible question: *Is this serious enough to go to the ER?* That uncertainty — the "waiting window" between symptom onset and clinical consultation — leads to delayed care, unnecessary ER visits, and preventable complications.

CareSignal closes that window.

---

## What CareSignal Does

CareSignal uses a **Privacy-First, Hybrid-AI** architecture to deliver immediate, actionable triage guidance — combining the contextual reasoning of large language models with deterministic local algorithms that work even offline.

---

## ✨ Core Features

### 🎙️ Multimodal Triage Engine

Three ways to describe what's wrong — whatever is easiest in the moment:

| Mode | How it works |
|---|---|
| **Voice** | Real-time conversational AI for hands-free, natural clinical intake |
| **Image** | Vision analysis detects visible symptoms — rashes, swelling, injuries |
| **Text** | Step-by-step structured assessment with an interactive **Body Map** selector |

### 🧠 Hybrid Analysis System

The intelligence layer runs two systems in parallel:

- **Deep AI Reasoning** — Google Gemini 1.5 Pro correlates complex, multi-symptom presentations with clinical context.
- **Local Algorithmic Matching** — A deterministic **Jaccard Similarity** engine matches symptoms against a curated medical dataset entirely on-device. No connectivity required.
- **Priority Index (0–100)** — A proprietary urgency score calculated from symptom severity, patient age, duration, and clinical red flags.

### 📋 Actionable Dashboards

Results are structured for clarity and immediate use:

- **Dynamic Action Plan** — Guidance split into *Right Now*, *Next 24 Hours*, and *Long-term Recovery*
- **Risks of Inaction** — Alerts users to complications of delaying care (the feature that turns a symptom checker into a true decision-support system)
- **Care & Recovery** — Home care, hydration, and nutrition recommendations

### 🩺 Clinical Continuity

CareSignal doesn't stop at the app — it prepares users for their doctor's appointment:

- **Doctor Prep Guide** — Summarises exactly what to tell the physician
- **Clinical Report Generator** — Professional, print-ready PDF for healthcare providers
- **Quick Summary Copy** — One-click clipboard export for family members or emergency teams

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18+ with TypeScript | Core UI framework |
| Vite | Lightning-fast build & dev server |
| Tailwind CSS | Utility-first responsive styling |
| Shadcn UI | Accessible component library |
| Framer Motion | High-fidelity animations & transitions |
| Lucide Icons | Consistent iconography |
| Recharts | Symptom trend & regional health visualisation |

### Backend & Infrastructure
| Technology | Purpose |
|---|---|
| Firebase Auth | Secure Google-based authentication |
| Cloud Firestore | Real-time NoSQL — reports & user profiles |

### AI & Algorithms
| Technology | Purpose |
|---|---|
| Google Gemini 1.5 Pro | Multimodal reasoning (Vision / Voice / Text) |
| Jaccard Similarity (TypeScript) | Local deterministic symptom matching |

---

## 🚀 What Makes CareSignal Different

**1. The Hybrid Edge**
Most triage apps are cloud-only. Our local Jaccard algorithm delivers immediate results even in low-connectivity environments — a critical advantage in rural areas or network outages.

**2. Multimodal Evidence**
Most symptom checkers are just forms. CareSignal captures the full clinical picture through voice, image, and structured text — the same inputs a triage nurse would gather.

**3. Proactive Safety**
The *Risks of Inaction* feature and Priority Index move beyond diagnosis into genuine decision support. Users understand not just *what* to do, but *why* waiting is dangerous.

**4. Professional Hand-off**
CareSignal closes the loop between AI and human care. The Clinical Report and Doctor Prep Guide ensure the AI's analysis translates directly into a better physician consultation.

---

## 🎬 Demo Scenarios

| Scenario | What it showcases |
|---|---|
| **Rotator Cuff** | Musculoskeletal matching, night-pain flag analysis |
| **Chest Pain** | High-urgency detection, emergency escalation, Risks of Inaction |
| **Allergies** | Low-urgency care pathway, nutrition advice, local dataset matching |

> **Pro tip:** The **Body Map selector** and **Priority Index gauge** are the strongest hero visuals for slides and demos.

---

## 🏗️ Getting Started

### Prerequisites

- Node.js 18+
- A [Firebase project](https://console.firebase.google.com) with Auth and Firestore enabled
- A [Google AI Studio](https://aistudio.google.com) API key (Gemini access)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/caresignal.git
cd caresignal

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
```

Edit `.env` and add your keys:

```env
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_GEMINI_API_KEY=your_gemini_key
```

```bash
# 4. Start the development server
npm run dev
```

App runs at `http://localhost:5173`.

---

## 📁 Project Structure

```
caresignal/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── BodyMap/       # Interactive body region selector
│   │   ├── PriorityIndex/ # Urgency score gauge
│   │   └── ClinicalReport/# PDF report generator
│   ├── features/
│   │   ├── triage/        # Voice, image, text intake flows
│   │   ├── analysis/      # Hybrid AI + Jaccard engine
│   │   └── dashboard/     # Action plans & recovery guidance
│   ├── lib/
│   │   ├── gemini.ts      # Gemini API client
│   │   ├── jaccard.ts     # Local symptom matching algorithm
│   │   └── firebase.ts    # Auth & Firestore helpers
│   └── types/             # Shared TypeScript types
├── public/
│   └── datasets/          # Curated symptom datasets (local)
└── .env.example
```

---

## 🤝 Contributing

Contributions are welcome. Please open an issue before submitting a PR for large changes.

```bash
# Run tests
npm test

# Lint
npm run lint

# Build for production
npm run build
```

---

<div align="center">

Built for hackathon. Built for patients. Built to matter.

</div>
