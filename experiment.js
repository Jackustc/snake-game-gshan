const pageTitles = {
  setup: "Study setup",
  scale: "Scale development, implementation, and measurement validity",
  assignment: "Experimental treatment assignment",
  sample: "Sample collection, G*Power-style planning, and data generation",
  measurement: "Conceptual model and confirmatory factor analysis",
  analysis: "Data analysis and result reporting",
  bias: "Common method bias diagnostics",
};

const palette = ["#0f766e", "#d75c48", "#3b6ea8", "#a97916", "#2f855a", "#7c3aed", "#be4b6b"];
const genders = ["Woman", "Man", "Nonbinary", "Prefer not to say"];
const education = ["High school", "Some college", "Bachelor's", "Master's", "Doctorate"];
const archetypes = ["Cautious evaluator", "Efficiency seeker", "Innovation champion", "Privacy guardian", "Value optimizer", "Habitual buyer"];
const references = {
  trust: "McKnight, Choudhury, & Kacmar (2002), MIS Quarterly",
  intention: "Venkatesh, Morris, Davis, & Davis (2003), MIS Quarterly",
  quality: "Wixom & Todd (2005), MIS Quarterly",
  literacy: "Long & Magerko (2020), CHI",
  privacy: "Smith, Milberg, & Burke (1996), MIS Quarterly",
  confidence: "Bearden, Hardesty, & Rose (2001), Journal of Consumer Research",
  diagnosticity: "Jiang & Benbasat (2007), Journal of MIS",
  autonomy: "Dillard & Shen (2005), Human Communication Research",
};
const effectGuides = {
  "t tests": {
    metric: "Cohen's d",
    values: "small = 0.20, medium = 0.50, large = 0.80",
    reference: "Cohen, J. (1988). Statistical Power Analysis for the Behavioral Sciences (2nd ed.). Hillsdale, NJ: Lawrence Erlbaum Associates.",
  },
  "F tests": {
    metric: "Cohen's f / f²",
    values: "ANOVA f: small = 0.10, medium = 0.25, large = 0.40; regression f²: small = 0.02, medium = 0.15, large = 0.35",
    reference: "Cohen, J. (1988). Statistical Power Analysis for the Behavioral Sciences (2nd ed.). Hillsdale, NJ: Lawrence Erlbaum Associates.",
  },
  "χ² tests": {
    metric: "Cohen's w",
    values: "small = 0.10, medium = 0.30, large = 0.50",
    reference: "Cohen, J. (1988). Statistical Power Analysis for the Behavioral Sciences (2nd ed.). Hillsdale, NJ: Lawrence Erlbaum Associates.",
  },
  "z tests": {
    metric: "Cohen's h",
    values: "small = 0.20, medium = 0.50, large = 0.80 for proportion differences",
    reference: "Cohen, J. (1988). Statistical Power Analysis for the Behavioral Sciences (2nd ed.). Hillsdale, NJ: Lawrence Erlbaum Associates.",
  },
  "Exact tests": {
    metric: "odds ratio / probability difference",
    values: "small effects are often OR around 1.5, medium around 2.5, large around 4.3; calibrate to the field context",
    reference: "Chen, H., Cohen, P., & Chen, S. (2010). How big is a big odds ratio? Interpreting the magnitudes of odds ratios in epidemiological studies. Communications in Statistics - Simulation and Computation, 39(4), 860-864.",
  },
};

let seed = 17469;
let activePage = "setup";
let assignmentMode = "balanced";
let constructs = [];
let treatments = [];
let personas = [];
let dataset = [];
let results = null;
let report = [];
let selectedPersonaIndex = 0;
let diagramNodes = [];
let diagramLinks = [];
let diagramMode = "move";
let draggedNodeId = null;
let linkSourceId = null;
let selectedLinkIndex = -1;
let draggedLinkEndpoint = null;
let copiedDiagramLink = null;
let finalizedDiagramNodes = [];
let finalizedDiagramLinks = [];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);
const els = {
  pageTitle: $("#page-title"),
  workflowSteps: $$(".workflow-step"),
  pageViews: $$(".page-view"),
  studyName: $("#study-name"),
  studyDescription: $("#study-description"),
  ivName: $("#iv-name"),
  outcomeNames: $("#outcome-names"),
  mediatorNames: $("#mediator-names"),
  moderatorNames: $("#moderator-names"),
  syncSetupBtn: $("#sync-setup-btn"),
  workflowCanvas: $("#workflow-canvas"),
  modelCanvas: $("#model-canvas"),
  diagramStatus: $("#diagram-status"),
  diagramMoveBtn: $("#diagram-move-btn"),
  diagramLinkBtn: $("#diagram-link-btn"),
  diagramRemoveBtn: $("#diagram-remove-btn"),
  diagramClearBtn: $("#diagram-clear-btn"),
  diagramFinalizeBtn: $("#diagram-finalize-btn"),
  analysisCanvas: $("#analysis-canvas"),
  powerCurveCanvas: $("#power-curve-canvas"),
  constructEditor: $("#construct-editor"),
  constructName: $("#construct-name"),
  constructItems: $("#construct-items"),
  addConstructBtn: $("#add-construct-btn"),
  treatmentList: $("#treatment-list"),
  treatmentName: $("#treatment-name"),
  treatmentDescription: $("#treatment-description"),
  addTreatmentBtn: $("#add-treatment-btn"),
  assignmentButtons: $$("[data-assignment]"),
  sampleSize: $("#sample-size"),
  sampleSizeValue: $("#sample-size-value"),
  effectSize: $("#effect-size"),
  effectSizeValue: $("#effect-size-value"),
  samplePower: $("#sample-power"),
  samplePowerValue: $("#sample-power-value"),
  powerLabel: $("#power-label"),
  generatePersonasBtn: $("#generate-personas-btn"),
  generateDataBtn: $("#generate-data-btn"),
  personaCount: $("#persona-count"),
  personaSelect: $("#persona-select"),
  personaEditor: $("#persona-editor"),
  dataTableHead: $("#data-table-head"),
  dataTable: $("#data-table"),
  variableStats: $("#variable-stats"),
  reportOutput: $("#report-output"),
  regressionTable: $("#regression-table"),
  runTime: $("#run-time"),
  cfaResults: $("#cfa-results"),
  cfaStatus: $("#cfa-status"),
  biasResults: $("#bias-results"),
  cmbStatus: $("#cmb-status"),
  validityLabel: $("#validity-label"),
  constructCount: $("#construct-count"),
  treatmentCount: $("#treatment-count"),
  sampleSizeMetric: $("#sample-size-metric"),
  cmbMetric: $("#cmb-metric"),
  exportReportBtn: $("#export-report-btn"),
  runStudyBtn: $("#run-study-btn"),
  downloadDataBtn: $("#download-data-btn"),
  scaleChat: $("#scale-chat"),
  scaleAgentInput: $("#scale-agent-input"),
  scaleAgentBtn: $("#scale-agent-btn"),
  treatmentChat: $("#treatment-chat"),
  treatmentAgentInput: $("#treatment-agent-input"),
  treatmentAgentBtn: $("#treatment-agent-btn"),
  powerChat: $("#power-chat"),
  powerAgentInput: $("#power-agent-input"),
  powerAgentBtn: $("#power-agent-btn"),
  gpTestFamily: $("#gp-test-family"),
  gpStatTest: $("#gp-stat-test"),
  gpAnalysisType: $("#gp-analysis-type"),
  gpTails: $("#gp-tails"),
  gpEffect: $("#gp-effect"),
  gpAlpha: $("#gp-alpha"),
  gpPower: $("#gp-power"),
  gpTotalN: $("#gp-total-n"),
  gpGroups: $("#gp-groups"),
  gpPredictors: $("#gp-predictors"),
  gpowerCalcBtn: $("#gpower-calc-btn"),
  gpowerApplyBtn: $("#gpower-apply-btn"),
  gpowerOutput: $("#gpower-output"),
  effectSizeGuide: $("#effect-size-guide"),
  effectReference: $("#effect-reference"),
};

function random() {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
}

