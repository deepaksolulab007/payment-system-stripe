# 🚀 Stripe Payment, Refund, Payout & Subscription System — Fullstack Implementation

This project is a complete end-to-end payment system built using:

- **NestJS Backend**
- **MongoDB**
- **React Frontend**
- **Stripe APIs** (Payments, Refunds, Connect Payouts, Subscriptions)

It includes customer payments, refunds, connected account onboarding (Express accounts), manual payouts, weekly scheduled payouts, **subscription management with auto-renewal**, and real-time webhook syncing.

---

## 📁 Project Features

### 🧑‍💻 User Payment Flow
- Accept payments via **Stripe Payment Element**
- Supports dynamic amount entry from UI
- Success & Failed pages  
- Stores all successful payments in MongoDB (via webhook)

---

### 🔄 Subscription System (NEW)
Users can:

- View available subscription plans
- Purchase subscriptions via Stripe Checkout
- Manage active subscriptions (view, cancel)
- Resume canceled subscriptions (if canceled at period end)
- Receive trial periods

**Auto-Renewal Features:**
- Automatic billing on subscription renewal
- Webhook-based status sync for renewals
- Failed payment handling (past_due status)
- Trial ending notifications

---

### 🛠 Admin Dashboard
Admin can:

- View total payments, refunds, payouts, **subscriptions** (with stats)
- View Stripe platform balance
- Check connected account balance
- Create new connected accounts
- Generate onboarding link
- Refresh onboarding status (charges/payouts enabled)
- Transfer funds to connected account
- Create manual payouts
- Configure weekly scheduled payouts
- **Create subscription products & prices**
- **View & manage all subscriptions**
- **Cancel subscriptions**
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
| Subscriptions | Stripe Subscriptions & Checkout |
| Payouts | Stripe Connect Express |
| Webhooks | Stripe CLI |

---

# 🚀 Installation & Setup

## 1️ Clone repo

```sh
git clone <repo-url>
cd payment_system_stripe
```

## 2. Install dependencies

```sh
# backend 
cd backend
npm install
npm run start:dev # run backend

# frontend (react + vite)
cd frontend
npm install
npm run dev # run frontend
```

## 3. Environment Variables

### backend/.env
```sh
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

MONGO_URI=mongodb://localhost:27017/stripe_payments
PORT=3000
```

### frontend/.env
```sh
VITE_ADMIN_PASSWORD=supersecret123
VITE_API_BASE_URL=http://localhost:3000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## 4. Webhook Setup

```sh
# Run Stripe webhook listener:
stripe listen --forward-to localhost:3000/webhook/stripe
```

---

# Folder Structure

```
backend/
 ├── src/
 │   ├── payment/
 │   ├── refund/
 │   ├── payout/
 │   ├── subscription/     # NEW
 │   ├── webhook/
 │   ├── admin/
 │   ├── stripe/
 │   └── app.module.ts
 │
 ├── .env
 └── main.ts

frontend/
 ├── src/
 │   ├── pages/
 │   │   ├── User/
 │   │   │   ├── Home.jsx
 │   │   │   ├── Subscription.jsx       # NEW
 │   │   │   ├── SubscriptionManage.jsx # NEW
 │   │   │   ├── SubscriptionSuccess.jsx
 │   │   │   └── SubscriptionCanceled.jsx
 │   │   ├── Admin/
 │   │   │   ├── AdminDashboard.jsx
 │   │   │   ├── Subscriptions.jsx      # NEW
 │   │   │   ├── Payouts.jsx
 │   │   │   └── Refunds.jsx
 │   ├── components/
 │   ├── utils/api.js
 │   └── App.jsx
 ├── index.html
 └── vite.config.js
