'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaCheckCircle, FaKey, FaLock, FaTrash, FaUserShield } from 'react-icons/fa';
import {
  clearStoredDemoConfig,
  getStoredDemoConfig,
  saveStoredDemoConfig,
} from '../../lib/apiKeys';

const emptyConfig = {
  openRouterApiKey: '',
  geminiApiKey: '',
  demoAccessCode: '',
};

export default function SetupPage() {
  const [config, setConfig] = useState(() => ({ ...emptyConfig, ...getStoredDemoConfig() }));
  const [isPresenterLoggedIn, setIsPresenterLoggedIn] = useState(false);
  const [saved, setSaved] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    setIsPresenterLoggedIn(sessionStorage.getItem('isLoggedIn') === 'true');

    fetch('/api/config/status')
      .then((response) => response.json())
      .then(setStatus)
      .catch(() => setStatus(null));
  }, []);

  const handleChange = (field, value) => {
    setSaved(false);
    setConfig((current) => ({ ...current, [field]: value }));
  };

  const handleSave = (event) => {
    event.preventDefault();
    saveStoredDemoConfig(config);
    setSaved(true);
  };

  const handleClear = () => {
    sessionStorage.removeItem('isLoggedIn');
    clearStoredDemoConfig();
    setConfig(emptyConfig);
    setSaved(false);
    setIsPresenterLoggedIn(false);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-5 py-10 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">VERA-AI Setup</p>
            <h1 className="mt-2 text-3xl font-bold">Configure live demo access</h1>
            <p className="mt-2 text-sm text-slate-600">
              Current mode: <span className="font-semibold">{isPresenterLoggedIn || config.demoAccessCode ? 'Presenter access active' : 'Public mode'}</span>
            </p>
          </div>
          <Link
            href="/"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-teal-500 hover:text-teal-700"
          >
            Back to app
          </Link>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <FaUserShield className="mb-4 h-6 w-6 text-teal-600" />
            <h2 className="font-semibold">Presenter Mode</h2>
            <p className="mt-2 text-sm text-slate-600">
              Use a private access code with API keys stored in Vercel environment variables.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <FaKey className="mb-4 h-6 w-6 text-teal-600" />
            <h2 className="font-semibold">Public BYOK Mode</h2>
            <p className="mt-2 text-sm text-slate-600">
              Visitors can paste their own API keys. They are saved only in this browser.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <FaLock className="mb-4 h-6 w-6 text-teal-600" />
            <h2 className="font-semibold">No Key Mode</h2>
            <p className="mt-2 text-sm text-slate-600">
              If no key is configured, live AI actions return a clear no API key message.
            </p>
          </div>
        </section>

        <form onSubmit={handleSave} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-5">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">Presenter access code</span>
              <input
                type="password"
                value={config.demoAccessCode}
                onChange={(event) => handleChange('demoAccessCode', event.target.value)}
                placeholder="Optional code for private demo access"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">OpenRouter API key</span>
              <input
                type="password"
                value={config.openRouterApiKey}
                onChange={(event) => handleChange('openRouterApiKey', event.target.value)}
                placeholder="Optional public-user key"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">Gemini API key</span>
              <input
                type="password"
                value={config.geminiApiKey}
                onChange={(event) => handleChange('geminiApiKey', event.target.value)}
                placeholder="Optional public-user key"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Save this browser
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-red-300 hover:text-red-600"
            >
              <FaTrash className="h-3 w-3" />
              Logout and clear
            </button>
            {saved && (
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700">
                <FaCheckCircle className="h-4 w-4" />
                Saved locally
              </span>
            )}
          </div>
        </form>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Deployment status</h2>
          <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
            <Status label="OpenRouter server key" value={status?.serverKeys?.openRouter} />
            <Status label="Gemini server key" value={status?.serverKeys?.gemini} />
            <Status label="Firebase project env" value={status?.serverKeys?.firebaseProject} />
            <Status label="Presenter access code" value={status?.demoAccessEnabled} />
          </div>
        </section>
      </div>
    </main>
  );
}

function Status({ label, value }) {
  const known = typeof value === 'boolean';

  return (
    <div className="flex items-center justify-between rounded-md border border-slate-200 px-4 py-3">
      <span className="font-medium text-slate-700">{label}</span>
      <span className={value ? 'font-semibold text-teal-700' : 'font-semibold text-slate-500'}>
        {known ? (value ? 'Configured' : 'Not configured') : 'Unknown'}
      </span>
    </div>
  );
}
