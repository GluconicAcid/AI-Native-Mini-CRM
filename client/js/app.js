import { checkHealth, launchCampaign, getCampaignStats } from "./api.js";

const promptInput = document.getElementById("campaign-prompt");
const launchBtn = document.getElementById("launch-btn");
const campaignResults = document.getElementById("campaign-results");
const apiStatus = document.getElementById("api-status");
const toastContainer = document.getElementById("toast-container");
const statsContent = document.getElementById("stats-content");
const statsCampaignLabel = document.getElementById("stats-campaign-label");
const statsCampaignMeta = document.getElementById("stats-campaign-meta");
const refreshStatsBtn = document.getElementById("refresh-stats-btn");
const navButtons = document.querySelectorAll(".nav-btn");
const views = document.querySelectorAll(".view");

let statsPollTimer = null;
let activeCampaignId = null;
let activeLaunchData = null;
let statsLoadInFlight = false;
let hasStatsLoaded = false;

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

function setLoading(button, loading) {
  const label = button.querySelector(".btn-label");
  const spinner = button.querySelector(".spinner");
  button.disabled = loading;
  label.classList.toggle("hidden", loading);
  spinner.classList.toggle("hidden", !loading);
}

function switchView(viewName) {
  navButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === viewName);
  });
  views.forEach((view) => {
    view.classList.toggle("active", view.id === `view-${viewName}`);
  });
}

function formatPercent(value) {
  return `${(value * 100).toFixed(1)}%`;
}

function rateClass(value, good, warn) {
  if (value >= good) return "good";
  if (value >= warn) return "warn";
  return "bad";
}

function stopStatsPolling() {
  if (statsPollTimer) {
    clearInterval(statsPollTimer);
    statsPollTimer = null;
  }
}

function normalizeLaunchData(data, prompt) {
  return {
    ...data,
    prompt,
    campaignMessage: data.campaignMessage ?? data.campaign_message ?? null,
    channel: data.channel ?? null,
    goal: data.goal ?? null,
  };
}

function renderCampaignMessageBlock(launchData) {
  if (!launchData?.campaignMessage) return "";

  const channel = launchData.channel
    ? launchData.channel.charAt(0).toUpperCase() + launchData.channel.slice(1)
    : null;

  return `
    <div class="campaign-message">
      <span class="campaign-message-label">Campaign message${channel ? ` · ${channel}` : ""}</span>
      <p>${launchData.campaignMessage}</p>
    </div>
  `;
}

function renderPromptBlock(prompt) {
  if (!prompt) return "";

  return `
    <div class="campaign-message">
      <span class="campaign-message-label">Your prompt</span>
      <p>${prompt}</p>
    </div>
  `;
}

function renderCampaignDetails(launchData) {
  if (!launchData) return "";

  return `
    ${launchData.goal ? `<p class="campaign-goal"><strong>Goal:</strong> ${launchData.goal}</p>` : ""}
    ${renderCampaignMessageBlock(launchData)}
    ${!launchData.campaignMessage ? renderPromptBlock(launchData.prompt) : ""}
  `;
}

function renderLaunchSummary(launchData, prompt) {
  const details = renderCampaignDetails(launchData);

  return `
    <div class="card campaign-summary result-success">
      <h3>${launchData.message || "Campaign started"}</h3>
      <p>Audience: <strong>${launchData.audienceSize?.toLocaleString() ?? "—"}</strong> customers</p>
      ${launchData.campaignId ? `<p>Campaign ID: <code>${launchData.campaignId}</code></p>` : ""}
      ${details ? `<div class="campaign-details">${details}</div>` : ""}
      ${launchData.campaignMessage ? renderPromptBlock(prompt) : ""}
      <p class="stats-hint">Stats are loading in the <button type="button" class="link-btn" id="go-to-stats-btn">Campaign Stats</button> tab.</p>
    </div>
  `;
}

