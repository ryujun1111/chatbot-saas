export const metadata = {
  title: 'Privacy Policy - ChatBot AI',
  description: "How ChatBot AI collects, uses and protects your data and your website visitors' chat messages.",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 mb-8">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
          <p>We collect the following information:</p>
          <ul>
            <li>Account information (email address, name)</li>
            <li>Chatbot content (documents, URLs, chat messages)</li>
            <li>Usage data (API calls, message counts)</li>
            <li>Payment information (processed by Paddle, not stored by us)</li>
            <li>Technical data (IP address for rate limiting, session IDs)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
          <ul>
            <li>Provide and improve our AI chatbot service</li>
            <li>Process payments and manage subscriptions</li>
            <li>Prevent abuse and enforce rate limits</li>
            <li>Send service-related emails (subscription, usage alerts)</li>
            <li>Analyze usage patterns to improve our service</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Data Storage & Security</h2>
          <p>
            Your data is stored securely using Supabase (PostgreSQL) with encryption at rest and in transit.
            We implement industry-standard security measures including:
          </p>
          <ul>
            <li>Row-level security (RLS) for database access control</li>
            <li>Rate limiting to prevent abuse</li>
            <li>XSS protection in widget integration</li>
            <li>Webhook signature verification</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul>
            <li><strong>OpenAI:</strong> AI models for generating chatbot responses and search embeddings</li>
            <li><strong>Supabase:</strong> Database and authentication</li>
            <li><strong>Paddle:</strong> Payment processing</li>
            <li><strong>Vercel:</strong> Hosting and deployment</li>
            <li><strong>Google Analytics:</strong> Usage analytics (optional)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Data Retention</h2>
          <ul>
            <li>Account data: Retained while your account is active</li>
            <li>Chatbot content: Deleted when you delete your account</li>
            <li>Rate limit logs: Auto-deleted after 7 days</li>
            <li>Webhook events: Retained for audit purposes</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Request data correction or deletion</li>
            <li>Export your chatbot content</li>
            <li>Opt out of marketing emails</li>
            <li>Delete your account at any time</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Contact</h2>
          <p>
            For privacy-related questions, contact us at:{' '}
            <a href="mailto:privacy@chatbot-saas.com" className="text-blue-600 hover:underline">
              privacy@chatbot-saas.com
            </a>
          </p>
        </section>
      </div>
    </div>
    </div>
  );
}
