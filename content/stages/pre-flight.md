---
title: "Pre-Flight"
subtitle: "Collect and apostille every document before you board a plane."
description: "Everything you need before you board. Apostilles, criminal background checks, translated diplomas, proof of accommodation, pet and family paperwork."
weight: 2
duration: "4–12 weeks"
requires:
  - "Stage 1 complete: you have chosen a visa pathway and confirmed you meet its income / employer requirements."
  - "A target move month (used to count back apostille and vaccine deadlines)."
documents:
  - "Passport with at least 18 months validity past the move date."
  - "Apostilled birth certificate with sworn translation into Croatian."
  - "Apostilled criminal background check, issued less than 6 months before use."
  - "Diploma with apostille and — if your profession is regulated — formal recognition."
  - "Signed employment contract, Blue Card offer, income proof, or business registration (depending on visa path)."
  - "Registered rental contract or proof of accommodation with landlord's consent to register your address."
  - "International health insurance covering your first 90 days in the EU."
  - "If moving with pets: EU Pet Passport, microchip record, rabies vaccination certificate, and (if required) titer test result."
  - "If moving with family: apostilled marriage and/or birth certificates with sworn translations, plus sponsor income proof."
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
      - label: "Employment contract / Blue Card offer letter from HR employer"
        note: "Blue Card gross minimum updates annually — verify current threshold before signing."
        appliesTo:
          visa: [blue-card, work-permit]
        source:
          url: "https://home-affairs.ec.europa.eu/policies/migration-and-asylum/legal-migration-and-integration/work_en"
          label: "EU Commission — Blue Card documentation"
          asOf: "2026-01-01"
      - label: "Proof of remote income for Digital Nomad application (bank statements / client contracts)"
        note: "3–6 months of statements showing consistent income above the MUP threshold. Foreign employer letter or freelance contracts accepted."
        appliesTo:
          visa: [digital-nomad]
        source:
          url: "https://mup.gov.hr/stay-in-the-republic-of-croatia/281621"
          label: "MUP — digital nomad income proof"
          asOf: "2026-02-15"
      - label: "Croatian business registration (obrt or d.o.o.) complete before permit application"
        note: "Must have a registered entity before applying for self-employment residency. Obrt registration is faster (~3 days)."
        appliesTo:
          visa: [self-employment]
        source:
          url: "https://www.porezna-uprava.hr/en/Pages/default.aspx"
          label: "Porezna uprava — trade registration"
          asOf: "2026-03-01"
  - name: "logistics dry-run"
    items:
      - label: "International health insurance with 90-day EU coverage"
        note: "Local public insurance kicks in only post-registration."
        source:
          url: "https://hzzo.hr/en"
          label: "HZZO — Croatian health insurance"
          asOf: "2026-02-15"
      - label: "Accommodation: landlord agrees to register your address"
        note: "A lease without registration consent is useless for MUP. Confirm before signing."
        source:
          url: "https://mup.gov.hr/stay-in-the-republic-of-croatia/281621"
          label: "MUP — address registration requirements"
          asOf: "2026-02-15"
  - name: "pets — pre-travel"
    items:
      - label: "Microchip (ISO 11784 / 11785) implanted and registered"
        note: "Microchip must precede rabies vaccination. No exceptions."
        appliesTo:
          pets: [dog-cat]
        source:
          url: "https://food.ec.europa.eu/animals/movement-pets_en"
          label: "EU — pet movement rules"
          asOf: "2026-03-01"
      - label: "Rabies vaccination — administered ≥ 21 days before travel"
        note: "Vaccine must be given after microchip. The 21-day window is the absolute minimum."
        appliesTo:
          pets: [dog-cat]
        source:
          url: "https://food.ec.europa.eu/animals/movement-pets_en"
          label: "EU — rabies vaccination requirements"
          asOf: "2026-03-01"
      - label: "Rabies antibody titer test passed (if travelling from unlisted country)"
        note: "The titer test requires 30 days post-vaccination before sampling. Result valid only after 3 months' wait. Start this process 4+ months before your move date."
        appliesTo:
          pets: [dog-cat]
        source:
          url: "https://food.ec.europa.eu/animals/movement-pets/non-eu-countries-listed_en"
          label: "EU — unlisted country rules"
          asOf: "2026-03-01"
      - label: "EU Pet Passport issued by accredited official veterinarian"
        note: "Only an official (government-authorised) vet can issue this. Not your regular clinic unless they hold the designation."
        appliesTo:
          pets: [dog-cat]
        source:
          url: "https://food.ec.europa.eu/animals/movement-pets_en"
          label: "EU — EU Pet Passport"
          asOf: "2026-03-01"
      - label: "Airline pet policy confirmed: cabin vs cargo, carrier dimensions"
        note: "Book pet space when booking the ticket — slots are limited and non-transferable."
        appliesTo:
          pets: [dog-cat, other]
        source:
          url: "https://www.iata.org/en/programs/cargo/live-animals/"
          label: "IATA — live animals regulations"
          asOf: "2026-01-01"
      - label: "Non-EU origin: CITES documentation confirmed (if exotic species)"
        note: "Dogs and cats are exempt. Birds, reptiles, and many mammals require CITES permits."
        appliesTo:
          pets: [other]
        source:
          url: "https://cites.org/eng/disc/what.php"
          label: "CITES — permit requirements"
          asOf: "2026-01-01"
  - name: "family — pre-travel"
    items:
      - label: "Marriage / civil partnership certificate — apostilled + sworn translation"
        note: "Required for spouse residency application. Apostille on the original, not the translation."
        appliesTo:
          family: [spouse, spouse-kids]
        source:
          url: "https://www.hcch.net/en/instruments/conventions/specialised-sections/apostille"
          label: "HCCH — Apostille Convention"
          asOf: "2026-01-01"
      - label: "Birth certificate for each child — apostilled + sworn translation"
        note: "One per child. Each needs its own apostille."
        appliesTo:
          family: [kids, spouse-kids]
        source:
          url: "https://mup.gov.hr/stay-in-the-republic-of-croatia/281621"
          label: "MUP — family reunification docs"
          asOf: "2026-02-15"
      - label: "Spouse's right-to-work status confirmed for your visa type"
        note: "Depends on primary applicant's permit. Family reunification permit often grants work rights; digital nomad permit may not extend to spouse automatically."
        appliesTo:
          family: [spouse, spouse-kids]
        source:
          url: "https://mup.gov.hr/stay-in-the-republic-of-croatia/281621"
          label: "MUP — family reunification"
          asOf: "2026-02-15"
      - label: "School shortlist researched + availability confirmed"
        note: "Zagreb: international schools have waiting lists 6–12 months long. Public school enrolment needs OIB first."
        appliesTo:
          family: [kids, spouse-kids]
        source:
          url: "https://mzo.gov.hr/"
          label: "Ministry of Science & Education — school enrolment"
          asOf: "2026-02-01"
      - label: "Sponsor income threshold for family reunification verified"
        note: "Must demonstrate stable income covering household. Threshold is ~average HR net salary per dependent — verify current figure with MUP."
        appliesTo:
          family: [spouse, kids, spouse-kids]
        source:
          url: "https://mup.gov.hr/stay-in-the-republic-of-croatia/281621"
          label: "MUP — income requirements"
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

Everything you need *before* you board. Apostilled birth certificates, criminal background checks, translated diplomas, pet paperwork, housing shortlist, and an initial look at banks. Expect this stage to take roughly twice as long as you first estimate.
