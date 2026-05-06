# ⚖️ LexShift — Frontend

> React 18 + Vite frontend for the LexShift legal document conversion platform.  
> See the [root README](../README.md) for full system architecture and backend setup.

---

## 🧱 Tech Stack

| Library | Purpose |
|---|---|
| **React 18** | UI component framework |
| **Vite** | Dev server + build tool (fast HMR) |
| **React Router v6** | Client-side routing |
| **Zustand** | Auth state management |
| **Axios** | HTTP client with cookie credentials |
| **Socket.io-client** | Real-time conversion progress |
| **GSAP + ScrollTrigger** | Scroll-triggered landing page animations |
| **Tailwind CSS** | Utility-first styling |
| **Lucide React** | Icon library |

---

## 📁 Structure

```
src/
├── features/
│   ├── auth/
│   │   ├── store/
│   │   │   └── authStore.js        # Zustand store — user session
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── VerifyOTP.jsx
│   │
│   ├── converter/
│   │   ├── Converter.jsx           # Upload engine + real-time progress UI
│   │   ├── api/
│   │   │   └── converterApi.js     # uploadDocument + downloadConvertedPDF
│   │   └── hooks/
│   │       └── useConverterSocket.js  # Imperative socket hook (connect on upload)
│   │
│   └── home/                       # Landing page sections
│       ├── Hero.jsx
│       ├── Stats.jsx
│       ├── BentoGrid.jsx
│       ├── HowItWorks.jsx
│       ├── Modules.jsx
│       ├── Architecture.jsx
│       └── PrivacyFocus.jsx
│
├── App.jsx                         # Routes
└── main.jsx                        # Entry point
```

---

## 🔄 Key UI Flows

### Authentication
```
/register  →  OTP sent to email  →  /verify-otp  →  logged in
/login     →  JWT cookie set     →  redirect to home
/auth/google  →  Google OAuth    →  OTP step  →  /verify-otp
```

### Conversion
```
/  (scroll to #converter-engine)
  → Upload PDF
  → Socket connects (job-scoped — not page-scoped)
  → Progress bar animates through stages:
       Extracting → Scrubbing → Converting → Generating → Uploading → Completed
  → Download button appears
  → Socket disconnects after download
```

---

## ⚡ Running Locally

```bash
npm install
npm run dev
```

App runs at `http://localhost:5173`

> Make sure the backend is running on `http://localhost:3000`

---

## 🏗️ Build for Production

```bash
npm run build
```

Output goes to `dist/` — deploy this folder to any static host (Vercel, Netlify, etc.)

---

© 2025 LexShift. All Rights Reserved.
