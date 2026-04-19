---
title: "Initialization"
subtitle: "OIB, address registration, bank account, health card."
description: "Bootstrapping local identity in Croatia: OIB first, address registration, bank, health insurance. Order matters."
weight: 4
exitCode: 0
duration: "2–6 weeks post-arrival"
command: "./init.sh --country=hr"
checklist:
  - name: "identity bootstrap"
    items:
      - label: "OIB (personal identification number) issued"
        note: "Free, ~same-day at Porezna uprava. Prerequisite for everything else."
        source:
          url: "https://www.porezna-uprava.hr/en/Pages/default.aspx"
          label: "Porezna uprava — OIB issuance"
          asOf: "2026-03-01"
      - label: "Address registration (prijava boravišta)"
        note: "MUP (police administration). Required for residency card."
        source:
          url: "https://mup.gov.hr/stay-in-the-republic-of-croatia/281621"
          label: "MUP — address registration"
          asOf: "2026-02-15"
      - label: "Residency permit card issued"
        note: "Plastic card; biometric appointment may be needed."
        source:
          url: "https://mup.gov.hr/stay-in-the-republic-of-croatia/281621"
          label: "MUP — residency permits"
          asOf: "2026-02-15"
  - name: "financial & medical"
    items:
      - label: "Local bank account opened"
        note: "Revolut / Wise work as bridges but aren't SEPA-native for salary. Zagrebačka, Erste, PBZ are EU-friendly."
        source:
          url: "https://www.hanfa.hr/en/"
          label: "HANFA — HR financial services authority"
          asOf: "2026-02-01"
      - label: "Health insurance (HZZO) enrolled"
        note: "Mandatory. Kicks in from registration date."
        source:
          url: "https://hzzo.hr/en"
          label: "HZZO — Croatian health insurance"
          asOf: "2026-02-15"
      - label: "Tax residency status clarified in writing"
        note: "Request a certificate — needed for DTA claims."
        source:
          url: "https://www.porezna-uprava.hr/en/Pages/default.aspx"
          label: "Porezna uprava — tax residency certificate"
          asOf: "2026-03-01"
  - name: "family registration"
    items:
      - label: "OIB issued for each dependent (spouse + each child)"
        note: "Each family member needs their own OIB. Same Porezna uprava appointment can cover all."
        appliesTo:
          family: [spouse, kids, spouse-kids]
        source:
          url: "https://www.porezna-uprava.hr/en/Pages/default.aspx"
          label: "Porezna uprava — OIB for dependents"
          asOf: "2026-03-01"
      - label: "HZZO family coverage registered for spouse and children"
        note: "Dependents must be added explicitly — they don't inherit your coverage automatically."
        appliesTo:
          family: [spouse, kids, spouse-kids]
        source:
          url: "https://hzzo.hr/en"
          label: "HZZO — family health insurance"
          asOf: "2026-02-15"
      - label: "Children enrolled in school (requires OIB + registered address)"
        note: "Public school: OIB + address + health card. International school: waiting list may already be long."
        appliesTo:
          family: [kids, spouse-kids]
        source:
          url: "https://mzo.gov.hr/"
          label: "Ministry of Education — enrolment"
          asOf: "2026-02-01"
      - label: "Non-EU spouse: family reunification application submitted to MUP"
        note: "Apply after primary applicant has residency card. Spouse can remain on tourist exemption (90 days) while waiting."
        appliesTo:
          family: [spouse, spouse-kids]
        source:
          url: "https://mup.gov.hr/stay-in-the-republic-of-croatia/281621"
          label: "MUP — family reunification application"
          asOf: "2026-02-15"
  - name: "pets post-arrival"
    items:
      - label: "Croatian official vet visit within 10 days of arrival"
        note: "Required for any follow-up vaccinations. Also establishes your local vet relationship."
        appliesTo:
          pets: [dog-cat, other]
        source:
          url: "https://veterinarstvo.hr/"
          label: "Veterinary Directorate (HR)"
          asOf: "2026-02-01"
      - label: "Microchip registered in Croatian database (Lysacan)"
        note: "Even with an EU Pet Passport, you must register the chip in HR's national database."
        appliesTo:
          pets: [dog-cat]
        source:
          url: "https://www.lysacan.hr/"
          label: "Lysacan — HR pet microchip registry"
          asOf: "2026-02-01"
      - label: "Dog registered with local municipality (e.g. City of Zagreb)"
        note: "Annual registration fee applies. Fine for non-compliance is significant."
        appliesTo:
          pets: [dog-cat]
        source:
          url: "https://www.zagreb.hr/"
          label: "City of Zagreb — dog registration"
          asOf: "2026-03-01"
gotchas:
  - "Some banks refuse non-EU passport holders without a permanent residency card — shortlist EU-friendly banks before arrival."
  - "Address registration requires landlord's notarized signature in some municipalities."
artifacts:
  - name: "OIB application walkthrough"
    kind: "doc"
    href: "#"
  - name: "Bank comparison (HR retail banks)"
    kind: "doc"
    href: "#"
---

Bootstrapping local identity. In Croatia: OIB first, address registration second, bank third, health insurance fourth. Order matters — each unblocks the next.
