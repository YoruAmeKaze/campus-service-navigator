#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(process.argv[2] || fileURLToPath(new URL('..', import.meta.url)));
const required = [
  'SKILL.md',
  '.skillignore',
  'LICENSE',
  'agents/openai.yaml',
  'assets/report-template.md',
  'references/schema.md',
  'references/navigation-policy.md',
  'references/discovery-and-safety.md',
  'references/output-examples.md',
  'references/service-directory.example.json',
  'scripts/service-navigator.mjs',
  'scripts/validate-directory.mjs',
  'scripts/export-knowledge-base.mjs'
];
const forbidden = [/^\.git(?:\\|\/|$)/, /^\.vscode(?:\\|\/|$)/, /^\.temp(?:\\|\/|$)/, /^campus-output(?:\\|\/|$)/, /^service-output(?:\\|\/|$)/, /^tests(?:\\|\/|$)/, /\.zip$/i, /评审报告/];

async function exists(relative) {
  try { await fs.access(path.join(root, relative)); return true; } catch { return false; }
}

const missing = [];
for (const file of required) if (!(await exists(file))) missing.push(file);
const violations = [];
for (const entry of await fs.readdir(root, { recursive: true })) {
  const relative = entry.replaceAll('\\', '/');
  if (forbidden.some((pattern) => pattern.test(relative))) violations.push(relative);
}
const result = { valid: missing.length === 0 && violations.length === 0, required, missing, violations };
console.log(JSON.stringify(result, null, 2));
if (!result.valid) process.exitCode = 1;
