import { redirect } from 'next/navigation';

export default function DemoPage() {
  // Redirect to /try page
  redirect('/try');
}
