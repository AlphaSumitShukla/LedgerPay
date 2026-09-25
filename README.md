# 🏦 LedgerPay — Full-Stack Banking & Double-Entry Ledger System

A production-grade, full-stack financial banking and double-entry ledger platform built with **Node.js, Express, MongoDB (ACID Transactions)** and a modern **React 19 + Vite** frontend.

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Node](https://img.shields.io/badge/Node.js-18%2B-green.svg)
![React](https://img.shields.io/badge/React-19.0-61dafb.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%2F%20ReplicaSet-brightgreen.svg)
![Vite](https://img.shields.io/badge/Vite-8.0-646CFF.svg)

---

## ✨ Features

### 💻 Frontend (React + Vite)
- **🌓 Obsidian Dark & Porcelain Light Modes**: Seamless theme switcher persisted across sessions in `localStorage`.
- **⚡ Real-Time Balance Aggregation**: Live ledger balance calculation for every account using backend MongoDB aggregation pipelines.
- **💸 Instant Peer-to-Peer Transfers**: Transfer funds securely with balance validation and instant digital receipts.
- **🛡️ Silent Double-Spend Protection**: Background cryptographic UUID v4 idempotency keys generated automatically for every transfer.
- **📜 Sent Transfer History**: Dedicated transfer history tracking destination account IDs, amounts in ₹, timestamps, search filters, and 1-click **"Send Again"** shortcuts.
- **✨ Smart Email Suggestions**: Dynamic inline domain autocomplete (`@gmail.com`, `@outlook.com`, etc.) during login and registration.
- **🏦 System Initial Funds Simulator**: Funding tool with an interactive 15-second settlement countdown.

### ⚙️ Backend (Node.js + Express + MongoDB)
- **📖 Double-Entry Bookkeeping**: Strict debit/credit accounting model ensuring the fundamental accounting equation ($\sum \text{Debits} = \sum \text{Credits}$) is always preserved.
- **🔒 ACID Transactions**: Every transfer executes within an atomic MongoDB replica set session (`startSession`, `withTransaction`) to guarantee consistency and rollback on failure.
- **🔑 JWT Authentication & Blacklisting**: Secure cookie and Bearer token authentication with server-side token invalidation on logout.
- **📧 Gmail OAuth2 Notifications**: Automatic welcome and onboarding emails sent to newly registered users via Google OAuth2.
- **🛡️ Idempotency Verification**: Prevents double-spending by checking and recording unique idempotency keys in the database.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, Vanilla CSS Design System, Context API |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB with Mongoose (Sessions, Aggregations) |
| **Authentication** | JSON Web Tokens (JWT), Bcrypt password hashing |
| **Email Service** | Nodemailer with Google OAuth2 |

---

## 📁 Project Structure

```
backend-ledger/
├── .env.example             # Template for required environment variables
├── .gitignore               # Protects .env, node_modules, and build outputs
├── server.js                # Express app entrypoint
├── package.json             # Backend dependencies
├── src/
│   ├── config/              # MongoDB and OAuth configurations
│   ├── contollers/          # Auth, Account, and Transaction controllers
│   ├── middlewares/         # JWT verification & auth guards
│   ├── models/              # User, Account, Transaction, and Ledger schemas
│   ├── routes/              # Express API route declarations
│   └── services/            # Email notification services
└── frontend/
    ├── index.html           # Main HTML entry
    ├── package.json         # Frontend dependencies
    ├── vite.config.js       # Vite dev server with reverse proxy (/api)
    └── src/
        ├── components/      # Navbar, AccountsList, TransferModal, History, etc.
        ├── context/         # AuthContext, ThemeContext, ToastContext
        ├── services/        # Frontend API client
        └── index.css        # Responsive dark/light design system
```

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/AlphaSumitShukla/LedgerPay.git
cd LedgerPay
```

### 2. Configure Environment Variables
Copy `.env.example` to create your local `.env`:
```bash
cp .env.example .env
```
Fill in your credentials in `.env`:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_ID=your_google_oauth_client_id
CLIENT_SECRET=your_google_oauth_client_secret
REFRESH_TOKEN=your_google_oauth_refresh_token
EMAIL_USER=your_gmail_address@gmail.com
PORT=3000
```

> **Note**: Never commit `.env` to Git. It is already added to `.gitignore`.

### 3. Install Dependencies & Run

#### Terminal 1 — Backend:
```bash
npm install
node server.js
```
*Backend runs on `http://localhost:3000`.*

#### Terminal 2 — Frontend:
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `POST` | `/api/auth/register` | Register new user & send welcome email | ❌ |
| `POST` | `/api/auth/login` | Log in and receive JWT token | ❌ |
| `POST` | `/api/auth/logout` | Invalidate session & blacklist token | ✅ |
| `POST` | `/api/accounts/` | Create a new ledger bank account | ✅ |
| `GET` | `/api/accounts/` | List all accounts owned by current user | ✅ |
| `GET` | `/api/accounts/balance/:accountId` | Compute real-time balance via aggregation | ✅ |
| `POST` | `/api/transactions/` | Transfer funds between accounts (ACID) | ✅ |
| `POST` | `/api/transactions/system/initial-funds` | Deposit system funds into account | ✅ |

---

## 📄 License
This project is licensed under the MIT License.