```

---

# API Endpoints

## Payments

| Method | Endpoint | Purpose |
| ------ | ------------------------- | --------------------- |
| POST | `/payments/create-intent` | Create payment intent |
| POST | `/payments/cancel-intent` | Cancel payment |
| GET | `/payment` | Get all payments |
| GET | `/payment/recent` | Get last 10 payments |

## Refunds

| Method | Endpoint | Purpose |
| ------ | ---------------- | -------------------------- |
| POST | `/refunds/create` | Create full/partial refund |
| GET | `/refunds/db-list` | List all refunds from DB |
| GET | `/refunds/stripe-list` | List refunds from Stripe |
| GET | `/refunds/status/:refundId` | Get refund status |

## Payouts

| Method | Endpoint | Purpose |
| ------ | -------------------------------- | ------------------------------- |
| POST | `/payout/create-account` | Create Express account |
| GET | `/payout/onboarding-link/:id` | Get onboarding link |
| GET | `/payout/account-status/:id` | Check account status |
| POST | `/payout/transfer` | Transfer to connected account |
| POST | `/payout/create-payout` | Create manual payout |
| POST | `/payout/set-schedule` | Set weekly payout schedule |
| POST | `/payout/balance` | Get connected account balance |
| GET | `/payout/platform-balance` | Get platform balance |
| GET | `/payout/all-accounts` | List all connected accounts |
| GET | `/payout/all-payouts/:accountId` | List payouts for account |

## Subscriptions (NEW)

### Products & Prices

| Method | Endpoint | Purpose |
| ------ | ----------------------------- | -------------------------------- |
| POST | `/subscription/product/create` | Create a subscription product |
| POST | `/subscription/price/create` | Create a price for a product |
| GET | `/subscription/products` | List all products |
| GET | `/subscription/prices` | List all prices |

### Subscription Management

| Method | Endpoint | Purpose |
| ------ | ---------------------------------- | ------------------------------------ |
| POST | `/subscription/checkout` | Create Stripe Checkout session |
| POST | `/subscription/create` | Create subscription directly |
| GET | `/subscription/details/:id` | Get subscription from Stripe |
| POST | `/subscription/cancel` | Cancel subscription |
| POST | `/subscription/resume` | Resume canceled subscription |
| POST | `/subscription/update` | Update subscription (change plan) |
| GET | `/subscription/customer/:id` | List customer's subscriptions |

### Database Queries

| Method | Endpoint | Purpose |
| ------ | --------------------------------- | --------------------------------- |
| GET | `/subscription/all` | Get all subscriptions from DB |
| GET | `/subscription/db/:id` | Get subscription by ID from DB |
| GET | `/subscription/by-email/:email` | Get subscriptions by email |
| GET | `/subscription/stats` | Get subscription statistics |

### Customer Portal

| Method | Endpoint | Purpose |
| ------ | --------------------- | -------------------------------------- |
| POST | `/subscription/portal` | Create customer portal session |

---

## Subscription Flow Summary

### 1. Create Products & Prices (Admin)
```
Admin Dashboard → Subscriptions → Create Product → Create Price
```

### 2. User Subscribes
```
User visits /subscription → Selects plan → Enters email → Stripe Checkout → Payment → Success page
```

### 3. Auto-Renewal
```
Stripe automatically charges on renewal date → 
Webhook: invoice.paid → Subscription synced to DB
```

### 4. Cancel Subscription
```
User visits /subscription/manage → Finds subscription → 
Cancel at period end (keeps access until period ends) OR Cancel immediately
```

### 5. Failed Renewal
```
Stripe payment fails → Webhook: invoice.payment_failed → 
Subscription status → past_due → Retry logic by Stripe
```

---

## Webhook Events Handled

### Payment Events
- `payment_intent.succeeded` - Save successful payment
- `payment_intent.payment_failed` - Log failed payment

### Refund Events
- `refund.*` - Store/update refund records

### Payout Events
- `payout.*` - Store payout events

### Subscription Events (NEW)
- `customer.subscription.created` - New subscription
- `customer.subscription.updated` - Status/plan changes
- `customer.subscription.deleted` - Subscription canceled
- `customer.subscription.trial_will_end` - Trial ending soon
- `customer.subscription.paused` - Subscription paused
- `customer.subscription.resumed` - Subscription resumed

### Invoice Events (for Renewals)
- `invoice.paid` - Successful renewal payment
- `invoice.payment_failed` - Failed renewal
- `invoice.upcoming` - Upcoming invoice notification
- `invoice.finalized` - Invoice ready

### Checkout Events
- `checkout.session.completed` - Checkout completed

---

## Admin Dashboard UI Features

### Dashboard includes:
- Stats cards (payments/refunds/payouts/**subscriptions**)
- Platform balance (Stripe account)
- Connected account balance lookup
- Create connected account
- Onboarding existing accounts
- Refresh onboarding status
- Transfer funds
- View all connected accounts
- Weekly payout schedule setup
- **Subscription stats (active/trialing/canceled)**

### Subscriptions Page includes:
- Create new products
- Create prices (monthly/yearly/weekly/daily)
- View all products & prices
- View all subscriptions
- Cancel subscriptions

---

## Admin Authentication
```sh
# Admin login uses password stored in:
VITE_ADMIN_PASSWORD=password # inside the frontend .env
```

---

## User Routes

| Route | Purpose |
| ------------------------------ | --------------------------- |
| `/` | Home - Make a payment |
| `/subscription` | View & purchase plans |
| `/subscription/manage` | Manage subscriptions |
| `/subscription/success` | Subscription success page |
| `/subscription/canceled` | Checkout canceled page |
| `/success` | Payment success |
| `/failed` | Payment failed |

## Admin Routes

| Route | Purpose |
| ----------------------- | ---------------------- |
| `/admin` | Admin login |
| `/admin/dashboard` | Main dashboard |
| `/admin/subscriptions` | Subscription management |
| `/admin/payouts` | Payout management |
| `/admin/refunds` | Refund management |