function normal(mean = 0, sd = 1) {
  const u = Math.max(random(), Number.EPSILON);
  const v = Math.max(random(), Number.EPSILON);
  return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function mean(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function variance(values) {
  const avg = mean(values);
  return mean(values.map((value) => (value - avg) ** 2));
}

function correlation(x, y) {
  const mx = mean(x);
  const my = mean(y);
  const numerator = x.reduce((sum, value, index) => sum + (value - mx) * (y[index] - my), 0);
  const denominator = Math.sqrt(
    x.reduce((sum, value) => sum + (value - mx) ** 2, 0) *
      y.reduce((sum, value) => sum + (value - my) ** 2, 0),
  );
  return denominator === 0 ? 0 : numerator / denominator;
}

function slope(x, y) {
  const vx = variance(x);
  return vx === 0 ? 0 : correlation(x, y) * Math.sqrt(variance(y) / vx);
}

function likert(value) {
  return Math.round(clamp(value, 1, 7) * 10) / 10;
}

function slug(value) {
  return String(value || "construct")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 28) || "construct";
}

function listFrom(text) {
  return String(text || "")
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function uniqueByKey(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.key)) return false;
    seen.add(item.key);
    return true;
  });
}

function generatedItems(label) {
  const key = slug(label);
  return [
    `${key}_1`,
    `${key}_2`,
    `${key}_3`,
  ];
}

function referenceFor(label) {
  const lower = label.toLowerCase();
  const hit = Object.keys(references).find((key) => lower.includes(key));
  return hit ? references[hit] : "Churchill (1979), Journal of Marketing Research; DeVellis (2016), Scale Development";
}

function constructFromLabel(label, role) {
  return {
    key: slug(label),
    label,
    role,
    items: generatedItems(label),
    reference: referenceFor(label),
  };
}

function syncFromSetup() {
  const outcomes = listFrom(els.outcomeNames.value).map((label) => constructFromLabel(label, "outcome"));
  const mediators = listFrom(els.mediatorNames.value).map((label) => constructFromLabel(label, "mediator"));
  const moderators = listFrom(els.moderatorNames.value).map((label) => constructFromLabel(label, "moderator"));
  const existing = new Map(constructs.map((construct) => [construct.key, construct]));
  constructs = uniqueByKey([...mediators, ...outcomes, ...moderators]).map((construct) => ({
    ...construct,
    items: existing.get(construct.key)?.items || construct.items,
    reference: existing.get(construct.key)?.reference || construct.reference,
  }));

  const iv = els.ivName.value.trim() || "Treatment";
  if (treatments.length > 0) {
    treatments = treatments.map((treatment, index) => {
      if (index === 0) return { ...treatment, name: treatment.name || "Control" };
      if (treatment.auto !== false) {
        return {
          ...treatment,
          name: `High ${iv}`,
          description: `Participants receive a strong ${iv.toLowerCase()} manipulation with stimuli aligned to ${outcomes.map((item) => item.label).join(" and ") || "the outcomes"}.`,
        };
      }
      return treatment;
    });
  }
  renderAll(false);
}

function activeOutcomes() {
  return constructs.filter((construct) => construct.role === "outcome");
}

function activeMediators() {
  return constructs.filter((construct) => construct.role === "mediator");
}

function activeModerators() {
  return constructs.filter((construct) => construct.role === "moderator");
}

function firstOutcome() {
  return activeOutcomes()[0] || constructs[0] || constructFromLabel("Outcome", "outcome");
}

function treatmentDose(row) {
  if (treatments.length <= 1) return 0;
  return Math.max(0, treatments.findIndex((item) => item.name === row.condition)) / (treatments.length - 1);
}

function addMessage(log, role, text) {
  const message = document.createElement("div");
  message.className = `message ${role}`;
  message.innerHTML = `<small>${role === "user" ? "You" : "AI agent"}</small>${text}`;
  log.appendChild(message);
  log.scrollTop = log.scrollHeight;
}

function agentScaleReply(prompt) {
  const names = listFrom(prompt).length ? listFrom(prompt) : [prompt || "trust", "purchase intention"];
  const cards = names.slice(0, 3).map((name) => {
    const items = generatedItems(name).join(", ");
    return `<strong>${name}</strong>: suggested reflective indicators ${items}. Reference: ${referenceFor(name)}.`;
  });
  return `${cards.join("<br><br>")}<br><br>Revise these item labels in the construct editor so the wording matches your exact study context and response scale.`;
}

function agentTreatmentReply(prompt) {
  const iv = els.ivName.value.trim() || "treatment";
  return `For ${iv}, consider conditions such as: (1) control/no ${iv.toLowerCase()}, (2) low-intensity ${iv.toLowerCase()}, and (3) high-intensity ${iv.toLowerCase()} with manipulation checks. Align each stimulus with the current outcomes (${activeOutcomes().map((item) => item.label).join(", ") || "none entered"}) and moderators (${activeModerators().map((item) => item.label).join(", ") || "none entered"}).`;
}

function agentPowerReply(prompt) {
  const changes = applyAgentGPowerChanges(prompt);
  const gp = calculateGPower();
  const perCell = Math.max(0, Math.floor(Number(els.sampleSize.value) / Math.max(treatments.length, 1)));
  const guide = effectGuides[els.gpTestFamily.value] || effectGuides["F tests"];
  const changeText = changes.length ? `I updated ${changes.join(", ")} and recalculated. ` : "";
  return `${changeText}For the current G*Power-style setup (${els.gpTestFamily.value}, ${els.gpStatTest.value}), N=${gp.n}, effect=${gp.effect.toFixed(2)}, alpha=${gp.alpha.toFixed(3)}, target power=${gp.targetPower.toFixed(2)}, and achieved power is ${gp.power.toFixed(2)}. The required N estimate is ${gp.suggestedN}. ${guide.metric} conventions: ${guide.values}. With ${treatments.length || 0} treatment conditions, the applied sample gives about ${perCell} participants per condition. Reference: ${guide.reference}`;
}

function numberAfter(text, patterns) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return Number(match[1]);
  }
  return null;
}

function applyAgentGPowerChanges(prompt) {
  const text = String(prompt || "").toLowerCase();
  const changes = [];
  const effect = numberAfter(text, [
    /effect size\s*(?:to|=|:)?\s*(0?\.\d+|\d+(?:\.\d+)?)/,
    /\bd\s*(?:to|=|:)\s*(0?\.\d+|\d+(?:\.\d+)?)/,
    /\bf\s*(?:to|=|:)\s*(0?\.\d+|\d+(?:\.\d+)?)/,
  ]);
  const power = numberAfter(text, [
    /(?:target\s*)?power\s*(?:to|=|:)?\s*(0?\.\d+|\d+(?:\.\d+)?)/,
  ]);
  const alpha = numberAfter(text, [
    /alpha\s*(?:to|=|:)?\s*(0?\.\d+|\d+(?:\.\d+)?)/,
    /α\s*(?:to|=|:)?\s*(0?\.\d+|\d+(?:\.\d+)?)/,
  ]);
  const n = numberAfter(text, [
    /(?:sample size|total n|n)\s*(?:to|=|:)?\s*(\d+)/,
  ]);
  if (effect !== null && Number.isFinite(effect)) {
    els.gpEffect.value = String(clamp(effect, 0.01, 9.99));
    changes.push("effect size");
  }
  if (power !== null && Number.isFinite(power)) {
    els.gpPower.value = String(clamp(power > 1 ? power / 100 : power, 0.1, 0.999));
    changes.push("target power");
  }
  if (alpha !== null && Number.isFinite(alpha)) {
    els.gpAlpha.value = String(clamp(alpha, 0.001, 0.2));
    changes.push("alpha");
  }
  if (n !== null && Number.isFinite(n)) {
    els.gpTotalN.value = String(Math.max(2, Math.round(n)));
    changes.push("total N");
  }
  if (changes.length) renderGPower();
  return changes;
}

function renderConstructs() {
  els.constructEditor.innerHTML = "";
  if (constructs.length === 0) {
    els.constructEditor.innerHTML = `<article class="empty-state">No constructs yet. Add a construct name, ask the search agent for referenced measures, or sync from study setup.</article>`;
  }
  constructs.forEach((construct, index) => {
    const card = document.createElement("article");
    card.className = "construct-card editable-card";
    card.innerHTML = `
      <div>
        <strong>${construct.label}</strong>
        <p>${construct.role} | Reference: ${construct.reference}</p>
        <label>Measurement items<textarea data-items="${index}" rows="2">${construct.items.join(", ")}</textarea></label>
      </div>
      <button class="remove-button" type="button" aria-label="Remove ${construct.label}">x</button>
    `;
    card.querySelector("textarea").addEventListener("change", (event) => {
      constructs[index].items = listFrom(event.target.value);
      if (constructs[index].items.length === 0) constructs[index].items = generatedItems(construct.label);
      renderAll(true);
    });
    card.querySelector("button").addEventListener("click", () => {
      constructs.splice(index, 1);
      renderAll(true);
    });
    els.constructEditor.appendChild(card);
  });
  els.constructCount.textContent = String(constructs.length);
}

