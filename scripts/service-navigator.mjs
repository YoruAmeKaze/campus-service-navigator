#!/usr/bin/env node
import { validateDirectory } from './validate-directory.mjs';
import { exportKnowledgeBase } from './export-knowledge-base.mjs';
import path from 'node:path';

function usage() {
  console.error('Usage:\n  node scripts/service-navigator.mjs validate <directory.json>\n  node scripts/service-navigator.mjs export <directory.json> --out <folder>');
}

function resolveOutputDir(value) {
  const base = path.resolve(process.cwd());
  const resolved = path.resolve(base, value);
  const relative = path.relative(base, resolved);
  if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error('--out 必须位于当前工作目录内。');
  }
  return resolved;
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
  const outDir = outIndex >= 0 ? rest[outIndex + 1] : '.temp/service-output';
  if (!outDir || outDir.startsWith('--')) {
    usage();
    process.exitCode = 2;
  } else {
    try {
      const result = await exportKnowledgeBase(input, resolveOutputDir(outDir));
      console.log(JSON.stringify(result, null, 2));
      if (!result.valid) process.exitCode = 1;
    } catch (error) {
      console.error(`导出失败：${error.message}`);
      process.exitCode = 1;
    }
  }
}
