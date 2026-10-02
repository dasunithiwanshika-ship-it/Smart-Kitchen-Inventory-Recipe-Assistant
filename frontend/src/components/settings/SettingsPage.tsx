import React, { useState } from 'react';
import { Settings, Bell, Shield, Server, CheckCircle2, User, Save, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const SettingsPage: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [notificationsEnabled, setNotificationsEnabled] = useState(user?.notifications_enabled ?? true);
  const [daysBeforeExpiry, setDaysBeforeExpiry] = useState(user?.notification_days_before_expiry || 3);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const updated = await api.updateProfile({
        full_name: fullName,
        notifications_enabled: notificationsEnabled,
        notification_days_before_expiry: Number(daysBeforeExpiry),
      });
      updateUser(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update settings', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-800 flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-slate-800 text-slate-200 border border-slate-700">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Kitchen Settings</h2>
          <p className="text-xs text-slate-400">Configure notification alerts, profile, and system settings</p>
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
        {saveSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Settings saved successfully!</span>
          </div>
        )}

        {/* Profile Details */}
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
            <User className="w-4 h-4 text-emerald-400" />
            <span>Profile Information</span>
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-500 text-xs cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Expiry Alerts & Notifications */}
        <div className="pt-4 border-t border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4 text-amber-400" />
            <span>Expiry Warnings & Alerts</span>
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-200">Enable Expiry Notifications</p>
                <p className="text-[11px] text-slate-400">Receive alerts before food items expire</p>
              </div>
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="w-5 h-5 rounded-lg accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Warning Threshold: <span className="text-emerald-400 font-bold">{daysBeforeExpiry} days</span> before expiry
              </label>
              <input
                type="range"
                min="1"
                max="7"
                value={daysBeforeExpiry}
                onChange={(e) => setDaysBeforeExpiry(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>1 day (Urgent only)</span>
                <span>3 days (Recommended)</span>
                <span>7 days (Early alert)</span>
              </div>
            </div>
          </div>
        </div>

        {/* API Backend Status */}
        <div className="pt-4 border-t border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
            <Server className="w-4 h-4 text-cyan-400" />
            <span>Backend Integration Status</span>
          </h3>
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-slate-200">FastAPI & SQLite / PostgreSQL Engine</span>
            </div>
            <span className="text-emerald-400 font-bold">Online</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold text-xs border border-rose-500/30 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
