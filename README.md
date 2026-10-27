# DanaTech — Gemini-led execution coordinator

DanaTech is intended to remain a bilingual English/Arabic mobile-accessories storefront for the UAE. This branch adds an initial coordinator scaffold for a Gemini-led workflow.

## Responsibility split

- **Gemini plans.** Each task is sent to Gemini first; its plan is supplied to the executor as the authoritative work plan.
- **OpenAI API executes.** The executor inspects and edits workspace files and runs allowed commands.
- **Vercel Sandbox isolates code execution.** Generated code and tests run in an isolated sandbox rather than in the production function.
- **GitHub changes are limited to the configured working branch.** The model cannot push or commit directly; the server writes resulting text changes to the branch after the executor finishes.
- **No production deployment is triggered by this endpoint.** Review changes and approve any merge/deployment separately.

The system does not assume Amazon Associates approval, product prices, or affiliate URLs.

## Required environment variables

Set these in Vercel Project Settings → Environment Variables. Do not commit real secrets or paste API keys into chat.

- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `GITHUB_TOKEN` — use a fine-grained token limited to this repository, with Contents read/write permissions.
- `COORDINATOR_API_TOKEN` — a separate long random token to authenticate requests.

Optional:
- `GITHUB_OWNER` (default: `Ahmadbehzadi1998`)
- `GITHUB_REPO` (default: `DanaTech`)
- `GITHUB_BRANCH` (default: `feature/gemini-directed-execution`)
- `MAX_EXECUTOR_TURNS` (bounded to 20)

See `.env.example` for the template. Keep all secrets server-side.

## API

`POST /api/coordinate`

Headers:
`Authorization: Bearer <COORDINATOR_API_TOKEN>`
`Content-Type: application/json`

Body:
`{"task":"Inspect the storefront and fix Arabic RTL navigation on mobile."}`

## Status and limitations

This is an initial scaffold, not a verified production service. Dependencies have not yet been installed and the build has not yet been run in this environment. Before deployment, run dependency installation, type-check/build, and security tests; verify Vercel Sandbox access, API quota, and the GitHub token's restricted permissions. Test only on a non-production branch first.

The coordinator does not deploy to Production. Review generated commits and test results before merging.
