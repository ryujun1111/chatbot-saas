import Link from 'next/link';
import { 
  Sparkles, 
  Zap, 
  MessageSquare, 
  CheckCircle, 
  ArrowRight,
  Bot,
  HeadphonesIcon,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl blur-lg opacity-70"></div>
                <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-xl">
                  <Bot className="w-6 h-6 text-white" />
                </div>
              </div>
              <span className="text-2xl font-bold text-white">
                ChatBot AI
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <button className="px-6 py-2.5 text-white/80 hover:text-white font-medium transition-colors">
                  Log In
                </button>
              </Link>
              <Link href="/signup">
                <button className="group relative px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl overflow-hidden transition-all hover:shadow-2xl hover:shadow-purple-500/50">
                  <span className="relative z-10 flex items-center gap-2">
                    Get Started Free
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          {/* Animated background */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
          
          <div className="container mx-auto px-6 lg:px-8 relative z-10">
            <div className="max-w-5xl mx-auto text-center space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-6 py-3 rounded-full backdrop-blur-sm">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-semibold text-white">
                  Powered by DeepSeek R1 • 90.8% MMLU Score
                </span>
              </div>

              {/* Main headline */}
              <h1 className="text-6xl lg:text-8xl font-black leading-tight text-white">
                Build AI Chatbots
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  That Sell 24/7
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Same GPT-4 intelligence, <span className="font-bold text-blue-400">98% lower cost</span>. 
                <br />Deploy in 2 minutes. Start converting visitors today.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link href="/try">
                  <button className="group relative px-12 py-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-bold rounded-2xl overflow-hidden transition-all hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-105">
                    <span className="relative z-10 flex items-center gap-3">
                      <Rocket className="w-6 h-6" />
                      Try It Free - No Signup
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </button>
                </Link>
                <Link href="#pricing">
                  <button className="px-12 py-6 bg-white/10 backdrop-blur-sm text-white text-xl font-semibold rounded-2xl border-2 border-white/20 hover:border-white/40 hover:bg-white/20 transition-all">
                    See Pricing →
                  </button>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center gap-8 pt-8 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>5 free messages to try</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Setup in 2 minutes</span>
                </div>
              </div>
            </div>

            {/* Product screenshot mockup */}
            <div className="max-w-6xl mx-auto mt-20">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-3xl opacity-30"></div>
                <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
                  {/* Browser chrome */}
                  <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-4 flex items-center gap-3 border-b border-white/10">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="flex-1 text-center text-sm text-gray-400 font-mono">dashboard.chatbotai.com</div>
                  </div>
                  
                  {/* Dashboard content */}
                  <div className="p-8 bg-gradient-to-br from-slate-900 to-slate-800">
                    <div className="grid md:grid-cols-3 gap-6">
                      {/* Stat card 1 */}
                      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 shadow-xl border border-white/5">
                        <div className="text-4xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">1,247</div>
                        <div className="text-gray-400 mt-1">Total Conversations</div>
                        <div className="mt-4 flex items-center gap-2 text-green-400 text-sm font-semibold">
                          <TrendingUp className="w-4 h-4" />
                          <span>+23% this week</span>
                        </div>
                      </div>
                      
                      {/* Stat card 2 */}
                      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 shadow-xl border border-white/5">
                        <div className="text-4xl font-black bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">94%</div>
                        <div className="text-gray-400 mt-1">Customer Satisfaction</div>
                        <div className="mt-4 flex items-center gap-2">
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      
                      {/* Stat card 3 */}
                      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 shadow-xl border border-white/5">
                        <div className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">$8/mo</div>
                        <div className="text-gray-400 mt-1">Total AI Cost</div>
                        <div className="mt-4 text-sm text-gray-500">vs $450/mo Chatbase</div>
                      </div>
                    </div>
                    
                    {/* Chat preview */}
                    <div className="mt-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-white/5">
                      <div className="space-y-4">
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">AI</div>
                          <div className="flex-1 bg-slate-700/50 rounded-lg p-3 text-sm text-gray-300">
                            Hi! How can I help you today?
                          </div>
                        </div>
                        <div className="flex gap-3 justify-end">
                          <div className="bg-blue-600/20 rounded-lg p-3 text-sm text-blue-200">
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
        <section className="py-12 bg-black/20 border-y border-white/10">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="text-center mb-8">
              <p className="text-gray-400 text-sm font-semibold uppercase tracking-wide">Trusted by forward-thinking companies</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-12 opacity-50">
              {/* Company logos would go here */}
              <div className="text-white/40 font-bold text-2xl">Company</div>
              <div className="text-white/40 font-bold text-2xl">Startup</div>
              <div className="text-white/40 font-bold text-2xl">Agency</div>
              <div className="text-white/40 font-bold text-2xl">SaaS</div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-gradient-to-b from-transparent to-black/20">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-6xl font-black mb-4 text-white">
                Everything You Need
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  To Convert More
                </span>
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Enterprise features without the enterprise price tag
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Zap,
                  title: "2-Minute Setup",
                  desc: "Paste your website URL. AI learns everything instantly. No coding required.",
                  gradient: "from-yellow-500 to-orange-500"
                },
                {
                  icon: MessageSquare,
                  title: "Human-Like AI",
                  desc: "DeepSeek R1 beats GPT-4o on benchmarks. Your customers won't know it's a bot.",
                  gradient: "from-blue-500 to-cyan-500"
                },
                {
                  icon: Globe,
                  title: "50+ Languages",
                  desc: "Automatically respond in your customer's native language. Zero configuration.",
                  gradient: "from-green-500 to-emerald-500"
                },
                {
                  icon: Shield,
                  title: "Enterprise Security",
                  desc: "SOC 2 compliant. Bank-level encryption. Your data is never shared or trained on.",
                  gradient: "from-purple-500 to-pink-500"
                },
                {
                  icon: HeadphonesIcon,
                  title: "24/7 Availability",
                  desc: "Never miss a lead. Respond instantly, any time of day or night.",
                  gradient: "from-red-500 to-rose-500"
                },
                {
                  icon: Users,
                  title: "Unlimited Team",
                  desc: "Bring your whole team. Collaborate in real-time. No per-seat pricing.",
                  gradient: "from-indigo-500 to-blue-500"
                }
              ].map((feature, i) => (
                <div key={i} className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300">
                  <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.gradient} text-white mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20 bg-black/20">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-6xl font-black mb-4 text-white">
                Simple, Transparent Pricing
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Start free. Scale when you need. Cancel anytime.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Free */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <div className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Free</div>
                <div className="text-5xl font-black text-white mb-2">$0</div>
                <div className="text-gray-400 mb-6">Forever free</div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2 text-gray-300">
                    <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>5 messages/month</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-300">
                    <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>1 chatbot</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-300">
                    <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Email support</span>
                  </li>
                </ul>
                <Link href="/try">
                  <button className="w-full px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all">
                    Try Free
                  </button>
                </Link>
              </div>

              {/* Starter - Popular */}
              <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 shadow-2xl scale-105 border-2 border-white/20">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-400 text-black text-xs font-bold px-4 py-1 rounded-full">
                  MOST POPULAR
                </div>
                <div className="text-sm font-semibold text-white/80 uppercase tracking-wide mb-4">Starter</div>
                <div className="text-5xl font-black text-white mb-2">$19</div>
                <div className="text-white/80 mb-6">per month</div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2 text-white">
                    <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>1,000 messages/month</span>
                  </li>
                  <li className="flex items-start gap-2 text-white">
                    <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Unlimited chatbots</span>
                  </li>
                  <li className="flex items-start gap-2 text-white">
                    <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-start gap-2 text-white">
                    <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Remove branding</span>
                  </li>
                </ul>
                <Link href="/signup">
                  <button className="w-full px-8 py-4 bg-white text-purple-600 font-bold rounded-xl hover:shadow-2xl transition-all">
                    Get Started
                  </button>
                </Link>
              </div>

              {/* Pro */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <div className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Pro</div>
                <div className="text-5xl font-black text-white mb-2">$49</div>
                <div className="text-gray-400 mb-6">per month</div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2 text-gray-300">
                    <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>5,000 messages/month</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-300">
                    <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Everything in Starter</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-300">
                    <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>24/7 support</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-300">
                    <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>White label</span>
                  </li>
                </ul>
                <Link href="/signup">
                  <button className="w-full px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all">
                    Get Started
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <h2 className="text-4xl lg:text-6xl font-black text-white">
                Ready to 10x Your
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Customer Support?
                </span>
              </h2>
              <p className="text-xl text-gray-400">
                Join thousands of businesses using AI chatbots to convert more visitors
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link href="/try">
                  <button className="group relative px-12 py-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-bold rounded-2xl overflow-hidden transition-all hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-105">
                    <span className="relative z-10 flex items-center gap-3">
                      Start Free Trial
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/40 py-12">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">ChatBot AI</span>
              </div>
              <p className="text-gray-400 text-sm">
                Build AI chatbots for your website in minutes.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">About</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Terms</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-gray-400 text-sm">
            © 2024 ChatBot AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
