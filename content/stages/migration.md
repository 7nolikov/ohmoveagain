---
title: "Migration"
subtitle: "The physical move — border crossing, first 72 hours, no undo button."
description: "Border crossing, temporary accommodation, first 72 hours on the ground. Keep every original document on your person, not in checked luggage."
weight: 3
sitemap:
  priority: 0.9
duration: "3–10 days"
requires:
  - "Stage 2 complete: every apostilled document, translation, and visa paper is assembled and in your cabin bag."
  - "First 30 days of accommodation booked in writing."
  - "Ground transport, SIM / eSIM, and a cash buffer arranged before departure."
documents:
  - "All originals from Stage 2, carried in your cabin bag — never in checked luggage."
  - "Printed proof of onward accommodation and funds for border control."
  - "Travel insurance policy and emergency contact list."
  - "If moving with pets: signed vet health certificate (within 10 days of travel) and airline booking reference."
categoryNames:
  border-crossing: "border crossing"
  first-72-hours: "first 72 hours"
  pets-in-transit: "pets in transit"
itemStrings:
  border-method:
    label: "Confirm border crossing method (air / land / sea)"
    note: "Croatia joined Schengen in 2023. Schengen vs non-Schengen routes have different stamp implications."
    sourceLabel: "EU — Schengen area"
  originals-cabin:
    label: "All originals in cabin bag — never checked"
    note: "Lost luggage + lost apostille = restart the pre-flight loop."
  customs-proof:
    label: "Customs: proof of onward accommodation + funds, printed"
    note: "Customs may request both on entry. Digital copies are not universally accepted."
    sourceLabel: "Carinska uprava (HR customs)"
  accommodation-30d:
    label: "First 30 days of accommodation booked"
    note: "Long enough to secure a registered lease without panic."
  ground-transport:
    label: "Ground transport from airport pre-booked"
    note: "Uber / Bolt coverage is spotty outside Zagreb."
  eu-sim:
    label: "EU-compatible SIM (eSIM preferred) active on arrival"
    note: "eSIM on arrival beats airport kiosks."
  emergency-cash:
    label: "Emergency cash buffer (€2–3K) in local currency"
    note: "Card fraud geo-locks happen. Croatia uses EUR since 2023."
    sourceLabel: "HNB — Croatian National Bank"
  vet-health-cert:
    label: "Vet health certificate signed within 10 days of travel date"
    note: "The clock starts from the vet's signature date, not your travel booking. Schedule the vet appointment last."
    sourceLabel: "EU — health certificate validity"
  airline-booking:
    label: "Pet booking confirmed with airline (reference number in hand)"
    note: "Reconfirm 48h before travel. Airlines cancel pet slots without notice."
    sourceLabel: "IATA — live animals transport"
  carrier-dimensions:
    label: "Carrier dimensions verified at check-in vs airline's current spec"
    note: "Staff measure on the day. If your carrier is 1cm over, the pet goes cargo or stays home."
gotchas:
  - "Your old country's bank may freeze cards on geo-change. Notify in advance, or carry a backup bank."
  - "Croatia switched to EUR in 2023 — old kuna cash is no longer legal tender."
claimStrings:
  border-method:
    impact: "operational-delay"
    explanation: "Border mechanics affect stamps, proof expectations and travel routing assumptions."
    conflictNote: "Schengen and non-Schengen routing can change what officers check in practice."
  originals-cabin:
    impact: "operational-delay"
    explanation: "Originals are irreplaceable during the arrival window and lost luggage can collapse the next stage."
  customs-proof:
    impact: "operational-delay"
    explanation: "Printed accommodation and funds proof reduce friction when a border check turns manual."
    conflictNote: "Digital acceptance varies by officer and travel context."
  accommodation-30d:
    impact: "suboptimal-planning"
    explanation: "Short booking windows create pressure and bad housing decisions right when identity setup begins."
  ground-transport:
    impact: "suboptimal-planning"
    explanation: "First-mile logistics failures compound stress in the first 72 hours."
    conflictNote: "Ride-hailing coverage differs sharply by city and arrival time."
  eu-sim:
    impact: "operational-delay"
    explanation: "Connectivity is a dependency for banking, landlord contact, transport and emergency changes."
  emergency-cash:
    impact: "financial-cost"
    explanation: "Cards fail more often during geo-changes than travellers expect."
  vet-health-cert:
    impact: "operational-delay"
    explanation: "Health certificate timing is strict and invalid documents fail at check-in or border inspection."
  airline-booking:
    impact: "operational-delay"
    explanation: "Pet space is operationally scarce and airline handling can diverge from generic pet guidance."
    conflictNote: "Airline-level pet acceptance changes faster than legal transport rules."
  carrier-dimensions:
    impact: "operational-delay"
    explanation: "Carrier compliance is enforced physically, not theoretically, at the airport."
    conflictNote: "Airlines and even staff interpretation can differ on the day of travel."
---

Border crossing, temporary accommodation, first 72 hours. Keep every original document on your person, not in checked luggage. Expect delays, confused staff, and unexpected fees — plan for twice the friction you budgeted for.
