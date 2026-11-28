// Page metadata (client pages can't export it themselves)
export const metadata = {
  title: 'Dashboard - ChatBot AI',
  description: 'Manage your AI chatbots, knowledge base and analytics.',
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
