# Service directory schema

The root object uses `schemaVersion: "0.1"`, `sourceUrl`, `generatedAt`, optional `sites`, and a `services` array.

Each service must contain:

- `serviceId`: stable identifier within the directory
- `name`: user-facing service name
- `description`: short evidence-based description
- `category`: broad category such as 学习、生活、办事 or 成长
- `entryUrl`: direct public entry URL
- `sourcePage`: page where the entry was found
- `platform`: campus website or external platform
- `requiresLogin`: boolean hint only, never a guarantee
- `confidence`: `high`, `medium`, or `low`

Optional fields include `aliases`, `audiences`, `site`, `accessHints`, `evidence`, `status`, `tags`, and `lastVerifiedAt`.
