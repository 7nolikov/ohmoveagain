---
title: "Scaling"
subtitle: "Settle in: lock down your tax setup, pick a business structure, and put down roots."
description: "Now that you are resident: pick the right business structure, plan taxes, build a local network. Verify every tax decision with a licensed Croatian accountant."
weight: 5
sitemap:
  priority: 0.9
duration: "ongoing"
requires:
  - "Stage 4 complete: you have OIB, registered address, residency card, bank account, and HZZO coverage."
  - "A realistic estimate of your annual gross income for the next 12 months."
documents:
  - "Signed engagement with a local accountant (knjigovođa)."
  - "Business-structure registration confirmation: paušalni obrt, standard obrt, j.d.o.o., or d.o.o."
  - "Invoicing and bookkeeping software configured for Croatian fiscalization rules."
  - "Written pension contribution plan (voluntary second-pillar top-ups where relevant)."
  - "A short list of local professional groups, meetups, or communities you have joined."
categoryNames:
  structure-filing: "structure & filing"
  renewals: "permit renewals"
  long-term: "long-term status"
  operations: "operations"
  community: "community"
itemStrings:
  accountant:
    label: "Accountant (knjigovođa) retained"
    note: "Flat monthly fee is normal. English-speaking ones charge a premium."
    sourceLabel: "HOK — Croatian Chamber of Trades & Crafts"
  business-structure:
    label: "Business structure selected: paušalni obrt / obrt / j.d.o.o. / d.o.o."
    note: "Pick by revenue, liability appetite, and visa route. Self-employed permit holders must keep their registered entity active."
    sourceLabel: "Porezna uprava — business taxation"
  blue-card-sideincome:
    label: "Verify Blue Card does not restrict side-income or second employment"
    note: "Blue Card ties you to a specific employer for the first 2 years. Side projects may require separate authorisation."
    sourceLabel: "EU Commission — Blue Card conditions"
  dnv-renewal:
    label: "Confirm Digital Nomad Visa renewal conditions (income + non-HR employer)"
    note: "Renewal requires same income proof. Working for a HR client voids the visa — your employer must remain foreign."
    sourceLabel: "MUP — digital nomad renewal"
  permit-renewal-window:
    label: "File renewal 30–60 days before expiry — never after"
    note: "Renewal isn't automatic. Family-reunification dependents follow the primary holder — their renewal is filed as part of the same packet, with the sponsor's continued income proof attached."
    sourceLabel: "MUP — residence permit renewal"
  blue-card-renewal:
    label: "Re-verify Blue Card salary threshold + employer continuity at renewal"
    note: "Salary floor is rechecked at renewal (threshold updates yearly). Employer-tie sunsets after 18 months — intra-EU mobility opens after that. Long-term EU residence unlocks at 5 years aggregated across member states."
    sourceLabel: "EU Commission — Blue Card renewal"
  work-permit-renewal:
    label: "Plan annual work-permit renewal + labour-market re-test"
    note: "Standard work permits are issued for 1 year and require a fresh labour-market test at each renewal unless your sector is exempted. Employer must initiate — start 60 days out."
    sourceLabel: "MUP — work permit renewal"
  vat-threshold:
    label: "VAT registration threshold understood"
    note: "Mandatory registration above the current annual threshold (re-verify yearly — figure changes with budget cycle); voluntary below for EU B2B."
    sourceLabel: "EU — VAT rules (Croatia)"
  invoicing-bookkeeping:
    label: "Invoicing + bookkeeping software wired up"
    note: "Must produce fiskalizirani račun for B2C. Fiskalizacija is a real-time tax-office ping."
    sourceLabel: "Porezna uprava — fiscalization"
  pension-strategy:
    label: "Pension contribution strategy set"
    note: "Voluntary second pillar top-ups are a legitimate tax-deferral lever."
    sourceLabel: "REGOS — central registry of insured persons"
  permanent-residence-path:
    label: "Plan the 5-year path to permanent residence (stalni boravak)"
    note: "After 5 years of continuous legal residence: A2 Croatian, clean criminal record, stable means of subsistence, valid health insurance. Continuous = absences under 6 months in any year and under 10 months total over the 5-year window. Breaks reset the clock."
    sourceLabel: "MUP — permanent residence"
  citizenship-path:
    label: "Map the citizenship path (~8 years to Croatian passport)"
    note: "Naturalization typically requires 8 years of legal residence (or 5 with stalni boravak), B1 Croatian, integration test, and clean record. Croatia generally allows dual citizenship — but check whether your origin country revokes on naturalization. Plan early; document continuity matters."
    sourceLabel: "MUP — Croatian citizenship"
  it-community:
    label: "Local IT community plugged in"
    note: "Zagreb meetups, Infobip events, Croatian Makers, local Slack / Discord."
    sourceLabel: "Meetup — Zagreb tech"
