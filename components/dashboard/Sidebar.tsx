'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, 
  MessageSquare, 
  FileText, 
  BarChart3, 
  Settings, 
  Menu,
  X,
  Bot
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

const menuItems = [
  { icon: Home, label: '홈', href: '/dashboard' },
  { icon: MessageSquare, label: '챗봇', href: '/dashboard/chatbots' },
  { icon: FileText, label: '문서', href: '/dashboard/documents' },
  { icon: BarChart3, label: '통계', href: '/dashboard/analytics' },
  { icon: Settings, label: '설정', href: '/dashboard/settings' },
];

export default function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full bg-white border-r border-gray-200 
          transition-transform duration-300 ease-in-out
          w-64 lg:translate-x-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              ChatBot SaaS
            </span>
          </Link>
          <button
            onClick={onMobileClose}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg font-medium
                  transition-all duration-200
                  ${isActive 
                    ? 'bg-blue-50 text-blue-600 shadow-sm' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
            <p className="text-xs font-semibold text-blue-900 mb-1">
              💡 프로 플랜 업그레이드
            </p>
            <p className="text-xs text-blue-700 mb-3">
              무제한 챗봇과 더 많은 기능을 사용하세요
            </p>
            <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all">
              업그레이드
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
