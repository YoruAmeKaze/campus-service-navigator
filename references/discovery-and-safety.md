# Discovery and safety

Deep-crawl same-origin public HTML pages only. Record external links as candidate sites; crawl them only after explicit approval or manual inclusion.

Reject non-HTTP(S) URLs and private, loopback, link-local, or metadata-network targets. Re-check the final URL after redirects and enforce per-site page, byte, timeout, and rate limits.

Use this generic discovery sequence, adapting it to the institution rather than hard-coding one school's domains or page names:

1. Reuse a recent local service directory and confirm its source/verification dates.
2. Establish the official institution domain from user-provided context or an authoritative search/source.
3. Find the pages most likely to own or index the requested service (for example, the responsible department and a central service portal).
4. Check candidate entry points and their immediate official source pages; record redirects, errors, login/VPN notices, and timestamps as observations.
5. Batch related pages and, when tools allow, parallelize independent read-only checks. Deduplicate overlapping entries and retain useful lower-confidence discoveries with explicit candidate/unverified status.

Avoid serial page-by-page browsing and redundant reachability tests when they cannot improve the recommendation. Once a strong, sourced answer is available, return it while finishing only relevant directory enrichment. Do not crawl unrelated sections merely to maximize coverage.

Do not log in, submit forms, download private files, or store personal data. Keep only service metadata, public procedural hints, source URLs, evidence, errors, and timestamps. Public official guides may contain authentication rules such as account identifiers or initial-password conventions: these can be summarized when relevant, with a direct source and a freshness caveat if needed. Never collect a user's actual credential or identity number, and never include such user-provided secrets in outputs.

Describe verification narrowly. A successful HTTP response establishes page reachability at that time, not that a user can log in or complete a transaction. A 403 or VPN notice establishes the observed access restriction, not that VPN access will necessarily succeed. A redirect to an identity provider establishes the redirect, not what services are available after login. Record check time and the exact observable result; label downstream conclusions as inference.