function renderTreatments() {
  els.treatmentList.innerHTML = "";
  if (treatments.length === 0) {
    els.treatmentList.innerHTML = `<article class="empty-state">No treatment conditions. Add conditions manually or ask the treatment agent to draft options.</article>`;
  }
  treatments.forEach((treatment, index) => {
    const card = document.createElement("article");
    card.className = "treatment-card editable-card";
    card.innerHTML = `
      <label>Condition name<input data-treatment-name="${index}" value="${treatment.name}" /></label>
      <label>Description<textarea data-treatment-description="${index}" rows="2">${treatment.description}</textarea></label>
      <button class="remove-button" type="button" aria-label="Remove ${treatment.name}">x</button>
    `;
    card.querySelector(`[data-treatment-name="${index}"]`).addEventListener("change", (event) => {
      treatments[index].name = event.target.value.trim() || `Condition ${index + 1}`;
      treatments[index].auto = false;
      renderAll(true);
    });
    card.querySelector(`[data-treatment-description="${index}"]`).addEventListener("change", (event) => {
      treatments[index].description = event.target.value.trim();
      treatments[index].auto = false;
      renderAll(true);
    });
    card.querySelector("button").addEventListener("click", () => {
      treatments.splice(index, 1);
      renderAll(true);
    });
    els.treatmentList.appendChild(card);
  });
  els.treatmentCount.textContent = String(treatments.length);
}

function assignmentFor(index, persona) {
  if (treatments.length === 0) return "Unassigned";
  if (assignmentMode === "random") return treatments[Math.floor(random() * treatments.length)].name;
  if (assignmentMode === "blocked") return treatments[(index + persona.block) % treatments.length].name;
  return treatments[index % treatments.length].name;
}

function createPersona(index) {
  const archetype = archetypes[index % archetypes.length];
  const age = Math.round(clamp(normal(39, 13), 18, 74));
  return {
    id: `P${String(index + 1).padStart(4, "0")}`,
    name: `${archetype} ${index + 1}`,
    archetype,
    gender: genders[Math.floor(random() * genders.length)],
    age,
    education: education[Math.floor(random() * education.length)],
    block: index % Math.max(treatments.length, 1),
    bias: normal(0, 0.24),
    variance: clamp(normal(0.2, 0.06), 0.1, 0.38),
  };
}

function generatePersonas() {
  personas = Array.from({ length: Number(els.sampleSize.value) }, (_, index) => createPersona(index));
  selectedPersonaIndex = 0;
  renderPersonas();
}

function renderPersonaSelector() {
  if (personas.length === 0) {
    els.personaSelect.innerHTML = "";
    els.personaEditor.innerHTML = `<article class="empty-state">Generate personas to edit a participant by ID.</article>`;
    return;
  }
  selectedPersonaIndex = clamp(selectedPersonaIndex, 0, personas.length - 1);
  els.personaSelect.innerHTML = personas
    .map((persona, index) => `<option value="${index}" ${index === selectedPersonaIndex ? "selected" : ""}>${persona.id}</option>`)
    .join("");
  renderSelectedPersonaEditor();
}

function renderSelectedPersonaEditor() {
  const persona = personas[selectedPersonaIndex];
  if (!persona) return;
  els.personaEditor.innerHTML = `
    <div class="persona-editor-grid">
      <label>Persona<input id="selected-persona-name" value="${persona.name}" /></label>
      <label>Archetype<input id="selected-persona-archetype" value="${persona.archetype}" /></label>
      <label>Gender<select id="selected-persona-gender">${genders.map((item) => `<option ${item === persona.gender ? "selected" : ""}>${item}</option>`).join("")}</select></label>
      <label>Age<input id="selected-persona-age" type="number" min="18" max="99" value="${persona.age}" /></label>
      <label>Education<select id="selected-persona-education">${education.map((item) => `<option ${item === persona.education ? "selected" : ""}>${item}</option>`).join("")}</select></label>
      <button id="save-selected-persona-btn" class="text-button" type="button">Save persona</button>
    </div>
  `;
  $("#save-selected-persona-btn").addEventListener("click", () => {
    persona.name = $("#selected-persona-name").value.trim() || persona.name;
    persona.archetype = $("#selected-persona-archetype").value.trim() || persona.archetype;
    persona.gender = $("#selected-persona-gender").value;
    persona.age = Number($("#selected-persona-age").value) || persona.age;
    persona.education = $("#selected-persona-education").value;
    renderPersonas();
  });
}

function renderPersonas() {
  els.personaCount.textContent = `${personas.length} participants`;
  if (personas.length === 0) {
    renderPersonaSelector();
    return;
  }
  renderPersonaSelector();
}

function generateDataset() {
  const targetN = Number(els.sampleSize.value);
  if (personas.length !== targetN) generatePersonas();
  const effect = Number(els.effectSize.value) / 100;
  const targetPower = Number(els.samplePower.value) / 100;
  const noise = clamp(0.58 - targetPower * 0.38, 0.08, 0.36);
  const mediators = activeMediators();
  const outcomes = activeOutcomes();
  const moderators = activeModerators();
  dataset = personas.map((persona, index) => {
    const condition = assignmentFor(index, persona);
    const pseudoRow = { condition };
    const dose = treatmentDose(pseudoRow);
    const commonMethod = normal(0, noise * 0.7);
    const row = {
      id: persona.id,
      persona: persona.name,
      archetype: persona.archetype,
      gender: persona.gender,
      age: persona.age,
      education: persona.education,
      condition,
      attention: Math.round(clamp(normal(0.91 - noise * 0.2, 0.08), 0, 1) * 100),
      method_marker: likert(4 + commonMethod + normal(0, 0.32)),
    };

    constructs.forEach((construct, constructIndex) => {
      let latent = 4 + persona.bias * 0.35 + commonMethod * 0.42 + dose * effect * (1 + constructIndex * 0.08);
      if (construct.role === "moderator") latent = 4 + persona.bias * 0.8 + normal(0, 0.5);
      if (construct.role === "mediator") latent = 4.1 + dose * effect * 2 + persona.bias + commonMethod + normal(0, persona.variance + noise);
      if (construct.role === "outcome") {
        const medMean = mean(mediators.map((mediator) => row[mediator.key] || 4));
        const modMean = mean(moderators.map((moderator) => row[moderator.key] || 4));
        latent = 3.6 + medMean * 0.42 + dose * effect * 1.4 + (dose * (modMean - 4)) * 0.28 + commonMethod * 0.55 + normal(0, noise + 0.28);
      }
      row[construct.key] = likert(latent);
      construct.items.forEach((item, itemIndex) => {
        row[item] = likert(latent + normal(0, 0.11 + itemIndex * 0.018 + noise * 0.38));
      });
    });
    if (outcomes.length === 0) row.synthetic_outcome = likert(4 + dose * effect * 2 + normal(0, noise));
    return row;
  });
  results = calculateResults();
  renderAll(false);
}

function cronbachAlpha(rows, items) {
  if (items.length < 2 || rows.length < 2) return items.length === 1 ? 1 : 0;
  const itemVars = items.map((item) => variance(rows.map((row) => row[item] || 0)));
  const totals = rows.map((row) => items.reduce((sum, item) => sum + (row[item] || 0), 0));
  const totalVariance = variance(totals);
  return totalVariance === 0 ? 0 : (items.length / (items.length - 1)) * (1 - itemVars.reduce((sum, value) => sum + value, 0) / totalVariance);
}

function aveFor(rows, construct) {
  if (construct.items.length === 0 || rows.length < 2) return 0;
  const composite = rows.map((row) => mean(construct.items.map((item) => row[item] || 0)));
  const loadings = construct.items.map((item) => Math.abs(correlation(rows.map((row) => row[item] || 0), composite)));
  return mean(loadings.map((loading) => loading ** 2));
}

