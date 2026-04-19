---
title: "Migration"
subtitle: "Physical relocation. The only irreversible step."
description: "Border crossing, temporary accommodation, first 72 hours. Keep documents on your person, not in checked luggage."
weight: 3
exitCode: 0
duration: "3–10 days"
command: "git push origin zagreb --force-with-lease"
checklist:
  - name: "border crossing"
    items:
      - label: "Confirm border crossing method (air / land / sea)"
        note: "Croatia joined Schengen in 2023. Schengen vs non-Schengen routes have different stamp implications."
        source:
          url: "https://home-affairs.ec.europa.eu/policies/schengen_en"
          label: "EU — Schengen area"
          asOf: "2026-01-01"
      - label: "All originals in cabin bag — never checked"
        note: "Lost luggage + lost apostille = restart the pre-flight loop."
      - label: "Customs: proof of onward accommodation + funds, printed"
        note: "Customs may request both on entry. Digital copies are not universally accepted."
        source:
          url: "https://carina.gov.hr/en"
          label: "Carinska uprava (HR customs)"
          asOf: "2026-02-01"
  - name: "first 72 hours"
    items:
      - label: "First 30 days of accommodation booked"
        note: "Long enough to secure a registered lease without panic."
      - label: "Ground transport from airport pre-booked"
        note: "Uber / Bolt coverage is spotty outside Zagreb."
      - label: "EU-compatible SIM (eSIM preferred) active on arrival"
        note: "eSIM on arrival beats airport kiosks."
      - label: "Emergency cash buffer (€2–3K) in local currency"
        note: "Card fraud geo-locks happen. Croatia uses EUR since 2023."
        source:
          url: "https://www.hnb.hr/en"
          label: "HNB — Croatian National Bank"
          asOf: "2026-01-01"
  - name: "pets in transit"
    items:
      - label: "Vet health certificate signed within 10 days of travel date"
        note: "The clock starts from the vet's signature date, not your travel booking. Schedule the vet appointment last."
        appliesTo:
          pets: [dog-cat]
        source:
          url: "https://food.ec.europa.eu/animals/movement-pets_en"
          label: "EU — health certificate validity"
          asOf: "2026-03-01"
      - label: "Pet booking confirmed with airline (reference number in hand)"
        note: "Reconfirm 48h before travel. Airlines cancel pet slots without notice."
        appliesTo:
          pets: [dog-cat, other]
        source:
          url: "https://www.iata.org/en/programs/cargo/live-animals/"
          label: "IATA — live animals transport"
          asOf: "2026-01-01"
      - label: "Carrier dimensions verified at check-in vs airline's current spec"
        note: "Staff measure on the day. If your carrier is 1cm over, the pet goes cargo or stays home."
        appliesTo:
          pets: [dog-cat]
gotchas:
  - "Your old country's bank may freeze cards on geo-change. Notify in advance, or carry a backup bank."
  - "Croatia switched to EUR in 2023 — old kuna cash is no longer legal tender."
artifacts:
  - name: "72-hour landing runbook"
    kind: "doc"
    href: "#"
---

Border crossing, temporary accommodation, first 72 hours. Keep documents on your person, not in checked luggage. Budget for 2× the expected friction.
