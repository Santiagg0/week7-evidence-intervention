# BUSINESS BENDING — WEEK 7
## Evidence-to-Intervention Layer
### Mexico Fleet Pilot

## Problem in My Words

Commercial fleet systems can already collect vehicle telemetry and detect driving events. The vacuum begins after detection: which events deserve attention, which can receive automated feedback, which require human review, and whether an intervention actually changed the measured behavior.

The system must not turn behavioral evidence into conclusions beyond what was measured.

**Core loop:**

SENSE → TRIAGE → INTERVENE → HUMAN REVIEW BY EXCEPTION → RETEST

## Exact User

Primary user: a fleet safety or operations manager at a Mexican logistics or commercial transportation company managing approximately 50–200 vehicles.

Secondary actor: the driver receiving event-specific feedback.

The system classifies EVENTS, not PEOPLE.

## Success Definition

Before the module closes, a fleet manager can:

1. View simulated vehicles on a map.
2. Select a speeding event.
3. Inspect its evidence.
4. See event-level severity triage.
5. Understand why it received that classification.
6. Route a selected event to human review.
7. Record an intervention.
8. View a simulated retest.
9. Compare baseline vs post-intervention behavior.
10. See explicitly what the evidence can and cannot prove.

## Working Slice

One measurable behavior:

**SPEEDING EPISODES**

Primary simulated event:

- Vehicle: MX-027
- Observed speed: 82 km/h
- Declared threshold: 60 km/h
- Difference: +22 km/h
- Duration: 18 seconds
- Triage: HIGH EVENT PRIORITY
- Route: HUMAN REVIEW BY EXCEPTION

Retest:

- Baseline: 8.2 speeding episodes / 100 km
- Retest: 4.9 speeding episodes / 100 km
- Observed change: approximately -40%

Permitted claim:

> Observed speeding episodes decreased by approximately 40% under the declared comparison conditions.

Not permitted:

> Transportation became 40% safer.

## Shadow Clause

The system may classify events.

It may NOT turn event classifications into permanent identity judgments about drivers.

Therefore the MVP has:

- no driver ranking
- no leaderboard
- no permanent safety score
- no automatic disciplinary recommendation
- no automatic firing recommendation

## Image-Generated Mockup

![Week 7 Dashboard Mockup](/week7-dashboard-mockup.png)

All vehicle and event information is simulated.

## Product Flow

```mermaid
flowchart TD
A[Simulated Vehicle Telemetry] --> B[SENSE]
B --> C[Detect Speeding Event]
C --> D[TRIAGE]
D --> E{Event Severity}
E -->|Low| F[Log Event]
E -->|Medium| G[Automated Event-Specific Feedback]
E -->|High| H[Human Review by Exception]
F --> I[Intervention Recorded]
G --> I
H --> I
I --> J[RETEST]
J --> K[Compare Behavior Under Similar Conditions]
K --> L[Report Observed Change]
L --> M[Apply Claim Boundary]
M --> N[Observed Behavior Change ≠ Total Transportation Safety]
