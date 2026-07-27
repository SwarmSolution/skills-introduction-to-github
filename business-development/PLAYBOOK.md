# Business Development Agent Team — Playbook

Context: B2B business development for a Dassault Systèmes (3DS) 3DEXPERIENCE
reseller/partner (CATIA, SOLIDWORKS, ENOVIA, SIMULIA, DELMIA, GEOVIA, BIOVIA,
MEDIDATA, NETVIBES, EXALEAD, CENTRIC PLM, 3DEXCITE).

This playbook defines a team of Claude Code subagents that cover the BD
funnel end to end — target list → research → outreach → meeting prep →
proposal → pipeline management — and how to stand them up.

## 1. The team

| Agent | Funnel stage | What it does |
|---|---|---|
| `bd-lead-prospector` | Targeting | Builds and scores target account/contact lists in a given industry vertical, focused on the PLM/CAD/simulation buying committee (engineering, manufacturing, IT, ops leadership). |
| `bd-account-researcher` | Research | Deep-dives a specific prospect: business background, tech stack, PLM footprint, pain points, buying signals. Can trigger a full Dassault Systèmes CVR report via the `cvr-research-3ds` skill, or produce a lighter one-page briefing. |
| `bd-competitive-analyst` | Research | Maintains battlecards comparing the 3DEXPERIENCE portfolio against Siemens (NX/Teamcenter), PTC (Creo/Windchill), Autodesk (Fusion/Vault), and Aras — positioning, objection handling, win/loss patterns. |
| `bd-outreach-strategist` | Engagement | Drafts multi-touch outreach sequences (email, LinkedIn, call scripts) personalized to a prospect's industry and pain points, referencing relevant 3DS brands/use cases. |
| `bd-meeting-prep` | Engagement | Assembles a one-page pre-call brief combining account research, competitive angle, and calendar/attendee context ahead of a discovery call or demo. |
| `bd-proposal-writer` | Conversion | Drafts proposals, SOWs, and ROI/business-case narratives as polished `.docx`/`.pptx` deliverables tied to 3DEXPERIENCE value props. |
| `bd-pipeline-strategist` | Management | Reviews pipeline/deal data, flags stalled deals, recommends next steps and pricing/negotiation strategy, produces forecast summaries (`.xlsx`). |
| `bd-orchestrator` | Coordination | Runs prospecting → research → competitive check → outreach draft as one pipeline per account instead of four separate asks, and saves the consolidated result. Does not send outreach or track replies — see §4. |

Each agent is defined in `.claude/agents/<name>.md` and is invokable via the
`Agent` tool (`subagent_type: <name>`) or by name in `/agents`.

## Reference material

Two files are mirrored from Google Drive into
`business-development/reference/` so every agent can read them via the
`Read` tool without depending on the Drive connector (which has had
permission-approval failures):
- `product-reference-life-sciences.md` — brand value props, trigger
  signals, typical buyers per 3DS brand.
- `brand-voice.md` — tone/vocabulary rules (partial copy; re-pull the full
  version from Drive once reads are working).

Both are sourced from docs already prepared in an earlier session/prompt,
not newly requested. If either drifts from the Drive original, update
both.

## 2. Development plan

**Phase 0 — Foundations (this change)**
- Define the roster and each agent's scope, tools, and handoffs (this doc).
- Ship the 7 subagent definitions in `.claude/agents/`.
- Confirm each agent triggers correctly and stays in its lane (no overlap
  with `cvr-research-3ds`, which remains the source of truth for full CVR
  reports — `bd-account-researcher` calls it rather than re-implementing it).

**Phase 1 — Research & prospecting**
- Validate `bd-lead-prospector` and `bd-account-researcher` against 2-3 real
  target accounts.
- Stand up `bd-competitive-analyst` with an initial battlecard set for the
  top 3 competitors; store outputs in `business-development/battlecards/`.

**Phase 2 — Engagement**
- Validate `bd-outreach-strategist` sequences against a real target list from
  Phase 1.
- Validate `bd-meeting-prep` against a real upcoming call (needs Google
  Calendar/Drive access, already available in this environment).

**Phase 3 — Conversion & pipeline**
- Validate `bd-proposal-writer` end to end on a real opportunity (uses the
  `docx`/`pptx` skills for deliverables).
- Stand up `bd-pipeline-strategist` against real pipeline data (CRM export
  or a spreadsheet) and confirm forecast/next-step output is usable.

**Phase 4 — Operationalize**
- Wire recurring cadences as needed, e.g. a weekly pipeline review or a
  daily meeting-prep run, using Routines (`create_trigger`) — set up only
  when explicitly requested, not by default.
- Iterate on each agent's prompt based on real usage; keep this playbook in
  sync as scope evolves.

**Phase 5 — Orchestration (in progress)**
- `bd-orchestrator` (added this change) automates prospect → research →
  competitive check → outreach draft as one pipeline call. Validate it
  against a real account next.
- Sending outreach, tracking replies, and auto-flagging a qualified lead
  are explicitly out of scope until the real sequencing/CRM tools are
  connected — see §4, Connectors. The tools are now known specifically:
  **Outreach** (sales engagement platform) and **Salesforce** (CRM),
  confirmed from the real sequence-request template — not a generic
  Gmail/CRM assumption anymore. Don't build a fake version of this; wire
  it in for real once a connector exists.
- A Salesforce connector would upgrade `bd-pipeline-strategist` from
  spreadsheet-only to live pipeline data — same rule, wire in for real,
  don't fake it.

## 4. Known gaps (permissions, templates, connectors)

- **Permissions**: the Google Drive `read_file_content` tool and the
  `send_later` reminder tool have both failed repeatedly in this
  environment with a "requires approval" error — approve them when
  prompted, or allowlist them, to unblock full-document reads and
  scheduled reminders.
- **Templates**: outreach sequence template — **received** (mirrored at
  `business-development/reference/outreach-sequence-template.md`,
  `bd-outreach-strategist` rewritten to follow it). Presentation/deck
  template — **built** (`business-development/templates/`, two files —
  light and dark — see that folder's README). Generic/unbranded per the
  user's choice; still open: swap in real branding when a company/client
  identity is confirmed, and consider rebuilding the icon set if the user
  uploads reference icons from their own prior decks.
- **Connectors**: no Salesforce connector (blocks live pipeline data), no
  Outreach (outreach.io) connector (blocks actually sending sequences and
  tracking replies — this is what `bd-orchestrator`'s qualified-lead
  detection is waiting on), no LinkedIn/Sales Navigator access (blocks
  closing the remaining named-contact gaps).

## 3. Working conventions

- **Namespacing**: all agents are prefixed `bd-` to avoid collisions with
  other subagents in this environment.
- **Handoffs**: `bd-account-researcher` and `bd-competitive-analyst` feed
  `bd-outreach-strategist`, `bd-meeting-prep`, and `bd-proposal-writer` —
  reuse their outputs rather than re-researching from scratch.
- **Deliverable formats**: proposals/business cases → `.docx`/`.pptx`
  (via the `docx`/`pptx` skills), pipeline/forecast data → `.xlsx` (via the
  `xlsx` skill), full account research → `.docx` (via `cvr-research-3ds`).
- **Storage**: BD working files that aren't meant to live in this repo
  long-term (battlecards, sequences, briefs) can go to Google Drive; repo
  storage under `business-development/` is for the playbook and any
  reusable templates.
