import { inject } from "@vercel/analytics";

inject();

const storageKey = "notabilityStudentGuideAnalytics";

const sourceFromReferrer = () => {
  const params = new URLSearchParams(window.location.search);
  const campaignSource = params.get("utm_source");

  if (campaignSource) {
    return campaignSource;
  }

  if (!document.referrer) {
    return "Direct";
  }

  try {
    const referrer = new URL(document.referrer);
    if (referrer.hostname === window.location.hostname) {
      return "Internal";
    }

    return referrer.hostname.replace(/^www\./, "");
  } catch {
    return "Unknown";
  }
};

const readAnalytics = () => {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || { visits: 0 };
  } catch {
    return { visits: 0 };
  }
};

const updateVisitorPanel = () => {
  const source = sourceFromReferrer();
  const landingPage = `${window.location.pathname}${window.location.search}`;
  const analytics = readAnalytics();

  analytics.visits += 1;
  analytics.lastSource = source;
  analytics.lastLandingPage = landingPage;
  analytics.updatedAt = new Date().toISOString();

  localStorage.setItem(storageKey, JSON.stringify(analytics));

  document.querySelector("#visit-count").textContent = analytics.visits.toLocaleString();
  document.querySelector("#visit-source").textContent = source;
  document.querySelector("#landing-page").textContent = landingPage || "/";
};

updateVisitorPanel();
