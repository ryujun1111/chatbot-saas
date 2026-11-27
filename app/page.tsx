import Link from 'next/link';
import { 
  Sparkles, 
  Zap, 
  MessageSquare, 
  CheckCircle, 
  ArrowRight,
  Bot,
  Globe,
  Shield,
  Rocket,
  TrendingUp,
  Users,
  Star,
  Check
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Animated gradient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur-lg opacity-75"></div>
                <Bot className="relative w-8 h-8 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                ChatBot AI
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <button className="px-6 py-2.5 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                  Log In
                </button>
              </Link>
              <Link href="/signup">
                <button className="px-6 py-2.5 text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300">
                  Get Started Free →
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-300">Powered by DeepSeek R1 • 90.8% MMLU Score</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-6xl lg:text-7xl font-bold">
              <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                Build AI Chatbots
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                That Actually Convert
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Same GPT-4 intelligence, 98% lower cost. Deploy in 2 minutes. 
              Start converting visitors today.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/demo">
                <button className="group relative px-8 py-4 overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/70 transition-all duration-300">
                  <span className="relative z-10 flex items-center gap-2">
                    <Rocket className="w-5 h-5" />
                    Try It Free - No Signup
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </Link>
              <Link href="/pricing">
                <button className="px-8 py-4 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 hover:border-white/20 transition-all duration-300">
                  See Pricing
                </button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>5 free messages</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>Setup in 2 minutes</span>
              </div>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="relative mt-16">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl"></div>
            <div className="relative rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8 backdrop-blur-xl border border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stat Card 1 */}
                <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                    <span className="text-sm text-gray-400">Total Conversations</span>
                  </div>
                  <div className="text-3xl font-bold text-white">↗+23%</div>
                  <div className="text-sm text-gray-500">this week</div>
                </div>

                {/* Stat Card 2 */}
                <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-5 h-5 text-purple-400" />
                    <span className="text-sm text-gray-400">Customer Satisfaction</span>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>

                {/* Stat Card 3 */}
                <div className="p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20">
                  <div className="flex items-center gap-3 mb-2">
                    <Zap className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-gray-400">Total AI Cost</span>
                  </div>
                  <div className="text-2xl font-bold text-white">vs $450/mo</div>
                  <div className="text-sm text-gray-500">Chatbase</div>
                </div>
              </div>

              {/* Chat Demo */}
              <div className="mt-6 p-6 rounded-xl bg-black/50 border border-white/5">
                <div className="flex items-center gap-3 mb-4">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-gray-400">AI</span>
                  <span className="text-xs text-gray-600">•</span>
                  <span className="text-xs text-gray-600">Just now</span>
                </div>
                <p className="text-white leading-relaxed">
                  Hi! How can I help you today?
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 border-y border-white/5">
        <div className="container mx-auto px-6">
          <p className="text-center text-sm text-gray-500 mb-8">TRUSTED BY FORWARD-THINKING COMPANIES</p>
          <div className="flex flex-wrap items-center justify-center gap-12 text-gray-600">
            <span className="text-2xl font-semibold">Company</span>
            <span className="text-2xl font-semibold">Startup</span>
            <span className="text-2xl font-semibold">Agency</span>
            <span className="text-2xl font-semibold">SaaS</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Everything You Need
              </span>
            </h2>
            <p className="text-xl text-gray-400">
              Enterprise features without the enterprise price tag
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="group relative p-8 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity"></div>
                <feature.icon className="relative w-12 h-12 mb-4 text-blue-400" />
                <h3 className="relative text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="relative text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-transparent to-black/50">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Simple, Transparent Pricing
              </span>
            </h2>
            <p className="text-xl text-gray-400">
              Pay for what you use. Cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pricingPlans.map((plan, i) => (
              <div key={i} className={`relative p-8 rounded-2xl border ${
                plan.popular 
                  ? 'bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/50 scale-105' 
                  : 'bg-white/5 border-white/10'
              } hover:border-white/20 transition-all duration-300`}>
                {plan.popular && (
                  <div className="absolute top-0 right-0 px-4 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-xs font-semibold text-white rounded-bl-lg rounded-tr-2xl">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-white">${plan.price}</span>
                  {plan.price > 0 && <span className="text-gray-400">/mo</span>}
                </div>
                <p className="text-gray-400 mb-6">{plan.description}</p>
                <Link href={plan.cta.link}>
                  <button className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:shadow-blue-500/50'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}>
                    {plan.cta.text}
                  </button>
                </Link>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="relative p-12 rounded-3xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/10 backdrop-blur-xl text-center">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-3xl"></div>
            <h2 className="relative text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Convert More Visitors?
            </h2>
            <p className="relative text-xl text-gray-300 mb-8">
              Join thousands of businesses using AI to sell 24/7
            </p>
            <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300">
                  Start Free Trial
                </button>
              </Link>
              <Link href="/demo">
                <button className="px-8 py-4 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/5 transition-all duration-300">
                  Watch Demo
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="container mx-auto text-center text-gray-500">
          <p>© 2024 ChatBot AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: Zap,
    title: "2-Minute Setup",
    description: "Paste your website URL. AI learns everything instantly."
  },
  {
    icon: Bot,
    title: "Human-Like AI",
    description: "DeepSeek R1 beats GPT-4o on benchmarks. Customers won't know it's a bot."
  },
  {
    icon: Globe,
    title: "50+ Languages",
    description: "Automatically respond in your customer's native language."
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your data stays yours. No training on your conversations."
  },
  {
    icon: Rocket,
    title: "Embed Anywhere",
    description: "Works on any website. WordPress, Shopify, custom sites."
  },
  {
    icon: TrendingUp,
    title: "Lightning Fast",
    description: "Responses in under 2 seconds. Faster than human support."
  }
];

const pricingPlans = [
  {
    name: "Free",
    price: 0,
    description: "Perfect for testing",
    cta: { text: "Get Started", link: "/signup" },
    features: [
      "5 messages/day",
      "1 chatbot",
      "Basic analytics",
      "Community support"
    ]
  },
  {
    name: "Starter",
    price: 19,
    description: "For small businesses",
    popular: true,
    cta: { text: "Get Started", link: "/signup" },
    features: [
      "1,000 messages/mo",
      "3 chatbots",
      "Full analytics",
      "Email support"
    ]
  },
  {
    name: "Growth",
    price: 49,
    description: "For growing teams",
    cta: { text: "Get Started", link: "/signup" },
    features: [
      "5,000 messages/mo",
      "10 chatbots",
      "Advanced analytics",
      "Priority support"
    ]
  },
  {
    name: "Agency",
    price: 99,
    description: "For agencies",
    cta: { text: "Get Started", link: "/signup" },
    features: [
      "15,000 messages/mo",
      "Unlimited chatbots",
      "White-label",
      "Dedicated support"
    ]
  }
];
