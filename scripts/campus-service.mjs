#!/usr/bin/env node
import { validateDirectory } from './validate-directory.mjs';
import { exportKnowledgeBase } from './export-knowledge-base.mjs';

function usage() {
  console.error('Usage:\n  node scripts/campus-service.mjs validate <directory.json>\n  node scripts/campus-service.mjs export <directory.json> --out <folder>');
}

const [, , command, input, ...rest] = process.argv;
if (!command || !input || !['validate', 'export'].includes(command)) {
  usage();
  process.exitCode = 2;
} else if (command === 'validate') {
  const result = await validateDirectory(input);
  console.log(JSON.stringify(result, null, 2));
  if (!result.valid) process.exitCode = 1;
} else {
  const outIndex = rest.indexOf('--out');
  const outDir = outIndex >= 0 ? rest[outIndex + 1] : 'campus-output';
  if (!outDir || outDir.startsWith('--')) {
    usage();
    process.exitCode = 2;
  } else {
    const result = await exportKnowledgeBase(input, outDir);
    console.log(JSON.stringify(result, null, 2));
    if (!result.valid) process.exitCode = 1;
  }
}
