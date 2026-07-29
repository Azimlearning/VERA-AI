const STORAGE_KEY = 'vera-ai-demo-config';

export function getStoredDemoConfig() {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

export function saveStoredDemoConfig(config) {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function clearStoredDemoConfig() {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
}

export function getClientOpenRouterKey() {
  return getStoredDemoConfig().openRouterApiKey || '';
}

export function getClientGeminiKey() {
  return getStoredDemoConfig().geminiApiKey || '';
}

export function getDemoAccessCode() {
  return getStoredDemoConfig().demoAccessCode || '';
}

export function buildDemoHeaders() {
  const headers = {};
  const geminiApiKey = getClientGeminiKey();
  const demoAccessCode = getDemoAccessCode();

  if (geminiApiKey) {
    headers['x-gemini-api-key'] = geminiApiKey;
  }

  if (demoAccessCode) {
    headers['x-vera-demo-code'] = demoAccessCode;
  }

  return headers;
}
