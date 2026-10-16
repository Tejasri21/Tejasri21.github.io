// Portfolio interactivity: nav toggle, smooth-scroll fallback, and the four
// live demo controllers (TriagePilot, CodeCompass, SecureFlow, A11yGuard).
(function () {
  "use strict";

  /* ---------- shared ---------- */
  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* ---------- mobile nav ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.getElementById("nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A" && links.classList.contains("open")) {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* Fallback smooth scrolling for browsers without CSS scroll-behavior. */
  if (!("scrollBehavior" in document.documentElement.style)) {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var target = document.querySelector(a.getAttribute("href"));
        if (target) { e.preventDefault(); target.scrollIntoView(); }
      });
    });
  }

  /* ---------- mermaid (SecureFlow diagram) ---------- */
  if (window.mermaid) {
    mermaid.initialize({ startOnLoad: false, theme: "dark", securityLevel: "loose" });
  }

  /* ================================================================
     TriagePilot demo — real runs captured from the project (MockLLM).
     ================================================================ */
  var triageReplay = document.getElementById("triage-replay");
  var triageNext = document.getElementById("triage-next");
  var triageReset = document.getElementById("triage-reset");
  var triageState = { key: null, step: 0 };

  function logLine(e) {
    var cls = e.level === "ERROR" ? "err" : (e.level === "WARN" ? "warn" : "");
    return '<div class="' + cls + '">[' + esc(e.level) + '] ' + esc(e.service) + '  ' + esc(e.message) + '</div>';
  }

  function triageSteps(d) {
    var steps = [];

    steps.push({
      title: "1 · The incident",
      html: '<p class="q">' + esc(d.title) + '</p>' +
            '<p>' + esc(d.description) + '</p>' +
            '<div class="log-lines">' + d.logs.map(logLine).join("") + '</div>'
    });

    steps.push({
      title: "2 · LogInvestigator",
      html: '<p>' + esc(d.investigator) + '</p>' +
            '<p><strong>Investigation summary:</strong> ' + esc(d.investigation || d.investigator) + '</p>'
    });

    steps.push({
      title: "3 · SeverityClassifier",
      html: '<p><span class="sev-badge sev-' + esc(d.severity) + '">' + esc(d.severity) +
            '</span> — ' + esc(d.severity_reason) + '</p>'
    });

    var cites = d.citations.map(function (c) {
      return '<li><code>' + esc(c.runbook) + '</code> § ' + esc(c.section) +
             ' <span class="score">(score=' + c.score + ')</span></li>';
    }).join("");
    steps.push({
      title: "4 · RunbookRetriever",
      html: '<p>Top runbook, confidence <span class="score">' + d.retrieval_confidence + '</span> (k=3):</p>' +
            '<ul class="cite-list">' + cites + '</ul>'
    });

    var planItems = d.plan_steps.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join("");
    var planCites = d.plan_citations.map(function (c) {
      return '<li><code>' + esc(c.runbook) + '</code> § ' + esc(c.section) + '</li>';
    }).join("");
    steps.push({
      title: "5 · RemediationPlanner",
      html: '<p>Plan confidence <span class="score">' + d.plan_confidence + '</span> · ' +
            d.latency_ms + ' ms end-to-end:</p>' +
            '<ol class="plan-list">' + planItems + '</ol>' +
            '<p><strong>Citations:</strong></p><ul class="cite-list">' + planCites + '</ul>'
    });

    return steps;
  }

  function triageRender() {
    var d = TRIAGE_DEMOS[triageState.key];
    var steps = triageSteps(d).slice(0, triageState.step);
    triageReplay.innerHTML = steps.map(function (s) {
      return '<div class="step"><p class="step-title">' + esc(s.title) + '</p>' + s.html + '</div>';
    }).join("") +
    (triageState.step >= triageSteps(d).length
      ? '<p class="demo-label">Replay complete — this was a real run of the TriagePilot pipeline.</p>' : '');
    triageNext.disabled = triageState.step >= triageSteps(d).length;
  }

  document.querySelectorAll('[data-demo="triage"]').forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll('[data-demo="triage"]').forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      triageState = { key: btn.getAttribute("data-key"), step: 1 };
      triageNext.disabled = false;
      triageReset.disabled = false;
      triageRender();
    });
  });
  triageNext.addEventListener("click", function () {
    triageState.step += 1;
    triageRender();
  });
  triageReset.addEventListener("click", function () {
    triageState = { key: null, step: 0 };
    triageReplay.innerHTML = '<p class="replay-empty">Choose an incident above to start the replay.</p>';
    triageNext.disabled = true;
    triageReset.disabled = true;
    document.querySelectorAll('[data-demo="triage"]').forEach(function (b) { b.classList.remove("active"); });
  });

  /* ================================================================
     CodeCompass demo — real sessions transcribed from the project README.
     ================================================================ */
  var ccReplay = document.getElementById("codecompass-replay");
  var ccNext = document.getElementById("codecompass-next");
  var ccReset = document.getElementById("codecompass-reset");
  var ccState = { key: null, step: 0 };

  function ccSteps(d) {
    var steps = [];
    steps.push({
      title: "1 · Question",
      html: '<p class="q">' + esc(d.question) + '</p>'
    });
    steps.push({
      title: "2 · QueryPlanner",
      html: '<p>Planner decomposed the question into <strong>' + esc(d.planner) + '</strong>.</p>'
    });
    d.rounds.forEach(function (r, i) {
      var verdict = r.verdict === "sufficient"
        ? '<span class="score">sufficient</span>'
        : '<span style="color:#e3b341;font-weight:600">weak</span>';
      var html = '<p>Round ' + r.n + ': ' +
        (r.chunks ? r.chunks + ' chunks retrieved, ' : '') +
        'critic score <span class="score">' + r.score.toFixed(2) + '</span> ' +
        '(threshold 0.55) → ' + verdict + '.</p>';
      if (r.note) html += '<p><em>' + esc(r.note) + '</em></p>';
      steps.push({ title: "3" + (i > 0 ? "." + (i + 1) : "") + " · Retriever + Critic", html: html });
    });
    if (d.abstained) {
      steps.push({
        title: "4 · Synthesizer — abstains",
        html: '<p class="q">' + esc(d.answer) + '</p>' +
              '<div class="abstain"><strong>[abstained:</strong> no supporting evidence in the codebase]</div>' +
              '<p>The evidence stayed weak after re-retrieval, so the system abstained instead of hallucinating.</p>'
      });
    } else {
      var srcs = d.sources.map(function (s) { return '<li><code>' + esc(s) + '</code></li>'; }).join("");
      steps.push({
        title: "4 · Synthesizer — answer",
        html: '<p class="q">' + esc(d.answer) + '</p>' +
              '<p><strong>Sources:</strong></p><ul class="cite-list">' + srcs + '</ul>'
      });
    }
    return steps;
  }

  function ccRender() {
    var d = CODECOMPASS_DEMOS[ccState.key];
    var steps = ccSteps(d).slice(0, ccState.step);
    ccReplay.innerHTML = steps.map(function (s) {
      return '<div class="step"><p class="step-title">' + esc(s.title) + '</p>' + s.html + '</div>';
    }).join("") +
    (ccState.step >= ccSteps(d).length
      ? '<p class="demo-label">Replay complete — transcribed from a real CodeCompass session.</p>' : '');
    ccNext.disabled = ccState.step >= ccSteps(d).length;
  }

  document.querySelectorAll('[data-demo="codecompass"]').forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll('[data-demo="codecompass"]').forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      ccState = { key: btn.getAttribute("data-key"), step: 1 };
      ccNext.disabled = false;
      ccReset.disabled = false;
      ccRender();
    });
  });
  ccNext.addEventListener("click", function () {
    ccState.step += 1;
    ccRender();
  });
  ccReset.addEventListener("click", function () {
    ccState = { key: null, step: 0 };
    ccReplay.innerHTML = '<p class="replay-empty">Choose a question above to start the replay.</p>';
    ccNext.disabled = true;
    ccReset.disabled = true;
    document.querySelectorAll('[data-demo="codecompass"]').forEach(function (b) { b.classList.remove("active"); });
  });

  /* ================================================================
     SecureFlow demo — walkthrough of a real pipeline run.
     ================================================================ */
  var SF_DIAGRAM = "flowchart TD\n" +
    '    T["Ticket FEAT-101: SSO Login via Okta (OIDC)"]\n' +
    '    US1["US-1: As an enterprise user, I can click \'Sign in with SSO\'…"]\n' +
    '    US2["US-2: …redirected back to the portal after Okta authentication…"]\n' +
    '    US3["US-3: …every SSO login attempt in the audit log…"]\n' +
    '    C1["auth/oidc_client.py — OIDC discovery, token exchange…"]\n' +
    '    C2["auth/session.py — session creation, rotation, expiry."]\n' +
    '    C3["audit/log.py — structured audit events for login attempts."]\n' +
    '    C4["web/login.py — login page, SSO button, callback handler."]\n' +
    "    T --> US1\n    T --> US2\n    T --> US3\n" +
    "    US1 --> C1\n    US1 --> C2\n    US1 --> C3\n    US1 --> C4\n" +
    "    US2 --> C1\n    US2 --> C2\n    US2 --> C3\n    US2 --> C4\n" +
    "    US3 --> C1\n    US3 --> C2\n    US3 --> C3\n    US3 --> C4\n" +
    '    SEC["Security checks: 5 threats mitigated, 6 acceptance criteria"]\n' +
    "    C1 --> SEC\n    C2 --> SEC\n    C3 --> SEC\n    C4 --> SEC\n" +
    '    APPR["Developer approval"]\n    PR["Pull request raised"]\n' +
    "    SEC --> APPR\n    APPR --> PR";

  var SF_GATE_REPORT =
    "# Security gate report\n\n" +
    "## Requirement completeness: PASS\n\n- No findings.\n\n" +
    "## Secret scan: PASS\n\n- No findings.\n\n" +
    "## Banned patterns: FAIL\n\n- app.py:4: banned pattern `eval(`\n- app.py:24: banned pattern `eval(`\n\n" +
    "## Dependency deny-list: FAIL\n\n- requirements.txt: denied dependency `pyyaml==5.3.1` (CVE-2020-14343: arbitrary code execution via yaml.full_load)\n\n" +
    "**Overall: FAIL**";

  var sfReplay = document.getElementById("secureflow-replay");
  var sfNext = document.getElementById("secureflow-next");
  var sfReset = document.getElementById("secureflow-reset");
  var sfStep = 0;

  function sfSteps() {
    return [
      {
        title: "1 · The requirement (FEAT-101: SSO Login via Okta)",
        html: '<p>Add "Sign in with SSO" to the customer portal using Okta as the OIDC identity provider, replacing the legacy username/password form for enterprise tenants.</p>' +
              '<p><strong>User stories:</strong> US-1 — click "Sign in with SSO" and get redirected to Okta; ' +
              'US-2 — return to the portal with a valid session after Okta authentication; ' +
              'US-3 — every SSO login attempt appears in the audit log.</p>' +
              '<p><strong>Acceptance criteria (6):</strong> authorization-code flow with PKCE; ' +
              '<code>state</code>/<code>nonce</code> validated on callback; ID token validated server-side; ' +
              '8-hour session expiry with refresh rotation; generic errors (no user enumeration); 100% audit logging.</p>' +
              '<p><strong>Threat model (5 threats):</strong> token theft, CSRF on callback, token replay, client-secret exposure, user enumeration — each with a mitigation.</p>'
      },
      {
        title: "2 · Generated flow diagram",
        html: '<p>The pipeline turns the requirement into this Mermaid diagram, attached to the PR for reviewers:</p>' +
              '<div class="mermaid-wrap"><div class="mermaid">' + esc(SF_DIAGRAM) + '</div></div>'
      },
      {
        title: "3 · Security gate — real report",
        html: '<p>The gate runs four checks against the sample app. It <strong>fails the PR</strong> on findings:</p>' +
              '<pre class="pr-comment-body">' + esc(SF_GATE_REPORT).replace(/FAIL/g, '<span class="fail">FAIL</span>').replace(/PASS/g, '<span class="pass">PASS</span>') + '</pre>'
      },
      {
        title: "4 · What lands on the pull request",
        html: '<p>The workflow posts the full report as a PR comment, so reviewers see exactly why the PR cannot merge:</p>' +
              '<div class="pr-comment"><div class="pr-comment-header"><strong>github-actions[bot]</strong> commented</div>' +
              '<pre class="pr-comment-body">' + esc(SF_GATE_REPORT).replace(/FAIL/g, '<span class="fail">FAIL</span>').replace(/PASS/g, '<span class="pass">PASS</span>') + '</pre></div>'
      }
    ];
  }

  function sfRender() {
    var steps = sfSteps().slice(0, sfStep);
    sfReplay.innerHTML = steps.map(function (s) {
      return '<div class="step"><p class="step-title">' + esc(s.title) + '</p>' + s.html + '</div>';
    }).join("") +
    (sfStep >= sfSteps().length
      ? '<p class="demo-label">Walkthrough complete — diagram and gate report are from a real pipeline run.</p>' : '');
    // Render any mermaid diagrams that were just injected.
    if (window.mermaid && sfReplay.querySelector(".mermaid")) {
      try { mermaid.run({ nodes: sfReplay.querySelectorAll(".mermaid") }); } catch (e) { /* leave code as-is */ }
    }
    sfNext.disabled = sfStep >= sfSteps().length;
  }

  sfNext.addEventListener("click", function () { sfStep += 1; sfRender(); });
  sfReset.addEventListener("click", function () {
    sfStep = 0;
    sfReplay.innerHTML = '<p class="replay-empty">Press "Next step" to walk through the pipeline.</p>';
    sfNext.disabled = false;
  });
  sfReplay.innerHTML = '<p class="replay-empty">Press "Next step" to walk through the pipeline.</p>';

  /* ================================================================
     A11yGuard demo — tabbed live iframes.
     ================================================================ */
  var tabBtns = document.querySelectorAll(".tab-btn");
  var panels = document.querySelectorAll(".tab-panels iframe");
  tabBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var tab = btn.getAttribute("data-tab");
      tabBtns.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle("active", active);
        b.setAttribute("aria-selected", active ? "true" : "false");
      });
      panels.forEach(function (p) {
        p.hidden = p.getAttribute("data-panel") !== tab;
      });
    });
  });
})();