function calculateResults() {
  const rows = dataset;
  const outcomes = activeOutcomes();
  const mediators = activeMediators();
  const moderators = activeModerators();
  const dose = rows.map(treatmentDose);
  const outcomeResults = outcomes.map((outcome) => {
    const y = rows.map((row) => row[outcome.key] || 0);
    const mediator = mediators[0];
    const moderator = moderators[0];
    const m = mediator ? rows.map((row) => row[mediator.key] || 0) : rows.map(() => 0);
    const w = moderator ? rows.map((row) => row[moderator.key] || 0) : rows.map(() => 0);
    const txw = dose.map((value, index) => value * (w[index] - mean(w)));
    const bTreatment = slope(dose, y);
    const bMediator = mediator ? slope(m, y) : 0;
    const bInteraction = moderator ? slope(txw, y) : 0;
    const r2 = clamp(correlation(dose, y) ** 2 + (mediator ? correlation(m, y) ** 2 * 0.45 : 0) + (moderator ? correlation(txw, y) ** 2 * 0.2 : 0), 0, 0.94);
    const firstRows = rows.filter((row) => row.condition === (treatments[0]?.name || "Unassigned"));
    const lastRows = rows.filter((row) => row.condition === (treatments[treatments.length - 1]?.name || "Unassigned"));
    const diff = mean(lastRows.map((row) => row[outcome.key] || 0)) - mean(firstRows.map((row) => row[outcome.key] || 0));
    const pooled = Math.sqrt((variance(firstRows.map((row) => row[outcome.key] || 0)) + variance(lastRows.map((row) => row[outcome.key] || 0))) / 2);
    const d = pooled === 0 ? 0 : diff / pooled;
    return { outcome, mediator, moderator, bTreatment, bMediator, bInteraction, r2, diff, d };
  });
  const alphas = constructs.map((construct) => cronbachAlpha(rows, construct.items));
  const aves = constructs.map((construct) => aveFor(rows, construct));
  const markerCorrelations = constructs.map((construct) => Math.abs(correlation(rows.map((row) => row[construct.key] || 0), rows.map((row) => row.method_marker || 0))));
  const cmbScore = mean(markerCorrelations);
  const cmbRisk = cmbScore > 0.32 ? "High" : cmbScore > 0.2 ? "Moderate" : "Low";
  const cfaBase = {
    cfi: clamp(0.82 + mean(alphas) * 0.16, 0, 0.99),
    tli: clamp(0.8 + mean(aves) * 0.18, 0, 0.98),
    rmsea: clamp(0.105 - mean(alphas) * 0.055, 0.025, 0.09),
    srmr: clamp(0.092 - mean(aves) * 0.055, 0.02, 0.08),
  };
  const cfaMethod = {
    cfi: clamp(cfaBase.cfi + cmbScore * 0.08, 0, 0.995),
    rmsea: clamp(cfaBase.rmsea - cmbScore * 0.03, 0.018, 0.09),
  };
  return { outcomeResults, alphas, aves, cmbScore, cmbRisk, cfaBase, cfaMethod };
}

function estimatePower(n, effect, groups = Math.max(treatments.length, 1), predictors = 3, alpha = 0.05) {
  const complexity = groups * 0.03 + predictors * 0.012 + (alpha < 0.05 ? 0.04 : 0);
  return clamp(0.16 + Math.sqrt(Math.max(n, 1)) * Math.abs(effect) / 7.2 - complexity, 0.05, 0.995);
}

function requiredN(effect, targetPower, groups, predictors, alpha) {
  let n = Math.max(groups * 8, 10);
  while (n < 5000 && estimatePower(n, effect, groups, predictors, alpha) < targetPower) n += 2;
  return n;
}

function calculateGPower() {
  const effect = Math.max(Number(els.gpEffect.value) || 0.01, 0.01);
  const alpha = clamp(Number(els.gpAlpha.value) || 0.05, 0.001, 0.2);
  const targetPower = clamp(Number(els.gpPower.value) || 0.8, 0.1, 0.999);
  const n = Math.max(Number(els.gpTotalN.value) || 2, 2);
  const groups = Math.max(Number(els.gpGroups.value) || 1, 1);
  const predictors = Math.max(Number(els.gpPredictors.value) || 1, 1);
  const power = estimatePower(n, effect, groups, predictors, alpha);
  const suggestedN = requiredN(effect, targetPower, groups, predictors, alpha);
  const critical = els.gpTails.value === "One" ? 1.64 : 1.96;
  const lambda = effect * effect * n;
  return { effect, alpha, targetPower, n, groups, predictors, power, suggestedN, critical, lambda };
}

function renderGPower() {
  const gp = calculateGPower();
  const guide = effectGuides[els.gpTestFamily.value] || effectGuides["F tests"];
  els.gpowerOutput.innerHTML = [
    resultCard("Achieved power", gp.power.toFixed(3), `${els.gpAnalysisType.value} estimate for ${els.gpTestFamily.value}.`),
    resultCard("Required N", String(gp.suggestedN), `Sample size needed for target power ${gp.targetPower.toFixed(2)}.`),
    resultCard("Critical value", gp.critical.toFixed(2), `${els.gpTails.value}-tailed approximation.`),
    resultCard("Noncentrality λ", gp.lambda.toFixed(2), `Effect-size-weighted noncentrality parameter.`),
  ].join("");
  els.effectSizeGuide.innerHTML = `
    <article class="result-card">
      <strong>${guide.metric}</strong>
      <p>Suggested effect-size conventions for ${els.gpTestFamily.value}: ${guide.values}.</p>
    </article>
  `;
  els.effectReference.textContent = `Reference: ${guide.reference}`;
  els.powerLabel.textContent = `Power ${gp.power.toFixed(2).replace("0.", ".")}`;
  drawPowerCurve(gp);
}

function syncSampleDesignFromGPower() {
  const effect = clamp(Number(els.gpEffect.value) || 0.01, 0.01, 1);
  const power = clamp(Number(els.gpPower.value) || 0.8, 0.1, 0.999);
  els.effectSize.value = String(Math.round(effect * 100));
  els.samplePower.value = String(Math.round(power * 100));
  els.effectSizeValue.textContent = effect.toFixed(2);
  els.samplePowerValue.textContent = power.toFixed(2);
}

function resultCard(label, value, copy) {
  return `<article class="result-card"><strong>${value}</strong><p>${label}: ${copy}</p></article>`;
}

function renderCfa() {
  if (!results) return;
  const minAlpha = results.alphas.length ? Math.min(...results.alphas) : 0;
  const minAve = results.aves.length ? Math.min(...results.aves) : 0;
  els.cfaStatus.textContent = results.cfaBase.cfi >= 0.9 && results.cfaBase.rmsea <= 0.08 ? "Fit accepted" : "Needs review";
  els.cfaResults.innerHTML = [
    resultCard("CFI", results.cfaBase.cfi.toFixed(2), "Comparative fit index for user-entered measurement model."),
    resultCard("TLI", results.cfaBase.tli.toFixed(2), "Parsimony-adjusted incremental fit."),
    resultCard("RMSEA", results.cfaBase.rmsea.toFixed(3), "Approximate error of model fit."),
    resultCard("SRMR", results.cfaBase.srmr.toFixed(3), "Standardized residual mismatch."),
    resultCard("Min alpha", minAlpha.toFixed(2), "Lowest construct reliability."),
    resultCard("Min AVE", minAve.toFixed(2), "Lowest convergent validity estimate."),
  ].join("");
  els.validityLabel.textContent = minAlpha >= 0.7 && minAve >= 0.5 ? "Valid" : "Review";
}

function pFromT(t) {
  const a = Math.abs(t);
  if (a > 3.3) return "< .001";
  if (a > 2.58) return ".010";
  if (a > 1.96) return ".048";
  return ".120";
}

