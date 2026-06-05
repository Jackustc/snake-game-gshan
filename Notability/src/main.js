import { inject } from "@vercel/analytics";

inject();

const storageKey = "notabilityStudentGuideAnalytics";
const defaultChartDays = 7;

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

const parseDateKey = (dateKey) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const addDays = (date, days) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};

const getDefaultRange = () => {
  const end = new Date();
  const start = addDays(end, -(defaultChartDays - 1));

  return {
    startKey: getDateKey(start),
    endKey: getDateKey(end)
  };
};

const getRangeDays = (startKey, endKey) => {
  const start = parseDateKey(startKey);
  const end = parseDateKey(endKey);
  const days = [];

  for (let date = start; date <= end; date = addDays(date, 1)) {
    days.push({
      key: getDateKey(date),
      label: date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
    });
  }

  return days;
};

const getSelectedRange = () => {
  const { startKey: defaultStart, endKey: defaultEnd } = getDefaultRange();
  const startInput = document.querySelector("#range-start");
  const endInput = document.querySelector("#range-end");
  let startKey = startInput.value || defaultStart;
  let endKey = endInput.value || defaultEnd;

  if (startKey > endKey) {
    [startKey, endKey] = [endKey, startKey];
  }

  startInput.value = startKey;
  endInput.value = endKey;

  return { startKey, endKey };
};

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

const formatDateLabel = (dateKey) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const positionTooltip = (point, content) => {
  const tooltip = document.querySelector("#chart-tooltip");
  const chart = document.querySelector(".visitor-chart");
  const svg = document.querySelector("#daily-visitor-chart");
  const chartRect = chart.getBoundingClientRect();
  const svgRect = svg.getBoundingClientRect();
  const scaleX = svgRect.width / 520;
  const scaleY = svgRect.height / 220;
  const left = svgRect.left - chartRect.left + point.x * scaleX;
  const top = svgRect.top - chartRect.top + point.y * scaleY;

  tooltip.innerHTML = content;
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
  tooltip.classList.add("is-visible");
};

const hideTooltip = () => {
  document.querySelector("#chart-tooltip").classList.remove("is-visible");
};

const renderVisitorChart = (dailyData) => {
  const svg = document.querySelector("#daily-visitor-chart");
  const grid = svg.querySelector(".chart-grid");
  const yLabels = svg.querySelector(".chart-y-labels");
  const line = svg.querySelector(".chart-line");
  const fill = svg.querySelector(".chart-fill");
  const pointsGroup = svg.querySelector(".chart-points");
  const labelsGroup = svg.querySelector(".chart-labels");
  const width = 520;
  const height = 220;
  const padding = { top: 24, right: 20, bottom: 42, left: 54 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const maxVisitors = Math.max(1, ...dailyData.map((day) => day.count));
  const tickValues = [...new Set([maxVisitors, Math.ceil(maxVisitors / 2), 0])];
  const labelInterval = Math.max(1, Math.ceil(dailyData.length / 7));

  const points = dailyData.map((day, index) => {
    const x = padding.left + (chartWidth / (dailyData.length - 1 || 1)) * index;
    const y = padding.top + chartHeight - (day.count / maxVisitors) * chartHeight;
    return { ...day, x, y };
  });

  grid.innerHTML = tickValues
    .map((value) => {
      const ratio = 1 - value / maxVisitors;
      const y = padding.top + chartHeight * ratio;
      return `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}"></line>`;
    })
    .join("");

  yLabels.innerHTML = tickValues
    .map((value) => {
      const ratio = 1 - value / maxVisitors;
      const y = padding.top + chartHeight * ratio + 4;
      return `<text x="${padding.left - 12}" y="${y}" text-anchor="end">${value}</text>`;
    })
    .join("");

  const path = pointPath(points);
  const fillPath = `${path} L ${points.at(-1).x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;

  line.setAttribute("d", path);
  fill.setAttribute("d", fillPath);

  pointsGroup.innerHTML = points
    .map(
      (point) =>
        `<g class="chart-point" tabindex="0" role="button" aria-label="${formatDateLabel(point.key)}: ${point.count} visits" data-x="${point.x}" data-y="${point.y}" data-date="${formatDateLabel(point.key)}" data-count="${point.count}">
          <circle class="point-hit-area" cx="${point.x}" cy="${point.y}" r="15"></circle>
          <circle class="point-dot" cx="${point.x}" cy="${point.y}" r="5"></circle>
        </g>`
    )
    .join("");

  labelsGroup.innerHTML = points
    .map((point, index) => {
      const shouldShowLabel = index === 0 || index === points.length - 1 || index % labelInterval === 0;
      return shouldShowLabel
        ? `<text x="${point.x}" y="${height - 15}" text-anchor="middle">${point.label}</text>`
        : "";
    })
    .join("");

  pointsGroup.querySelectorAll(".chart-point").forEach((pointElement) => {
    const point = {
      x: Number(pointElement.dataset.x),
      y: Number(pointElement.dataset.y)
    };
    const content = `<strong>${pointElement.dataset.count}</strong><span>${pointElement.dataset.date} visitors</span>`;

    pointElement.addEventListener("mouseenter", () => positionTooltip(point, content));
    pointElement.addEventListener("mouseleave", hideTooltip);
    pointElement.addEventListener("focus", () => positionTooltip(point, content));
    pointElement.addEventListener("blur", hideTooltip);
  });
};

const escapeCsvValue = (value) => {
  const stringValue = String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replaceAll("\"", "\"\"")}"`;
  }

  return stringValue;
};

const downloadCsv = (dailyData) => {
  const header = ["date", "visitors"];
  const rows = dailyData.map((day) => [day.key, day.count]);
  const csv = [header, ...rows]
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const { startKey, endKey } = getSelectedRange();
  const link = document.createElement("a");

  link.href = url;
  link.download = `notability-visitors-${startKey}-to-${endKey}.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
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

const recordVisit = () => {
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

  return analytics;
};

const renderVisitorPanel = (analytics) => {
  const source = analytics.lastSource || sourceFromReferrer();
  const todayKey = getDateKey(new Date());
  const { startKey, endKey } = getSelectedRange();
  const rangeDays = getRangeDays(startKey, endKey);
  const dailyData = rangeDays.map((day) => ({
    ...day,
    count: analytics.days[day.key] || 0
  }));
  const rangeCount = dailyData.reduce((total, day) => total + day.count, 0);

  document.querySelector("#today-count").textContent = (analytics.days[todayKey] || 0).toLocaleString();
  document.querySelector("#range-count").textContent = rangeCount.toLocaleString();
  document.querySelector("#visit-source").textContent = source;
  document.querySelector("#chart-summary").textContent =
    `${formatDateLabel(startKey)} to ${formatDateLabel(endKey)}: ${rangeCount.toLocaleString()} local visits. Today: ${(analytics.days[todayKey] || 0).toLocaleString()}.`;

  renderVisitorChart(dailyData);
  renderSourceList(analytics.sources);

  return dailyData;
};

const activeAnalytics = recordVisit();
let activeDailyData = renderVisitorPanel(activeAnalytics);

document.querySelector("#range-start").addEventListener("change", () => {
  hideTooltip();
  activeDailyData = renderVisitorPanel(activeAnalytics);
});

document.querySelector("#range-end").addEventListener("change", () => {
  hideTooltip();
  activeDailyData = renderVisitorPanel(activeAnalytics);
});

document.querySelector("#download-csv").addEventListener("click", () => {
  downloadCsv(activeDailyData);
});
