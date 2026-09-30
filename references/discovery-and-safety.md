# Discovery and safety

Deep-crawl same-origin public HTML pages only. Record external links as candidate sites; crawl them only after explicit approval or manual inclusion.

Reject non-HTTP(S) URLs and private, loopback, link-local, or metadata-network targets. Re-check the final URL after redirects and enforce per-site page, byte, timeout, and rate limits.

Do not log in, submit forms, download private files, or store personal data. Keep only service metadata, public procedural hints, source URLs, evidence, errors, and timestamps.