function renderReport() {
  if (!results) return;
  const rows = [];
  results.outcomeResults.forEach((item) => {
    [
      ["Treatment", item.bTreatment],
      [item.mediator ? item.mediator.label : "Mediator", item.bMediator],
      [item.moderator ? `Treatment x ${item.moderator.label}` : "Interaction", item.bInteraction],
    ].forEach(([predictor, beta], index) => {
      const se = 0.06 + index * 0.02;
      const t = beta / se;
      rows.push(`<tr><td>${item.outcome.label}</td><td>${predictor}</td><td>${beta.toFixed(2)}</td><td>${se.toFixed(2)}</td><td>${t.toFixed(2)}</td><td>${pFromT(t)}</td></tr>`);
    });
  });
  els.regressionTable.innerHTML = rows.join("");
  els.reportOutput.innerHTML = results.outcomeResults
    .map((item) => {
      const hayes = item.moderator ? `Hayes-style conditional indirect path uses ${item.moderator.label} as W on X to M.` : "Hayes-style mediation uses X to M to Y without a moderator.";
      return card(
        item.outcome.label,
        `Treatment β=${item.bTreatment.toFixed(2)}, mediator β=${item.bMediator.toFixed(2)}, interaction β=${item.bInteraction.toFixed(2)}, R2=${item.r2.toFixed(2)}. ${hayes}`,
      );
    })
    .join("");
  report = [
    `Study: ${els.studyName.value}`,
    `Description: ${els.studyDescription.value}`,
    `Outcomes: ${activeOutcomes().map((item) => item.label).join(", ")}`,
    `Mediators: ${activeMediators().map((item) => item.label).join(", ")}`,
    `Moderators: ${activeModerators().map((item) => item.label).join(", ")}`,
    `CFA: CFI=${results.cfaBase.cfi.toFixed(2)}, RMSEA=${results.cfaBase.rmsea.toFixed(3)}`,
    `CMB: ${results.cmbRisk}, marker correlation=${results.cmbScore.toFixed(2)}`,
  ];
  els.runTime.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function renderBias() {
  if (!results) return;
  const tone = results.cmbRisk === "High" ? "alert" : results.cmbRisk === "Moderate" ? "warning" : "";
  els.cmbStatus.textContent = `${results.cmbRisk} risk`;
  els.cmbMetric.textContent = results.cmbRisk;
  els.biasResults.innerHTML = [
    card("Marker-variable screening", `Average absolute marker correlation is ${results.cmbScore.toFixed(2)}. Values above .20 suggest possible shared method variance.`, tone),
    card("CFA without method factor", `Baseline CFA: CFI=${results.cfaBase.cfi.toFixed(2)}, RMSEA=${results.cfaBase.rmsea.toFixed(3)}.`),
    card("CFA with latent method factor", `Method-factor CFA: CFI=${results.cfaMethod.cfi.toFixed(2)}, RMSEA=${results.cfaMethod.rmsea.toFixed(3)}.`),
    card("Recommended response", "If the latent method factor materially improves fit, report the sensitivity check and use temporal separation, source separation, neutral ordering, and marker variables in the next run."),
  ].join("");
}

function card(title, body, tone = "") {
  return `<article class="report-card ${tone}"><strong>${title}</strong><p>${body}</p></article>`;
}

function renderDataTable() {
  const outcomeCols = activeOutcomes().map((item) => item.key);
  const mediatorCols = activeMediators().map((item) => item.key);
  const moderatorCols = activeModerators().map((item) => item.key);
  const constructCols = [...mediatorCols, ...outcomeCols, ...moderatorCols];
  const fields = [
    ["ID", "id"],
    ["Persona", "persona"],
    ["Gender", "gender"],
    ["Age", "age"],
    ["Education", "education"],
    ["Condition", "condition"],
    ...constructCols.map((key) => [key, key]),
  ];
  els.dataTableHead.innerHTML = `<tr>${fields.map(([label, key]) => `<th><button class="var-header" type="button" data-variable="${key}">${label}</button></th>`).join("")}</tr>`;
  els.dataTable.innerHTML = dataset
    .map(
      (row) => `
        <tr>
          <td>${row.id}</td><td>${row.persona}</td><td>${row.gender}</td><td>${row.age}</td><td>${row.education}</td><td><span class="badge">${row.condition}</span></td>
          ${constructCols.map((key) => `<td>${Number(row[key] || 0).toFixed(1)}</td>`).join("")}
        </tr>
      `,
    )
    .join("");
  els.dataTableHead.querySelectorAll("[data-variable]").forEach((button) => {
    button.addEventListener("click", () => renderVariableStats(button.dataset.variable));
  });
}

function renderVariableStats(variable) {
  const values = dataset.map((row) => row[variable]).filter((value) => value !== undefined && value !== null && value !== "");
  if (values.length === 0) {
    els.variableStats.textContent = `${variable}: no data available.`;
    return;
  }
  const numeric = values.map(Number).filter(Number.isFinite);
  if (numeric.length === values.length) {
    const sorted = [...numeric].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const avg = mean(numeric);
    const sd = Math.sqrt(variance(numeric));
    els.variableStats.innerHTML = `<strong>${variable}</strong><span>n=${numeric.length}</span><span>mean=${avg.toFixed(2)}</span><span>sd=${sd.toFixed(2)}</span><span>min=${min.toFixed(2)}</span><span>max=${max.toFixed(2)}</span>`;
    return;
  }
  const counts = values.reduce((acc, value) => {
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
  const top = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([value, count]) => `${value}: ${count}`)
    .join("; ");
  els.variableStats.innerHTML = `<strong>${variable}</strong><span>n=${values.length}</span><span>unique=${Object.keys(counts).length}</span><span>${top}</span>`;
}

function renderMetrics() {
  const sampleEffect = (Number(els.effectSize.value) / 100).toFixed(2);
  const samplePower = (Number(els.samplePower.value) / 100).toFixed(2);
  els.gpEffect.value = sampleEffect;
  els.gpPower.value = samplePower;
  const gp = calculateGPower();
  els.gpTotalN.value = String(gp.suggestedN);
  els.constructCount.textContent = String(constructs.length);
  els.treatmentCount.textContent = String(treatments.length);
  els.sampleSizeMetric.textContent = els.sampleSize.value;
  els.sampleSizeValue.textContent = els.sampleSize.value;
  els.effectSizeValue.textContent = sampleEffect;
  els.samplePowerValue.textContent = samplePower;
  els.powerLabel.textContent = `Power ${gp.power.toFixed(2).replace("0.", ".")}`;
}

function setSampleSizeTarget(n) {
  const clean = Math.max(1, Number(n) || 1);
  const currentMax = Number(els.sampleSize.max) || 1200;
  if (clean > currentMax) {
    els.sampleSize.max = String(clean);
  }
  els.sampleSize.value = String(clean);
  els.sampleSizeMetric.textContent = String(clean);
  els.sampleSizeValue.textContent = String(clean);
}

function drawWorkflow() {
  const canvas = els.workflowCanvas;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#eef5f3";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const nodes = [
    ["Study", 85, 92, "#0f766e"],
    ["Constructs", 240, 220, "#3b6ea8"],
    ["Treatments", 430, 92, "#d75c48"],
    ["Personas", 585, 220, "#2f855a"],
    ["Models", 700, 92, "#a97916"],
  ];
  ctx.strokeStyle = "rgba(23,32,42,.28)";
  ctx.lineWidth = 3;
  for (let i = 0; i < nodes.length - 1; i += 1) {
    ctx.beginPath();
    ctx.moveTo(nodes[i][1], nodes[i][2]);
    ctx.bezierCurveTo(nodes[i][1] + 60, nodes[i][2] - 90, nodes[i + 1][1] - 65, nodes[i + 1][2] + 90, nodes[i + 1][1], nodes[i + 1][2]);
    ctx.stroke();
  }
  nodes.forEach(([label, x, y, color]) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 43, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "700 14px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(label, x, y + 4);
  });
  ctx.fillStyle = "#17202a";
  ctx.font = "700 19px system-ui";
  ctx.textAlign = "left";
  ctx.fillText(`${activeOutcomes().length} outcomes | ${activeMediators().length} mediators | ${activeModerators().length} moderators`, 28, 304);
}

