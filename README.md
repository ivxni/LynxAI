# SnapOCR

A mobile application that turns photos of documents into searchable, editable PDF files using Mistral AI's OCR engine. Point your camera at any document -- printed text, handwritten notes, receipts, forms -- and get a clean PDF with selectable text in seconds.

## Architecture

```
frontend/          React Native (Expo) mobile app
backend/           Node.js / Express REST API
docs/              Architecture and context documentation
```

The frontend captures or selects images and sends them to the backend, which delegates OCR processing to Mistral AI's vision models. The extracted text is post-processed for accuracy (symbol correction, layout preservation) and rendered into a structured PDF using PDFKit.

## Tech Stack

| Layer | Technologies |
|---|---|
| **Mobile** | React Native 0.76, Expo, TypeScript, Expo Router, React Native Paper |
| **Backend** | Node.js 18, Express, MongoDB (Mongoose), JWT auth |
| **OCR** | Mistral AI OCR API (`mistral-ocr-latest`, `mistral-large-latest`) |
| **PDF** | PDFKit with layout-aware rendering (headings, lists, tables, columns) |
| **Auth** | JWT + bcrypt, Apple Sign-In (expo-apple-authentication) |
| **Payments** | RevenueCat (react-native-purchases) for iOS/Android subscriptions |
| **Encryption** | Client-side XOR file encryption before upload |
| **Deploy** | Railway (Nixpacks) |

## Features

- **Camera and gallery upload** -- scan documents directly or import from photo library
- **Intelligent OCR** -- recognizes printed text, handwriting, tables, formulas, and special characters
- **PDF generation** -- produces structured PDFs preserving headings, lists, and layout
- **Post-processing** -- fixes common OCR errors (math symbols, bullet points, image artifacts)
- **Handwriting mode** -- specialized processing pipeline tuned for handwritten documents
- **Client-side encryption** -- files are encrypted before upload for privacy
- **Subscription system** -- free tier (3 docs/day), premium, family, and business plans
- **Document history** -- browse, re-download, and share previously processed documents
- **Multi-language** -- i18n support with language switching
- **Dark mode** -- full dark/light theme support
- **Apple Sign-In** -- native authentication on iOS
- **Family sharing** -- manage a shared subscription with up to 4 members

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (Atlas or local)
- Mistral AI API key ([platform.mistral.ai](https://platform.mistral.ai))
- Expo CLI (`npm install -g expo-cli`)

### Backend

```bash
cd backend
cp .env.example .env    # fill in your credentials
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npx expo start
```

Set `EXPO_PUBLIC_API_URL` in your environment to point to your backend (defaults to `http://localhost:3001/api`).

## Project Structure

```
SnapOCR/
├── backend/
│   ├── config/             Database and upload configuration
│   ├── controllers/        Route handlers (auth, documents, subscriptions)
│   ├── middleware/          Auth, validation, error handling
│   ├── models/             Mongoose schemas (User, Document, ProcessingJob, FamilyGroup)
│   ├── routes/             Express route definitions
│   ├── services/
│   │   ├── ocrService.js           Core OCR + PDF pipeline
│   │   ├── pdfService.js           Image-to-PDF conversion
│   │   ├── processingService.js    Job orchestration
│   │   ├── subscriptionService.js  Plan management and billing
│   │   ├── translationService.js   OCR with translation
│   │   ├── tableExtractionService.js
│   │   ├── classificationService.js
│   │   ├── qrBarcodeService.js
│   │   └── imageEnhancementService.js
│   ├── utils/              Token generation, validators
│   └── server.js           Entry point
├── frontend/
│   └── app/
│       ├── (auth)/         Sign-in, sign-up screens
│       ├── (app)/          Main app screens (dashboard, upload, history, profile, etc.)
│       ├── components/     Shared UI components
│       ├── constants/      API config, colors, routes, theme
│       ├── contexts/       Auth, Document, Subscription, Language, DarkMode providers
│       ├── hooks/          useAuth, useDocuments
│       ├── services/       API client and service layers
│       ├── types/          TypeScript type definitions
│       └── utils/          i18n, encryption, theming
└── docs/                   Architecture documentation
```

## API Endpoints

### Auth
- `POST /api/auth/register` -- create account
- `POST /api/auth/login` -- email/password login
- `POST /api/auth/apple-signin` -- Apple Sign-In
- `GET /api/auth/profile` -- get profile (protected)
- `PUT /api/auth/profile` -- update profile / change password (protected)

### Documents
- `POST /api/documents/upload` -- upload image for OCR processing (protected)
- `GET /api/documents` -- list user documents (protected)
- `GET /api/documents/:id` -- get document by ID (protected)
- `GET /api/documents/:id/status` -- check processing status (protected)
- `DELETE /api/documents/:id` -- delete document (protected)

### Subscriptions
- `GET /api/subscription` -- get subscription details (protected)
- `POST /api/subscription/trial` -- start free trial (protected)
- `POST /api/subscription/subscribe` -- subscribe to a plan (protected)
- `POST /api/subscription/verify-purchase` -- verify App Store / Play Store receipt (protected)
- `POST /api/subscription/restore` -- restore purchases (protected)
- `POST /api/subscription/cancel` -- cancel subscription (protected)

## License

Private project.
