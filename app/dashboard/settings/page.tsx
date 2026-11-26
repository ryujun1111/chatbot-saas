'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, signOut } from '@/lib/auth';

type TabType = 'profile' | 'account' | 'billing' | 'api-keys';

interface UserSettings {
  name: string;
  email: string;
  currentPlan: 'free' | 'starter' | 'pro' | 'enterprise';
  apiKeys: Array<{
    id: string;
    name: string;
    key: string;
    createdAt: string;
  }>;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [userEmail, setUserEmail] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<UserSettings>({
    name: '',
    email: '',
    currentPlan: 'free',
    apiKeys: []
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [newApiKey, setNewApiKey] = useState({
    name: '',
    visible: false
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const user = getCurrentUser();
    
    if (!user) {
      router.push('/login');
      return;
    }
    
    setUserEmail(user.email);
    loadSettings(user.email);
    setLoading(false);
  };

  const loadSettings = (email: string) => {
    // Load from localStorage
    const savedSettings = localStorage.getItem(`settings_${email}`);
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(parsed);
      setProfileForm({
        name: parsed.name || '',
        email: parsed.email || email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } else {
      // Initialize default settings
      const defaultSettings: UserSettings = {
        name: email.split('@')[0],
        email: email,
        currentPlan: 'free',
        apiKeys: []
      };
      setSettings(defaultSettings);
      setProfileForm({
        name: defaultSettings.name,
        email: email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedSettings = {
        ...settings,
        name: profileForm.name,
        email: profileForm.email
      };
      
      localStorage.setItem(`settings_${userEmail}`, JSON.stringify(updatedSettings));
      setSettings(updatedSettings);
      
      showSuccessMessage('Settings saved successfully!');
    } catch (error) {
      alert('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const changePassword = async () => {
    if (!profileForm.currentPassword || !profileForm.newPassword) {
      alert('Please fill all password fields');
      return;
    }

    if (profileForm.newPassword !== profileForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (profileForm.newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update password in localStorage
      const usersJson = localStorage.getItem('chatbot_saas_users');
      if (usersJson) {
        const users = JSON.parse(usersJson);
        const userIndex = users.findIndex((u: any) => u.email === userEmail);
        if (userIndex !== -1) {
          if (users[userIndex].password !== profileForm.currentPassword) {
            alert('Current password is incorrect');
            setIsSaving(false);
            return;
          }
          users[userIndex].password = profileForm.newPassword;
          localStorage.setItem('chatbot_saas_users', JSON.stringify(users));
        }
      }
      
      setProfileForm({
        ...profileForm,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      showSuccessMessage('Password changed successfully!');
    } catch (error) {
      alert('Failed to change password');
    } finally {
      setIsSaving(false);
    }
  };

  const generateApiKey = async () => {
    if (!newApiKey.name.trim()) {
      alert('Please enter a name for the API key');
      return;
    }

    const key = 'sk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    const updatedSettings = {
      ...settings,
      apiKeys: [
        ...settings.apiKeys,
        {
          id: Date.now().toString(),
          name: newApiKey.name,
          key: key,
          createdAt: new Date().toISOString()
        }
      ]
    };
    
    localStorage.setItem(`settings_${userEmail}`, JSON.stringify(updatedSettings));
    setSettings(updatedSettings);
    setNewApiKey({ name: '', visible: false });
    
    showSuccessMessage('API key generated successfully!');
  };

  const deleteApiKey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) {
      return;
    }

    const updatedSettings = {
      ...settings,
      apiKeys: settings.apiKeys.filter(k => k.id !== id)
    };
    
    localStorage.setItem(`settings_${userEmail}`, JSON.stringify(updatedSettings));
    setSettings(updatedSettings);
    
    showSuccessMessage('API key deleted successfully!');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccessMessage('Copied to clipboard!');
  };

  const deleteAccount = async () => {
    setShowDeleteModal(false);
    
    // Remove user data
    localStorage.removeItem(`settings_${userEmail}`);
    
    // Remove user from users list
    const usersJson = localStorage.getItem('chatbot_saas_users');
    if (usersJson) {
      const users = JSON.parse(usersJson);
      const updatedUsers = users.filter((u: any) => u.email !== userEmail);
      localStorage.setItem('chatbot_saas_users', JSON.stringify(updatedUsers));
    }
    
    // Sign out
    signOut();
    router.push('/');
  };

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleLogout = () => {
    signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700 font-medium">{userEmail}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          ✓ {successMessage}
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'account'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Account
              </button>
              <button
                onClick={() => setActiveTab('billing')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'billing'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Billing
              </button>
              <button
                onClick={() => setActiveTab('api-keys')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'api-keys'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                API Keys
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="max-w-2xl">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={saveSettings}
                      disabled={isSaving}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>

                  <hr className="my-8" />

                  <h3 className="text-lg font-bold text-gray-900 mb-4">Change Password</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={profileForm.currentPassword}
                      onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Current password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={profileForm.newPassword}
                      onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="New password (min 6 characters)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={profileForm.confirmPassword}
                      onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Confirm new password"
                    />
                  </div>

                  <div>
                    <button
                      onClick={changePassword}
                      disabled={isSaving}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                    >
                      {isSaving ? 'Changing...' : 'Change Password'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="max-w-2xl">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Account Settings</h2>
                
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-blue-900 mb-2">Current Plan</h3>
                    <p className="text-3xl font-bold text-blue-600 mb-2 capitalize">{settings.currentPlan}</p>
                    <p className="text-sm text-blue-700 mb-4">
                      {settings.currentPlan === 'free' && 'Up to 5 chatbots, 1,000 messages/month'}
                      {settings.currentPlan === 'starter' && 'Up to 10 chatbots, 5,000 messages/month'}
                      {settings.currentPlan === 'pro' && 'Up to 50 chatbots, 25,000 messages/month'}
                      {settings.currentPlan === 'enterprise' && 'Unlimited chatbots and messages'}
                    </p>
                    {settings.currentPlan !== 'enterprise' && (
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
                        Upgrade Plan
                      </button>
                    )}
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Usage This Month</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700">Chatbots</span>
                          <span className="font-semibold">0 / {settings.currentPlan === 'free' ? '5' : settings.currentPlan === 'starter' ? '10' : settings.currentPlan === 'pro' ? '50' : '∞'}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700">Messages</span>
                          <span className="font-semibold">0 / {settings.currentPlan === 'free' ? '1,000' : settings.currentPlan === 'starter' ? '5,000' : settings.currentPlan === 'pro' ? '25,000' : '∞'}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <hr className="my-8" />

                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-red-900 mb-2">Delete Account</h3>
                    <p className="text-sm text-red-700 mb-4">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <div className="max-w-2xl">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Billing & Payments</h2>
                
                <div className="space-y-6">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Method</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Payments are processed securely through Paddle
                    </p>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
                      Add Payment Method
                    </button>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg">
                    <div className="p-6 border-b border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900">Payment History</h3>
                    </div>
                    <div className="p-6">
                      <div className="text-center py-8 text-gray-500">
                        No payment history yet
                      </div>
                    </div>
                  </div>

                  {settings.currentPlan !== 'free' && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                      <h3 className="text-lg font-bold text-orange-900 mb-2">Cancel Subscription</h3>
                      <p className="text-sm text-orange-700 mb-4">
                        Cancel your subscription and downgrade to the free plan at the end of your billing period.
                      </p>
                      <button className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-700 transition-colors">
                        Cancel Subscription
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* API Keys Tab */}
            {activeTab === 'api-keys' && (
              <div className="max-w-2xl">
                <h2 className="text-xl font-bold text-gray-900 mb-6">API Keys</h2>
                
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-blue-900 mb-2">Create New API Key</h3>
                    <p className="text-sm text-blue-700 mb-4">
                      Generate an API key to use our chatbot API in your applications
                    </p>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={newApiKey.name}
                        onChange={(e) => setNewApiKey({ ...newApiKey, name: e.target.value })}
                        className="flex-1 px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="API key name (e.g., Production, Development)"
                      />
                      <button
                        onClick={generateApiKey}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap"
                      >
                        Generate Key
                      </button>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg">
                    <div className="p-6 border-b border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900">Your API Keys</h3>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {settings.apiKeys.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                          No API keys yet. Create one to get started.
                        </div>
                      ) : (
                        settings.apiKeys.map((apiKey) => (
                          <div key={apiKey.id} className="p-6">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-semibold text-gray-900">{apiKey.name}</h4>
                                <p className="text-xs text-gray-500 mt-1">
                                  Created {new Date(apiKey.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <button
                                onClick={() => deleteApiKey(apiKey.id)}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                              >
                                Delete
                              </button>
                            </div>
                            <div className="flex gap-2 mt-3">
                              <code className="flex-1 bg-gray-100 px-4 py-2 rounded text-sm font-mono text-gray-800 overflow-x-auto">
                                {apiKey.key}
                              </code>
                              <button
                                onClick={() => copyToClipboard(apiKey.key)}
                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors text-sm font-medium whitespace-nowrap"
                              >
                                Copy
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-yellow-900 mb-2">⚠️ Security Notice</h3>
                    <p className="text-sm text-yellow-700">
                      Keep your API keys secure and never share them publicly. If you believe a key has been compromised, delete it immediately and generate a new one.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Account?</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete your account? This action is permanent and cannot be undone. All your chatbots, data, and settings will be lost.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deleteAccount}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
