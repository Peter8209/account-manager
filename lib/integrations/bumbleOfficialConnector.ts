type BumbleConnectorStatus = {
  configured: boolean;
  mode: 'not_configured' | 'official_api_ready';
  appStoreUrl: string;
  message: string;
};

export function getBumbleConnectorStatus(): BumbleConnectorStatus {
  const apiBaseUrl = process.env.BUMBLE_OFFICIAL_API_BASE_URL;
  const apiKey = process.env.BUMBLE_OFFICIAL_API_KEY;

  const configured = Boolean(apiBaseUrl && apiKey);

  return {
    configured,
    mode: configured ? 'official_api_ready' : 'not_configured',
    appStoreUrl:
      'https://apps.apple.com/sk/app/bumble-dating-app-meet-date/id930441707?l=sk',
    message: configured
      ? 'Bumble official connector je nakonfigurovaný pre oficiálne API.'
      : 'Bumble official connector nie je nakonfigurovaný. Doplň oficiálne API údaje.',
  };
}

export async function testBumbleOfficialApi() {
  const apiBaseUrl = process.env.BUMBLE_OFFICIAL_API_BASE_URL;
  const apiKey = process.env.BUMBLE_OFFICIAL_API_KEY;

  if (!apiBaseUrl || !apiKey) {
    return {
      ok: false,
      status: 'not_configured',
      message: 'Chýba BUMBLE_OFFICIAL_API_BASE_URL alebo BUMBLE_OFFICIAL_API_KEY.',
    };
  }

  const response = await fetch(`${apiBaseUrl}/health`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  return {
    ok: response.ok,
    status: response.status,
    message: response.ok
      ? 'Oficiálne Bumble API odpovedá.'
      : 'Oficiálne Bumble API neodpovedá správne.',
  };
}