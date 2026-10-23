# Service directory schema

The root object requires `schemaVersion: "0.1"` and a `services` array. `sourceUrl` and `generatedAt` are optional; when present, `sourceUrl` must be an HTTP(S) URL without embedded credentials and `generatedAt` must be a parseable date-time string. `sites` is also optional.

Each service must contain:

- `serviceId`: stable identifier within the directory
- `name`: user-facing service name
- `description`: short evidence-based description
- `category`: broad category discovered from the institution, such as 办事、财务、支持、培训 or 公共服务
- `entryUrl`: direct public entry URL
- `sourcePage`: page where the entry was found
- `platform`: institution website or external platform
- `requiresLogin`: boolean hint only, never a guarantee
- `confidence`: `high`, `medium`, or `low`

Optional fields include `aliases`, `audiences`, `site`, `accessHints`, `evidence`, `status`, `tags`, and `lastVerifiedAt`.

`entryUrl` and `sourcePage` must be HTTP(S) URLs and must not embed usernames or passwords. Runtime discovery must additionally reject private, loopback, link-local, and metadata-network destinations, including after redirects; syntax validation alone does not establish that a destination is safe to fetch.

The CLI export output directory must remain inside the current working directory. Use an explicit temporary subdirectory such as `.temp/service-output` for generated artifacts.
