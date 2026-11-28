export const metadata = {
  title: 'Terms of Service - ChatBot AI',
  description: 'Terms for using ChatBot AI, including subscriptions, acceptable use and our refund policy.',
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 mb-8">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing or using ChatBot AI SaaS ("the Service"), you agree to be bound by these Terms of Service.
            If you do not agree, do not use the Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Service Description</h2>
          <p>
            ChatBot AI SaaS provides an AI-powered chatbot platform that allows you to:
          </p>
          <ul>
            <li>Create custom chatbots for your website</li>
            <li>Train chatbots with your own content (documents, URLs)</li>
            <li>Embed chatbots on external websites via widget</li>
            <li>Manage chatbot responses and analytics</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
          <p>You agree to:</p>
          <ul>
            <li>Provide accurate account information</li>
            <li>Keep your password secure</li>
            <li>Not share your account with others</li>
            <li>Not use the Service for illegal or harmful purposes</li>
            <li>Not attempt to bypass rate limits or security measures</li>
            <li>Not upload copyrighted content without permission</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Subscription Plans & Billing</h2>
          <ul>
            <li><strong>Free Plan:</strong> 50 messages/month, no credit card required</li>
            <li><strong>Starter Plan:</strong> $19/month, 1,000 messages/month</li>
            <li><strong>Growth Plan:</strong> $49/month, 5,000 messages/month</li>
            <li><strong>Agency Plan:</strong> $99/month, 15,000 messages/month</li>
          </ul>
          <p className="mt-4">
            Subscriptions renew automatically. You can cancel anytime from your account settings.
            Payments are processed securely by Paddle.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Rate Limits & Fair Use</h2>
          <p>To ensure service quality for all users:</p>
          <ul>
            <li>Session limit: 50 messages per 24 hours (widget users)</li>
            <li>IP limit: 100 messages per hour</li>
            <li>Monthly message limits based on your plan</li>
            <li>Exceeding limits may result in temporary service suspension</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Refund Policy</h2>
          <ul>
            <li><strong>7-day money-back guarantee:</strong> Full refund if requested within 7 days of first payment</li>
            <li><strong>Pro-rated refunds:</strong> Not available for partial months</li>
            <li><strong>Cancellation:</strong> Downgrade to Free plan at end of billing period</li>
            <li><strong>Refund process:</strong> Contact support@chatbot-saas.com with your account email</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Service Availability</h2>
          <p>
            We strive for 99.9% uptime but do not guarantee uninterrupted service. 
            Scheduled maintenance will be announced in advance when possible.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Intellectual Property</h2>
          <ul>
            <li>You retain ownership of your content (documents, chat data)</li>
            <li>We retain ownership of the Service platform and code</li>
            <li>You grant us license to process your content to provide the Service</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Termination</h2>
          <p>We may terminate or suspend your account if you:</p>
          <ul>
            <li>Violate these Terms</li>
            <li>Engage in abusive or fraudulent behavior</li>
            <li>Fail to pay subscription fees</li>
          </ul>
          <p className="mt-4">
            You may delete your account at any time. Upon deletion, all your data will be permanently removed within 30 days.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Limitation of Liability</h2>
          <p>
            THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES. 
            WE ARE NOT LIABLE FOR ANY INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES.
            OUR TOTAL LIABILITY IS LIMITED TO THE AMOUNT YOU PAID IN THE LAST 12 MONTHS.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. Changes to Terms</h2>
          <p>
            We may update these Terms from time to time. Continued use of the Service after changes 
            constitutes acceptance of the new Terms. We will notify you of significant changes via email.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">12. Contact</h2>
          <p>
            For questions about these Terms, contact:{' '}
            <a href="mailto:support@chatbot-saas.com" className="text-blue-600 hover:underline">
              support@chatbot-saas.com
            </a>
          </p>
        </section>
      </div>
    </div>
    </div>
  );
}
