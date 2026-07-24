# Existing Dassault Systèmes Sales Intelligence Engine (found in Drive)

There's already a working system in the Drive BD folder, built in an earlier session/prompt, that
this agent team should align with rather than duplicate. Captured here (from search snippets — full
reads are still blocked by the Drive permission issue) so `bd-*` agents don't have to rediscover it.

## What already exists

- **`Target_Accounts_Registry`** (spreadsheet) — the 10 tracked enterprise accounts, each with a
  `Primary DS Solution Hypothesis` and a `Last Quarterly Review` date. This is the same file this BD
  team's target list (Tier 1) was built from.
- **`Client Value Report Prompt`** (doc) — the research prompt that drives CVR generation: prioritizes
  10-K/DEF 14A (or Annual Report for private companies), and structures output into the CVR sections
  below with mandatory source citation per sentence.
- **CVR example**: `Merck & Co - 3DS CVR - 2026-07-01` — a full, populated Customer Value Report.
- **`Account Accelerator [Template].docx`** — a strategic account-plan template, separate from the CVR
  (structure below).
- **`Quarterly Account Review - Procedure`** (doc) — describes a recurring workflow: a daily 6 AM check
  scans SEC EDGAR for each Active account in `Target_Accounts_Registry` for new 10-K/10-Q/8-K filings;
  a new filing triggers a Quarterly Review that reuses the CVR structure plus two extra sections (DS
  Solution-Mapping, Strategic Recommendations — formats below). References a companion
  `daily-account-intel` procedure not yet captured here.
- **Example Quarterly Review**: `Johnson & Johnson - Quarterly Review - 8-K - 2026-07-15`.
- **`CVR Refreshes`** folder and a **`Quarterly Intelligence`** folder — where these outputs live.
- **`Biweekly AI + Life Sciences Intelligence Brief`** — the recurring competitive/market intel brief
  already referenced in this session's research (Edwards, West Pharma, etc.).

This means: account research, quarterly refresh, and market-intel gathering already have a running
system. This BD agent team's job is to extend it (prospecting, outreach, proposals, pipeline) — not
rebuild the research layer from scratch. `bd-account-researcher` already defers to `cvr-research-3ds`
for full CVRs; the note here is to also match the *shape* of what already exists when doing lighter
research, so outputs are consistent.

## Account Accelerator — section structure

1. **Account Snapshot** — Account Owner, ACV (current), Target ACV (12mo), Renewal Date, Products in
   Scope, Exec Sponsor, Revenue History (3 years).
2. **Executive Summary** — Client Overview (what they do, market position), Strategic Importance (why
   this account matters beyond revenue), Current State (relationship strength/momentum/confidence).
3. **Critical 12-Month Objective** / **Key Stakeholders** (name, role, influence H/M/L, relationship
   +/0/-), **Biggest Opportunity** / **Biggest Risk**.
4. **Business Context & Solution Mapping** — Client Priorities & Impact on Buy Behavior (≤100 words);
   a table mapping the client's current-year focus areas to 3DS solution areas.
5. **Growth & Expansion Strategy** — Near Term (0–12mo) and Long Term (12+mo), each as
   product → next-step pairs.
6. **Product-Specific Strategy** — one row per relevant brand (Medidata, Biovia, other 3DS brands),
   strategy & revenue impact (≤100 words each).
7. **Competitive Landscape & Risks** — Key Competitors & Threats (≤100 words); Leadership Support
   Needed (≤50 words).

`bd-competitive-analyst` battlecards should be written so their content can drop straight into an
account's "Competitive Landscape & Risks" section — same competitor framing, same brevity discipline.

## CVR — section structure

**Section 1: Customer Profile** — Company Profiling & Vision; Key Financials & Employees (3-year
revenue/margin/R&D table); Segments/Business Units; Strategic Health & Focus (FCF, debt, M&A,
investment strategy); SWOT Analysis; Cloud/SaaS and Data Strategies.

**Section 2: Customer/3DS Positioning & Relationship** — Ecosystem Landscape for other software (name
the likely PLM / ERP / CRM / Analytics-BI-AI / Design-Engineering-Simulation vendor per domain);
Ecosystem Landscape for Consulting & System Integrators (who does strategy/build/run/engineering).

**Section 3: Customer Strategy & 3DS Value Proposition** — Business Objectives & Drivers (top 3–5,
sourced from MD&A / CEO-CFO letters); *(remainder of this section wasn't captured in the pull — check
the `Client Value Report Prompt` doc directly once Drive reads work again)*.

**Quarterly Review extension (on top of the CVR structure above):**
- **DS Solution-Mapping** — same DELMIA/BIOVIA/3DEXPERIENCE rubric as `daily-account-intel`:
  - DELMIA: new/expanded plants, CAPEX for capacity, MES/plant digitization, supply chain disruption,
    global production planning.
  - BIOVIA: lab informatics, formulation/process development, regulatory submission data management,
    quality/compliance systems.
  - 3DEXPERIENCE: end-to-end digital transformation, digital twin/PLM, cross-functional data
    unification, new CIO/CDO hires, M&A integration.
- **Strategic Recommendations** — row format: `Date | Account | Trigger Signal(s) | Recommended DS
  Solution | Rationale | Suggested Play | Priority`. Use this exact row shape for any recommendation
  log this BD team produces, so it's compatible with the existing one.

## Known constraint carried over from the existing engine

Per the Quarterly Account Review procedure: "the Drive connector available to this engine cannot edit
existing files — only create new ones." Same constraint this BD team has been working under all
session (confirmed independently). Updates to registries/trackers need to be called out in the run
summary for the user to apply by hand, not attempted as an in-place edit.
