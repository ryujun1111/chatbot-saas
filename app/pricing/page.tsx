import Link from 'next/link';
import { CheckCircle, ArrowRight, Bot, Sparkles } from 'lucide-react';
import PaddleButton from '@/components/PaddleButton';
import { PLANS } from '@/lib/plans';

export const metadata = {
  title: 'Pricing - ChatBot AI',
  description: 'Simple monthly plans for AI website chatbots. Start free, upgrade when you need more messages and chatbots.',
};

export default function PricingPage() {
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
              <Link href="/" className="flex items-center gap-2 md:gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur-lg opacity-75"></div>
                  <Bot className="relative w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <span className="text-lg md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  ChatBot AI
                </span>
              </Link>
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
        <section className="relative pt-20 md:pt-28 lg:pt-32 pb-12 md:pb-16 px-4 md:px-6">
          <div className="container mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 backdrop-blur-sm mb-6 md:mb-8">
              <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-blue-400" />
              <span className="text-xs md:text-sm text-gray-300">Simple, Transparent Pricing</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
              <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                Choose Your Plan
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-base md:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto mb-8 md:mb-12">
              Start free, upgrade when you need. No hidden fees. Cancel anytime.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-8 md:py-12 lg:py-16 px-4 md:px-6">
          <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {pricingPlans.map((plan, i) => (
                <div
                  key={i}
                  className={`relative ${plan.popular ? 'pricing-card-popular' : 'pricing-card'} p-6 md:p-8 ${
                    plan.popular ? 'scale-100 lg:scale-105' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 px-3 md:px-4 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-xs font-semibold text-white rounded-bl-lg rounded-tr-2xl">
                      MOST POPULAR
                    </div>
                  )}
                  
                  <div className="mb-6 md:mb-8">
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className="mb-3 md:mb-4">
                      <span className="text-4xl md:text-5xl font-bold text-white">${plan.price}</span>
                      {plan.price > 0 && <span className="text-sm md:text-base text-gray-400">/mo</span>}
                    </div>
                    <p className="text-sm md:text-base text-gray-400">{plan.description}</p>
                  </div>

                  <div className="mb-6 md:mb-8">
                    {plan.id === 'free' ? (
                      <Link href="/signup" className="block">
                        <button className={`w-full py-2.5 md:py-3 px-4 md:px-6 rounded-lg font-semibold text-sm md:text-base transition-all duration-300 ${
                        plan.popular
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:shadow-blue-500/50'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}>{plan.cta.text}</button>
                      </Link>
                    ) : (
                      <PaddleButton plan={plan.id} className={`w-full py-2.5 md:py-3 px-4 md:px-6 rounded-lg font-semibold text-sm md:text-base transition-all duration-300 ${
                        plan.popular
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:shadow-blue-500/50'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}>
                        {plan.cta.text}
                      </PaddleButton>
                    )}
                  </div>

                  <div className="space-y-3 md:space-y-4">
                    <p className="text-xs md:text-sm font-semibold text-gray-400 uppercase tracking-wider">
                      What's included:
                    </p>
                    <ul className="space-y-2 md:space-y-3">
                      {plan.features.map((feat, j) => (
                        <li key={j} className="flex items-start gap-2 md:gap-3 text-xs md:text-sm text-gray-300">
                          <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 md:py-16 lg:py-24 px-4 md:px-6">
          <div className="container mx-auto max-w-3xl">
            <div className="text-center mb-10 md:mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
                <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Frequently Asked Questions
                </span>
              </h2>
            </div>

            <div className="space-y-4 md:space-y-6">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className="bg-gray-800/50 backdrop-blur-xl rounded-xl md:rounded-2xl border border-white/10 p-5 md:p-6 lg:p-8"
                >
                  <h3 className="text-base md:text-lg font-semibold text-white mb-2 md:mb-3">{faq.q}</h3>
                  <p className="text-sm md:text-base text-gray-400 leading-relaxed">{faq.a}</p>
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
                Ready to Get Started?
              </h2>
              <p className="text-base md:text-lg lg:text-xl text-gray-300 mb-6 md:mb-8 text-center">
                Join thousands of businesses using AI to convert visitors 24/7
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
                <Link href="/signup" className="w-full sm:w-auto">
                  <button className="btn-primary w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 text-sm md:text-base flex items-center justify-center gap-2">
                    <span>Start Free Trial</span>
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </Link>
                <Link href="/demo" className="w-full sm:w-auto">
                  <button className="btn-secondary w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 text-sm md:text-base">
                    Try Demo
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
              <Link href="/privacy" className="hover:text-gray-300">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-gray-300">Terms of Service</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

const pricingPlans = [
  {
    id: 'free' as const,
    name: "Free",
    price: 0,
    description: "Perfect for testing",
    cta: { text: "Get Started", link: "/signup" },
    features: [
      "50 messages/mo",
      "1 chatbot",
      "Basic analytics",
      "Community support",
      "Website embedding"
    ]
  },
  {
    id: 'starter' as const,
    name: "Starter",
    price: PLANS.starter.price,
    description: "For small businesses",
    popular: true,
    cta: { text: "Subscribe", link: "/signup" },
    features: [
      "1,000 messages/mo",
      "3 chatbots",
      "Full analytics",
      "Email support",
      "Custom branding",
      "Lead collection"
    ]
  },
  {
    id: 'growth' as const,
    name: "Growth",
    price: PLANS.growth.price,
    description: "For growing teams",
    cta: { text: "Subscribe", link: "/signup" },
    features: [
      "5,000 messages/mo",
      "10 chatbots",
      "Advanced analytics",
      "Priority support",
      "API access",
      "Remove branding",
      "Team collaboration"
    ]
  },
  {
    id: 'agency' as const,
    name: "Agency",
    price: PLANS.agency.price,
    description: "For agencies & enterprises",
    cta: { text: "Subscribe", link: "/signup" },
    features: [
      "15,000 messages/mo",
      "Unlimited chatbots",
      "White-label solution",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantee",
      "Priority features"
    ]
  }
];

const faqs = [
  {
    q: "Can I change plans later?",
    a: "Yes! You can upgrade or downgrade at any time. Changes take effect immediately, and we'll prorate the difference."
  },
  {
    q: "What happens if I exceed my message limit?",
    a: "Your chatbot will pause until the next billing cycle. You can upgrade anytime to restore service immediately."
  },
  {
    q: "Do you offer refunds?",
    a: "Yes, we offer a 7-day money-back guarantee on your first payment (see our Terms of Service). If you're not satisfied, contact us for a full refund."
  },
  {
    q: "Is there a free trial?",
    a: "Yes! The Free plan lets you build and test a chatbot on your own website with 50 messages per month. No credit card required."
  },
  {
    q: "Can I cancel anytime?",
    a: "Absolutely. You can cancel your subscription at any time from your dashboard. No questions asked."
  }
];
