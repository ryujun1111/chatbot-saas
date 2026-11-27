"use client";

import { useEffect } from 'react';

declare global {
  interface Window {
    Paddle?: any;
  }
}

interface PaddleButtonProps {
  priceId: string;
  children: React.ReactNode;
  className?: string;
}

export default function PaddleButton({ priceId, children, className }: PaddleButtonProps) {
  const handleClick = () => {
    if (typeof window !== 'undefined' && window.Paddle) {
      window.Paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }]
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
