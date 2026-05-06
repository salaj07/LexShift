<div align="center">

# ⚖️ LexShift

### AI-Powered Legal Document Conversion Platform
**Indian Penal Code (IPC) → Bharatiya Nyaya Sanhita (BNS)**

![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=flat-square&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-BullMQ-DC382D?style=flat-square&logo=redis&logoColor=white)
![AWS S3](https://img.shields.io/badge/AWS-S3-FF9900?style=flat-square&logo=amazon-aws&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Gemini-AI-4285F4?style=flat-square&logo=google&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101?style=flat-square&logo=socket.io)

</div>

---

## 📌 What is LexShift?

India replaced the **Indian Penal Code (IPC)** with the **Bharatiya Nyaya Sanhita (BNS)** in 2024. Thousands of historical legal documents — FIRs, charge sheets, judgments — still reference old IPC sections. Converting them manually is time-consuming, error-prone, and expensive.

**LexShift** automates this. Upload a PDF → get back a properly formatted BNS document with:
- All IPC section references accurately mapped to BNS equivalents
- Person names and PII protected using anonymization
- Output rendered in the official CCTNS government FIR format
- Real-time processing status streamed to the browser

---

## ✨ Core Features

| Feature | Description |
|---|---|
| 🤖 **AI Legal Conversion** | Gemini AI maps every IPC section to its correct BNS equivalent with full legal context |
| 🛡️ **PII Anonymization** | Person names are masked before AI processing using Named Entity Recognition and restored in the final output |
| 🖨️ **Scanned PDF Support** | Gemini Vision OCR extracts text from image-based or scanned PDFs |
| 📄 **Official FIR Format** | Puppeteer renders output as a pixel-perfect CCTNS government FIR form PDF |
| 📡 **Real-Time Progress** | Socket.io + Redis Pub/Sub streams live conversion stages to the browser |
| ⚡ **Async Job Queue** | BullMQ keeps uploads instant — heavy AI processing runs in a background worker |
| 🔐 **Secure Auth** | JWT cookies + Google OAuth 2.0 + OTP email verification |
| 🔒 **Rate Limiting** | Per-route request limits defend against brute-force and abuse |
| ☁️ **Cloud Storage** | Original and converted PDFs stored securely on AWS S3 |
| 📊 **Structured Logging** | Winston writes JSON logs to files in production, readable console in dev |

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                     Browser (React + Vite)                       │
│                                                                  │
│  Landing Page  ──▶  Auth (Login/Register/OTP)  ──▶  Converter   │
│                                                         │        │
│                         Socket.io Client ◀──────────────┘        │
│                         (listens for progress events)            │
└─────────────────────────────┬────────────────────────────────────┘
                              │ HTTPS / WSS
┌─────────────────────────────▼────────────────────────────────────┐
│                  Express API Server  (server.js)                  │
│                                                                  │
│  /auth/*  ──▶  Auth Controller  (JWT · Google OAuth · OTP)       │
│  /docs/*  ──▶  Doc Controller   (upload · status · download)     │
│                                                                  │
│  Middleware Stack:                                               │
│  Helmet → Compression → CORS → Rate Limiter → Auth Guard        │
│                                                                  │
│  Socket.io Server  ◀──  Redis Subscriber (lexshift:progress)     │
└────────────┬──────────────────────────────────────┬─────────────┘
             │                                      │
    BullMQ Job Enqueue              Socket.io emits to user room
             │
┌────────────▼────────────────────────────────────────────────────┐
│                  AI Worker Process  (worker.js)                  │
│                                                                  │
│  Step 1 [Extracting]  Download PDF from S3                       │
│                       → pdf-parse (text PDFs)                    │
│                       → Gemini Vision (scanned PDFs)             │
│                                                                  │
│  Step 2 [Scrubbing]   Detect & mask person names → [PERSON_N]   │
│                                                                  │
│  Step 3 [Converting]  Gemini AI:                                 │
│                       → Replace IPC refs with BNS equivalents    │
│                       → Format as official CCTNS FIR HTML        │
│                       → LangChain chunks large documents         │
│                                                                  │
│  Step 4 [Generating]  Puppeteer renders HTML → PDF buffer        │
│                                                                  │
│  Step 5 [Uploading]   Upload converted PDF → AWS S3              │
│                                                                  │
│  Step 6 [Completed]   Update MongoDB · Publish to Redis channel  │
│                       → Socket.io relays to browser              │
└──────────┬──────────────────────────────┬───────────────────────┘
           │                              │
  ┌────────▼────────┐           ┌─────────▼───────────┐
  │   MongoDB Atlas │           │      AWS S3          │
  │  users          │           │  originals/          │
  │  documents      │           │  converted/          │
  └─────────────────┘           └─────────────────────┘
```

---

## 🧰 Technology Stack & Why Each Was Chosen

### Backend

| Technology | Role | Why |
|---|---|---|
| **Node.js + Express** | API server | Non-blocking I/O handles concurrent uploads and WebSocket connections efficiently |
| **MongoDB + Mongoose** | Database | Flexible schema suits document metadata; Atlas provides managed scaling |
| **BullMQ** | Job queue | Decouples upload from processing — uploads return instantly while AI runs async in background |
| **Redis** | Queue broker + Pub/Sub | Powers BullMQ's queue and acts as the message bus between the worker and the Socket.io server |
| **Socket.io** | Real-time communication | Bi-directional WebSocket with fallback to HTTP polling; rooms isolate each user's events |
| **Google Gemini AI** | Legal conversion + OCR | State-of-the-art LLM for accurate IPC→BNS mapping; Vision model handles scanned PDFs |
| **LangChain** | Document chunking | `RecursiveCharacterTextSplitter` splits large PDFs into overlapping chunks for reliable Gemini processing |
| **Puppeteer** | PDF generation | Headless Chromium renders pixel-perfect HTML into official FIR format PDFs |
| **pdf-parse** | Text extraction | Fast, lightweight extraction from text-based PDFs without AI cost |
| **AWS S3** | File storage | Durable, scalable object storage; keeps files off server disk entirely |
| **Passport.js** | Google OAuth | Battle-tested OAuth 2.0 strategy for Google sign-in |
| **JWT + bcryptjs** | Auth tokens + hashing | Stateless authentication; OTPs and passwords never stored in plaintext |
| **Nodemailer** | Email delivery | OTP emails sent via Gmail App Password |
| **Winston** | Logging | Structured JSON logs with log levels; writes to files in production |
| **Helmet** | HTTP security | Sets 14 security headers (CSP, HSTS, XSS protection, etc.) |
| **express-rate-limit** | Abuse prevention | Per-route throttling protects auth and upload endpoints |
| **compression** | Performance | Gzip compresses all API responses |
| **multer-s3** | File upload | Streams files directly from browser → S3, bypassing server disk |

### Frontend

| Technology | Role | Why |
|---|---|---|
| **React 18 + Vite** | UI framework | Fast HMR in dev; React's component model suits complex conversion UI states |
| **React Router v6** | Navigation | Client-side routing for auth flows and page transitions |
| **Zustand** | State management | Lightweight auth store; simpler than Redux for this use case |
| **Axios** | HTTP client | Interceptors handle credentials (cookies) and base URL configuration |
| **Socket.io-client** | Real-time updates | Connects to backend for live conversion progress |
| **GSAP + ScrollTrigger** | Animations | High-performance scroll-triggered animations for the landing page |
| **Tailwind CSS** | Styling | Utility-first CSS keeps component styles co-located and consistent |
| **Lucide React** | Icons | Clean, consistent icon set |

---

## 📁 Project Structure

```
lexshift-code/
│
├── backend/
│   ├── src/
│   │   ├── controller/
│   │   │   ├── auth.controller.js      # Register, login, OTP, Google OAuth, logout
│   │   │   └── doc.controller.js       # Upload, status poll, result download
│   │   │
│   │   ├── db/
│   │   │   └── db.js                   # MongoDB connection with Winston logging
│   │   │
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js       # JWT cookie verification
│   │   │   └── rateLimiter.middleware.js # Global / auth / OTP / upload limiters
│   │   │
│   │   ├── models/
│   │   │   ├── user.model.js           # User schema (email, password, OTP, Google)
│   │   │   └── document.model.js       # Document schema with status enum + S3 keys
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.routes.js          # Auth endpoints with per-route rate limits
│   │   │   └── doc.routes.js           # Doc endpoints with upload limit
│   │   │
│   │   ├── services/
│   │   │   ├── aiWorker.service.js     # BullMQ worker — full conversion pipeline
│   │   │   ├── aiProcessor.service.js  # Gemini AI calls + LangChain chunking
│   │   │   ├── pdfGenerator.service.js # Puppeteer singleton — HTML → PDF
│   │   │   ├── email.service.js        # Nodemailer OTP delivery
│   │   │   ├── passport.service.js     # Google OAuth strategy
│   │   │   └── storage/
│   │   │       └── s3.service.storage.js # S3 client + multer-s3 config
│   │   │
│   │   ├── sockets/
│   │   │   └── index.js               # Socket.io server + Redis subscriber
│   │   │
│   │   └── utils/
│   │       └── logger.js              # Winston logger (dev console + prod files)
│   │
│   ├── logs/                          # Winston output (gitignored)
│   │   ├── combined.log
│   │   └── error.log
│   │
│   ├── server.js                      # App entry — HTTP server + sockets
│   ├── worker.js                      # Worker entry — BullMQ processor
│   ├── .env                           # Secrets (gitignored)
│   └── .gitignore
│
└── frontend/
    └── src/
        ├── features/
        │   ├── auth/
        │   │   ├── store/authStore.js  # Zustand auth state
        │   │   ├── Login.jsx
        │   │   ├── Register.jsx
        │   │   └── VerifyOTP.jsx
        │   │
        │   ├── converter/
        │   │   ├── Converter.jsx       # Upload engine + progress UI
        │   │   ├── api/converterApi.js # Upload + download API calls
        │   │   └── hooks/
        │   │       └── useConverterSocket.js # Imperative socket hook
        │   │
        │   └── home/                  # Landing page sections
        │       ├── Hero.jsx
        │       ├── Stats.jsx
        │       ├── BentoGrid.jsx
        │       └── ...
        │
        └── main.jsx
```

---

## 🔄 Conversion Flow (Step by Step)

```
1. User logs in (JWT cookie set)
         │
2. User uploads a PDF on the Converter page
         │
3. Socket connects → user joins private room (userId)
         │
4. File streamed directly to AWS S3 via multer-s3
         │
5. Document record created in MongoDB (status: Uploaded)
         │
6. BullMQ job enqueued → response sent to browser instantly
         │
7. Worker picks up job:
   │
   ├── [Extracting]  Downloads PDF from S3
   │                 Detects: text-based (pdf-parse) or scanned (Gemini Vision)
   │
   ├── [Scrubbing]   Detects person names via Gemini
   │                 Replaces with [PERSON_1], [PERSON_2]... (mapping saved)
   │
   ├── [Converting]  Gemini AI call:
   │                 - Maps every IPC section reference → correct BNS section
   │                 - Formats entire document as CCTNS FIR HTML
   │                 - Large docs split into chunks (LangChain) and processed in order
   │
   ├── [Generating]  Restores real names from mapping
   │                 Puppeteer renders HTML → official FIR PDF buffer
   │
   ├── [Uploading]   PDF uploaded to S3 (converted/ prefix)
   │
   └── [Completed]   MongoDB updated with convertedS3Key
                     Redis publishes event → Socket.io server picks up
                     → Browser receives progressUpdate event
                     → Progress bar hits 100% → Download button appears
         │
8. User clicks Download → S3 file streamed to browser
         │
9. Socket disconnects (job complete, connection no longer needed)
```

---

## 🔐 Security Architecture

### Authentication
- JWT tokens stored in `httpOnly` cookies — inaccessible to JavaScript (XSS safe)
- Passwords hashed with `bcryptjs` (10 salt rounds)
- OTPs hashed before storage, expire in 5 minutes
- Google OAuth via Passport.js — no password stored for Google users

### Rate Limiting
| Route Group | Limit | Window |
|---|---|---|
| All routes (global) | 100 requests | 15 min |
| Login + Register | 10 requests | 15 min |
| OTP (verify/forgot/reset) | 5 requests | 15 min |
| Document Upload | 10 requests | 1 hour |

### File Safety
- Only `application/pdf` MIME type accepted
- Maximum file size: 50MB
- Files go directly S3 → worker → S3 (never written to server disk)
- PII masked before any AI processing

### HTTP Security
- `helmet()` sets: CSP, HSTS, X-Frame-Options, X-XSS-Protection, and 10 other headers
- `compression()` gzips all responses
- CORS locked to frontend origin

---

## 🚀 Local Setup

### Prerequisites
- Node.js v18+
- A running Redis instance (local or [Upstash](https://upstash.com))
- MongoDB Atlas cluster (or local MongoDB)
- AWS S3 bucket with IAM credentials
- Google Cloud project with OAuth 2.0 + Gemini API enabled
- Gmail account with [App Password](https://myaccount.google.com/apppasswords) enabled

### 1. Clone

```bash
git clone https://github.com/YOUR_USERNAME/lexshift.git
cd lexshift
```

### 2. Backend `.env`

Create `backend/.env`:

```env
# Server
PORT=3000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/lexshift

# JWT
JWT_SECRET=your_random_secret_min_32_chars

# Redis
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# AWS S3
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET_NAME=your-bucket-name

# Google OAuth 2.0
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxx
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Google Gemini
GEMINI_API_KEY=AIzaSy...

# Email (Gmail App Password)
EMAIL_USER=your@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx

# Frontend
CLIENT_URL=http://localhost:5173
```

### 3. Install & Run

```bash
# Backend API server
cd backend
npm install
npm run dev

# Backend AI Worker (new terminal)
cd backend
npx nodemon worker.js

# Frontend
cd frontend
npm install
npm run dev
```

### 4. Visit

```
http://localhost:5173
```

---

## 📡 API Reference

### Auth Routes — `/auth`

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/register` | `{ username, email, password }` | Register + send OTP |
| `POST` | `/login` | `{ email, password }` | Login → sets JWT cookie |
| `POST` | `/verify-otp` | `{ email, otp }` | Verify OTP → sets JWT cookie |
| `POST` | `/forgot-password` | `{ email }` | Send password reset OTP |
| `POST` | `/reset-password` | `{ email, otp, newPassword }` | Reset password |
| `GET` | `/google` | — | Redirect to Google OAuth |
| `GET` | `/google/callback` | — | OAuth callback |
| `GET` | `/me` | — | Get current user (cookie auth) |
| `POST` | `/logout` | — | Clear JWT cookie |

### Document Routes — `/docs` *(requires auth)*

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/upload` | `form-data: document` | Upload PDF → returns `docId` |
| `GET` | `/status/:docId` | — | Get current conversion status |
| `GET` | `/result/:docId` | — | Stream converted PDF |

### WebSocket Events

| Direction | Event | Payload | Description |
|---|---|---|---|
| Client → Server | `joinRoom` | `userId` | Join user's private event room |
| Server → Client | `progressUpdate` | `{ docId, status }` | Conversion stage update |

**Status values:** `Extracting` → `Scrubbing` → `Converting` → `Generating` → `Uploading` → `Completed` / `Failed`

---

## 📊 Logging

In **development** — colorized, readable console output:
```
[00:15:32] INFO: Server running on port 3000
[00:15:33] INFO: MongoDB connected successfully
[00:15:45] INFO: Job started → docId: 6819f3a2...
[00:16:02] INFO: Job completed → docId: 6819f3a2...
```

In **production** — structured JSON written to:
- `logs/combined.log` — all log levels
- `logs/error.log` — errors only

---

## 🧪 Known Limitations

- Chunked processing of large documents is sequential (Gemini rate limits prevent full parallelism)
- Conversion quality depends on Gemini's understanding of the document structure
- Scanned PDFs with very low resolution may have reduced accuracy

---
