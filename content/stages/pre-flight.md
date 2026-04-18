---
title: "Pre-Flight"
subtitle: "Document pipeline, apostilles, logistics dry-run."
description: "Everything you need before you board. Apostilles, criminal background checks, translated diplomas, proof of accommodation."
weight: 2
exitCode: 0
duration: "4–12 weeks"
command: "make pre-flight"
checklist:
  - name: "travel docs"
    items:
      - label: "Passport validity ≥ 18 months from move date"
        note: "Some residency permits require runway past the permit's expiry."
        source:
          url: "https://mup.gov.hr/"
          label: "MUP — travel documents (HR)"
          asOf: "2026-02-15"
      - label: "Apostilled birth certificate + sworn translation"
        note: "Apostille goes on the original, not the translation. Sworn translator in target country ≠ translator at origin."
        source:
          url: "https://www.hcch.net/en/instruments/conventions/specialised-sections/apostille"
          label: "HCCH — Apostille Convention"
          asOf: "2026-01-01"
      - label: "Criminal background check — apostilled, < 6 months old"
        note: "Clock starts the day it's issued, not the day you use it."
        source:
          url: "https://pravosudje.gov.hr/"
          label: "Ministry of Justice (HR)"
          asOf: "2026-02-01"
  - name: "eligibility proof"
    items:
      - label: "Diploma apostille + recognition (if regulated profession)"
        note: "Software is typically unregulated. Double-check your specific title."
        source:
          url: "https://mzo.gov.hr/"
          label: "Ministry of Science & Education (HR)"
          asOf: "2026-02-01"
      - label: "Proof of accommodation for residency filing"
        note: "Landlord signature + registered rental contract usually required."
        source:
          url: "https://mup.gov.hr/stay-in-the-republic-of-croatia/281621"
          label: "MUP — residency application docs"
          asOf: "2026-02-15"
      - label: "Proof of funds / employment contract / Blue Card offer"
        note: "Blue Card gross minimum updates annually — verify current threshold."
        source:
          url: "https://home-affairs.ec.europa.eu/policies/migration-and-asylum/legal-migration-and-integration/work_en"
          label: "EU Commission — legal migration"
          asOf: "2026-01-01"
  - name: "logistics dry-run"
    items:
      - label: "Pet paperwork (EU pet passport, rabies titer if applicable)"
        note: "Titer test has a multi-month lead time in some corridors."
        source:
          url: "https://food.ec.europa.eu/animals/movement-pets_en"
          label: "EU — movement of pets"
          asOf: "2026-01-01"
      - label: "International health insurance with 90-day EU coverage"
        note: "Local public insurance kicks in only post-registration."
        source:
          url: "https://hzzo.hr/en"
          label: "HZZO — Croatian health insurance"
          asOf: "2026-02-15"
gotchas:
  - "The apostille is on the document, not on the translation. Order matters."
  - "Some consulates require originals AND notarized copies. Bring both."
artifacts:
  - name: "Apostille checklist (printable)"
    kind: "doc"
    href: "#"
  - name: "Document tracker (spreadsheet)"
    kind: "template"
    href: "#"
---

Everything you need *before* you board. Apostilled birth certificates, criminal background checks, translated diplomas, pet paperwork, housing shortlist, bank account reconnaissance.
