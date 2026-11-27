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

      <div style={{ minHeight: '100vh' }}>
        {/* Navigation */}
        <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50 }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', borderRadius: '8px', filter: 'blur(16px)', opacity: 0.75 }}></div>
                <Bot style={{ position: 'relative', width: '32px', height: '32px', color: 'white' }} />
              </div>
              <span style={{ fontSize: '24px', fontWeight: 'bold', background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                ChatBot AI
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Link href="/login" className="btn-secondary">
                Log In
              </Link>
              <Link href="/signup" className="btn-primary">
                Get Started Free →
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section style={{ position: 'relative', paddingTop: '128px', paddingBottom: '80px', paddingLeft: '24px', paddingRight: '24px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center' }}>
              {/* Badge */}
              <div className="badge" style={{ marginBottom: '32px' }}>
                <Sparkles style={{ width: '16px', height: '16px', color: '#60a5fa' }} />
                <span>Powered by DeepSeek R1 • 90.8% MMLU Score</span>
              </div>

              {/* Main Heading */}
              <h1 className="hero-title" style={{ marginBottom: '16px' }}>
                Build AI Chatbots
              </h1>
              <h1 className="hero-title-gradient" style={{ marginBottom: '32px' }}>
                That Actually Convert
              </h1>

              {/* Subheading */}
              <p style={{ fontSize: '20px', color: '#9ca3af', maxWidth: '800px', margin: '0 auto 48px', lineHeight: 1.6 }}>
                Same GPT-4 intelligence, 98% lower cost. Deploy in 2 minutes. 
                Start converting visitors today.
              </p>

              {/* CTA Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', marginBottom: '48px' }}>
                <Link href="/demo">
                  <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Rocket style={{ width: '20px', height: '20px' }} />
                    Try It Free - No Signup
                    <ArrowRight style={{ width: '20px', height: '20px' }} />
                  </button>
                </Link>
                <Link href="/pricing">
                  <button className="btn-secondary">
                    See Pricing
                  </button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'center', fontSize: '14px', color: '#6b7280' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check style={{ width: '16px', height: '16px', color: '#10b981' }} />
                  <span>No credit card required</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check style={{ width: '16px', height: '16px', color: '#10b981' }} />
                  <span>5 free messages</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check style={{ width: '16px', height: '16px', color: '#10b981' }} />
                  <span>Setup in 2 minutes</span>
                </div>
              </div>
            </div>

            {/* Dashboard Preview */}
            <div style={{ position: 'relative', marginTop: '64px' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))', filter: 'blur(60px)' }}></div>
              <div style={{ position: 'relative', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(31,41,55,0.5), rgba(17,24,39,0.5))', padding: '32px', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                  {/* Stat Card 1 */}
                  <div className="stat-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <TrendingUp style={{ width: '20px', height: '20px', color: '#60a5fa' }} />
                      <span style={{ fontSize: '14px', color: '#9ca3af' }}>Total Conversations</span>
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'white' }}>↗+23%</div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>this week</div>
                  </div>

                  {/* Stat Card 2 */}
                  <div className="stat-card stat-card-purple">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <Users style={{ width: '20px', height: '20px', color: '#a78bfa' }} />
                      <span style={{ fontSize: '14px', color: '#9ca3af' }}>Customer Satisfaction</span>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} style={{ width: '20px', height: '20px', fill: '#fbbf24', color: '#fbbf24' }} />
                      ))}
                    </div>
                  </div>

                  {/* Stat Card 3 */}
                  <div className="stat-card stat-card-green">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <Zap style={{ width: '20px', height: '20px', color: '#10b981' }} />
                      <span style={{ fontSize: '14px', color: '#9ca3af' }}>Total AI Cost</span>
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>vs $450/mo</div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>Chatbase</div>
                  </div>
                </div>

                {/* Chat Demo */}
                <div style={{ padding: '24px', borderRadius: '16px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <MessageSquare style={{ width: '20px', height: '20px', color: '#60a5fa' }} />
                    <span style={{ fontSize: '14px', color: '#9ca3af' }}>AI</span>
                    <span style={{ fontSize: '12px', color: '#4b5563' }}>•</span>
                    <span style={{ fontSize: '12px', color: '#4b5563' }}>Just now</span>
                  </div>
                  <p style={{ color: 'white', lineHeight: 1.6 }}>
                    Hi! How can I help you today?
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section style={{ padding: '48px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <p style={{ textAlign: 'center', fontSize: '14px', color: '#6b7280', marginBottom: '32px' }}>TRUSTED BY FORWARD-THINKING COMPANIES</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '48px', justifyContent: 'center', color: '#4b5563' }}>
              <span style={{ fontSize: '24px', fontWeight: 600 }}>Company</span>
              <span style={{ fontSize: '24px', fontWeight: 600 }}>Startup</span>
              <span style={{ fontSize: '24px', fontWeight: 600 }}>Agency</span>
              <span style={{ fontSize: '24px', fontWeight: 600 }}>SaaS</span>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section style={{ padding: '96px 24px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <h2 className="hero-title" style={{ fontSize: '48px', marginBottom: '24px' }}>
                Everything You Need
              </h2>
              <p style={{ fontSize: '20px', color: '#9ca3af' }}>
                Enterprise features without the enterprise price tag
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
              {features.map((feature, i) => (
                <div key={i} className="feature-card">
                  <feature.icon style={{ width: '48px', height: '48px', marginBottom: '16px', color: '#60a5fa' }} />
                  <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'white', marginBottom: '12px' }}>{feature.title}</h3>
                  <p style={{ color: '#9ca3af', lineHeight: 1.6 }}>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section style={{ padding: '96px 24px', background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.5))' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <h2 className="hero-title" style={{ fontSize: '48px', marginBottom: '24px' }}>
                Simple, Transparent Pricing
              </h2>
              <p style={{ fontSize: '20px', color: '#9ca3af' }}>
                Pay for what you use. Cancel anytime.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px' }}>
              {pricingPlans.map((plan, i) => (
                <div key={i} className={plan.popular ? 'pricing-card pricing-card-popular' : 'pricing-card'}>
                  {plan.popular && (
                    <div style={{ position: 'absolute', top: 0, right: 0, padding: '4px 16px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', fontSize: '12px', fontWeight: 600, color: 'white', borderBottomLeftRadius: '8px', borderTopRightRadius: '24px' }}>
                      MOST POPULAR
                    </div>
                  )}
                  <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>{plan.name}</h3>
                  <div style={{ marginBottom: '16px' }}>
                    <span style={{ fontSize: '48px', fontWeight: 'bold', color: 'white' }}>${plan.price}</span>
                    {plan.price > 0 && <span style={{ color: '#9ca3af' }}>/mo</span>}
                  </div>
                  <p style={{ color: '#9ca3af', marginBottom: '24px' }}>{plan.description}</p>
                  <Link href={plan.cta.link}>
                    <button className={plan.popular ? 'btn-primary' : 'btn-secondary'} style={{ width: '100%' }}>
                      {plan.cta.text}
                    </button>
                  </Link>
                  <ul style={{ marginTop: '24px', listStyle: 'none' }}>
                    {plan.features.map((feat, j) => (
                      <li key={j} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#d1d5db', marginBottom: '12px' }}>
                        <CheckCircle style={{ width: '16px', height: '16px', color: '#10b981', flexShrink: 0 }} />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section style={{ padding: '96px 24px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div className="cta-section">
              <h2 style={{ fontSize: '48px', fontWeight: 'bold', color: 'white', marginBottom: '24px', textAlign: 'center' }}>
                Ready to Convert More Visitors?
              </h2>
              <p style={{ fontSize: '20px', color: '#d1d5db', marginBottom: '32px', textAlign: 'center' }}>
                Join thousands of businesses using AI to sell 24/7
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
                <Link href="/signup">
                  <button className="btn-primary">
                    Start Free Trial
                  </button>
                </Link>
                <Link href="/demo">
                  <button className="btn-secondary">
                    Watch Demo
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ padding: '48px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center', color: '#6b7280' }}>
            <p>© 2024 ChatBot AI. All rights reserved.</p>
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
