# Frontend development and verification

Shared [development rules](../../holansl_backend/docs/DEVELOPMENT.md) and
[local logging rules](../../holansl_backend/docs/DEVELOPMENT_LOGGING.md) apply.
Plan → approval → direct file editing; backend before dependent frontend.
Do not modify the backend unless both repositories are explicitly in scope.

Use pnpm and the installed supported Node version. Current Next.js requires a
modern Node runtime; a system Node 18 binary is not the intended local toolchain.
Dependencies belong in package.json/pnpm-lock.yaml; explain additions/upgrades.

## Checks

```bash
pnpm test:theme
pnpm type-check
pnpm lint
pnpm format:check
pnpm build
```

For scoped formatting, run pnpm exec prettier --check on changed files.
Use pnpm format for an explicitly approved repository-wide formatting pass.
The existing Prettier dependency is configured in .prettierrc.json; .prettierignore
excludes generated output, dependencies, environment files and the local log.
Do not reformat unrelated files merely because whole-project checks report issues.
Theme tests use Node's built-in test runner; no testing dependency is required.
They check palette/semantic mappings, light/dark contrast pairs and font setup.

next/font/google retrieves font data during a build. Report network/font failures
honestly; do not disable production font loading merely to make tests pass.

## CSS-first Tailwind v4

Keep theme values in src/app/globals.css using complete CSS colours.
Existing v3-style raw HSL channels must not be mapped directly as colours.
Do not duplicate the palette in tailwind.config.js or install a second animation
plugin to replace already-imported tw-animate-css.

Use brand/status tokens and foreground companions. Retain compatible aliases.
Light/dark token coverage is not a claim that all old explicit-colour components
have been migrated; record follow-up work accurately.

## Manual verification

Check mobile/tablet/desktop layout, font loading, readable buttons/alerts,
dialog overflow/focus, compact/full tables and guarded account mutations.
Check keyboard navigation, status labels/icons, light/dark colours and error states.
Do not call authenticated live backend APIs or change business data merely to
verify theme changes; use isolated UI fixtures where possible.

Update DEVELOPMENT_LOG.local.md for every added/changed/corrected feature, with
timestamp, functions, reason, files and exact verification results.