gotchas:
  - "Watch the paušalni obrt revenue ceiling — crossing mid-year forces a messy structure switch."
  - "Don't improvise tax residency — what you owe is set by residency, client location, and IP ownership together."
  - "Renewal filed late = overstayer status, even by one day. Set a calendar reminder 90 days before expiry, not 30."
  - "Time outside Croatia counts against permanent-residence eligibility — long sabbaticals or remote stints abroad can reset the 5-year clock."
claimStrings:
  accountant:
    impact: "suboptimal-planning"
    explanation: "Local accounting practices define compliance and reporting structure."
  business-structure:
    consequence: "Stuck on the full corporate rate forever — restructuring usually means a new entity, not an edit"
    impact: "financial-cost"
    explanation: "Structure decisions compound over years and are hard to reverse cleanly."
    conflictNote: "Best structure depends on income profile and liability tolerance."
  blue-card-sideincome:
    consequence: "Blue Card revoked for unauthorised income — single-employer rule is strict"
    impact: "legal-noncompliance"
    explanation: "Secondary work may conflict with permit conditions."
    conflictNote: "Interpretation differs across member states and contracts."
  dnv-renewal:
    consequence: "Permit lapses, you become an overstayer — Croatia entry ban for years"
    impact: "visa-rejection"
    explanation: "Renewal rules must be satisfied continuously, not just at entry."
  vat-threshold:
    consequence: "Back-VAT plus penalty — Porezna pursues retroactively, can run to tens of thousands of euros"
    impact: "legal-noncompliance"
    explanation: "VAT obligations change financial reporting and pricing structure."
    conflictNote: "Threshold values change periodically and require rechecking."
  invoicing-bookkeeping:
    impact: "operational-delay"
    explanation: "Compliance systems must align with Croatian fiscalization requirements."
  pension-strategy:
    impact: "suboptimal-planning"
    explanation: "Pension contributions can be optimized but are often overlooked."
  permit-renewal-window:
    consequence: "Filed late = overstayer status — entry ban risk, even with a pending application"
    impact: "visa-renewal-failure"
    explanation: "Croatia does not auto-renew. The window opens 60 days before expiry; outside of it, you have no legal status while waiting."
  blue-card-renewal:
    consequence: "Renewal denied if salary slips below the current threshold — Blue Card lapses, fall back to a work permit if possible"
    impact: "visa-renewal-failure"
    explanation: "The salary floor is re-evaluated at each renewal against the year's published threshold, not the one you originally qualified under."
    conflictNote: "Mobility rules and long-term residence accrual differ by member state — verify before assuming portability."
  work-permit-renewal:
    consequence: "Labour-market test re-runs each year — if a HR/EU candidate is found, renewal is denied"
    impact: "visa-renewal-failure"
    explanation: "The 1-year cycle keeps the test live. Employer drives the filing; gaps in their compliance are the most common renewal failure."
  permanent-residence-path:
    impact: "suboptimal-long-term-planning"
    explanation: "Permanent residence removes annual renewal overhead and unlocks the citizenship clock. Continuous-residence and language requirements are the gating conditions."
    conflictNote: "Time-abroad tolerances differ from EU long-term residence rules — Croatia's domestic rules are stricter on absences."
  citizenship-path:
    impact: "suboptimal-long-term-planning"
    explanation: "Citizenship rules and language thresholds change over time — track the requirement set early so language study and document continuity align."
    conflictNote: "Dual-citizenship treatment depends on your origin country's rules, not Croatia's — verify before naturalizing."
---

Now that you are resident, make the setup sustainable. Croatia's paušalni obrt (lump-sum trade) is often the right structure for solo work under the revenue cap. Above the cap, a d.o.o. or j.d.o.o. is usually the better fit. Decisions in this stage compound for years — talk to a licensed local accountant, not to a forum thread.
