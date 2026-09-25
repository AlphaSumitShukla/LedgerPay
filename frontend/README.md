# LedgerPay Frontend

A modern, institutional-grade React.js + Vite frontend for the Double-Entry Ledger and Account Banking Backend.

## Features Built
- **Zero Backend Modification**: The backend remains 100% untouched. All API routes, middleware, controllers, models, and schemas are strictly preserved.
- **Vite Reverse Proxy**: The frontend dev server proxies `/api` directly to `http://localhost:3000`, eliminating CORS issues while transmitting authorization cookies and Bearer tokens seamlessly.
- **Authentication**:
  - Sign in (`POST /api/auth/login`)
  - User Registration (`POST /api/auth/register`) with regex email validation and minimum password length check
  - Logout (`POST /api/auth/logout`) with server-side token blacklisting
  - Persistent session management with JWT and automatic 401 session expiration handling
- **Account Management**:
  - Open new ledger accounts with 1 click (`POST /api/accounts/`)
  - Retrieve user-owned accounts (`GET /api/accounts/`)
  - Live double-entry balance computation from MongoDB aggregation (`GET /api/accounts/balance/:accountId`)
  - 1-click MongoDB ObjectId copy-to-clipboard
- **Transactions & Money Transfers**:
  - Full double-entry ledger transfers (`POST /api/transactions/`)
  - Source account selection with real-time balance checks
  - Destination account validator
  - Automatic cryptographic UUID v4 Idempotency Key generation for double-spend protection
  - Pre-flight transfer review modal and digital receipt view
- **Transfer History Section ("Paise transfer kiye destination account me")**:
  - Displays all transfers sent to destination accounts with exact amount in `₹`, destination account ID (payee), source account ID, transaction ID, and timestamp.
  - Quick 1-click copy for destination account IDs and transaction hashes.
  - Search and filter by destination account, amount, or transaction ID.
  - "Send Again" shortcut button that pre-populates the transfer modal.
  - Summary metrics: Total Transferred Out (₹) and total transfer count.
  - Persisted per user in `localStorage`.
- **System Initial Funds Deposit**:

  - Admin/System user funding tool (`POST /api/transactions/system/initial-funds`)
  - Live 15-second settlement countdown animation reflecting the backend's simulation lock
- **API & Architecture Explorer**:
  - Interactive reference sheet showing all 8 backend endpoints, HTTP methods, authorization requirements, request formats, and response schemas.

## Running the Application

### 1. Run the Backend
From the root directory:
```bash
npm run dev
# or
node server.js
```
The backend server runs on `http://localhost:3000`.

### 2. Run the Frontend
In another terminal, navigate to the `frontend` folder:
```bash
cd frontend
npm run dev
```
Open your browser at `http://localhost:5173/`.
