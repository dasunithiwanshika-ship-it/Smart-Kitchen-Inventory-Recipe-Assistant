# Smart Kitchen AI — Intelligent Inventory & Recipe Assistant 🍳🌱

> **"Know what is in your kitchen, know what will expire, and know what you can cook."**

Smart Kitchen AI is a production-grade application designed to eliminate household and commercial kitchen food waste. It combines barcode scanning, manual fast-entry, real-time expiry countdowns, leftover tracking, machine learning waste risk predictions, and zero-waste AI recipe recommendations.

---

##  Key Features

- **Smart Dashboard**: Real-time overview of pantry, fridge, and freezer inventory, active leftovers, and urgency countdown alerts.
- **Barcode Scanner**: Integrated camera barcode scanner powered by `html5-qrcode` and real-time OpenFoodFacts API auto-fill.
- **Rapid Manual Entry**: Add groceries in under 10 seconds with category chips and expiry presets.
- **Expiry Engine & Warnings**: Dynamic status tagging (🔴 Expired, 🔴 Critical 0-1d, 🟠 Expiring Soon 2-3d, 🟢 Fresh).
- **Leftovers Management**: Separate tracking for prepared meals with use-by countdowns and repurposing links.
-  **AI Recipe Recommendation Engine**: Mathematical multi-factor scoring algorithm that prioritizes meals rescuing expiring ingredients.
- **AI Kitchen Copilot**: Conversational assistant grounded in your live kitchen inventory to guarantee zero hallucinations.
- **Food Waste Analytics & ML Predictions**: Visual breakdown of consumed vs wasted food, estimated financial savings, and ML waste risk estimations.
- **Enterprise-Grade Security**: Stateless JWT Bearer auth, bcrypt password hashing, input validation, and user data isolation.

---

## Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti, HTML5-QRCode
- **Backend**: Python 3.13, FastAPI, SQLAlchemy 2.0, Pydantic v2, Scikit-Learn, Pandas, NumPy, Bcrypt, Pytest
- **Database**: SQLite (default local zero-config) / PostgreSQL (production ready)

---

## Quick Start Guide

### 1. Backend Setup

```bash
# Navigate to project root
cd "Smart-Kitchen-Inventory-Recipe-Assistant"

# Create & activate Python virtual environment
python -m venv backend/venv
# Windows:
backend\venv\Scripts\activate
# Mac/Linux:
source backend/venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Start the FastAPI server (auto-seeds default categories, foods, demo user, & 20+ recipes)
python backend/app/main.py
```
*Backend runs on `http://localhost:8000` (API documentation available at `http://localhost:8000/docs`).*

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install npm packages
npm install

# Start development server
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 👨‍🍳 Demo Account Credentials

You can use the **One-Click Demo Login** button on the sign-in screen or manually enter:
- **Email**: `chef@smartkitchen.ai`
- **Password**: `password123`

---

## 🧪 Running Automated Tests

```bash
# Run backend pytest suite
backend\venv\Scripts\pytest backend/tests -v
```

---

## 📁 Project Structure

```text
├── backend/
│   ├── app/
│   │   ├── api/            # REST API endpoints (auth, inventory, barcode, recipes, leftovers, analytics, assistant)
│   │   ├── database/       # SQLAlchemy engine, session, and seed data
│   │   ├── ml/             # Recipe scoring algorithm and ML waste risk predictor
│   │   ├── models/         # Relational database models
│   │   ├── schemas/        # Pydantic v2 validation models
│   │   ├── services/       # Core business logic services
│   │   ├── config.py       # Configuration & environment settings
│   │   └── main.py         # FastAPI application entrypoint
│   ├── tests/              # Pytest integration & unit test suite
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Layout, dashboard, inventory, barcode scanner, leftovers, recipes, assistant, analytics
│   │   ├── context/        # React Auth context
│   │   ├── services/       # Centralized API client
│   │   ├── types/          # TypeScript data contracts
│   │   ├── App.tsx         # Master component
│   │   └── index.css       # Tailwind CSS design system
│   └── package.json
│
├── docs/                   # Comprehensive architecture, database, API, and AI documentation
├── .env.example
├── .gitignore
└── README.md
```

---

## Documentation

- [System Architecture](docs/architecture.md)
- [Database Schema & ERD](docs/database-schema.md)
- [REST API Specification](docs/api.md)
- [AI Grounding & Copilot Design](docs/ai-design.md)
- [Recipe Scoring & Recommendation Algorithm](docs/recipe-recommendation.md)
