"use strict";
// Interface uses DOM text nodes, not executable HTML strings or remote services.
(function () {
  const model = window.ClasificadorTFE;
  const byId = id => document.getElementById(id);
  const form = byId("assessmentForm");
  const navigation = byId("phaseNavigation");
  const resultRoot = byId("resultRoot");
  const demoBanner = byId("demoBanner");
  const staleNotice = byId("staleNotice");
  const labels = {si:"Sí", no:"No", no_comprobado:"No comprobado"};
  let currentPhase = 0;
  let hasResult = false;

  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = String(text);
    return element;
  }
  function readAnswers() {
    const values = {};
    Object.keys(model.CRITERIA).forEach(key => { values[key] = form.elements[key].value; });
    return values;
  }
  function criterion(key) {
    const item = model.CRITERIA[key];
    const row = node("div", "criterion" + (item.gate ? " gate" : ""));
    const description = node("div");
    description.append(node("h3", "", item.title), node("p", "", item.prompt), node("div", "trace", item.refs));
    const label = node("label");
    label.htmlFor = "field-" + key;
    const select = node("select");
    select.id = "field-" + key;
    select.name = key;
    select.setAttribute("aria-label", item.title + ": evidencia disponible");
    model.VALID_STATES.forEach(state => {
      const option = node("option", "", labels[state]);
      option.value = state;
      option.selected = state === "no_comprobado";
      select.append(option);
    });
    label.append(node("span", "", "Evidencia disponible"), select);
    row.append(description, label);
    return row;
  }
  function renderCriteria() {
    const root = byId("criteriaRoot");
    root.replaceChildren();
    navigation.replaceChildren();
    model.PHASES.forEach(phase => {
      const section = node("section", "phase-section");
      section.id = "phase-section-" + phase.id;
      section.setAttribute("aria-labelledby", "phase-" + phase.id + "-title");
      const header = node("div", "phase-heading");
      const number = node("span", "phase-heading-number", phase.id);
      number.setAttribute("aria-hidden", "true");
      const text = node("div");
      const title = node("h2", "", "Fase " + phase.id + ". " + phase.name);
      title.id = "phase-" + phase.id + "-title";
      title.tabIndex = -1;
      text.append(title, node("small", "", phase.optional ? "Condicionada a una necesidad comprobada" : "Parte de la secuencia obligatoria"));
      header.append(number, text);
      const list = node("div", "criterion-list");
      (phase.gate ? [phase.gate] : []).concat(phase.criteria).forEach(key => list.append(criterion(key)));
      section.append(header, list);
      root.append(section);
      const button = node("button", "phase-tab");
      button.type = "button";
      button.dataset.phase = phase.id;
      button.setAttribute("aria-controls", section.id);
      const navNumber = node("span", "nav-number", phase.id);
      navNumber.setAttribute("aria-hidden", "true");
      const navText = node("span");
      const count = node("span", "nav-count");
      count.id = "phase-count-" + phase.id;
      navText.append(node("span", "nav-name", phase.name), count);
      button.append(navNumber, navText);
      navigation.append(button);
    });
  }
  function showPhase(index, focus) {
    currentPhase = Math.max(0, Math.min(model.PHASES.length - 1, index));
    model.PHASES.forEach((phase, position) => {
      byId("phase-section-" + phase.id).hidden = position !== currentPhase;
      navigation.querySelector('[data-phase="' + phase.id + '"]').setAttribute("aria-pressed", String(position === currentPhase));
    });
    byId("previousPhase").disabled = currentPhase === 0;
    byId("nextPhase").disabled = currentPhase === model.PHASES.length - 1;
    if (focus) byId("phase-" + model.PHASES[currentPhase].id + "-title").focus();
  }
  function refreshAnswers() {
    const answers = readAnswers();
    const unknown = Object.keys(model.CRITERIA).filter(key => answers[key] === "no_comprobado").length;
    byId("answerSummary").textContent = unknown ? unknown + " de 19 condiciones sin comprobar" : "19 condiciones respondidas con Sí o No";
    model.PHASES.forEach(phase => {
      const keys = (phase.gate ? [phase.gate] : []).concat(phase.criteria);
      const count = keys.filter(key => answers[key] !== "no_comprobado").length;
      byId("phase-count-" + phase.id).textContent = count + "/" + keys.length + " con Sí o No";
    });
    Object.keys(model.CRITERIA).forEach(key => { form.elements[key].dataset.answer = answers[key]; });
  }
  function setAnswers(values) {
    const answers = model.normalizeAnswers(values);
    Object.keys(model.CRITERIA).forEach(key => { form.elements[key].value = answers[key]; });
    refreshAnswers();
  }
  function renderRoute(states) {
    const names = {complete:"Declarada cumplida", declared_blocked:"Declarada, con prerrequisitos pendientes", pending:"Primera pendiente", inactive:"Sin activar", not_reached:"Posterior", awaiting:"Por revisar"};
    const strip = byId("phaseStrip");
    strip.replaceChildren();
    states.forEach(item => {
      const chip = node("div", "phase-chip");
      chip.dataset.state = item.state;
      const number = node("span", "route-number", item.id);
      number.setAttribute("aria-label", "Fase " + item.id);
      const text = node("div");
      text.append(node("strong", "", item.name), node("span", "route-state", names[item.state]));
      chip.append(number, text);
      strip.append(chip);
    });
  }
  function card(title, content, warning) {
    const result = node("div", "result-card" + (warning ? " warning" : ""));
    result.append(node("h3", "", title), content);
    return result;
  }
  function textList(items) {
    const list = node("ul");
    items.forEach(text => list.append(node("li", "", text)));
    return list;
  }
  function renderResult(result) {
    resultRoot.replaceChildren();
    if (!demoBanner.hidden) resultRoot.append(node("div", "notice", demoBanner.textContent));
    const header = node("div", "result-hero " + (result.kind === "ready" ? "ready" : "pending"));
    header.append(node("p", "eyebrow", "Orientación por reglas"), node("h2", "", result.headline), node("p", "", result.explanation));
    header.append(node("p", "reading-note", "Lectura: no se calcula una puntuación, promedio ni nivel de madurez. La regla selecciona el primer prerrequisito pendiente de la secuencia."));
    const grid = node("div", "result-grid");
    if (result.missing.length) {
      const missing = node("ul");
      const outputs = node("ul");
      result.missing.forEach(entry => {
        const item = node("li");
        item.append(node("strong", "", entry.criterion.title), document.createTextNode(" — " + labels[entry.state]), node("div", "trace", entry.criterion.refs));
        missing.append(item);
        const output = node("li", "", entry.criterion.output);
        output.append(node("div", "trace", entry.criterion.refs));
        outputs.append(output);
      });
      grid.append(card("Condiciones no satisfechas", missing), card("Salidas concretas antes de avanzar", outputs));
    } else {
      grid.append(card("Condiciones obligatorias", node("p", "", "Según las respuestas ingresadas, las fases 0, 1 y 2 cuentan con «Sí» en todos sus prerrequisitos. La evidencia debe revisarse antes de aceptar el paso de fase.")));
      grid.append(card("Decisión siguiente", node("p", "", "Conservar evidencias de aceptación, revisar incidentes y activar una fase condicionada solo si existe una necesidad verificable.")));
    }
    if (result.warnings.length) grid.append(card("Incoherencias o dependencias detectadas", textList(result.warnings.map(item=>item.text)), true));
    if (result.notices.length) grid.append(card("Fases condicionadas", textList(result.notices)));
    resultRoot.append(header, grid);
    renderRoute(result.phaseStates);
  }
  function run() {
    const result = model.evaluate(readAnswers());
    renderResult(result);
    hasResult = true;
    staleNotice.hidden = true;
    return result;
  }
  function reset() {
    setAnswers({});
    hasResult = false;
    demoBanner.hidden = true;
    staleNotice.hidden = true;
    const empty = node("div", "empty");
    empty.append(node("strong", "", "La orientación aparecerá aquí"), node("p", "", "Revise las condiciones de cada fase y seleccione «Generar orientación». También puede explorar un ejemplo ficticio."));
    resultRoot.replaceChildren(empty);
    renderRoute(model.PHASES.map(phase=>({id:phase.id,name:phase.name,state:phase.optional?"inactive":"awaiting"})));
    showPhase(0, false);
  }
  function renderTable() {
    const wrap = node("div", "table-wrap");
    const table = node("table", "rules-table");
    const head = node("thead");
    const row = node("tr");
    ["Fase","Condición","Trazabilidad","Evidencia de salida"].forEach(text => row.append(node("th", "", text)));
    head.append(row);
    const body = node("tbody");
    Object.values(model.CRITERIA).forEach(item => {
      const row = node("tr");
      ["Fase " + item.phase, item.title, item.refs, item.output].forEach(text=>row.append(node("td", "", text)));
      body.append(row);
    });
    table.append(head, body);
    wrap.append(table);
    byId("rulesTableWrap").replaceChildren(wrap);
  }
  renderCriteria();
  renderTable();
  reset();
  form.addEventListener("submit", event => { event.preventDefault(); run(); byId("resultTitle").focus(); });
  form.addEventListener("change", () => {
    refreshAnswers();
    staleNotice.hidden = !hasResult;
    if (!demoBanner.hidden) demoBanner.textContent = "Ejemplo ficticio modificado. Las respuestas editadas no representan resultados de campo.";
  });
  navigation.addEventListener("click", event => {
    const button = event.target.closest("[data-phase]");
    if (button) showPhase(Number(button.dataset.phase), true);
  });
  byId("previousPhase").addEventListener("click", () => showPhase(currentPhase - 1, true));
  byId("nextPhase").addEventListener("click", () => showPhase(currentPhase + 1, true));
  byId("resetButton").addEventListener("click", reset);
  byId("printButton").addEventListener("click", () => { run(); window.print(); });
  document.querySelectorAll("[data-demo]").forEach(button => button.addEventListener("click", () => {
    const demo = model.DEMOS[button.dataset.demo];
    setAnswers(demo.values);
    demoBanner.textContent = demo.label + ". Valores ficticios para probar la lógica; no representan una empresa ni resultados de campo.";
    demoBanner.hidden = false;
    run();
    byId("resultTitle").focus();
  }));
  if (window.location.protocol === "file:") {
    byId("zipDownload").hidden = true;
    byId("offlineNotice").hidden = false;
  }
}());
