---
title: "Assessment"
subtitle: "Is this move a net-positive commit?"
description: "Model tax residency, cost of living, career optionality, and the real cost of staying — before you run the border."
weight: 1
exitCode: 0
duration: "2–6 weeks"
command: "./move.sh --dry-run"
checklist:
  - name: "tax math"
    items:
      - label: "Model effective tax rate in current vs target"
        note: "Blend income tax + social contributions. Contractors get hit differently than FTEs."
        source:
          url: "https://www.porezna-uprava.hr/en/Pages/default.aspx"
          label: "Porezna uprava — HR tax authority"
          asOf: "2026-03-01"
      - label: "Calculate 3-year runway delta"
        note: "Same annual gross → how many more months of runway does the target country buy you?"
        source:
          url: "/calculator/"
          label: "ohmoveagain — runway calculator"
          asOf: "2026-04-18"
      - label: "Audit exit taxes from source jurisdiction"
        note: "Some countries tax unrealized gains on departure. Model before you trigger."
        source:
          url: "https://www.oecd.org/tax/tax-policy/"
          label: "OECD — tax policy centre"
          asOf: "2026-01-01"
  - name: "visa pathway"
    items:
      - label: "Audit visa / residency pathway for your situation"
        note: "Blue Card, Digital Nomad Visa, or employer sponsorship. Each has a different SLA."
        source:
          url: "https://mup.gov.hr/stay-in-the-republic-of-croatia/281621"
          label: "MUP — stay in Croatia"
          asOf: "2026-02-15"
      - label: "Confirm EU Blue Card threshold (if employee route)"
        note: "Thresholds update annually. Verify current gross minimum before assuming eligibility."
        source:
          url: "https://home-affairs.ec.europa.eu/policies/migration-and-asylum/legal-migration-and-integration/work_en"
          label: "EU Commission — legal migration (Blue Card)"
          asOf: "2026-01-01"
  - name: "reality check"
    items:
      - label: "Audit career market density (local + remote)"
        note: "Local IT salary band, remote-work tolerance, English fluency in hiring."
        source:
          url: "https://survey.stackoverflow.co/"
          label: "Stack Overflow developer survey"
          asOf: "2025-06-01"
      - label: "Stress-test decision with partner / dependents"
        note: "Solo moves are easy mode. Family moves are distributed systems."
gotchas:
  - "Croatia's tax residency triggers at 183 days OR center-of-life — you can become resident before you realize."
  - "Double-taxation treaties don't eliminate paperwork — they cap exposure. Both filings still happen."
artifacts:
  - name: "Runway calculator (HR / MNE / DE / PT / EE)"
    kind: "calc"
    href: "/calculator/"
---

Run the numbers before you run the border. Model tax residency, cost of living, career optionality, and the real cost of *staying*. If the diff is negative, rollback.
