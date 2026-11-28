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
    <>
      {/* Background Blobs */}
      <div className="bg-blob bg-blob-blue"></div>
      <div className="bg-blob bg-blob-purple"></div>

      <div className="min-h-screen">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/5">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 py-3 md:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur-lg opacity-75"></div>
                  <Bot className="relative w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <span className="text-lg md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  ChatBot AI
                </span>
              </div>
              <div className="flex items-center gap-2 md:gap-4">
                <Link href="/login" className="btn-secondary text-xs md:text-sm px-3 md:px-6 py-2 md:py-2.5">
                  Log In
                </Link>
                <Link href="/signup" className="btn-primary text-xs md:text-sm px-3 md:px-6 py-2 md:py-2.5">
                  Get Started →
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative pt-20 md:pt-28 lg:pt-32 pb-12 md:pb-16 lg:pb-20 px-4 md:px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center space-y-4 md:space-y-6 lg:space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 backdrop-blur-sm">
                <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-blue-400" />
                <span className="text-xs md:text-sm text-gray-300">Powered by GPT-4o mini • Trained on your website</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                  Build AI Chatbots
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  That Actually Convert
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-base md:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed px-4">
                Same GPT-4 intelligence, 98% lower cost. Deploy in 2 minutes. 
                Start converting visitors today.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 pt-2 md:pt-4 px-4">
                <Link href="/try" className="w-full sm:w-auto">
                  <button className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 text-sm md:text-base">
                    <Rocket className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="whitespace-nowrap">Try It Free - No Signup</span>
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </Link>
                <Link href="/pricing" className="w-full sm:w-auto">
                  <button className="btn-secondary w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 text-sm md:text-base">
                    See Pricing
                  </button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 pt-4 md:pt-8 text-xs md:text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Check className="w-3 h-3 md:w-4 md:h-4 text-green-400" />
                  <span>No credit card</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3 h-3 md:w-4 md:h-4 text-green-400" />
                  <span>5 free messages</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3 h-3 md:w-4 md:h-4 text-green-400" />
                  <span>2 min setup</span>
                </div>
              </div>
            </div>

            {/* Dashboard Preview */}
            <div className="relative mt-8 md:mt-12 lg:mt-16">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl"></div>
              <div className="relative rounded-xl md:rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-4 md:p-6 lg:p-8 backdrop-blur-xl border border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
                  {/* Stat Card 1 */}
                  <div className="stat-card p-4 md:p-6">
                    <div className="flex items-center gap-2 md:gap-3 mb-2">
                      <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
                      <span className="text-xs md:text-sm text-gray-400">Total Conversations</span>
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-white">↗+23%</div>
                    <div className="text-xs md:text-sm text-gray-500">this week</div>
                  </div>

                  {/* Stat Card 2 */}
                  <div className="stat-card stat-card-purple p-4 md:p-6">
                    <div className="flex items-center gap-2 md:gap-3 mb-2">
                      <Users className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
                      <span className="text-xs md:text-sm text-gray-400">Customer Satisfaction</span>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 md:w-5 md:h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>

                  {/* Stat Card 3 */}
                  <div className="stat-card stat-card-green p-4 md:p-6">
                    <div className="flex items-center gap-2 md:gap-3 mb-2">
                      <Zap className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
                      <span className="text-xs md:text-sm text-gray-400">Total AI Cost</span>
                    </div>
                    <div className="text-xl md:text-2xl font-bold text-white">vs $450/mo</div>
                    <div className="text-xs md:text-sm text-gray-500">Chatbase</div>
                  </div>
                </div>

                {/* Chat Demo */}
                <div className="p-4 md:p-6 rounded-lg md:rounded-xl bg-black/50 border border-white/5">
                  <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                    <MessageSquare className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
                    <span className="text-xs md:text-sm text-gray-400">AI</span>
                    <span className="text-xs text-gray-600">•</span>
                    <span className="text-xs text-gray-600">Just now</span>
                  </div>
                  <p className="text-sm md:text-base text-white leading-relaxed">
                    Hi! How can I help you today?
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 md:py-16 lg:py-24 px-4 md:px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-10 md:mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
                <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Everything You Need
                </span>
              </h2>
              <p className="text-base md:text-lg lg:text-xl text-gray-400">
                Enterprise features without the enterprise price tag
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {features.map((feature, i) => (
                <div key={i} className="feature-card p-6 md:p-8">
                  <feature.icon className="w-10 h-10 md:w-12 md:h-12 mb-3 md:mb-4 text-blue-400" />
                  <h3 className="text-lg md:text-xl font-semibold text-white mb-2 md:mb-3">{feature.title}</h3>
                  <p className="text-sm md:text-base text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-12 md:py-16 lg:py-24 px-4 md:px-6 bg-gradient-to-b from-transparent to-black/50">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-10 md:mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
                <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Simple, Transparent Pricing
                </span>
              </h2>
              <p className="text-base md:text-lg lg:text-xl text-gray-400">
                Pay for what you use. Cancel anytime.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {pricingPlans.map((plan, i) => (
                <div key={i} className={`relative ${plan.popular ? 'pricing-card-popular' : 'pricing-card'} p-6 md:p-8`}>
                  {plan.popular && (
                    <div className="absolute top-0 right-0 px-3 md:px-4 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-xs font-semibold text-white rounded-bl-lg rounded-tr-2xl">
                      MOST POPULAR
                    </div>
                  )}
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="mb-3 md:mb-4">
                    <span className="text-4xl md:text-5xl font-bold text-white">${plan.price}</span>
                    {plan.price > 0 && <span className="text-sm md:text-base text-gray-400">/mo</span>}
                  </div>
                  <p className="text-sm md:text-base text-gray-400 mb-4 md:mb-6">{plan.description}</p>
                  <Link href={plan.cta.link} className="block">
                    <button className={`w-full py-2.5 md:py-3 px-4 md:px-6 rounded-lg font-semibold text-sm md:text-base transition-all duration-300 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:shadow-blue-500/50'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}>
                      {plan.cta.text}
                    </button>
                  </Link>
                  <ul className="mt-4 md:mt-6 space-y-2 md:space-y-3">
                    {plan.features.map((feat, j) => (
                      <li key={j} className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-gray-300">
                        <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-400 flex-shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-16 lg:py-24 px-4 md:px-6">
          <div className="container mx-auto max-w-4xl">
            <div className="cta-section p-8 md:p-10 lg:p-12">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6 text-center">
                Ready to Convert More Visitors?
              </h2>
              <p className="text-base md:text-lg lg:text-xl text-gray-300 mb-6 md:mb-8 text-center">
                Let AI answer your visitors' questions 24/7
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
                <Link href="/signup" className="w-full sm:w-auto">
                  <button className="btn-primary w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 text-sm md:text-base">
                    Start Free Trial
                  </button>
                </Link>
                <Link href="/try" className="w-full sm:w-auto">
                  <button className="btn-secondary w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 text-sm md:text-base">
                    Watch Demo
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 md:py-12 px-4 md:px-6 border-t border-white/5">
          <div className="container mx-auto text-center text-sm md:text-base text-gray-500">
            <p>© {new Date().getFullYear()} ChatBot AI. All rights reserved.</p>
            <div className="mt-3 flex justify-center gap-6">
              <Link href="/pricing" className="hover:text-gray-300">Pricing</Link>
              <Link href="/privacy" className="hover:text-gray-300">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-gray-300">Terms of Service</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
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
    description: "Answers come from your own website content, in a natural conversational tone."
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
      "50 messages/mo",
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
