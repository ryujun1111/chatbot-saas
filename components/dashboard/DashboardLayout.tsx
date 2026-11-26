'use client';

import { useState, ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface DashboardLayoutProps {
  children: ReactNode;
  userEmail: string;
}

export default function DashboardLayout({ children, userEmail }: DashboardLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64">
        {/* Header */}
        <Header 
          onMobileMenuToggle={() => setIsMobileSidebarOpen(true)}
          userEmail={userEmail}
        />

        {/* Page Content */}
        <main className="pt-16 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
