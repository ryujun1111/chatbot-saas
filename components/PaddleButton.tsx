"use client";

import { trackSelectPlan } from '@/components/GoogleAnalytics';

declare global {
  interface Window {
    Paddle?: any;
  }
}

interface PaddleButtonProps {
  priceId: string;
  children: React.ReactNode;
  className?: string;
  planName?: string;
  planValue?: number;
}

export default function PaddleButton({ 
  priceId, 
  children, 
  className,
  planName = 'Unknown',
  planValue = 0
}: PaddleButtonProps) {
  const handleClick = () => {
    // Google Analytics 이벤트 추적
    trackSelectPlan(planName, planValue);

    if (typeof window !== 'undefined' && window.Paddle) {
      window.Paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customData: {
          plan: planName
        },
        successCallback: () => {
          // 결제 성공 시
          if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'purchase', {
              transaction_id: Date.now().toString(),
              value: planValue,
              currency: 'USD',
              items: [{
                item_name: planName,
                item_category: 'subscription',
                price: planValue,
                quantity: 1
              }]
            });
          }
        }
      });
    } else {
      alert('Payment system is loading. Please try again in a moment.');
    }
  };

  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
