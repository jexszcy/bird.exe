# Workspace

The workspace/ directory is the **home of all project source code**. This is where the actual product lives — frontend applications, backend services, shared libraries, infrastructure-as-code, and any other project deliverables.

---

## Purpose

- Contains all runnable, buildable, or deployable code
- Organized by project subdirectory (e.g., rontend/, ackend/, shared/, mobile/)
- The **Implementor** agent writes code here
- The **Reviewer** agent audits code here
- The **Tester** agent validates endpoints and contracts against code here

---

## Suggested Structure

```
workspace/
├── frontend/           # Web client (React, Vue, Next.js, etc.)
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/            # API server (Node, Go, Python, etc.)
│   ├── src/
│   ├── tests/
│   └── package.json / go.mod / pyproject.toml
├── shared/             # Shared types, utilities, contracts
│   └── types/
├── mobile/             # Native mobile app (if applicable)
│   └── ...
└── infra/              # Infrastructure as code (Docker, Terraform, etc.)
    └── ...
```

> **Note:** The specific structure depends on the project being built. Adjust subdirectories as needed. Each sub-project should have its own README.md describing how to run, build, and test it.

---

## Guidelines

- All code here should be **production-quality**: typed, linted, and tested
- API contracts (request/response shapes) must be documented so the Tester agent can validate them
- Frontend code should follow the principles defined in the ui-ux-design skill
- Backend code should follow the principles defined in the security and pi-design skills
- Never commit secrets, credentials, or environment-specific config (use .env files excluded by .gitignore)

---

## Relationship to Other Folders

| Folder | Connection |
|---|---|
| milestones/decisions/ | Decisions about architecture, tech stack, and patterns affect code here |
| eports/<feature>/ | Every feature implemented here gets a corresponding report in eports/ |
| .opencode/agents/ | Agents read and write code in this folder |