function renderStatsSection(statsData) {
  const { stats, insights } = statsData;

  return `
    <div class="metric-grid">
      <div class="metric-card">
        <div class="label">Delivery Rate</div>
        <div class="value ${rateClass(stats.deliveryRate, 0.85, 0.7)}">${formatPercent(stats.deliveryRate)}</div>
      </div>
      <div class="metric-card">
        <div class="label">Open Rate</div>
        <div class="value ${rateClass(stats.openRate, 0.25, 0.15)}">${formatPercent(stats.openRate)}</div>
      </div>
      <div class="metric-card">
        <div class="label">Click-through Rate</div>
        <div class="value ${rateClass(stats.ctr, 0.2, 0.1)}">${formatPercent(stats.ctr)}</div>
      </div>
      <div class="metric-card">
        <div class="label">Failure Rate</div>
        <div class="value ${stats.failureRate <= 0.1 ? "good" : stats.failureRate <= 0.2 ? "warn" : "bad"}">${formatPercent(stats.failureRate)}</div>
      </div>
    </div>

    <div class="card insights-card">
      <h3>AI Insights</h3>
      <div class="insight-summary">${insights.summary}</div>
      <div class="insight-lists">
        <div class="insight-list positives">
          <h4>What worked</h4>
          <ul>${insights.positives.length ? insights.positives.map((item) => `<li>${item}</li>`).join("") : "<li>None noted</li>"}</ul>
        </div>
        <div class="insight-list issues">
          <h4>Issues</h4>
          <ul>${insights.issues.length ? insights.issues.map((item) => `<li>${item}</li>`).join("") : "<li>None noted</li>"}</ul>
        </div>
        <div class="insight-list actions">
          <h4>Recommended actions</h4>
          <ul>${insights.actions.length ? insights.actions.map((item) => `<li>${item}</li>`).join("") : "<li>None noted</li>"}</ul>
        </div>
      </div>
    </div>
  `;
}

function renderStatsLoading() {
  return `
    <div class="stats-loading">
      <span class="spinner"></span>
      <span>Loading campaign stats…</span>
    </div>
  `;
}

function renderStatsError(message) {
  return `
    <div class="result-error">
      <h3>Could not load stats</h3>
      <p>${message || "Something went wrong. Please try again."}</p>
    </div>
  `;
}

function renderLaunchError(message, query) {
  campaignResults.classList.remove("hidden");
  campaignResults.innerHTML = `
    <div class="result-error">
      <h3>Campaign failed</h3>
      <p>${message || "Something went wrong. Please try again."}</p>
      ${query ? `<p><strong>Query:</strong> ${JSON.stringify(query)}</p>` : ""}
    </div>
  `;
}

function updateStatsHeader(campaignId, launchData = null) {
  statsCampaignLabel.textContent = campaignId ? `Campaign ${campaignId}` : "No campaign selected";

  const metaParts = [];
  if (launchData?.audienceSize) {
    metaParts.push(`Audience: ${launchData.audienceSize.toLocaleString()} customers`);
  }
  if (launchData?.channel) {
    metaParts.push(`Channel: ${launchData.channel}`);
  }
  statsCampaignMeta.textContent = metaParts.join(" · ");

  refreshStatsBtn.disabled = !campaignId;
}

function renderStatsCampaignInfo(launchData) {
  const details = renderCampaignDetails(launchData);
  if (!details) return "";

  return `<div class="card campaign-info-card">${details}</div>`;
}

function showStatsLoading() {
  statsContent.innerHTML = renderStatsLoading();
}

function showStatsEmpty() {
  statsContent.innerHTML = `
    <div class="stats-empty">
      <p>Launch a campaign to view live stats here.</p>
    </div>
  `;
}

function setStatsRefreshing(refreshing) {
  refreshStatsBtn.disabled = refreshing || !activeCampaignId;
  const label = refreshStatsBtn.querySelector(".btn-label");
  const spinner = refreshStatsBtn.querySelector(".spinner");
  if (label && spinner) {
    label.classList.toggle("hidden", refreshing);
    spinner.classList.toggle("hidden", !refreshing);
  } else {
    refreshStatsBtn.textContent = refreshing ? "Refreshing…" : "Refresh stats";
  }
}

