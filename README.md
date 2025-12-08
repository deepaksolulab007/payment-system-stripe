# 🚀 Stripe Payment, Refund & Payout System — Fullstack Implementation

This project is a complete end-to-end payment system built using:

- **NestJS Backend**
- **MongoDB**
- **React Frontend**
- **Stripe APIs** (Payments, Refunds, Connect Payouts)

It includes customer payments, refunds, connected account onboarding (Express accounts), manual payouts, weekly scheduled payouts, and real-time webhook syncing.

---

## 📁 Project Features

### 🧑‍💻 User Payment Flow
- Accept payments via **Stripe Payment Element**
- Supports dynamic amount entry from UI
- Success & Failed pages  
- Stores all successful payments in MongoDB (via webhook)

---

### 🛠 Admin Dashboard
Admin can:

- View total payments, refunds, payouts (with stats)
- View Stripe platform balance
- Check connected account balance
- Create new connected accounts
- Generate onboarding link
- Refresh onboarding status (charges/payouts enabled)
- Transfer funds to connected account
- Create manual payouts
- Configure weekly scheduled payouts
- View refund history
- View webhook logs
- View latest payments for refund actions

---

### 💸 Payouts (Stripe Connect Express)
Supports:

- Express account creation  
- Onboarding via Stripe-hosted flow  
- Check onboarding status  
- Transfer funds to connected accounts  
- Manual payouts  
- Weekly automated payouts  
- Store payout webhook events in MongoDB  

---

### 💵 Refund Module
Admin can:

- Create full or partial refunds
- Add refund reason
- View all refund records
- Webhook keeps refund updates synced automatically

---

## 📦 Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | NestJS, Stripe SDK, Mongoose |
| Frontend | React (Vite) |
| Database | MongoDB |
| Payments | Stripe Payment Intents |
| Payouts | Stripe Connect Express |
| Webhooks | Stripe CLI |

---

# 🚀 Installation & Setup

## 1️ Clone repo

```sh
git clone <repo-url>
cd payment_system_stripe
```
## 2. install dependencies
```sh
// backend 
cd backend
npm install

npm run start:dev // run backend

// frontend (react + vite)
cd frontend
npm install

npm run dev // run frontend
```
## 3. .env
```sh
// backend/.env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

MONGO_URI=mongodb://localhost:27017/stripe_payments
PORT=3000

// frontend/.env
```sh
// frontend/.env
VITE_ADMIN_PASSWORD=supersecret123
VITE_API_BASE_URL=http://localhost:3000
VITE_STRIPE_PUBLISHABLE_KEY=
```
## 4. Webhook Setup
```sh
// Run Stripe webhook listener:
stripe listen --forward-to localhost:3000/webhook/stripe
```
# Folder structure
```sh
backend/
 ├── src/
 │   ├── payments/
 │   ├── refund/
 │   ├── payout/
 │   ├── webhook/
 │   ├── admin/
 │   └── app.module.ts
 │
 ├── .env
 └── main.ts

frontend/
 ├── src/
 │   ├── pages/
 │   │   ├── User/
 │   │   ├── Admin/
 │   ├── components/
 │   ├── utils/api.js
 │   └── App.jsx
 ├── index.html
 └── vite.config.js
```
# Api
```sh
// payments 

| Method | Endpoint                  | Purpose               |
| ------ | ------------------------- | --------------------- |
| POST   | `/payments/create-intent` | Create payment intent |
| POST   | `/payments/cancel-intent` | Cancel payment        |

// Refunds

| Method | Endpoint         | Purpose                    |
| ------ | ---------------- | -------------------------- |
| POST   | `/refund/create` | Create full/partial refund |
| GET    | `/refund/all`    | List all refunds           |

// Payout

| Method | Endpoint                         |
| ------ | -------------------------------- |
| POST   | `/payout/create-account`         |
| GET    | `/payout/onboarding-link/:id`    |
| GET    | `/payout/account-status/:id`     |
| POST   | `/payout/transfer`               |
| POST   | `/payout/create-payout`          |
| POST   | `/payout/set-schedule`           |
| POST   | `/payout/balance`                |
| GET    | `/payout/platform-balance`       |
| GET    | `/payout/all-accounts`           |
| GET    | `/payout/all-payouts/:accountId` |
```
## Admin Dashboard UI Features
### Dashboard includes:
- Stats cards (payments/refunds/payouts)
- Platform balance (Stripe account)
- Connected account balance lookup
- Create connected account
- Onboarding existing accounts
- Refresh onboarding status
- Transfer funds
- View all connected accounts
- Weekly payout schedule setup

### Admin Authentication
```sh
// Admin login uses password stored in:
VITE_ADMIN_PASSWORD=password // inside the frontend .env
```
### Connect Account Onboarding Flow

- Admin clicks Create New Connected Account
- Backend creates Express account & onboarding link
- Admin completes Stripe-hosted onboarding page
- Stripe webhook triggers:
-- account.updated
#### DB updates flags:
- chargesEnabled = true
- payoutsEnabled = true

## 💸Payout Flow Summary

### Manual Payout
- Admin transfers money to connected account
- Admin triggers payout → money moves to bank
- Webhook stores payout in DB

### Scheduled Weekly Payout
- Admin selects weekday
- Stripe auto-pays out weekly
- Webhook logs event

## 💵 Refund Flow Summary
- Admin selects PaymentIntent
- Creates refund (full/partial)
- Stripe webhook updates DB
- Refund appears in UI