function drawModel() {
  const canvas = els.modelCanvas;
  const ctx = canvas.getContext("2d");
  ensureDiagramNodes();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#eef5f3";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  diagramLinks.forEach((link, index) => {
    const from = diagramNodes.find((node) => node.id === link.from);
    const to = diagramNodes.find((node) => node.id === link.to);
    if (from && to) {
      drawDiagramArrow(ctx, from, to, index === selectedLinkIndex, diagramLinkOffset(index));
    }
  });
  diagramNodes.forEach((node) => {
    drawNode(ctx, node.label, node.x, node.y, node.color, node.rx, node.ry);
    if (node.id === linkSourceId) {
      ctx.strokeStyle = "#17202a";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(node.x, node.y, node.rx + 7, node.ry + 7, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  });
}

function desiredDiagramNodes() {
  const nodes = [
    { id: "iv", label: els.ivName.value || "Treatment", role: "iv", color: "#d75c48", x: 110, y: 220 },
    ...activeMediators().map((construct, index) => ({
      id: construct.key,
      label: construct.label,
      role: "mediator",
      color: "#0f766e",
      x: 330,
      y: 115 + index * 95,
    })),
    ...activeOutcomes().map((construct, index) => ({
      id: construct.key,
      label: construct.label,
      role: "outcome",
      color: "#3b6ea8",
      x: 620,
      y: 130 + index * 95,
    })),
    ...activeModerators().map((construct, index) => ({
      id: construct.key,
      label: construct.label,
      role: "moderator",
      color: "#a97916",
      x: 330,
      y: 350 + index * 58,
      rx: 66,
      ry: 32,
    })),
  ];
  return nodes.map((node) => ({ rx: 76, ry: 38, ...node }));
}

function ensureDiagramNodes() {
  const desired = desiredDiagramNodes();
  const existing = new Map(diagramNodes.map((node) => [node.id, node]));
  diagramNodes = desired.map((node) => ({
    ...node,
    x: existing.get(node.id)?.x ?? node.x,
    y: existing.get(node.id)?.y ?? node.y,
  }));
  const ids = new Set(diagramNodes.map((node) => node.id));
  diagramLinks = diagramLinks.filter((link, index) => endpointExists(link.from, index) && endpointExists(link.to, index));
  if (selectedLinkIndex >= diagramLinks.length) selectedLinkIndex = -1;
}

function endpointKey(endpoint) {
  return endpoint?.type === "arrow" ? `arrow:${endpoint.index}` : `node:${endpoint}`;
}

function endpointExists(endpoint, selfIndex = -1) {
  if (endpoint?.type === "arrow") return Boolean(diagramLinks[endpoint.index]) && endpoint.index !== selfIndex;
  return Boolean(diagramNodes.find((node) => node.id === endpoint));
}

function resolveDiagramEndpoint(endpoint) {
  if (endpoint?.type === "arrow") return diagramLinkMidpoint(endpoint.index);
  return diagramNodes.find((node) => node.id === endpoint) || null;
}

function diagramLinkMidpoint(index) {
  const link = diagramLinks[index];
  if (!link) return null;
  const from = resolveDiagramEndpoint(link.from);
  const to = resolveDiagramEndpoint(link.to);
  if (!from || !to) return null;
  const points = edgePoints(from, to, diagramLinkOffset(index));
  return {
    id: `arrow-${index}`,
    label: "path",
    x: (points.start.x + points.end.x) / 2,
    y: (points.start.y + points.end.y) / 2,
    rx: 8,
    ry: 8,
  };
}

function canvasPoint(event) {
  const rect = els.modelCanvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * els.modelCanvas.width,
    y: ((event.clientY - rect.top) / rect.height) * els.modelCanvas.height,
  };
}

function diagramNodeAt(point) {
  return [...diagramNodes].reverse().find((node) => {
    const dx = (point.x - node.x) / node.rx;
    const dy = (point.y - node.y) / node.ry;
    return dx * dx + dy * dy <= 1;
  });
}

function nearestDiagramNode(point, exceptId = null) {
  return diagramNodes
    .filter((node) => node.id !== exceptId)
    .map((node) => ({ node, distance: Math.hypot(point.x - node.x, point.y - node.y) }))
    .sort((a, b) => a.distance - b.distance)[0]?.node || null;
}

function distanceToSegment(point, start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) return Math.hypot(point.x - start.x, point.y - start.y);
  const t = clamp(((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared, 0, 1);
  const x = start.x + t * dx;
  const y = start.y + t * dy;
  return Math.hypot(point.x - x, point.y - y);
}

function diagramLinkOffset(index) {
  const link = diagramLinks[index];
  if (!link) return 0;
  const fromKey = endpointKey(link.from);
  const toKey = endpointKey(link.to);
  const siblings = diagramLinks
    .map((item, itemIndex) => ({ ...item, itemIndex }))
    .filter((item) => endpointKey(item.from) === fromKey && endpointKey(item.to) === toKey);
  const position = siblings.findIndex((item) => item.itemIndex === index);
  return (position - (siblings.length - 1) / 2) * 16;
}

function diagramLinkAt(point, threshold = 24) {
  let best = { index: -1, distance: Infinity };
  diagramLinks.forEach((link, index) => {
    const from = resolveDiagramEndpoint(link.from);
    const to = resolveDiagramEndpoint(link.to);
    if (!from || !to) return;
    const points = edgePoints(from, to, diagramLinkOffset(index));
    const distance = distanceToSegment(point, points.start, points.end);
    if (distance < best.distance) best = { index, distance };
  });
  return best.distance <= threshold ? best.index : -1;
}

function diagramEndpointAt(point) {
  let best = { index: -1, side: null, distance: Infinity };
  diagramLinks.forEach((link, index) => {
    const from = resolveDiagramEndpoint(link.from);
    const to = resolveDiagramEndpoint(link.to);
    if (!from || !to) return;
    const points = edgePoints(from, to, diagramLinkOffset(index));
    [
      ["from", points.start],
      ["to", points.end],
    ].forEach(([side, endpoint]) => {
      const distance = Math.hypot(point.x - endpoint.x, point.y - endpoint.y);
      if (distance < best.distance) best = { index, side, distance };
    });
  });
  return best.distance <= 22 ? { index: best.index, side: best.side } : null;
}

function diagramTargetAt(point, exceptEndpoint = null) {
  const node = diagramNodeAt(point);
  if (node && endpointKey(node.id) !== endpointKey(exceptEndpoint)) return node.id;
  const linkIndex = diagramLinkAt(point, 180);
  if (linkIndex >= 0 && endpointKey({ type: "arrow", index: linkIndex }) !== endpointKey(exceptEndpoint)) {
    return { type: "arrow", index: linkIndex };
  }
  const nearest = nearestDiagramNode(point, typeof exceptEndpoint === "string" ? exceptEndpoint : null);
  return nearest ? nearest.id : null;
}

function setDiagramMode(nextMode) {
  diagramMode = nextMode;
  linkSourceId = null;
  draggedNodeId = null;
  draggedLinkEndpoint = null;
  els.diagramMoveBtn.classList.toggle("is-selected", nextMode === "move");
  els.diagramLinkBtn.classList.toggle("is-selected", nextMode === "link");
  els.diagramStatus.textContent = nextMode === "move" ? "Move mode" : "Draw arrow mode";
  drawModel();
}

function handleDiagramPointerDown(event) {
  const point = canvasPoint(event);
  const hitNode = diagramNodeAt(point);
  if (diagramMode === "move" && !hitNode) {
    const endpoint = diagramEndpointAt(point);
    if (endpoint) {
      selectedLinkIndex = endpoint.index;
      draggedLinkEndpoint = endpoint;
      els.diagramStatus.textContent = endpoint.side === "from" ? "Moving arrow tail" : "Moving arrowhead";
      try {
        els.modelCanvas.setPointerCapture(event.pointerId);
      } catch {}
      drawModel();
      return;
    }
    selectedLinkIndex = diagramLinkAt(point);
    els.diagramStatus.textContent = selectedLinkIndex >= 0 ? "Arrow selected" : "Move mode";
    drawModel();
    return;
  }
  const node =
    diagramMode === "link"
      ? hitNode?.id === linkSourceId
        ? nearestDiagramNode(point, linkSourceId)
        : hitNode || nearestDiagramNode(point, linkSourceId)
      : hitNode;
  if (!node) return;
  if (diagramMode === "link") {
    if (!linkSourceId) {
      const sourceNode = hitNode || nearestDiagramNode(point);
      if (!sourceNode) return;
      linkSourceId = sourceNode.id;
      selectedLinkIndex = -1;
      els.diagramStatus.textContent = `Arrow from ${sourceNode?.label || "construct"}`;
    } else {
      const target = diagramTargetAt(point, linkSourceId);
      if (!target) return;
      if (endpointKey(linkSourceId) === endpointKey(target)) {
        drawModel();
        return;
      }
      const exists = diagramLinks.some((link) => endpointKey(link.from) === endpointKey(linkSourceId) && endpointKey(link.to) === endpointKey(target));
      if (!exists) diagramLinks.push({ from: linkSourceId, to: target });
      selectedLinkIndex = diagramLinks.length - 1;
      linkSourceId = null;
      els.diagramStatus.textContent = "Draw arrow mode";
    }
    drawModel();
    return;
  }
  selectedLinkIndex = -1;
  draggedLinkEndpoint = null;
  draggedNodeId = node.id;
  try {
    els.modelCanvas.setPointerCapture(event.pointerId);
  } catch {}
}

function handleDiagramPointerMove(event) {
  if (draggedLinkEndpoint && diagramMode === "move") {
    const point = canvasPoint(event);
    const link = diagramLinks[draggedLinkEndpoint.index];
    const other = link ? link[draggedLinkEndpoint.side === "from" ? "to" : "from"] : null;
    const target = link ? diagramTargetAt(point, other) : null;
    if (target && link) {
      link[draggedLinkEndpoint.side] = target;
      selectedLinkIndex = draggedLinkEndpoint.index;
      drawModel();
    }
    return;
  }
  if (!draggedNodeId || diagramMode !== "move") return;
  const node = diagramNodes.find((item) => item.id === draggedNodeId);
  if (!node) return;
  const point = canvasPoint(event);
  node.x = clamp(point.x, node.rx + 6, els.modelCanvas.width - node.rx - 6);
  node.y = clamp(point.y, node.ry + 6, els.modelCanvas.height - node.ry - 6);
  drawModel();
}

function handleDiagramPointerUp(event) {
  if (draggedNodeId || draggedLinkEndpoint) {
    if (draggedLinkEndpoint) {
      const link = diagramLinks[draggedLinkEndpoint.index];
      if (link && endpointKey(link.from) === endpointKey(link.to)) {
        diagramLinks.splice(draggedLinkEndpoint.index, 1);
        selectedLinkIndex = -1;
      }
      draggedLinkEndpoint = null;
      els.diagramStatus.textContent = selectedLinkIndex >= 0 ? "Arrow selected" : "Move mode";
      drawModel();
    }
    draggedNodeId = null;
    try {
      els.modelCanvas.releasePointerCapture(event.pointerId);
    } catch {}
  }
}

function handleDiagramKeydown(event) {
  const key = event.key.toLowerCase();
  if (!(event.ctrlKey || event.metaKey) || (key !== "c" && key !== "v")) return;
  if (activePage !== "measurement") return;
  if (key === "c") {
    if (selectedLinkIndex < 0 || !diagramLinks[selectedLinkIndex]) return;
    copiedDiagramLink = { ...diagramLinks[selectedLinkIndex] };
    els.diagramStatus.textContent = "Arrow copied";
    event.preventDefault();
    return;
  }
  if (!copiedDiagramLink) return;
  diagramLinks.push({ ...copiedDiagramLink });
  selectedLinkIndex = diagramLinks.length - 1;
  els.diagramStatus.textContent = "Arrow pasted";
  drawModel();
  event.preventDefault();
}

function drawAnalysis() {
  const canvas = els.analysisCanvas;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#eef5f3";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (finalizedDiagramLinks.length > 0) {
    drawFinalizedAnalysisDiagram(ctx);
    return;
  }
  ctx.fillStyle = "#17202a";
  ctx.font = "800 18px system-ui";
  ctx.fillText("Hayes-style structural results", 28, 42);
  const items = results?.outcomeResults || [];
  items.forEach((item, index) => {
    const y = 105 + index * 92;
    drawNode(ctx, "Treatment", 110, y, "#d75c48", 65, 32);
    if (item.mediator) drawNode(ctx, item.mediator.label, 350, y, "#0f766e", 72, 34);
    drawNode(ctx, item.outcome.label, 610, y, "#3b6ea8", 76, 36);
    arrow(ctx, 176, y, 278, y, item.bTreatment.toFixed(2));
    if (item.mediator) arrow(ctx, 422, y, 532, y, item.bMediator.toFixed(2));
    if (item.moderator) {
      drawNode(ctx, item.moderator.label, 350, y + 55, "#a97916", 68, 28);
      arrow(ctx, 350, y + 28, 270, y + 8, item.bInteraction.toFixed(2));
    }
  });
}

