import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { exportKnowledgeBase } from '../scripts/export-knowledge-base.mjs';
import { validateDirectory } from '../scripts/validate-directory.mjs';

const validService = {
  serviceId: 'service-1',
  name: '成绩查询',
  description: '查看成绩',
  category: '学习',
  entryUrl: 'https://example.edu/service',
  sourcePage: 'https://example.edu/',
  platform: '学校门户',
  requiresLogin: true,
  confidence: 'high'
};

async function writeFixture(t, document) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'campus-service-navigator-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  const file = path.join(dir, 'directory.json');
  await fs.writeFile(file, JSON.stringify(document));
  return { dir, file };
}

test('accepts a correctly typed directory and optional string arrays', async (t) => {
  const { file } = await writeFixture(t, {
    schemaVersion: '0.1',
    services: [{ ...validService, aliases: ['查成绩'], accessHints: ['需要登录'], audiences: [], tags: [] }]
  });

  const result = await validateDirectory(file);
  assert.equal(result.valid, true, result.errors.join('\n'));
});

test('rejects malformed root services and primitive service entries without throwing', async (t) => {
  const invalidServices = await writeFixture(t, { schemaVersion: '0.1', services: {} });
  const invalidEntries = await writeFixture(t, { schemaVersion: '0.1', services: [null, 7, []] });

  const rootResult = await validateDirectory(invalidServices.file);
  const entryResult = await validateDirectory(invalidEntries.file);
  assert.equal(rootResult.valid, false);
  assert.match(rootResult.errors.join(' '), /services 必须是数组/);
  assert.equal(entryResult.valid, false);
  assert.equal(entryResult.errors.filter((error) => error.includes('必须是对象')).length, 3);
});

test('rejects empty and non-HTTP(S) URLs and fields with invalid types', async (t) => {
  const { file } = await writeFixture(t, {
    schemaVersion: '0.1',
    services: [{
      ...validService,
      entryUrl: '',
      sourcePage: 'javascript:alert(1)',
      name: 23,
      aliases: '查成绩'
    }]
  });

  const result = await validateDirectory(file);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes('entryUrl 必须是非空字符串')));
  assert.ok(result.errors.some((error) => error.includes('sourcePage 必须使用 HTTP 或 HTTPS')));
  assert.ok(result.errors.some((error) => error.includes('name 必须是非空字符串')));
  assert.ok(result.errors.some((error) => error.includes('aliases 必须是字符串数组')));
});

test('escapes untrusted multiline fields in the Markdown report', async (t) => {
  const { dir, file } = await writeFixture(t, {
    schemaVersion: '0.1',
    generatedAt: 'today\n## forged heading',
    sourceUrl: 'https://example.edu/\n- forged item',
    services: [{
      ...validService,
      name: 'Service\n## forged [link](https://evil.example) <img src=x onerror=alert(1)>',
      category: '学习\n- forged category'
    }]
  });
  const outDir = path.join(dir, 'out');

  const result = await exportKnowledgeBase(file, outDir);
  assert.equal(result.valid, true, result.errors.join('\n'));
  const report = await fs.readFile(path.join(outDir, 'REPORT.md'), 'utf8');
  assert.doesNotMatch(report, /\n## forged heading/);
  assert.doesNotMatch(report, /\n- forged item/);
  assert.doesNotMatch(report, /(?<!\\)<img/);
  assert.match(report, /Service \\#\\# forged/);
});
