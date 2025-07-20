'use client';

import { Switch } from '@/components/ui/switch';
import Header from '@/components/layout/header/Header';
import Main from '@/components/layout/Main';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useTheme } from 'next-themes';

export default function SettingsPage() {
  const [usePermit2, setUsePermit2] = useLocalStorage('usePermit2', true);
  const { theme, setTheme } = useTheme();

  return (
    <div className="font-zen">
      <Header />
      <Main>
          <h1 className="py-8 font-zen">Settings</h1>

          <div className="flex flex-col gap-6">
            {/* Transaction Settings Section */}
            <div className="flex flex-col gap-4">
              <h2 className="text font-monospace text-secondary">Transaction Settings</h2>

              <div className="bg-card rounded p-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-medium text-primary">Use Gasless Approvals</h3>
                    <p className="text-sm text-secondary">
                      Enable signature-based token approvals using Permit2. This bundles approvals and
                      actions into a single transaction, saving gas.
                    </p>
                    <p className="mt-2 text-xs text-secondary opacity-80">
                      Note: If you're using a smart contract wallet (like Safe or other multisig), you
                      may want to disable this and use standard approvals instead.
                    </p>
                  </div>
                  <Switch
                    checked={usePermit2}
                    onCheckedChange={setUsePermit2}
                  />
                </div>
              </div>
            </div>

            {/* Appearance Settings Section */}
            <div className="flex flex-col gap-4 pt-4">
              <h2 className="text font-monospace text-secondary">Appearance</h2>

              <div className="bg-card rounded p-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-medium text-primary">Dark Mode</h3>
                  <p className="text-sm text-secondary">
                    Enable dark mode for a better viewing experience in low-light environments.
                  </p>
                </div>
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                />
              </div>
            </div>
            </div>
        </div>
      </Main>
    </div>
  );
}