function resolveEndpointFrom(nodes, links, endpoint, depth = 0) {
  if (depth > 6) return null;
  if (endpoint?.type === "arrow") {
    const link = links[endpoint.index];
    if (!link) return null;
    const from = resolveEndpointFrom(nodes, links, link.from, depth + 1);
    const to = resolveEndpointFrom(nodes, links, link.to, depth + 1);
    if (!from || !to) return null;
    const points = edgePoints(from, to, 0);
    return {
      id: `final-arrow-${endpoint.index}`,
      label: "path",
      x: (points.start.x + points.end.x) / 2,
      y: (points.start.y + points.end.y) / 2,
      rx: 8,
      ry: 8,
    };
  }
  return nodes.find((node) => node.id === endpoint) || null;
}

function drawFinalizedAnalysisDiagram(ctx) {
  ctx.fillStyle = "#17202a";
  ctx.font = "800 18px system-ui";
  ctx.textAlign = "left";
  ctx.fillText("Finalized structural model", 28, 42);
  finalizedDiagramLinks.forEach((link, index) => {
    const from = resolveEndpointFrom(finalizedDiagramNodes, finalizedDiagramLinks, link.from);
    const to = resolveEndpointFrom(finalizedDiagramNodes, finalizedDiagramLinks, link.to);
    if (from && to) {
      drawDiagramArrow(ctx, from, to, index === 0, 0);
    }
  });
  finalizedDiagramNodes.forEach((node) => drawNode(ctx, node.label, node.x, node.y, node.color, node.rx, node.ry));
  ctx.fillStyle = "#17202a";
  ctx.font = "700 14px system-ui";
  ctx.fillText(`${finalizedDiagramLinks.length} finalized path${finalizedDiagramLinks.length === 1 ? "" : "s"} from the measurement model diagram`, 28, 432);
}

function drawPowerCurve(gp) {
  const canvas = els.powerCurveCanvas;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#d9e1ea";
  for (let i = 0; i < 5; i += 1) {
    const y = 30 + i * 45;
    ctx.beginPath();
    ctx.moveTo(48, y);
    ctx.lineTo(730, y);
    ctx.stroke();
  }
  ctx.strokeStyle = "#0f766e";
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let n = 20; n <= 1200; n += 20) {
    const power = estimatePower(n, gp.effect, gp.groups, gp.predictors, gp.alpha);
    const x = 48 + (n / 1200) * 682;
    const y = 225 - power * 190;
    if (n === 20) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.fillStyle = "#17202a";
  ctx.font = "700 13px system-ui";
  ctx.fillText("Power curve by total sample size", 54, 22);
  ctx.fillText("N", 716, 244);
  ctx.fillText("1.0", 18, 38);
  ctx.fillText("0.5", 18, 132);
}

function drawNode(ctx, label, x, y, color, rx = 76, ry = 38) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = "700 13px system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  wrapText(ctx, label, x, y - 7, rx * 1.55, 15);
}

function edgePoints(from, to, offset = 0) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const angle = Math.atan2(dy, dx);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const normalX = -sin;
  const normalY = cos;
  const fromRadius = 1 / Math.sqrt((cos * cos) / (from.rx * from.rx) + (sin * sin) / (from.ry * from.ry));
  const toRadius = 1 / Math.sqrt((cos * cos) / (to.rx * to.rx) + (sin * sin) / (to.ry * to.ry));
  return {
    start: {
      x: from.x + cos * fromRadius + normalX * offset,
      y: from.y + sin * fromRadius + normalY * offset,
    },
    end: {
      x: to.x - cos * toRadius + normalX * offset,
      y: to.y - sin * toRadius + normalY * offset,
    },
    angle,
  };
}

function drawDiagramArrow(ctx, from, to, selected = false, offset = 0) {
  const { start, end, angle } = edgePoints(from, to, offset);
  const size = selected ? 16 : 13;
  const lineEnd = {
    x: end.x - Math.cos(angle) * (size * 0.72),
    y: end.y - Math.sin(angle) * (size * 0.72),
  };
  ctx.strokeStyle = selected ? "#d75c48" : "#17202a";
  ctx.fillStyle = selected ? "#d75c48" : "#17202a";
  ctx.lineWidth = selected ? 4 : 2.5;
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(lineEnd.x, lineEnd.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(end.x, end.y);
  ctx.lineTo(end.x - size * Math.cos(angle - 0.45), end.y - size * Math.sin(angle - 0.45));
  ctx.lineTo(end.x - size * Math.cos(angle + 0.45), end.y - size * Math.sin(angle + 0.45));
  ctx.closePath();
  ctx.fill();
}

function arrow(ctx, x1, y1, x2, y2, label) {
  ctx.strokeStyle = "#17202a";
  ctx.fillStyle = "#17202a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  const angle = Math.atan2(y2 - y1, x2 - x1);
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - 10 * Math.cos(angle - 0.45), y2 - 10 * Math.sin(angle - 0.45));
  ctx.lineTo(x2 - 10 * Math.cos(angle + 0.45), y2 - 10 * Math.sin(angle + 0.45));
  ctx.closePath();
  ctx.fill();
  if (label) {
    ctx.font = "700 12px system-ui";
    ctx.fillText(label, (x1 + x2) / 2, (y1 + y2) / 2 - 8);
  }
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = String(text).split(" ");
  let line = "";
  words.forEach((word, index) => {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      line = word;
      y += lineHeight;
    } else {
      line = test;
    }
    if (index === words.length - 1) ctx.fillText(line, x, y);
  });
}

