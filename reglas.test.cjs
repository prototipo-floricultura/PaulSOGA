"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const html = fs.readFileSync(path.join(__dirname,"index.html"),"utf8");
const source = fs.readFileSync(path.join(__dirname,"motor.js"),"utf8");
const sandbox = {};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(source, sandbox, {filename:"motor.js"});
const model = sandbox.ClasificadorTFE;

let passed = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    passed += 1;
    process.stdout.write("PASS  " + name + "\n");
  } catch (error) {
    failures.push(name + ": " + error.message);
    process.stdout.write("FAIL  " + name + " — " + error.message + "\n");
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function yesThroughPhase2() {
  const values = {};
  model.PHASES.slice(0, 3).forEach(function (phase) {
    phase.criteria.forEach(function (key) { values[key] = "si"; });
  });
  return values;
}

test("faltantes llevan a la fase 0", function () {
  const result = model.evaluate({});
  assert(result.phase === "0", "se esperaba fase 0");
  assert(result.missing.length === 4, "deben faltar las cuatro condiciones de alineación");
  assert(result.missing.every(function (entry) { return entry.state === "no_comprobado"; }), "los faltantes deben ser no comprobados");
});

test("la secuencia exige fase 1 antes de nube", function () {
  const values = yesThroughPhase2();
  model.PHASES[1].criteria.forEach(function (key) { values[key] = "no_comprobado"; });
  values.repository = "si";
  values.access = "si";
  values.dashboards = "si";
  const result = model.evaluate(values);
  assert(result.phase === "1", "se esperaba fase 1");
  assert(result.warnings.some(function (item) { return item.code === "phase1_prerequisite"; }), "debe advertir dependencia de fase 1");
});

test("una fase posterior declarada no figura completa si faltan prerrequisitos", function () {
  const values = {};
  model.PHASES[1].criteria.forEach(function (key) { values[key] = "si"; });
  model.PHASES[2].criteria.forEach(function (key) { values[key] = "si"; });
  const result = model.evaluate(values);
  const phase1 = result.phaseStates.find(function (item) { return item.id === "1"; });
  const phase2 = result.phaseStates.find(function (item) { return item.id === "2"; });
  assert(result.phase === "0", "la recomendación debe conservarse en fase 0");
  assert(phase1.state === "declared_blocked", "fase 1 debe quedar declarada con prerrequisitos pendientes");
  assert(phase2.state === "declared_blocked", "fase 2 debe quedar declarada con prerrequisitos pendientes");
});

test("la fase 0 acepta recursos preliminares sin exigir TCO completo", function () {
  const values = { scope: "si", governance: "si", baseline: "si", budget: "si" };
  const result = model.evaluate(values);
  assert(result.phase === "1", "los recursos preliminares deben permitir pasar a la primera condición de fase 1");
  assert(model.CRITERIA.budget.title === "Recursos preliminares identificados", "título presupuestal inesperado");
  assert(!model.CRITERIA.budget.prompt.toLowerCase().includes("costo total"), "el criterio de entrada no debe exigir TCO completo");
  assert(model.CRITERIA.budget.output.includes("TCO a tres años antes de invertir"), "debe conservar la advertencia de TCO antes de inversión");
});

test("no recomienda IA cuando no existe caso de uso", function () {
  const values = yesThroughPhase2();
  values.visualCase = "no";
  values.traceabilityNeed = "no";
  const result = model.evaluate(values);
  assert(result.kind === "ready", "la ruta base debe quedar completada");
  assert(result.phase !== "3", "no debe activar fase 3");
  assert(result.notices.some(function (text) { return text.includes("fase 3 no se activa"); }), "debe explicar la no activación de IA");
});

test("caso visual activa fase 3 si faltan sus controles", function () {
  const values = yesThroughPhase2();
  values.visualCase = "si";
  values.imageProtocol = "no";
  values.humanReview = "no_comprobado";
  values.traceabilityNeed = "no";
  const result = model.evaluate(values);
  assert(result.phase === "3", "se esperaba fase 3");
  assert(result.missing.length === 2, "deben faltar protocolo y revisión humana");
});

test("todos los requisitos activados y cumplidos dejan la ruta completa", function () {
  const values = yesThroughPhase2();
  values.visualCase = "si";
  values.imageProtocol = "si";
  values.humanReview = "si";
  values.traceabilityNeed = "si";
  values.custodyIntegration = "si";
  values.traceReports = "si";
  const result = model.evaluate(values);
  assert(result.kind === "ready", "se esperaba ruta completa");
  assert(result.missing.length === 0, "no deben quedar faltantes");
});

test("trazabilidad ampliada exige registros base", function () {
  const values = yesThroughPhase2();
  values.baseEvents = "no";
  values.visualCase = "no";
  values.traceabilityNeed = "si";
  values.custodyIntegration = "si";
  values.traceReports = "si";
  const result = model.evaluate(values);
  assert(result.phase === "1", "debe volver a captura básica");
  assert(result.warnings.some(function (item) { return item.code === "downstream_without_base"; }), "debe advertir trazabilidad sin base");
});

test("la fase 4 puede seguir sin IA cuando la IA no es necesaria", function () {
  const values = yesThroughPhase2();
  values.visualCase = "no";
  values.traceabilityNeed = "si";
  values.custodyIntegration = "no_comprobado";
  values.traceReports = "no_comprobado";
  const result = model.evaluate(values);
  assert(result.phase === "4", "se esperaba fase 4");
  assert(result.notices.some(function (text) { return text.includes("fase 3 no se activa"); }), "debe registrar que IA no se activa");
});

test("las reglas usan solo estados permitidos y referencias H/R", function () {
  assert(model.VALID_STATES.join(",") === "si,no,no_comprobado", "estados inesperados");
  Object.keys(model.CRITERIA).forEach(function (key) {
    const item = model.CRITERIA[key];
    assert(/H\d+/.test(item.refs), key + " carece de referencia H");
    assert(/R-[A-Z]+-\d+/.test(item.refs), key + " carece de referencia R");
  });
});

test("aparecen los quince hallazgos y los quince requisitos documentados", function () {
  const refs = Object.keys(model.CRITERIA).map(function (key) { return model.CRITERIA[key].refs; }).join(" ");
  const expectedFindings = Array.from({ length: 15 }, function (_, index) { return "H" + String(index + 1).padStart(2, "0"); });
  const expectedRequirements = ["R-DAT-01", "R-IOT-01", "R-MNT-01", "R-TRA-01", "R-TRA-02", "R-GOV-01", "R-CHG-01", "R-OPS-01", "R-SEC-01", "R-AI-01", "R-ARC-01", "R-FIN-01", "R-INT-02", "R-LRN-01", "R-SUP-01"];
  expectedFindings.forEach(function (id) { assert(new RegExp("(?:^|\\D)" + id + "(?:\\D|$)").test(refs), "falta " + id); });
  expectedRequirements.forEach(function (id) { assert(refs.includes(id), "falta " + id); });
});

test("archivos locales y política de seguridad restrictiva", function () {
  const scripts = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(m=>m[1]);
  assert(scripts.join(",") === "motor.js,app.js", "scripts inesperados");
  const ui = fs.readFileSync(path.join(__dirname,"app.js"),"utf8");
  ["fetch(", "XMLHttpRequest", "WebSocket", "localStorage", "sessionStorage", "indexedDB", "innerHTML", "eval("].forEach(function(token) {
    assert(!(source+ui).includes(token), "API no permitida: "+token);
  });
  assert(!html.includes("unsafe-inline"), "scripts inline permitidos");
  assert(html.includes("connect-src 'none'"), "falta restricción de conexiones");
});

process.stdout.write("\nResultado: " + passed + " aprobadas, " + failures.length + " fallidas.\n");
if (failures.length) {
  failures.forEach(function (failure) { process.stderr.write("- " + failure + "\n"); });
  process.exit(1);
}
