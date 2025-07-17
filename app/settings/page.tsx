'use client';

import { Switch } from '@/components/ui/switch';
import Header from '@/components/layout/header/Header';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', true);
  const [notifications, setNotifications] = useLocalStorage('notifications', true);
  const [analytics, setAnalytics] = useLocalStorage('analytics', false);

  return (
    <div className="flex w-full flex-col justify-between font-zen">
      <Header />
      <div className="container h-full gap-8 px-[5%]">
        <h1 className="py-8 font-zen">Settings</h1>

        <div className="flex flex-col gap-6">
          {/* Appearance Settings Section */}
          <div className="flex flex-col gap-4">
            <h2 className="text font-monospace text-secondary">Appearance</h2>

            <div className="bg-surface rounded p-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-medium text-primary">Dark Mode</h3>
                  <p className="text-sm text-secondary">
                    Enable dark mode for a better viewing experience in low-light environments.
                  </p>
                </div>
                <Switch
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                  className="min-w-[64px]"
                />
              </div>
            </div>
          </div>

          {/* Notification Settings Section */}
          <div className="flex flex-col gap-4 pt-4">
            <h2 className="text font-monospace text-secondary">Notifications</h2>

            <div className="bg-surface flex flex-col gap-6 rounded p-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-medium text-primary">Push Notifications</h3>
                  <p className="text-sm text-secondary">
                    Receive notifications about important updates and events.
                  </p>
                </div>
                <Switch
                  checked={notifications}
                  onCheckedChange={setNotifications}
                  className="min-w-[64px]"
                />
              </div>
            </div>
          </div>

          {/* Privacy Settings Section */}
          <div className="flex flex-col gap-4 py-8">
            <h2 className="text font-monospace text-secondary">Privacy</h2>

            <div className="flex flex-col gap-6 rounded border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900/20">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-medium text-primary">Analytics</h3>
                  <p className="text-sm text-secondary">
                    Allow us to collect anonymous usage data to improve the application.
                  </p>
                </div>
                <Switch
                  checked={analytics}
                  onCheckedChange={setAnalytics}
                  className="min-w-[64px]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
