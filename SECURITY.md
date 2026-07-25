# Security Policy

## Reporting a vulnerability

Please report security issues through
[**private vulnerability reporting**](https://github.com/7nolikov/ohmoveagain/security/advisories/new),
not a public issue.

Expect an acknowledgement within 7 days. Since this is a solo-maintained
project, a fix may take longer — you'll get an honest estimate rather than
silence.

## Scope

This is a static site. It has no backend, no database, no accounts, and
collects no personal data. Checklist progress is stored in the reader's own
browser (`localStorage`) and never leaves the device.

That narrows the realistic attack surface to:

- **Cross-site scripting** through content or template rendering. Several
  templates use `safeHTML`/`safeJS`, and machine-translated strings flow into
  some of them — see below.
- **Supply chain** — a compromised GitHub Action or npm dependency.
- **Dependency vulnerabilities** in the build toolchain.
- **Source-link integrity** — a checklist item pointing somewhere it shouldn't.

Out of scope: anything requiring access to a maintainer's account, findings
against the third-party government sites the Pipeline links to, and reports
that a page returns 403 to an automated scanner (several government sites
block bots by design).

## What we already do

- Every GitHub Action is pinned to a 40-character commit SHA, enforced by the
  repository, after the May 2026 `actions-cool/issues-helper` tag-moving attack.
- Workflows default to read-only token permissions.
- Secret scanning and push protection are enabled.
- Dependabot alerts and security updates are enabled; version updates run
  weekly.
- A weekly link check flags source URLs that have moved or died, so a
  redirected government link doesn't silently become somewhere else.

## Known risk we accept

Translations are produced by an LLM and land in templates that render with
`safeHTML`. The i18n sync therefore opens a **pull request** rather than
committing to `main`, so generated markup is reviewed before it ships. If you
find a way to get executable content through that path, it is in scope and we
want to hear about it.

A Content-Security-Policy **is** enforced, via a `<meta http-equiv>` tag in
`layouts/partials/head.html`: `default-src 'self'`, `object-src 'none'`,
`base-uri 'self'`, and `form-action` limited to the form handler.

Two limits are accepted rather than overlooked:

- `script-src` includes `'unsafe-eval'` and `'unsafe-inline'`, required by
  Alpine.js. Removing them needs a tested CSP build, not a one-line change.
- Delivered as a meta tag, not a response header, because GitHub Pages cannot
  set headers. That means no `frame-ancestors` and no HSTS. HTTPS is enforced
  at the Pages level instead.
