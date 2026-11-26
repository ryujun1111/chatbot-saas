import Link from 'next/link';
import { Button } from '@/components/ui';
import { 
  Sparkles, 
  Zap, 
  MessageSquare, 
  CheckCircle, 
  ArrowRight,
  Clock,
  Bot,
  HeadphonesIcon,
  Globe,
  Shield,
  Rocket,
  TrendingUp,
  Users,
  Star
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Navigation */}
      <nav className="border-b border-white/20 bg-white/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl blur-lg opacity-50"></div>
                <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-xl">
                  <Bot className="w-6 h-6 text-white" />
                </div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ChatBot AI
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <button className="px-6 py-2.5 text-gray-700 hover:text-gray-900 font-medium transition-colors">
                  Log In
                </button>
              </Link>
              <Link href="/signup">
                <button className="group relative px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl overflow-hidden transition-all hover:shadow-2xl hover:shadow-blue-500/50">
                  <span className="relative z-10 flex items-center gap-2">
                    Get Started Free
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          {/* Background gradients */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
          
          <div className="container mx-auto px-6 lg:px-8 relative z-10">
            <div className="max-w-5xl mx-auto text-center space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50 px-6 py-3 rounded-full backdrop-blur-sm">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Powered by DeepSeek R1 - 90.8% MMLU
                </span>
              </div>

              {/* Main headline */}
              <h1 className="text-6xl lg:text-7xl font-black leading-tight">
                <span className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                  Build AI Chatbots
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  That Actually Convert
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Same GPT-4 power, <span className="font-bold text-blue-600">98% lower cost</span>. 
                Deploy in 2 minutes, start converting visitors into customers today.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link href="/try">
                  <button className="group relative px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-bold rounded-2xl overflow-hidden transition-all hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-105">
                    <span className="relative z-10 flex items-center gap-3">
                      <Rocket className="w-6 h-6" />
                      Try It Now - No Signup
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </button>
                </Link>
                <Link href="#pricing">
                  <button className="px-10 py-5 bg-white text-gray-900 text-lg font-semibold rounded-2xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all">
                    See Pricing
                  </button>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center gap-8 pt-8 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>5 free messages to try</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Setup in 2 minutes</span>
                </div>
              </div>
            </div>

            {/* Product screenshot mockup */}
            <div className="max-w-6xl mx-auto mt-20">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-3xl opacity-20"></div>
                <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 flex items-center gap-3">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="flex-1 text-center text-sm text-gray-400">Your AI Chatbot Dashboard</div>
                  </div>
                  <div className="p-8 bg-gradient-to-br from-slate-50 to-blue-50">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="bg-white rounded-xl p-6 shadow-lg">
                        <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">1,247</div>
                        <div className="text-gray-600 mt-1">Conversations</div>
                        <div className="mt-4 flex items-center gap-2 text-green-600 text-sm font-semibold">
                          <TrendingUp className="w-4 h-4" />
                          <span>+23% this week</span>
                        </div>
                      </div>
                      <div className="bg-white rounded-xl p-6 shadow-lg">
                        <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">94%</div>
                        <div className="text-gray-600 mt-1">Satisfaction</div>
                        <div className="mt-4 flex items-center gap-2">
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <div className="bg-white rounded-xl p-6 shadow-lg">
                        <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">$8/mo</div>
                        <div className="text-gray-600 mt-1">Total Cost</div>
                        <div className="mt-4 text-sm text-gray-500">vs $450/mo Chatbase</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-black mb-4">
                <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Everything You Need to Win
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Enterprise features at a fraction of the cost
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Zap,
                  title: "Instant Setup",
                  desc: "Paste your website URL. AI learns everything in under 5 minutes.",
                  gradient: "from-yellow-500 to-orange-500"
                },
                {
                  icon: MessageSquare,
                  title: "Human-Like Conversations",
                  desc: "Powered by DeepSeek R1 - beats GPT-4o on MMLU benchmarks.",
                  gradient: "from-blue-500 to-cyan-500"
                },
                {
                  icon: Globe,
                  title: "50+ Languages",
                  desc: "Automatically respond in your customer's native language.",
                  gradient: "from-green-500 to-emerald-500"
                },
                {
                  icon: Shield,
                  title: "Enterprise Security",
                  desc: "SOC 2 compliant. Your data is encrypted and never shared.",
                  gradient: "from-purple-500 to-pink-500"
                },
                {
                  icon: HeadphonesIcon,
                  title: "24/7 Support",
                  desc: "Never miss a lead. Respond instantly, any time of day.",
                  gradient: "from-red-500 to-rose-500"
                },
                {
                  icon: Users,
                  title: "Unlimited Team Access",
                  desc: "Collaborate with your whole team. No per-seat fees.",
                  gradient: "from-indigo-500 to-blue-500"
                }
              ].map((feature, i) => (
                <div key={i} className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 border border-gray-200 hover:border-blue-500 hover:shadow-2xl transition-all duration-300">
                  <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.gradient} text-white mb-6 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing - rest of the content... */}
      </main>
    </div>
  );
}
