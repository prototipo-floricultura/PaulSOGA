
  (function (root) {
    "use strict";

    const PHASES = [
      { id: "0", name: "Alineación", optional: false, criteria: ["scope", "governance", "baseline", "budget"] },
      { id: "1", name: "Captura básica", optional: false, criteria: ["dataModel", "offlineCapture", "maintenance", "securityContinuity", "training", "baseEvents"] },
      { id: "2", name: "Nube y tableros", optional: false, criteria: ["repository", "access", "dashboards"] },
      { id: "3", name: "Calidad asistida", optional: true, gate: "visualCase", criteria: ["imageProtocol", "humanReview"] },
      { id: "4", name: "Trazabilidad ampliada", optional: true, gate: "traceabilityNeed", criteria: ["custodyIntegration", "traceReports"] }
    ];

    const CRITERIA = {
      scope: { phase: "0", title: "Alcance y procesos piloto definidos", prompt: "Existe un acta de alcance con procesos críticos, responsables y límites del piloto.", refs: "H11 · R-ARC-01", output: "Acta de alcance, procesos piloto y responsable de decisión." },
      governance: { phase: "0", title: "Gobierno del dato asignado", prompt: "Están designados patrocinador, dueño de proceso, custodio del dato y responsabilidades RACI.", refs: "H06 · R-GOV-01", output: "RACI aprobado y responsables de registro, corrección, acceso y respuesta." },
      baseline: { phase: "0", title: "Línea base y criterios de aceptación", prompt: "La situación inicial, los indicadores y la condición para continuar, ajustar o detener están documentados.", refs: "H11 · R-ARC-01", output: "Línea base, indicadores, criterio de entrada y criterio de salida." },
      budget: { phase: "0", title: "Recursos preliminares identificados", prompt: "Se dispone de un rango preliminar de recursos, una alternativa escalable y un responsable para revisar la viabilidad antes del piloto.", refs: "H12 · R-FIN-01", output: "Rango preliminar de recursos, responsable y nota de viabilidad; completar el TCO a tres años antes de invertir." },
      dataModel: { phase: "1", title: "Variables y formatos comunes", prompt: "Hay diccionario de variables, campos obligatorios, identificadores y reglas de validación comunes.", refs: "H01 · R-DAT-01", output: "Diccionario de datos y reglas de validación aprobados." },
      offlineCapture: { phase: "1", title: "Captura tolerante a desconexión", prompt: "La captura prioritaria puede conservar datos localmente, sincronizar después y registrar el estado de transmisión.", refs: "H02 · R-IOT-01", output: "Prueba de desconexión, recuperación y transmisión sin pérdida." },
      maintenance: { phase: "1", title: "Mantenimiento, soporte y transferencia", prompt: "Dispositivos, calibraciones, repuestos, firmware, soporte, escalamiento y transferencia de conocimiento tienen responsables y calendario.", refs: "H03 · H15 · R-MNT-01 · R-SUP-01", output: "Inventario, calendario de calibración, SLA, exportación de datos y plan de transferencia o salida." },
      securityContinuity: { phase: "1", title: "Seguridad y continuidad operativa", prompt: "Hay cuentas individuales, mínimo privilegio, copias, restauración probada y contingencia manual para picos o fallos.", refs: "H08 · H09 · R-OPS-01 · R-SEC-01", output: "Matriz de acceso, evidencia de restauración probada y procedimiento de contingencia." },
      training: { phase: "1", title: "Formación, revisión humana y aprendizaje documentado", prompt: "Los usuarios participan en el diseño, reciben formación por rol, aplican un protocolo de excepciones y registran incidentes, decisiones, cierres y lecciones para la revisión posterior de cada fase.", refs: "H07 · H14 · R-CHG-01 · R-LRN-01", output: "Plan de formación, evaluación práctica, protocolo de excepciones y repositorio de incidentes, decisiones y lecciones." },
      baseEvents: { phase: "1", title: "Registros base con identificador persistente", prompt: "Cada lote conserva un identificador y registra eventos con fecha, actor, ubicación, estado, decisión y excepción.", refs: "H04 · R-TRA-01", output: "Historial base por lote con identificador persistente y sello de tiempo." },
      repository: { phase: "2", title: "Repositorio central e intercambio documentado", prompt: "Los registros válidos se consolidan en un repositorio común con importación y exportación documentadas.", refs: "H01 · R-DAT-01", output: "Repositorio central, interfaces documentadas y cola de calidad." },
      access: { phase: "2", title: "Usuarios, permisos y responsables de alerta", prompt: "Los perfiles de acceso son coherentes y cada alerta tiene responsable y plazo de atención.", refs: "H06 · H09 · R-GOV-01 · R-SEC-01", output: "Perfiles de acceso, bitácora y matriz de responsables de alertas." },
      dashboards: { phase: "2", title: "Tableros y reportes internos operativos", prompt: "Los indicadores, alertas y reportes internos se generan desde el repositorio común y responden a una necesidad operativa de usuarios responsables.", refs: "H01 · H06 · R-DAT-01 · R-GOV-01", output: "Tablero interno activo, alertas con responsable y reporte operativo reconstruible desde el repositorio." },
      visualCase: { phase: "3", gate: true, title: "Necesidad de calidad visual asistida", prompt: "Existe un caso de uso visual acotado cuya utilidad justifica explorar imágenes; la IA no se activa solo por disponibilidad tecnológica.", refs: "H10 · H11 · R-AI-01 · R-ARC-01", output: "Caso de uso, usuario, decisión apoyada y criterio de éxito." },
      imageProtocol: { phase: "3", title: "Protocolo y muestra de imágenes gobernados", prompt: "Se definieron condiciones de captura, metadatos, etiquetas versionadas y separación de conjuntos para el caso visual.", refs: "H10 · R-AI-01", output: "Protocolo de imagen, repositorio con metadatos y etiquetas versionadas." },
      humanReview: { phase: "3", title: "Validación y decisión humana", prompt: "Están definidos acuerdo entre evaluadores, métricas por clase, umbral de confianza y ruta de revisión humana.", refs: "H07 · H10 · R-CHG-01 · R-AI-01", output: "Plan de validación por variedad y protocolo de revisión humana." },
      traceabilityNeed: { phase: "4", gate: true, title: "Necesidad de trazabilidad ampliada", prompt: "Existe una necesidad verificable de reconstruir cadena de custodia con terceros, frío, despacho o exigencias de cliente.", refs: "H05 · H13 · R-TRA-02 · R-INT-02", output: "Caso de trazabilidad, actores, eventos, consultas y criterio de aceptación." },
      custodyIntegration: { phase: "4", title: "Eventos interoperables con terceros", prompt: "Transferencias y excepciones usan el identificador común, sello de tiempo, reloj de referencia y estado de sincronización.", refs: "H04 · H13 · R-INT-02", output: "API o intercambio de eventos, reglas de conciliación y manejo de excepciones." },
      traceReports: { phase: "4", title: "Reportes externos auditables y cadena de custodia", prompt: "El historial de cadena de custodia y los reportes externos se reconstruyen desde los eventos base y se contrastan con un caso de cliente o auditoría.", refs: "H05 · R-TRA-02", output: "Historial de cadena de custodia consultable y reporte externo auditable contra el dato fuente." }
    };

    const VALID_STATES = ["si", "no", "no_comprobado"];

    function normalizeAnswers(input) {
      const answers = {};
      Object.keys(CRITERIA).forEach(function (key) {
        answers[key] = VALID_STATES.includes(input && input[key]) ? input[key] : "no_comprobado";
      });
      return answers;
    }

    function missingFor(phase, answers) {
      return phase.criteria.filter(function (key) { return answers[key] !== "si"; });
    }

    function firstPendingCore(answers) {
      for (const phase of PHASES.slice(0, 3)) {
        if (missingFor(phase, answers).length) return phase;
      }
      return null;
    }

    function buildWarnings(answers) {
      const warnings = [];
      const phase0Incomplete = missingFor(PHASES[0], answers).length > 0;
      const phase1Incomplete = missingFor(PHASES[1], answers).length > 0;
      const downstream1 = PHASES[1].criteria.some(function (key) { return answers[key] === "si"; });
      const downstream2 = PHASES[2].criteria.some(function (key) { return answers[key] === "si"; });

      if (phase0Incomplete && (downstream1 || downstream2 || answers.visualCase === "si" || answers.traceabilityNeed === "si")) {
        warnings.push({ code: "phase0_prerequisite", text: "Hay condiciones posteriores marcadas como cumplidas, pero la alineación todavía no está completa. La orientación vuelve a la fase 0 porque el alcance, el gobierno, la línea base y los recursos son prerrequisitos." });
      }
      if (!phase0Incomplete && phase1Incomplete && (downstream2 || answers.visualCase === "si" || answers.traceabilityNeed === "si")) {
        warnings.push({ code: "phase1_prerequisite", text: "Hay capacidades posteriores declaradas, pero la captura básica todavía tiene condiciones pendientes. La secuencia vuelve a la fase 1 antes de consolidar nube, calidad asistida o trazabilidad ampliada." });
      }
      if (answers.baseEvents !== "si" && (answers.traceabilityNeed === "si" || answers.custodyIntegration === "si" || answers.traceReports === "si")) {
        warnings.push({ code: "downstream_without_base", text: "Se declaró trazabilidad ampliada sin registros base sustentados con evidencia. Primero se requiere un identificador persistente y eventos mínimos por lote (H04; R-TRA-01)." });
      }
      if (answers.visualCase === "no" && (answers.imageProtocol === "si" || answers.humanReview === "si")) {
        warnings.push({ code: "ai_without_case", text: "Se marcaron capacidades de imágenes, pero no existe una necesidad visual confirmada. La fase 3 no se activa hasta justificar el caso de uso y la decisión que apoyará." });
      }
      return warnings;
    }

    function phaseStatus(phase, answers, recommendation) {
      if (phase.gate && answers[phase.gate] !== "si") return "inactive";
      const position = PHASES.indexOf(phase);
      const requiredPredecessors = PHASES.slice(0, Math.min(position, 3));
      const hasPendingPrerequisite = requiredPredecessors.some(function (previous) {
        return missingFor(previous, answers).length > 0;
      });
      if (!missingFor(phase, answers).length) return hasPendingPrerequisite ? "declared_blocked" : "complete";
      if (recommendation && recommendation.id === phase.id) return "pending";
      return "not_reached";
    }

    function evaluate(input) {
      const answers = normalizeAnswers(input);
      const warnings = buildWarnings(answers);
      let recommendation = firstPendingCore(answers);
      const notices = [];

      if (!recommendation) {
        if (answers.visualCase === "si" && missingFor(PHASES[3], answers).length) {
          recommendation = PHASES[3];
        } else if (answers.visualCase !== "si") {
          notices.push(answers.visualCase === "no"
            ? "La fase 3 no se activa porque no se declaró y sustentó una necesidad de calidad visual asistida."
            : "La fase 3 permanece sin activar hasta comprobar un caso de uso visual; no se presume la necesidad de IA.");
        }
      }

      if (!recommendation) {
        if (answers.traceabilityNeed === "si" && missingFor(PHASES[4], answers).length) {
          recommendation = PHASES[4];
        } else if (answers.traceabilityNeed !== "si") {
          notices.push(answers.traceabilityNeed === "no"
            ? "La fase 4 no se activa porque no se declaró y sustentó una necesidad de trazabilidad ampliada."
            : "La fase 4 permanece sin activar hasta comprobar una necesidad de cadena de custodia ampliada.");
        }
      }

      const missingKeys = recommendation ? missingFor(recommendation, answers) : [];
      const result = {
        kind: recommendation ? "phase" : "ready",
        phase: recommendation ? recommendation.id : null,
        phaseName: recommendation ? recommendation.name : "Ruta base completada",
        answers: answers,
        missing: missingKeys.map(function (key) {
          return { key: key, state: answers[key], criterion: CRITERIA[key] };
        }),
        warnings: warnings,
        notices: notices,
        phaseStates: PHASES.map(function (phase) {
          return { id: phase.id, name: phase.name, state: phaseStatus(phase, answers, recommendation) };
        })
      };

      result.headline = recommendation
        ? "Primera fase pendiente: " + recommendation.id + ". " + recommendation.name
        : "Según las respuestas ingresadas, las fases obligatorias se declaran cumplidas; no hay otra fase activada pendiente";
      result.explanation = recommendation
        ? "La recomendación se detiene en la primera fase con evidencia faltante. Antes de avanzar deben resolverse las condiciones marcadas como «No» o «No comprobado» y contrastarse sus productos de salida con evidencia de la empresa."
        : "Las respuestas ingresadas son «Sí» para las condiciones de las fases 0, 1 y 2. Esta salida orienta la revisión, no certifica el cumplimiento: cada respuesta debe contrastarse con evidencia de la empresa, responsables y criterios de aceptación. Las fases opcionales solo se activan por una necesidad confirmada.";
      return result;
    }

    const DEMOS = {
      manual: {
        label: "Caso demostrativo: operación con base manual",
        values: { scope: "si", governance: "no", baseline: "no_comprobado", budget: "no", dataModel: "no", offlineCapture: "no_comprobado", maintenance: "no_comprobado", securityContinuity: "no_comprobado", training: "si", baseEvents: "no", repository: "no", access: "no_comprobado", dashboards: "no", visualCase: "no_comprobado", imageProtocol: "no_comprobado", humanReview: "no_comprobado", traceabilityNeed: "no_comprobado", custodyIntegration: "no_comprobado", traceReports: "no_comprobado" }
      },
      baseReady: {
        label: "Caso demostrativo: datos y tableros listos, sin necesidad de IA",
        values: { scope: "si", governance: "si", baseline: "si", budget: "si", dataModel: "si", offlineCapture: "si", maintenance: "si", securityContinuity: "si", training: "si", baseEvents: "si", repository: "si", access: "si", dashboards: "si", visualCase: "no", imageProtocol: "no_comprobado", humanReview: "no_comprobado", traceabilityNeed: "no", custodyIntegration: "no_comprobado", traceReports: "no_comprobado" }
      },
      inconsistent: {
        label: "Caso demostrativo: trazabilidad solicitada sin registros base",
        values: { scope: "si", governance: "si", baseline: "si", budget: "si", dataModel: "si", offlineCapture: "si", maintenance: "si", securityContinuity: "si", training: "si", baseEvents: "no", repository: "si", access: "si", dashboards: "si", visualCase: "no", imageProtocol: "no_comprobado", humanReview: "no_comprobado", traceabilityNeed: "si", custodyIntegration: "si", traceReports: "si" }
      }
    };

    root.ClasificadorTFE = Object.freeze({ PHASES: PHASES, CRITERIA: CRITERIA, VALID_STATES: VALID_STATES, DEMOS: DEMOS, evaluate: evaluate, normalizeAnswers: normalizeAnswers });
  }(typeof globalThis !== "undefined" ? globalThis : this));
  