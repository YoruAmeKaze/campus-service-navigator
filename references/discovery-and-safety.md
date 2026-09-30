# Discovery and safety

Deep-crawl same-origin public HTML pages only. Record external links as candidate sites; crawl them only after explicit approval or manual inclusion.

Reject non-HTTP(S) URLs and private, loopback, link-local, or metadata-network targets. Re-check the final URL after redirects and enforce per-site page, byte, timeout, and rate limits.

Batch related pages and likely campus service sub-sites where permitted; deduplicate overlapping services and retain useful lower-confidence discoveries with explicit candidate/unverified status. Avoid serially checking unrelated pages when a sufficient direct answer is already available.

Do not log in, submit forms, download private files, or store personal data. Keep only service metadata, public procedural hints, source URLs, evidence, errors, and timestamps. Public official guides may contain authentication rules such as account identifiers or initial-password conventions: these can be summarized when relevant, with a direct source and a freshness caveat if needed. Never collect a user's actual credential or identity number, and never include such user-provided secrets in outputs.

Describe verification narrowly. A successful HTTP response establishes page reachability at that time, not that a user can log in or complete a transaction. A 403 or VPN notice establishes the observed access restriction, not that VPN access will necessarily succeed. A redirect to an identity provider establishes the redirect, not what services are available after login. Record check time and the exact observable result; label downstream conclusions as inference.
