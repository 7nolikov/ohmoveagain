---
title: "Scaling"
subtitle: "Tax optimization, SaaS structure, community integration."
description: "Croatia's paušalni obrt for solo SaaS, d.o.o. / j.d.o.o. above the cap. Verify with a local accountant."
weight: 5
exitCode: 0
duration: "ongoing"
command: "helm upgrade life --set country=hr"
checklist:
  - name: "structure & filing"
    items:
      - label: "Accountant (knjigovođa) retained"
        note: "Flat monthly fee is normal. English-speaking ones charge a premium."
        source:
          url: "https://www.hok.hr/en/"
          label: "HOK — Croatian Chamber of Trades & Crafts"
          asOf: "2026-02-01"
      - label: "Business structure selected: paušalni obrt / obrt / j.d.o.o. / d.o.o."
        note: "Pick by revenue, liability appetite, and visa route. Self-employed permit holders must keep their registered entity active."
        source:
          url: "https://www.porezna-uprava.hr/en/Pages/default.aspx"
          label: "Porezna uprava — business taxation"
          asOf: "2026-03-01"
      - label: "Verify Blue Card does not restrict side-income or second employment"
        note: "Blue Card ties you to a specific employer for the first 2 years. Side projects may require separate authorisation."
        appliesTo:
          visa: [blue-card]
        source:
          url: "https://home-affairs.ec.europa.eu/policies/migration-and-asylum/legal-migration-and-integration/work_en"
          label: "EU Commission — Blue Card conditions"
          asOf: "2026-01-01"
      - label: "Confirm Digital Nomad Visa renewal conditions (income + non-HR employer)"
        note: "Renewal requires same income proof. Working for a HR client voids the visa — your employer must remain foreign."
        appliesTo:
          visa: [digital-nomad]
        source:
          url: "https://mup.gov.hr/stay-in-the-republic-of-croatia/281621"
          label: "MUP — digital nomad renewal"
          asOf: "2026-02-15"
      - label: "VAT registration threshold understood"
        note: "Mandatory registration above the annual threshold (EUR 39,816 in 2025); voluntary below for EU B2B."
        source:
          url: "https://taxation-customs.ec.europa.eu/vat-rules-by-country/croatia_en"
          label: "EU — VAT rules (Croatia)"
          asOf: "2026-01-01"
  - name: "operations"
    items:
      - label: "Invoicing + bookkeeping software wired up"
        note: "Must produce fiskalizirani račun for B2C. Fiskalizacija is a real-time tax-office ping."
        source:
          url: "https://www.porezna-uprava.hr/en/Pages/default.aspx"
          label: "Porezna uprava — fiscalization"
          asOf: "2026-03-01"
      - label: "Pension contribution strategy set"
        note: "Voluntary second pillar top-ups are a legitimate tax-deferral lever."
        source:
          url: "https://www.regos.hr/en/"
          label: "REGOS — central registry of insured persons"
          asOf: "2026-02-01"
  - name: "community"
    items:
      - label: "Local IT community plugged in"
        note: "Zagreb meetups, Infobip events, Croatian Makers, local Slack / Discord."
        source:
          url: "https://www.meetup.com/find/?location=hr--zagreb&source=EVENTS&keywords=tech"
          label: "Meetup — Zagreb tech"
          asOf: "2026-02-01"
gotchas:
  - "Paušalni obrt has annual revenue caps — crossing mid-year is messy."
  - "Tax residency + client location + IP ownership determine where you owe. Don't freelance this."
artifacts:
  - name: "SaaS structure decision tree (HR)"
    kind: "doc"
    href: "#"
  - name: "Full tax-optimization playbook (wip, free)"
    kind: "link"
    href: "/waitlist/"
---

Now that you're resident, optimize. Croatia's paušalni obrt (lump-sum trade) is often the right structure for solo SaaS under the revenue cap. Above it: d.o.o. or j.d.o.o. Talk to a local accountant — not a Reddit comment.
