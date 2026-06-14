const API_BASE = import.meta.env.VITE_API_URL ?? "";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || "Request failed");
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE}/campaign`, { method: "OPTIONS" });
    return response.status !== 0;
  } catch {
    return false;
  }
}

export async function launchCampaign(prompt) {
  return request("/campaign", {
    method: "POST",
    body: JSON.stringify({ prompt }),
  });
}

export async function getCampaignStats(campaignId) {
  return request(`/campaign/${campaignId}/stats`, {
    method: "GET",
  });
}

export { API_BASE };
