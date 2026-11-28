"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PaddleButton from "@/components/PaddleButton";
import { PLANS } from "@/lib/plans";

type TabType = "profile" | "account" | "billing";

interface AccountInfo {
  email: string;
  name: string;
  plan: string;
  planName: string;
  subscriptionStatus: string;
  hasSubscription: boolean;
  usage: {
    messagesUsed: number;
    messageLimit: number;
    chatbots: number;
    chatbotLimit: number | null;
    resetsAt: string | null;
  };
}

const PAID_PLANS = ["starter", "growth", "agency"] as const;

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [name, setName] = useState("");
  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  const showNotice = (type: "success" | "error", text: string) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 4000);
  };

  const loadAccount = async () => {
    const res = await fetch("/api/settings");
    if (res.status === 401)
      return router.replace("/login?next=/dashboard/settings");
    const data = await res.json();
    setAccount(data);
    setName(data.name);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab === "billing" || tab === "account") setActiveTab(tab);
    if (params.get("checkout") === "success") {
      showNotice(
        "success",
        "Payment received! Your plan will update in a few seconds.",
      );
      setTimeout(loadAccount, 5000); // webhook usually lands within seconds
    }
    loadAccount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Name lives in Supabase Auth user metadata
  const saveProfile = async () => {
    setIsSaving(true);
    const { error } = await createClient().auth.updateUser({
      data: { full_name: name.trim() },
    });
    setIsSaving(false);
    if (error) showNotice("error", error.message);
    else showNotice("success", "Profile saved");
  };

  // Re-verify the current password, then set the new one
  const changePassword = async () => {
    if (!passwords.current || !passwords.next)
      return showNotice("error", "Please fill in all password fields");
    if (passwords.next !== passwords.confirm)
      return showNotice("error", "New passwords do not match");
    if (passwords.next.length < 8)
      return showNotice("error", "Password must be at least 8 characters");

    setIsSaving(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: account!.email,
      password: passwords.current,
    });
    if (authError) {
      setIsSaving(false);
      return showNotice("error", "Current password is incorrect");
    }
    const { error } = await supabase.auth.updateUser({
      password: passwords.next,
    });
    setIsSaving(false);
    if (error) return showNotice("error", error.message);
    setPasswords({ current: "", next: "", confirm: "" });
    showNotice("success", "Password changed");
  };

  const openBillingPortal = async () => {
    setIsSaving(true);
    const res = await fetch("/api/paddle/portal", { method: "POST" });
    const data = await res.json();
    setIsSaving(false);
    if (res.ok && data.url) window.location.href = data.url;
    else showNotice("error", data.error || "Billing portal is unavailable");
  };

  const deleteAccount = async () => {
    const res = await fetch("/api/settings", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: deletePassword }),
    });
    const data = await res.json();
    if (!res.ok)
      return showNotice("error", data.error || "Failed to delete account");
    setShowDeleteModal(false);
    // The user no longer exists server-side, so only clear the local session
    await createClient().auth.signOut({ scope: "local" });
    router.replace("/");
  };

  const handleLogout = async () => {
    await createClient().auth.signOut();
    router.replace("/login");
    router.refresh();
  };

  if (!account) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const pct = (used: number, limit: number | null) =>
    limit ? Math.min(100, (used / limit) * 100) : 0;
  const inputClass =
    "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900";
  const tabClass = (tab: TabType) =>
    `px-4 md:px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
      activeTab === tab
        ? "border-blue-500 text-blue-600"
        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
    }`;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap gap-3 justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-sm text-gray-700 font-medium">
              {account.email}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {notice && (
        <div
          role="status"
          className={`fixed top-4 right-4 left-4 sm:left-auto ${notice.type === "success" ? "bg-green-500" : "bg-red-500"} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in`}
        >
          {notice.type === "success" ? "✓ " : ""}
          {notice.text}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Tabs (div, not <nav>, to avoid the global dark nav style) */}
          <div className="border-b border-gray-200">
            <div className="flex -mb-px overflow-x-auto" role="tablist">
              <button
                onClick={() => setActiveTab("profile")}
                className={tabClass("profile")}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab("account")}
                className={tabClass("account")}
              >
                Plan &amp; Usage
              </button>
              <button
                onClick={() => setActiveTab("billing")}
                className={tabClass("billing")}
              >
                Billing
              </button>
            </div>
          </div>

          <div className="p-5 md:p-8">
            {/* Profile */}
            {activeTab === "profile" && (
              <div className="max-w-2xl">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Profile Settings
                </h2>
                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={inputClass}
                      placeholder="Your name"
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={account.email}
                      disabled
                      className={`${inputClass} bg-gray-100 text-gray-500`}
                    />
                  </div>
                  <div className="pt-4">
                    <button
                      onClick={saveProfile}
                      disabled={isSaving}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>

                  <hr className="my-8" />
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Change Password
                  </h3>
                  <div>
                    <label
                      htmlFor="current-password"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Current Password
                    </label>
                    <input
                      id="current-password"
                      type="password"
                      autoComplete="current-password"
                      value={passwords.current}
                      onChange={(e) =>
                        setPasswords({ ...passwords, current: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="new-password"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      New Password
                    </label>
                    <input
                      id="new-password"
                      type="password"
                      autoComplete="new-password"
                      value={passwords.next}
                      onChange={(e) =>
                        setPasswords({ ...passwords, next: e.target.value })
                      }
                      className={inputClass}
                      placeholder="At least 8 characters"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="confirm-password"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Confirm New Password
                    </label>
                    <input
                      id="confirm-password"
                      type="password"
                      autoComplete="new-password"
                      value={passwords.confirm}
                      onChange={(e) =>
                        setPasswords({ ...passwords, confirm: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <button
                      onClick={changePassword}
                      disabled={isSaving}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                    >
                      {isSaving ? "Changing..." : "Change Password"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Plan & usage */}
            {activeTab === "account" && (
              <div className="max-w-2xl">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Plan &amp; Usage
                </h2>
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-blue-900 mb-2">
                      Current Plan
                    </h3>
                    <p className="text-3xl font-bold text-blue-600 mb-2">
                      {account.planName}
                    </p>
                    <p className="text-sm text-blue-700 mb-4">
                      {account.usage.messageLimit.toLocaleString()}{" "}
                      messages/month ·{" "}
                      {account.usage.chatbotLimit === null
                        ? "Unlimited chatbots"
                        : `${account.usage.chatbotLimit} chatbot${account.usage.chatbotLimit === 1 ? "" : "s"}`}
                      {account.subscriptionStatus === "past_due" &&
                        " · Payment overdue — please update your card in Billing"}
                    </p>
                    {account.plan !== "agency" && (
                      <button
                        onClick={() => setActiveTab("billing")}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                      >
                        Upgrade Plan
                      </button>
                    )}
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Usage This Month
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700">Chatbots</span>
                          <span className="font-semibold">
                            {account.usage.chatbots} /{" "}
                            {account.usage.chatbotLimit ?? "∞"}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${pct(account.usage.chatbots, account.usage.chatbotLimit)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700">Messages</span>
                          <span className="font-semibold">
                            {account.usage.messagesUsed.toLocaleString()} /{" "}
                            {account.usage.messageLimit.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${pct(account.usage.messagesUsed, account.usage.messageLimit)}%`,
                            }}
                          ></div>
                        </div>
                        {account.usage.resetsAt && (
                          <p className="mt-2 text-xs text-gray-500">
                            Resets on{" "}
                            {new Date(
                              account.usage.resetsAt,
                            ).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <hr className="my-8" />
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-red-900 mb-2">
                      Delete Account
                    </h3>
                    <p className="text-sm text-red-700 mb-4">
                      Permanently delete your account, chatbots, knowledge base
                      and conversation history. This cannot be undone.
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

            {/* Billing */}
            {activeTab === "billing" && (
              <div className="max-w-3xl">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Billing &amp; Payments
                </h2>
                <div className="space-y-6">
                  {account.hasSubscription && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Your Subscription
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {account.planName} plan · status:{" "}
                        {account.subscriptionStatus.replace("_", " ")}. Update
                        your payment method, download invoices or cancel in the
                        secure Paddle billing portal.
                      </p>
                      <button
                        onClick={openBillingPortal}
                        disabled={isSaving}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                      >
                        {isSaving ? "Opening..." : "Manage Billing"}
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {PAID_PLANS.map((id) => {
                      const p = PLANS[id];
                      const current = account.plan === id;
                      return (
                        <div
                          key={id}
                          className={`border rounded-lg p-5 ${current ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
                        >
                          <h4 className="font-bold text-gray-900">{p.name}</h4>
                          <p className="text-2xl font-bold text-gray-900 my-2">
                            ${p.price}
                            <span className="text-sm text-gray-500">/mo</span>
                          </p>
                          <p className="text-sm text-gray-600 mb-4">
                            {p.messages.toLocaleString()} messages/mo
                            <br />
                            {Number.isFinite(p.chatbots)
                              ? `${p.chatbots} chatbots`
                              : "Unlimited chatbots"}
                          </p>
                          {current ? (
                            <p className="text-sm font-semibold text-blue-600">
                              Current plan
                            </p>
                          ) : account.hasSubscription ? (
                            <p className="text-xs text-gray-500">
                              To switch plans, cancel in Manage Billing, then
                              subscribe to the new plan.
                            </p>
                          ) : (
                            <PaddleButton
                              plan={id}
                              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                            >
                              Subscribe
                            </PaddleButton>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-500">
                    Payments are processed securely by Paddle, our merchant of
                    record. Prices in USD; taxes may apply.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Delete Account?
            </h3>
            <p className="text-gray-700 mb-6">
              This permanently deletes your account, all chatbots, knowledge and
              conversation history. This cannot be undone.
            </p>
            <label htmlFor="delete-password" className="block text-sm font-medium text-gray-700 mb-2">
              Enter your password to confirm
            </label>
            <input
              id="delete-password"
              type="password"
              autoComplete="current-password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className="w-full px-4 py-2 mb-6 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deleteAccount}
                disabled={!deletePassword}
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
