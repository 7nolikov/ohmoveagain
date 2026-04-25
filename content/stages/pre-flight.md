---
title: "Pre-Flight"
subtitle: "Collect and apostille every document before you board a plane."
description: "Everything you need before you board. Apostilles, criminal background checks, translated diplomas, proof of accommodation, pet and family paperwork."
weight: 2
sitemap:
  priority: 0.9
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
  - "If moving with family: apostilled marriage and/or birth certificates (issued within last 6 months) with sworn translations, plus sponsor income proof."
categoryNames:
  travel-docs: "travel docs"
  eligibility-proof: "eligibility proof"
  logistics-dry-run: "logistics dry-run"
  pets-pre-travel: "pets — pre-travel"
  family-pre-travel: "family — pre-travel"
itemStrings:
  passport-validity:
    label: "Passport validity ≥ 18 months from move date"
    note: "Some residency permits require runway past the permit's expiry."
    sourceLabel: "MUP — travel documents (HR)"
  birth-cert-apostilled:
    label: "Apostilled birth certificate + sworn translation"
    note: "Apostille goes on the original, not the translation. Sworn translator in target country ≠ translator at origin."
    sourceLabel: "HCCH — Apostille Convention"
  criminal-background:
    label: "Criminal background check — apostilled, < 6 months old"
    note: "Clock starts the day it's issued, not the day you use it."
    sourceLabel: "Ministry of Justice (HR)"
  diploma-recognition:
    label: "Diploma apostille + recognition (if regulated profession)"
    note: "Software is typically unregulated. Double-check your specific title."
    sourceLabel: "Ministry of Science & Education (HR)"
  accommodation-proof:
    label: "Proof of accommodation for residency filing"
    note: "Landlord signature + registered rental contract usually required."
    sourceLabel: "MUP — residency application docs"
  employment-contract:
    label: "Employment contract / Blue Card offer letter from HR employer"
    note: "Blue Card gross minimum updates annually — verify current threshold before signing."
    sourceLabel: "EU Commission — Blue Card documentation"
  dnv-income-proof:
    label: "Proof of remote income for Digital Nomad application (bank statements / client contracts)"
    note: "3–6 months of statements showing consistent income above the MUP threshold. Foreign employer letter or freelance contracts accepted."
    sourceLabel: "MUP — digital nomad income proof"
  business-registration:
    label: "Croatian business registration (obrt or d.o.o.) complete before permit application"
    note: "Must have a registered entity before applying for self-employment residency. Obrt registration is faster (~3 days)."
    sourceLabel: "Porezna uprava — trade registration"
  intl-health-insurance:
    label: "International health insurance with 90-day EU coverage"
    note: "Local public insurance kicks in only post-registration."
    sourceLabel: "HZZO — Croatian health insurance"
  landlord-registration-consent:
    label: "Accommodation: landlord agrees to register your address"
    note: "A lease without registration consent is useless for MUP. Confirm before signing."
    sourceLabel: "MUP — address registration requirements"
  pet-microchip:
    label: "Microchip (ISO 11784 / 11785) implanted and registered"
    note: "Microchip must precede rabies vaccination. No exceptions."
    sourceLabel: "EU — pet movement rules"
  pet-rabies:
    label: "Rabies vaccination — administered ≥ 21 days before travel"
    note: "Vaccine must be given after microchip. The 21-day window is the absolute minimum."
    sourceLabel: "EU — rabies vaccination requirements"
  pet-titer-test:
    label: "Rabies antibody titer test passed (if travelling from unlisted country)"
    note: "The titer test requires 30 days post-vaccination before sampling. Result valid only after 3 months' wait. Start this process 4+ months before your move date."
    sourceLabel: "EU — unlisted country rules"
  pet-passport:
    label: "EU Pet Passport issued by accredited official veterinarian"
    note: "Only an official (government-authorised) vet can issue this. Not your regular clinic unless they hold the designation."
    sourceLabel: "EU — EU Pet Passport"
  airline-pet-policy:
    label: "Airline pet policy confirmed: cabin vs cargo, carrier dimensions"
    note: "Book pet space when booking the ticket — slots are limited and non-transferable."
    sourceLabel: "IATA — live animals regulations"
  cites-docs:
    label: "Non-EU origin: CITES documentation confirmed (if exotic species)"
    note: "Dogs and cats are exempt. Birds, reptiles, and many mammals require CITES permits."
    sourceLabel: "CITES — permit requirements"
  marriage-cert:
    label: "Marriage / civil partnership certificate — apostilled + sworn translation, issued within the last 6 months"
    note: "MUP rejects marriage certificates older than 6 months from the DATE OF ISSUE (not the apostille date — 2023 policy update). Order a fresh copy from your civil registry right before you apply. Apostille goes on the original, not the translation."
    sourceLabel: "MUP — family reunification document rules"
  child-birth-certs:
    label: "Birth certificate for each child — apostilled + sworn translation"
    note: "One per child. Each needs its own apostille."
    sourceLabel: "MUP — family reunification docs"
  spouse-work-status:
    label: "Spouse's right-to-work status confirmed for your visa type"
    note: "Depends on primary applicant's permit. Family reunification permit often grants work rights; digital nomad permit may not extend to spouse automatically."
    sourceLabel: "MUP — family reunification"
  school-shortlist:
    label: "School shortlist researched + availability confirmed"
    note: "Zagreb: international schools have waiting lists 6–12 months long. Public school enrolment needs OIB first."
    sourceLabel: "Ministry of Science & Education — school enrolment"
  sponsor-income:
    label: "Sponsor income threshold for family reunification verified"
    note: "Must demonstrate stable income covering household. Threshold is ~average HR net salary per dependent — verify current figure with MUP."
    sourceLabel: "MUP — income requirements"
