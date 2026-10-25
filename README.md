# DocLens — Your Online Medical Officer

> **AI-Powered Medical Report Analysis & Clinical Guidance Platform**  
> *Transforming complex diagnostic documents into patient-centered, structured insights.*

[![Stack](https://img.shields.io/badge/Stack-React%20%7C%20FastAPI%20%7C%20PostgreSQL-0ea5e9.svg)](#)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-emerald.svg)](#)
[![Safety](https://img.shields.io/badge/Medical%20Safety-Non--Diagnostic%20Standard-blue.svg)](#medical-safety-standard)

---

## 1. Executive Summary

**DocLens** is an intelligent medical report analysis platform designed to address the communication and comprehension gap between clinical laboratory findings and everyday patients. 

When a user uploads a medical laboratory report (PDF, JPG, PNG, or TXT), DocLens:
1. **Extracts** observed laboratory parameters and patient metadata using Google Gemini AI.
2. **Normalizes & Validates** numerical values, units, and clinical reference thresholds deterministically.
3. **Isolates Abnormalities** into *Normal*, *Borderline*, *Above Range*, and *Below Range*.
4. **Detects Concerning Combinations** of findings (such as concurrent glycemic & lipid elevations, dual liver transaminase stress, or metabolic-renal markers).
5. **Computes a Non-Diagnostic Review Priority Index** (0–100) communicating urgency without false diagnostic claims.
6. **Generates Calm Plain-Language Explanations** and suggests actionable questions to discuss with a physician.
7. **Discovers Nearby Healthcare Providers** (hospitals, clinics, doctors, diagnostic labs, and pharmacies) using Google Places.

---

## 2. Medical Safety Standard

DocLens is an **assistive health-information tool, NOT a diagnostic system**.

The platform strictly adheres to the following principles:
- **Never Claims a Diagnosis:** The system will never state *"You have [disease]"* or *"You are diagnosed with..."*.
- **No Treatment or Medication Directives:** The system never prescribes, alters, or recommends changes to medications.
- **Safe Clinical Phraseology:** Results are described using safe wording such as:
  - *"This result is outside the configured reference range."*
  - *"This may warrant professional review."*
  - *"Potentially concerning combination of findings."*
  - *"Discuss this result with a qualified healthcare professional."*

---

## 3. Technology Architecture

```
DocLens/
├── frontend/                     # React 18 + Vite + Tailwind CSS SPA
│   ├── src/
│   │   ├── components/           # Reusable UI primitives, cards & layout
│   │   │   ├── ui/               # Button, Card, PriorityBadge, StatusChip, etc.
│   │   │   ├── layout/           # AppLayout, Desktop Sidebar, Mobile Nav
│   │   │   ├── reports/          # FileDropzone, FindingCard, RangeBarChart
│   │   │   └── ai/               # AIChatPanel, SuggestedPrompts
│   │   ├── pages/                # Landing, Auth, Dashboard, Upload, Analysis, etc.
│   │   ├── services/             # Centralized API service (api.js)
│   │   ├── context/              # AuthContext (JWT session state)
│   │   └── App.jsx               # React Router protected routes
│   └── package.json
│
├── backend/                      # Python FastAPI REST API
│   ├── app/
│   │   ├── api/routes/           # Auth, Users, Reports, Analysis, Compare, Assistant
│   │   ├── core/                 # Config, Security (bcrypt & JWT), Dependencies
│   │   ├── db/                   # Resilient PostgreSQL / SQLite SQLAlchemy session
│   │   ├── models/               # SQLAlchemy entities (User, MedicalReport, MedicalParameter, etc.)
│   │   ├── schemas/              # Pydantic request/response models
│   │   ├── rules/                # Deterministic Reference Ranges & Concerning Combinations
│   │   ├── services/             # Gemini Extraction, Report Processing
│   │   └── main.py               # FastAPI application entry point
│   ├── requirements.txt
│   └── test_pipeline_direct.py   # Automated end-to-end verification suite
│
├── README.md
└── .gitignore
```

---

## 4. Environment Configuration

### Backend Environment (`backend/.env`)

```env
DATABASE_URL=postgresql://username:2609@localhost:5432/doclens_db
GEMINI_API_KEY=
GOOGLE_MAPS_API_KEY=
JWT_SECRET_KEY=doclens_super_secret_jwt_key_2026_dev_secure_random_token
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
CORS_ORIGINS=http://localhost:5173
UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE_MB=10
```

> **Note:** If PostgreSQL is offline during local testing or evaluation, DocLens automatically initializes a resilient local database session (`doclens.db`) so the application never crashes.

### Frontend Environment (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## 5. Quick Start Guide

### Step 1: Start the Backend (FastAPI)

```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```
- API Documentation (Swagger): [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Endpoint: [http://localhost:8000/api/health](http://localhost:8000/api/health)

### Step 2: Start the Frontend (Vite + React)

```bash
cd frontend
npm run dev
```
- Web Application: [http://localhost:5173](http://localhost:5173)

---

## 6. Primary User Flows

1. **Landing Page (`/`):** Instant value proposition, live analysis visualization preview, and fast entry CTAs.
2. **Registration & Disclaimer (`/register`, `/disclaimer`):** Password hashing, JWT token creation, and non-diagnostic safety acknowledgement.
3. **Dashboard (`/dashboard`):** Overview with quick stats, recent report highlights, and attention-needed alerts.
4. **Report Upload (`/upload`):** Drag-and-drop file upload with animated multi-stage processing (*Uploading $\to$ Reading $\to$ Extracting $\to$ Checking Reference Ranges $\to$ Analyzing Combinations $\to$ Preparing Summary*).
5. **One-Click Demo Mode:** Click **"Try Demo Report"** on any page to immediately generate and evaluate a comprehensive metabolic & lipid panel.
6. **Flagship Analysis Dashboard (`/reports/:id`):**
   - Non-diagnostic Review Priority radial score gauge.
   - Abnormal findings highlighted first with StatusChips and visual reference range bar charts.
   - Potentially concerning combination cards.
   - Plain-language AI summary and "What to ask your doctor" suggestions.
   - Complete parameter table with category filters (*Blood, Metabolic, Lipid, Kidney, Liver*).
7. **Report Assistant (`/reports/:id/assistant`):** Context-aware conversational explainer.
8. **Report Comparison (`/compare`):** Side-by-side delta analysis between two distinct dates.
