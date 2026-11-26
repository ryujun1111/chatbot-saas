# AI Chatbot SaaS

> DeepSeek R1-powered chatbot platform targeting international markets

An AI chatbot SaaS platform that enables businesses to create intelligent chatbots trained on their website content. Built with DeepSeek R1 for cost-effective, high-quality AI responses.

## ✨ Key Features

- **Try Without Signup** - Experience the chatbot immediately, no registration required
- **URL Crawling** - Automatically extract and process website content
- **DeepSeek R1 AI** - Powered by DeepSeek R1 through OpenRouter for intelligent responses
- **Website Widget** - Easy-to-embed chatbot widget for any website
- **Subscription Billing** - Paddle-integrated payment system for recurring revenue

## 🚀 Tech Stack

- **Frontend & Backend**: Next.js 16 (App Router)
- **AI Model**: DeepSeek R1 via OpenRouter
- **Database**: Supabase (PostgreSQL)
- **Payments**: Paddle
- **Styling**: Tailwind CSS v4
- **Crawling**: Cheerio
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18.17 or later
- npm or yarn
- Supabase account
- OpenRouter API key
- Paddle account (for payments)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd chatbot-saas
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (see below)

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🔑 Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenRouter API (DeepSeek R1)
OPENROUTER_API_KEY=your_openrouter_api_key

# Paddle Payment Gateway
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=your_paddle_client_token
PADDLE_API_KEY=your_paddle_api_key
NEXT_PUBLIC_PADDLE_ENVIRONMENT=sandbox # or 'production'

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Variable Descriptions

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `OPENROUTER_API_KEY` | OpenRouter API key for DeepSeek R1 access |
| `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` | Paddle client-side token |
| `PADDLE_API_KEY` | Paddle server-side API key |
| `NEXT_PUBLIC_PADDLE_ENVIRONMENT` | Paddle environment (`sandbox` or `production`) |
| `NEXT_PUBLIC_APP_URL` | Your application URL |

## 📦 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Deploy

```bash
npm run build
```

### Cloudflare Pages

1. Build the application:
```bash
npm run build
```

2. Deploy the `.next` output directory to Cloudflare Pages
3. Configure environment variables in Cloudflare dashboard

## 📁 Project Structure

```
chatbot-saas/
├── app/
│   ├── (auth)/          # Authentication pages (login, signup)
│   ├── api/             # API routes
│   │   ├── chat/        # Chat completion endpoint
│   │   ├── crawl/       # URL crawling endpoint
│   │   └── embed/       # Embedding generation
│   ├── dashboard/       # User dashboard
│   ├── try/             # Try-before-signup demo
│   └── widget/          # Embeddable chatbot widget
├── components/          # Reusable React components
├── lib/                 # Utility functions and helpers
│   ├── supabase/        # Supabase client configuration
│   └── utils/           # Helper functions
├── public/              # Static assets
└── docs/                # Documentation
```

## 🎯 Goals

- ✅ Build MVP with core chatbot functionality
- 🎯 **First $1 Payment** - Achieve first paying customer
- 🎯 **$770 MRR** - Reach monthly recurring revenue target

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🤝 Contributing

This is a solo founder project, but issues and pull requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📧 Contact

For questions or suggestions, please open an issue.

---

**Built with ❤️ by a solo founder**
