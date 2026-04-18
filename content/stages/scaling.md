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
      - label: "Business structure selected"
        note: "Paušalni obrt / obrt / j.d.o.o. / d.o.o. — pick by revenue and liability appetite."
        source:
          url: "https://www.porezna-uprava.hr/en/Pages/default.aspx"
          label: "Porezna uprava — business taxation"
          asOf: "2026-03-01"
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
  - name: "Premium: full tax-optimization playbook"
    kind: "link"
    href: "/waitlist/"
---

Now that you're resident, optimize. Croatia's paušalni obrt (lump-sum trade) is often the right structure for solo SaaS under the revenue cap. Above it: d.o.o. or j.d.o.o. Talk to a local accountant — not a Reddit comment.
