# ChatBot AI SaaS

AI-powered chatbot platform with payment integration.

## 🚀 Live Demo

**Website:** https://chatbot-saas-tau-sandy.vercel.app

## ✅ Features

- ✅ AI Chatbot (DeepSeek R1 + OpenAI Embeddings)
- ✅ Payment System (Paddle)
- ✅ User Authentication (Supabase)
- ✅ Analytics (Google Analytics 4)
- ✅ Webhook Integration
- ✅ Responsive Design

## 💰 Pricing

- **Free:** $0/month
- **Starter:** $19/month
- **Growth:** $49/month
- **Agency:** $99/month

## 🔧 Setup

### 1. Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# API Keys
OPENROUTER_API_KEY=
OPENAI_API_KEY=

# Paddle
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=live_ce1e56ad5ff88ee1e6e1d49fb
PADDLE_API_KEY=

# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=
```

### 2. Install & Run

```bash
npm install
npm run dev
```

### 3. Deploy

Automatic deployment via Vercel on push to main.

## 📊 Paddle Webhook

**Endpoint:** `https://your-app.vercel.app/api/webhooks/paddle`

Add this URL to your Paddle dashboard under Developer Tools > Notifications.

## 🔗 Important Links

- **Paddle Dashboard:** https://vendors.paddle.com
- **Supabase Dashboard:** https://app.supabase.io
- **Vercel Dashboard:** https://vercel.com/dashboard

## 📝 License

MIT
