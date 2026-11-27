# AI Chatbot SaaS - Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables

Copy the \.env.local\ file and add your API keys:

\\\ash
# Supabase (Already configured)
NEXT_PUBLIC_SUPABASE_URL=https://hckcuzdigluapiovftsy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here  # Get from Supabase Dashboard
SUPABASE_SERVICE_ROLE_KEY=your_key_here      # Get from Supabase Dashboard

# OpenRouter (DeepSeek R1) - Already have \ credit
OPENROUTER_API_KEY=your_key_here             # Get from OpenRouter Dashboard

# OpenAI (Embeddings)
OPENAI_API_KEY=your_key_here                 # Get from OpenAI Dashboard
\\\

### 3. Get Your API Keys

#### Supabase Keys:
1. Go to: https://supabase.com/dashboard/project/hckcuzdigluapiovftsy/settings/api-keys
2. Copy **Publishable key** (anon key)
3. Reveal and copy **Secret key** (service role key)

#### OpenRouter Key:
1. Go to: https://openrouter.ai/keys
2. Copy your API key

#### OpenAI Key:
1. Go to: https://platform.openai.com/api-keys
2. Create and copy your API key

### 4. Run Development Server

\\\ash
npm run dev
\\\

Open [http://localhost:3000](http://localhost:3000)

## 📊 Production Deployment

Already deployed at: **https://chatbot-saas-tau-sandy.vercel.app**

### Add Environment Variables to Vercel:
1. Go to: https://vercel.com/ryujun1111/chatbot-saas/settings/environment-variables
2. Add all variables from \.env.local\
3. Redeploy

## 📂 Project Structure

\\\
app/
├── page.tsx                 # Home page (mobile responsive)
├── login/page.tsx          # Login (mobile responsive)
├── signup/page.tsx         # Signup (mobile responsive)
├── pricing/page.tsx        # Pricing (mobile responsive) ✨ NEW
├── try/page.tsx            # Try demo (mobile responsive)
├── demo/page.tsx           # Redirect to /try ✨ NEW
├── dashboard/page.tsx      # Dashboard
└── api/                    # API routes (8 endpoints)
    ├── analytics/
    ├── chat/
    ├── chatbots/
    ├── crawl/
    ├── documents/
    ├── embed/
    └── settings/
\\\

## 🎨 Tech Stack

- **Framework**: Next.js 16
- **Database**: Supabase (PostgreSQL)
- **AI Model**: DeepSeek R1 (via OpenRouter)
- **Embeddings**: OpenAI
- **Styling**: Tailwind CSS v3.4.0
- **Deployment**: Vercel

## 📱 Mobile Responsive

All pages are fully mobile responsive:
- Mobile: 375px (iPhone SE)
- Tablet: 768px (iPad)
- Desktop: 1920px (Full HD)

## 🔑 Next Steps

1. ✅ Add API keys to \.env.local\
2. ✅ Test locally (\
pm run dev\)
3. ✅ Add environment variables to Vercel
4. 🚀 Start marketing (Product Hunt, Reddit, Agency outreach)

## 💰 Pricing

- Free: \/mo (5 messages/day)
- Starter: \/mo (1,000 messages)
- Growth: \/mo (5,000 messages)
- Agency: \/mo (15,000 messages)

## 📞 Support

For issues, contact: ryujy0915@gmail.com
