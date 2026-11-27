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
  Check,
  Code2,
  Gauge,
  Lock
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-2xl">
        <div className="container mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-lg blur-xl opacity-50"></div>
                <div className="relative bg-gradient-to-br from-blue-500 to-purple-500 p-2 rounded-lg">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              </div>
              <span className="text-xl font-bold">ChatBot AI</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <button className="px-5 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                  Log In
                </button>
              </Link>
              <Link href="/signup">
                <button className="px-6 py-2 text-sm font-semibold bg-white text-black rounded-lg hover:bg-gray-100 transition-all">
                  Get Started Free →
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-sm font-medium">Powered by DeepSeek R1 • 90.8% MMLU Score</span>
            </div>

            {/* Main headline */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Build AI Chatbots
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                That Convert 24/7
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Same GPT-4 intelligence, 98% lower cost.
              Deploy in 2 minutes. Start converting visitors today.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/try">
                <button className="group px-8 py-4 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-all flex items-center gap-2">
                  <Rocket className="w-5 h-5" />
                  Try It Free - No Signup
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link href="#pricing">
                <button className="px-8 py-4 border border-white/10 bg-white/5 font-semibold rounded-lg hover:bg-white/10 transition-all">
                  See Pricing
                </button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-sm text-gray-400">
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

          {/* Product Preview */}
          <div className="max-w-5xl mx-auto mt-16">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-3xl"></div>
              <div className="relative bg-gradient-to-b from-white/10 to-white/5 rounded-2xl border border-white/10 backdrop-blur-sm overflow-hidden">
                {/* Browser chrome */}
                <div className="bg-white/5 px-4 py-3 border-b border-white/10 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="flex-1 text-center text-sm text-gray-500">dashboard.chatbotai.com</div>
                </div>
                
                {/* Dashboard */}
                <div className="p-8">
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                      <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">1,247</div>
                      <div className="text-sm text-gray-400 mt-1">Total Conversations</div>
                      <div className="mt-3 flex items-center gap-2 text-green-400 text-xs font-semibold">
                        <TrendingUp className="w-3.5 h-3.5" />
                        +23% this week
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                      <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">94%</div>
                      <div className="text-sm text-gray-400 mt-1">Customer Satisfaction</div>
                      <div className="mt-3 flex gap-1">
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                      <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">$8/mo</div>
                      <div className="text-sm text-gray-400 mt-1">Total AI Cost</div>
                      <div className="mt-3 text-xs text-gray-500">vs $450/mo Chatbase</div>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold">AI</div>
                        <div className="flex-1 bg-white/5 rounded-lg px-3 py-2 text-sm text-gray-300">
                          Hi! How can I help you today?
                        </div>
                      </div>
                      <div className="flex gap-3 justify-end">
                        <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg px-3 py-2 text-sm text-blue-200">
                          What are your pricing plans?
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 border-y border-white/5">
        <div className="container mx-auto px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500 mb-8">TRUSTED BY FORWARD-THINKING COMPANIES</p>
          <div className="flex flex-wrap items-center justify-center gap-12">
            <div className="text-gray-600 font-semibold text-lg">Company</div>
            <div className="text-gray-600 font-semibold text-lg">Startup</div>
            <div className="text-gray-600 font-semibold text-lg">Agency</div>
            <div className="text-gray-600 font-semibold text-lg">SaaS</div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-400">
              Enterprise features without the enterprise price tag
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: "2-Minute Setup",
                desc: "Paste your website URL. AI learns everything instantly.",
                color: "from-yellow-400 to-orange-400"
              },
              {
                icon: MessageSquare,
                title: "Human-Like AI",
                desc: "DeepSeek R1 beats GPT-4o on benchmarks. Customers won't know it's a bot.",
                color: "from-blue-400 to-cyan-400"
              },
              {
                icon: Globe,
                title: "50+ Languages",
                desc: "Automatically respond in your customer's native language.",
                color: "from-green-400 to-emerald-400"
              },
              {
                icon: Shield,
                title: "Privacy First",
                desc: "Your data stays yours. No training on your conversations.",
                color: "from-purple-400 to-pink-400"
              },
              {
                icon: Code2,
                title: "Embed Anywhere",
                desc: "Works on any website. WordPress, Shopify, custom sites.",
                color: "from-pink-400 to-rose-400"
              },
              {
                icon: Gauge,
                title: "Lightning Fast",
                desc: "Responses in under 2 seconds. Faster than human support.",
                color: "from-cyan-400 to-blue-400"
              }
            ].map((feature, i) => (
              <div key={i} className="group p-6 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} p-3 mb-4`}>
                  <feature.icon className="w-full h-full text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-white/5">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-400">
              Pay for what you use. Cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              {
                name: "Free",
                price: "$0",
                desc: "Perfect for testing",
                features: ["5 messages/day", "1 chatbot", "Basic analytics", "Community support"]
              },
              {
                name: "Starter",
                price: "$19",
                desc: "For small businesses",
                features: ["1,000 messages/mo", "3 chatbots", "Full analytics", "Email support"],
                popular: true
              },
              {
                name: "Growth",
                price: "$49",
                desc: "For growing teams",
                features: ["5,000 messages/mo", "10 chatbots", "Advanced analytics", "Priority support"]
              },
              {
                name: "Agency",
                price: "$99",
                desc: "For agencies",
                features: ["15,000 messages/mo", "Unlimited chatbots", "White-label", "Dedicated support"]
              }
            ].map((plan, i) => (
              <div key={i} className={`relative p-6 rounded-2xl border ${plan.popular ? 'border-blue-500 bg-gradient-to-b from-blue-500/10 to-purple-500/10' : 'border-white/10 bg-white/5'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-xs font-semibold rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <div className="text-sm font-semibold text-gray-400 mb-2">{plan.name}</div>
                <div className="text-4xl font-bold mb-1">{plan.price}</div>
                <div className="text-sm text-gray-400 mb-6">{plan.desc}</div>
                <Link href="/signup">
                  <button className={`w-full py-3 rounded-lg font-semibold transition-all ${plan.popular ? 'bg-white text-black hover:bg-gray-100' : 'bg-white/10 hover:bg-white/20'}`}>
                    Get Started
                  </button>
                </Link>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-300">
                      <Check className="w-4 h-4 text-green-400" />
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
      <section className="py-24">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-6xl font-bold">
              Ready to Convert More Visitors?
            </h2>
            <p className="text-xl text-gray-400">
              Join thousands of businesses using AI to sell 24/7
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <button className="px-8 py-4 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-all flex items-center gap-2">
                  <Rocket className="w-5 h-5" />
                  Start Free Trial
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/demo">
                <button className="px-8 py-4 border border-white/10 bg-white/5 font-semibold rounded-lg hover:bg-white/10 transition-all">
                  Watch Demo
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center text-sm text-gray-500">
            © 2024 ChatBot AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