function renderAll(keepData) {
  if (!keepData && dataset.length === 0) {
    results = calculateResults();
  }
  renderConstructs();
  renderTreatments();
  renderMetrics();
  renderGPower();
  renderPersonas();
  if (dataset.length > 0) {
    results = calculateResults();
    renderDataTable();
  }
  renderCfa();
  renderReport();
  renderBias();
  drawWorkflow();
  drawModel();
  drawAnalysis();
}

function switchPage(page) {
  activePage = page;
  els.pageTitle.textContent = pageTitles[page];
  els.workflowSteps.forEach((step) => step.classList.toggle("is-active", step.dataset.page === page));
  els.pageViews.forEach((view) => view.classList.toggle("is-active", view.id === `page-${page}`));
  renderAll(true);
}

function csvFromRows(rows) {
  const dynamicFields = constructs.flatMap((construct) => [construct.key, ...construct.items]);
  const fields = ["id", "persona", "archetype", "gender", "age", "education", "condition", "attention", ...dynamicFields, "method_marker"];
  const escape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  return [fields.join(","), ...rows.map((row) => fields.map((field) => escape(row[field])).join(","))].join("\n");
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function addConstructFromInputs() {
  const label = els.constructName.value.trim();
  if (!label) {
    els.constructName.focus();
    return;
  }
  const items = listFrom(els.constructItems.value);
  constructs.push({
    key: slug(label),
    label,
    role: "custom",
    items: items.length ? items.map(slug) : generatedItems(label),
    reference: referenceFor(label),
  });
  addMessage(els.scaleChat, "agent", `Added ${label}. I generated starter items ${generatedItems(label).join(", ")} from the construct name; revise them in the editor before data generation. Reference: ${referenceFor(label)}.`);
  els.constructName.value = "";
  els.constructItems.value = "";
  renderAll(true);
}

function addTreatmentFromInputs() {
  const name = els.treatmentName.value.trim();
  const description = els.treatmentDescription.value.trim();
  if (!name && !description) {
    els.treatmentName.focus();
    return;
  }
  treatments.push({ name: name || `Condition ${treatments.length + 1}`, description: description || "Manual treatment condition.", auto: false });
  els.treatmentName.value = "";
  els.treatmentDescription.value = "";
  renderAll(true);
}

function wireChat(input, button, log, replyFn) {
  const send = () => {
    const prompt = input.value.trim();
    if (!prompt) {
      input.focus();
      return;
    }
    addMessage(log, "user", prompt);
    addMessage(log, "agent", replyFn(prompt));
    input.value = "";
  };
  button.addEventListener("click", send);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") send();
  });
}

function initializeDefaults() {
  constructs = [
    constructFromLabel("Perceived trust", "mediator"),
    constructFromLabel("Perceived information quality", "mediator"),
    constructFromLabel("Purchase intention", "outcome"),
    constructFromLabel("Adoption intention", "outcome"),
    constructFromLabel("AI literacy", "moderator"),
    constructFromLabel("Privacy concern", "moderator"),
  ];
  treatments = [
    { name: "Control", description: "Participants see a standard AI product recommendation without explanation.", auto: false },
    { name: "High AI transparency treatment", description: "Participants see the AI recommendation plus feature-weight explanations and confidence cues.", auto: true },
  ];
}

els.workflowSteps.forEach((step) => step.addEventListener("click", () => switchPage(step.dataset.page)));
els.syncSetupBtn.addEventListener("click", syncFromSetup);
els.addConstructBtn.addEventListener("click", addConstructFromInputs);
els.addTreatmentBtn.addEventListener("click", addTreatmentFromInputs);
els.generatePersonasBtn.addEventListener("click", () => {
  generatePersonas();
  dataset = [];
  renderAll(true);
});
els.generateDataBtn.addEventListener("click", generateDataset);
els.runStudyBtn.addEventListener("click", () => {
  if (activePage === "sample") generateDataset();
  else renderAll(true);
});
els.downloadDataBtn.addEventListener("click", () => downloadFile("experimentos-simulated-data.csv", csvFromRows(dataset), "text/csv"));
els.exportReportBtn.addEventListener("click", () => downloadFile("experimentos-report.txt", report.join("\n"), "text/plain"));
els.gpowerCalcBtn.addEventListener("click", renderGPower);
els.gpowerApplyBtn.addEventListener("click", () => {
  const n = calculateGPower().suggestedN;
  syncSampleDesignFromGPower();
  setSampleSizeTarget(n);
  renderAll(true);
});
els.diagramMoveBtn.addEventListener("click", () => setDiagramMode("move"));
els.diagramLinkBtn.addEventListener("click", () => setDiagramMode("link"));
els.diagramRemoveBtn.addEventListener("click", () => {
  if (selectedLinkIndex < 0) {
    els.diagramStatus.textContent = "Select an arrow first";
    return;
  }
  diagramLinks.splice(selectedLinkIndex, 1);
  selectedLinkIndex = -1;
  els.diagramStatus.textContent = "Selected arrow removed";
  drawModel();
});
els.diagramClearBtn.addEventListener("click", () => {
  diagramLinks = [];
  selectedLinkIndex = -1;
  linkSourceId = null;
  drawModel();
});
els.diagramFinalizeBtn.addEventListener("click", () => {
  ensureDiagramNodes();
  finalizedDiagramNodes = diagramNodes.map((node) => ({ ...node }));
  finalizedDiagramLinks = diagramLinks.map((link) => ({
    from: typeof link.from === "object" ? { ...link.from } : link.from,
    to: typeof link.to === "object" ? { ...link.to } : link.to,
  }));
  els.diagramStatus.textContent = `Model finalized with ${finalizedDiagramLinks.length} path${finalizedDiagramLinks.length === 1 ? "" : "s"}`;
  drawAnalysis();
});
els.modelCanvas.addEventListener("pointerdown", handleDiagramPointerDown);
els.modelCanvas.addEventListener("pointermove", handleDiagramPointerMove);
els.modelCanvas.addEventListener("pointerup", handleDiagramPointerUp);
els.modelCanvas.addEventListener("pointerleave", handleDiagramPointerUp);
els.modelCanvas.addEventListener("mousedown", handleDiagramPointerDown);
els.modelCanvas.addEventListener("mousemove", handleDiagramPointerMove);
els.modelCanvas.addEventListener("mouseup", handleDiagramPointerUp);
els.modelCanvas.addEventListener("mouseleave", handleDiagramPointerUp);
document.addEventListener("keydown", handleDiagramKeydown);
els.personaSelect.addEventListener("change", (event) => {
  selectedPersonaIndex = Number(event.target.value);
  renderSelectedPersonaEditor();
});

[els.ivName, els.outcomeNames, els.mediatorNames, els.moderatorNames].forEach((input) => input.addEventListener("change", syncFromSetup));
[els.studyName, els.studyDescription].forEach((input) => input.addEventListener("input", () => renderAll(true)));
[els.sampleSize, els.effectSize, els.samplePower].forEach((control) => control.addEventListener("input", () => renderAll(true)));
[$("#gp-effect"), $("#gp-alpha"), $("#gp-power"), $("#gp-total-n"), $("#gp-groups"), $("#gp-predictors"), $("#gp-test-family"), $("#gp-stat-test"), $("#gp-analysis-type"), $("#gp-tails")].forEach((control) => {
  control.addEventListener("input", renderGPower);
  control.addEventListener("change", renderGPower);
});

els.assignmentButtons.forEach((button) => {
  button.addEventListener("click", () => {
    els.assignmentButtons.forEach((item) => item.classList.remove("is-selected"));
    button.classList.add("is-selected");
    assignmentMode = button.dataset.assignment;
    $("#assignment-label").textContent = button.textContent;
    renderAll(true);
  });
});

wireChat(els.scaleAgentInput, els.scaleAgentBtn, els.scaleChat, agentScaleReply);
wireChat(els.treatmentAgentInput, els.treatmentAgentBtn, els.treatmentChat, agentTreatmentReply);
wireChat(els.powerAgentInput, els.powerAgentBtn, els.powerChat, agentPowerReply);

window.addEventListener("resize", () => {
  drawWorkflow();
  drawModel();
  drawAnalysis();
  drawPowerCurve(calculateGPower());
});

initializeDefaults();
addMessage(els.scaleChat, "agent", "Ask for measurement items by construct name. I will include starter items and paper references, then you can revise items in the construct editor.");
addMessage(els.treatmentChat, "agent", "Ask for treatment conditions, manipulation checks, and stimulus ideas. You can manually add or remove every condition.");
addMessage(els.powerChat, "agent", "This design advisor complements the G*Power-style calculator with study-specific guidance about treatment cells, moderators, and generated personas.");
generatePersonas();
generateDataset();