async function loadStats(campaignId, { silent = false } = {}) {
  if (!campaignId) return;
  if (statsLoadInFlight) return;

  const showFullLoading = !silent && !hasStatsLoaded;

  if (showFullLoading) {
    showStatsLoading();
  } else if (!silent) {
    setStatsRefreshing(true);
  }

  statsLoadInFlight = true;

  try {
    const statsData = await getCampaignStats(campaignId);
    statsContent.innerHTML = renderStatsSection(statsData);
    hasStatsLoaded = true;
    return statsData;
  } catch (error) {
    if (!silent || !hasStatsLoaded) {
      statsContent.innerHTML = renderStatsError(error.data?.message || error.message);
    }
    if (!silent) {
      showToast(error.data?.message || error.message, "error");
    }
    throw error;
  } finally {
    statsLoadInFlight = false;
    setStatsRefreshing(false);
  }
}

function startStatsPolling(campaignId) {
  stopStatsPolling();

  let polls = 0;
  const maxPolls = 20;

  statsPollTimer = setInterval(async () => {
    polls += 1;

    try {
      await loadStats(campaignId, { silent: true });
    } catch {
      // keep polling silently
    }

    if (polls >= maxPolls) {
      stopStatsPolling();
    }
  }, 3000);
}

function beginStatsTracking(campaignId, launchData) {
  activeCampaignId = campaignId;
  activeLaunchData = launchData;
  hasStatsLoaded = false;
  updateStatsHeader(campaignId, launchData);
  renderStatsCampaignInfoPanel(launchData);
  void loadStats(campaignId);
  startStatsPolling(campaignId);
}

function renderStatsCampaignInfoPanel(launchData) {
  const infoPanel = document.getElementById("stats-campaign-info");
  if (!infoPanel) return;

  const infoHtml = renderStatsCampaignInfo(launchData);
  infoPanel.innerHTML = infoHtml;
  infoPanel.classList.toggle("hidden", !infoHtml);
}

navButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    switchView(btn.dataset.view);
    if (btn.dataset.view === "stats" && activeLaunchData) {
      renderStatsCampaignInfoPanel(activeLaunchData);
    }
  });
});

document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    promptInput.value = chip.dataset.example;
    promptInput.focus();
  });
});

refreshStatsBtn.addEventListener("click", () => {
  if (activeCampaignId) {
    void loadStats(activeCampaignId);
  }
});

launchBtn.addEventListener("click", async () => {
  const prompt = promptInput.value.trim();

  if (!prompt) {
    showToast("Please enter a campaign prompt.", "error");
    return;
  }

  setLoading(launchBtn, true);
  campaignResults.classList.add("hidden");
  campaignResults.innerHTML = "";
  stopStatsPolling();
  hasStatsLoaded = false;

  try {
    const data = await launchCampaign(prompt);
    const campaignId = data.campaignId?.toString?.() ?? data.campaignId;
    const launchData = normalizeLaunchData(data, prompt);

    campaignResults.classList.remove("hidden");
    campaignResults.innerHTML = renderLaunchSummary(launchData, prompt);

    document.getElementById("go-to-stats-btn")?.addEventListener("click", () => {
      switchView("stats");
    });

    showToast("Campaign launched successfully.", "success");

    if (campaignId) {
      beginStatsTracking(campaignId, launchData);
      switchView("stats");
    } else {
      showToast("Campaign started but no ID was returned — stats unavailable.", "error");
    }
  } catch (error) {
    renderLaunchError(error.data?.message || error.message, error.data?.query);
    showToast(error.data?.message || error.message, "error");
  } finally {
    setLoading(launchBtn, false);
  }
});

async function init() {
  const online = await checkHealth();
  apiStatus.textContent = online ? "connected" : "offline";
  apiStatus.className = online ? "online" : "offline";

  if (!online) {
    showToast("Backend is not reachable. Start the server on port 8000.", "error");
  }

  updateStatsHeader(null);
  showStatsEmpty();
}

init();