gotchas:
  - "The apostille is on the document, not on the translation. Order matters."
  - "Some consulates require originals AND notarized copies. Bring both."
claimStrings:
  passport-validity:
    impact: "operational-delay"
    explanation: "Passport validity can block boarding, application intake, or permit issuance late in the process."
  birth-cert-apostilled:
    impact: "operational-delay"
    explanation: "Civil status documents often fail because the apostille and translation chain is done in the wrong order."
  criminal-background:
    impact: "operational-delay"
    explanation: "Background checks have a short usable life, so timing matters almost as much as the document itself."
  diploma-recognition:
    impact: "legal-noncompliance"
    explanation: "Recognition is not universal across professions, so this needs category-specific checking."
    conflictNote: "Regulated professions and ordinary private-sector roles are treated differently."
  accommodation-proof:
    impact: "operational-delay"
    explanation: "Address proof is a core filing dependency and weak accommodation documents can stop the process immediately."
  employment-contract:
    impact: "visa-rejection"
    explanation: "Employer-side documentation defines whether this path exists at all."
    conflictNote: "Salary thresholds and document expectations can shift across yearly updates."
  dnv-income-proof:
    impact: "visa-rejection"
    explanation: "Income proof is the core eligibility gate for remote-income routes."
    conflictNote: "Threshold interpretation can drift with policy updates and document examples."
  business-registration:
    impact: "visa-rejection"
    explanation: "You cannot safely assume residency can be filed first and entity paperwork later."
  intl-health-insurance:
    impact: "healthcare-gap"
    explanation: "There is usually a gap between entry and local public insurance onboarding."
  landlord-registration-consent:
    impact: "operational-delay"
    explanation: "A lease without registration cooperation from the landlord can be useless for residency purposes."
  pet-microchip:
    impact: "legal-noncompliance"
    explanation: "Microchip sequencing matters because later veterinary documents depend on it."
  pet-rabies:
    impact: "operational-delay"
    explanation: "Rabies timing rules are strict and are checked mechanically, not generously."
  pet-titer-test:
    impact: "operational-delay"
    explanation: "This rule creates long lead times, so late discovery breaks the move plan."
    conflictNote: "Requirement depends on whether the origin country is listed or unlisted."
  pet-passport:
    impact: "operational-delay"
    explanation: "Pet documents fail when owners use the wrong kind of veterinarian or incomplete paperwork."
  airline-pet-policy:
    impact: "operational-delay"
    explanation: "Airline-level implementation can override generic assumptions about pet transport."
    conflictNote: "Carrier rules differ even when the legal import framework is the same."
  cites-docs:
    impact: "legal-noncompliance"
    explanation: "Non-standard species can trigger an entirely different compliance pathway."
    conflictNote: "Species-specific permit requirements vary more than owners usually expect."
  marriage-cert:
    impact: "operational-delay"
    explanation: "Civil status documents are time-sensitive and often rejected when people rely on old copies."
    conflictNote: "Fresh-issue expectations and local practice can change with administrative guidance."
  child-birth-certs:
    impact: "operational-delay"
    explanation: "Each child creates a separate document dependency chain."
  spouse-work-status:
    impact: "suboptimal-planning"
    explanation: "Secondary applicant work rights affect budget, timing, and route selection."
    conflictNote: "Work rights differ by permit type and cannot be assumed from one visa route to another."
  school-shortlist:
    impact: "suboptimal-planning"
    explanation: "School availability can become a hard relocation blocker for families with children."
  sponsor-income:
    impact: "visa-rejection"
    explanation: "Income thresholds define whether dependents can realistically be added to the move."
    conflictNote: "Threshold practice can change and needs rechecking before filing."
---

Everything you need *before* you board. Apostilled birth certificates, criminal background checks, translated diplomas, pet paperwork, housing shortlist, and an initial look at banks. Expect this stage to take roughly twice as long as you first estimate.

{{< pet-gantt >}}

<div id="pet-countdown"></div>

{{< pet-countdown >}}
