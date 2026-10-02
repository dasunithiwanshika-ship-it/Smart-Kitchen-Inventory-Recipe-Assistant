# Smart Kitchen AI — System Architecture

## 1. High-Level Architecture

Smart Kitchen AI is designed with a decoupled, modern multi-tier architecture:

```text
┌─────────────────────────────────────────────────────────────┐
│                    REACT TYPESCRIPT CLIENT                  │
│  (Vite + Tailwind CSS + Lucide Icons + Html5Qrcode Scanner)  │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON REST API (JWT)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   FASTAPI BACKEND SERVICE                   │
│  ┌───────────────────────┬───────────────────────────────┐  │
│  │   API Routing Layer   │     Business Logic Layer      │  │
│  │  - /api/auth          │  - AuthService                │  │
│  │  - /api/inventory     │  - InventoryService           │  │
│  │  - /api/barcode       │  - ExpiryService              │  │
│  │  - /api/leftovers     │  - LeftoverService            │  │
│  │  - /api/recipes       │  - BarcodeService             │  │
│  │  - /api/analytics     │  - AnalyticsService           │  │
│  │  - /api/assistant     │                               │  │
│  └───────────────────────┴───────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   AI & ML CORE ENGINE                 │  │
│  │  - RecipeScorer (Mathematical multi-factor ranking)   │  │
│  │  - WastePredictor (Statistical & ML Risk Classification│ │
│  │  - Grounded Kitchen Assistant (Context-Injected LLM)  │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────┘
                               │ SQLAlchemy 2.0 ORM
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   RELATIONAL DATABASE                       │
│        (SQLite for local dev / PostgreSQL production)       │
└─────────────────────────────────────────────────────────────┘
```

## 2. Key Components

### 2.1 Frontend
- **Framework**: React 19 + TypeScript + Vite.
- **Styling**: Tailwind CSS with Glassmorphism, tailored culinary color palette, dark mode default, and fluid micro-animations.
- **Responsive Navigation**: Adaptive desktop Sidebar + thumb-friendly mobile bottom bar.
- **Scanning**: HTML5 Camera QR/Barcode live reader integration with OpenFoodFacts resolution.

### 2.2 Backend & Services
- **FastAPI**: Asynchronous Python API with strict Pydantic v2 schemas and validation.
- **Authentication**: Stateless JWT Bearer tokens with direct bcrypt password hashing.
- **Database ORM**: SQLAlchemy 2.0 supporting SQLite (local instant setup) and PostgreSQL (production).

### 2.3 AI & ML Layer
- **Recipe Recommendation**: Evaluates ingredient overlap percentage, applies urgency boost for expiring ingredients (0-1 days: +25pts, 2-3 days: +15pts), leftover reuse boost (+15pts), and subtracts missing ingredient penalties.
- **Food Waste Risk Prediction**: Analyzes historical purchasing volume, expiry horizons, and consumption frequency.
- **AI Kitchen Assistant**: Injects live inventory context into conversations to prevent hallucinations.
