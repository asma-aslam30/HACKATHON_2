---
id: 0001
title: Project Manager Agent Specification
stage: spec
date: 2025-12-24
surface: agent
model: claude-opus-4-5-20251101
feature: agents
branch: master
user: xolva
command: direct prompt
labels: ["agent-documentation", "project-management", "orchestration", "reusable-intelligence"]
links:
  spec: .claude/agents/project-manager.md
  ticket: null
  adr: null
  pr: null
files:
  - .claude/agents/project-manager.md
tests:
  - N/A (documentation, no tests required)
---

## Prompt

Act as **Spec Architect Agent** and create detailed documentation for **Project Manager Agent** in `.claude/agents/project-manager.md`.

**Agent Role**: Orchestrates the entire Hackathon II project across 5 phases
**Responsibilities**:
- Plans phase-wise work breakdown (Phase I → V)
- Coordinates other agents: Spec → Implementation → Test
- Tracks deadlines: Dec 7,14,21 (Phases I-III), Jan 4,18 (IV-V)
- Ensures hackathon deliverables: GitHub repo, Vercel link, 90s demo video
- Manages bonus features: Reusable Intelligence (+200), Blueprints (+200)

**Activation**: "Act as Project Manager Agent"
**Skills**: Phase planning, agent coordination, deadline tracking, deliverable checklist

**Output**: Complete Markdown file with sections: Role, Responsibilities, Activation Phrase, Skills, Example Usage

## Response snapshot

Acting as **Spec Architect Agent**, I created comprehensive documentation for the **Project Manager Agent** at `.claude/agents/project-manager.md`.

**Document Structure**:

1. **Role**: Primary orchestrator for 5-phase hackathon project, coordinating specification → implementation → testing → deployment workflow

2. **Responsibilities** (5 major areas):
   - Phase-wise work breakdown with dependency management
   - Multi-agent coordination (Spec → Architect → Implementation → Testing → Quality)
   - Deadline tracking (Dec 7, 14, 21; Jan 4, 18) with risk mitigation
   - Hackathon deliverable management (mandatory + bonus features)
   - Bonus feature coordination (+400 points potential)

3. **Activation Phrase**: "Act as Project Manager Agent"

4. **Skills**: Phase planning, agent coordination, deadline tracking, deliverable checklist, risk management, workflow integration

5. **Example Usage** (4 comprehensive scenarios):
   - Initiating Phase I workflow
   - Mid-phase status check with risk assessment
   - Coordinating Reusable Intelligence bonus (+200 points)
   - Risk escalation with multiple mitigation options

**Key Content**:
- Hackathon timeline table (all 5 phase deadlines)
- Deliverable checklist (mandatory + bonus)
- Multi-agent coordination flow
- 8-step workflow integration
- Success metrics and validation criteria

## Outcome

- ✅ Impact: Created foundational Project Manager Agent documentation, enabling consistent orchestration across all 5 phases and contributing to Reusable Intelligence bonus deliverable (+200 points)
- 🧪 Tests: N/A (documentation)
- 📁 Files: Created .claude/agents/project-manager.md
- 🔁 Next prompts: Document remaining 9 agents to complete Reusable Intelligence deliverable
- 🧠 Reflection: Comprehensive agent spec with clear activation phrase, detailed examples, and integration points

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Manual review - PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Test activation with "Act as Project Manager Agent and plan Phase I work"
