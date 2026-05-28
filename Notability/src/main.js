import { inject } from "@vercel/analytics";

inject();

const storageKey = "notabilityStudentGuideAnalytics";
const chartDays = 7;

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
    const analytics = JSON.parse(localStorage.getItem(storageKey)) || {};
    return {
      visits: analytics.visits || 0,
      days: analytics.days || {},
      sources: analytics.sources || {},
      lastSource: analytics.lastSource || "Direct",
      lastLandingPage: analytics.lastLandingPage || "/"
    };
  } catch {
    return { visits: 0, days: {}, sources: {}, lastSource: "Direct", lastLandingPage: "/" };
  }
};

const writeAnalytics = (analytics) => {
  try {
    localStorage.setItem(storageKey, JSON.stringify(analytics));
  } catch {
    // Keep the visitor chart visible even when local storage is blocked.
  }
};

const getDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getRecentDays = () =>
  Array.from({ length: chartDays }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (chartDays - 1 - index));

    return {
      key: getDateKey(date),
      label: date.toLocaleDateString(undefined, { weekday: "short" })
    };
  });

const pointPath = (points) => {
  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  return points
    .map((point, index) => {
      if (index === 0) {
        return `M ${point.x} ${point.y}`;
      }

      const previous = points[index - 1];
      const controlOffset = (point.x - previous.x) / 2;
      return `C ${previous.x + controlOffset} ${previous.y}, ${point.x - controlOffset} ${point.y}, ${point.x} ${point.y}`;
    })
    .join(" ");
};

const renderVisitorChart = (dailyData) => {
  const svg = document.querySelector("#daily-visitor-chart");
  const grid = svg.querySelector(".chart-grid");
  const line = svg.querySelector(".chart-line");
  const fill = svg.querySelector(".chart-fill");
  const pointsGroup = svg.querySelector(".chart-points");
  const labelsGroup = svg.querySelector(".chart-labels");
  const width = 520;
  const height = 220;
  const padding = { top: 24, right: 20, bottom: 42, left: 44 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const maxVisitors = Math.max(1, ...dailyData.map((day) => day.count));

  const points = dailyData.map((day, index) => {
    const x = padding.left + (chartWidth / (dailyData.length - 1 || 1)) * index;
    const y = padding.top + chartHeight - (day.count / maxVisitors) * chartHeight;
    return { ...day, x, y };
  });

  grid.innerHTML = [0, 0.5, 1]
    .map((ratio) => {
      const y = padding.top + chartHeight * ratio;
      return `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}"></line>`;
    })
    .join("");

  const path = pointPath(points);
  const fillPath = `${path} L ${points.at(-1).x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;

  line.setAttribute("d", path);
  fill.setAttribute("d", fillPath);

  pointsGroup.innerHTML = points
    .map(
      (point) =>
        `<circle cx="${point.x}" cy="${point.y}" r="5"><title>${point.key}: ${point.count} visits</title></circle>`
    )
    .join("");

  labelsGroup.innerHTML = points
    .map(
      (point) =>
        `<text x="${point.x}" y="${height - 15}" text-anchor="middle">${point.label}</text>`
    )
    .join("");
};

const renderSourceList = (sources) => {
  const sourceList = document.querySelector("#source-list");
  const entries = Object.entries(sources)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  sourceList.innerHTML = entries
    .map(([source, count]) => `<span><strong>${count}</strong> ${source}</span>`)
    .join("");
};

const updateVisitorPanel = () => {
  const source = sourceFromReferrer();
  const landingPage = `${window.location.pathname}${window.location.search}`;
  const analytics = readAnalytics();
  const todayKey = getDateKey(new Date());

  analytics.visits += 1;
  analytics.days[todayKey] = (analytics.days[todayKey] || 0) + 1;
  analytics.sources[source] = (analytics.sources[source] || 0) + 1;
  analytics.lastSource = source;
  analytics.lastLandingPage = landingPage;
  analytics.updatedAt = new Date().toISOString();

  writeAnalytics(analytics);

  const recentDays = getRecentDays();
  const dailyData = recentDays.map((day) => ({
    ...day,
    count: analytics.days[day.key] || 0
  }));
  const weekCount = dailyData.reduce((total, day) => total + day.count, 0);

  document.querySelector("#today-count").textContent = (analytics.days[todayKey] || 0).toLocaleString();
  document.querySelector("#week-count").textContent = weekCount.toLocaleString();
  document.querySelector("#visit-source").textContent = source;
  document.querySelector("#chart-summary").textContent =
    `Last 7 days: ${weekCount.toLocaleString()} local visits. Today: ${(analytics.days[todayKey] || 0).toLocaleString()}.`;

  renderVisitorChart(dailyData);
  renderSourceList(analytics.sources);
};

updateVisitorPanel();
