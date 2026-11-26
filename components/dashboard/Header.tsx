'use client';

import { useState, useRef, useEffect } from 'react';
import { Menu, Bell, Search, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { signOut } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  onMobileMenuToggle: () => void;
  userEmail: string;
}

export default function Header({ onMobileMenuToggle, userEmail }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    signOut();
    router.push('/');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-0 lg:left-64 z-30">
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left Side */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Search Bar (Optional) */}
          <div className="hidden md:flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg w-80">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="검색..."
              className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 w-full"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Notifications (Optional) */}
          <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-gray-900">
                  {userEmail.split('@')[0]}
                </p>
                <p className="text-xs text-gray-500">
                  {userEmail}
                </p>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">{userEmail.split('@')[0]}</p>
                  <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                </div>
                
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    router.push('/dashboard/settings');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>프로필</span>
                </button>
                
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    router.push('/dashboard/settings');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>설정</span>
                </button>
                
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>로그아웃</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
