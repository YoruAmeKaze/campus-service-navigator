# Navigation policy

Match the user request against `name`, `aliases`, `description`, `category`, `audiences`, and `tags`. Prefer exact service intent, then audience fit, then confidence and recency.

Return at most three recommendations. Every recommendation must cite its `entryUrl` and `sourcePage`. Explain when an entry is external, may require login, is low confidence, or is only a candidate.

Never invent a URL or procedural detail. If no service matches, say so and offer the closest verified candidates or ask for the institution/domain.
