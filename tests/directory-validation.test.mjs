import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { exportKnowledgeBase } from '../scripts/export-knowledge-base.mjs';
import { validateDirectory } from '../scripts/validate-directory.mjs';

const validService = {
  serviceId: 'service-1',
  name: '收入证明办理',
  description: '查看公开办理说明',
  category: '证明办理',
  entryUrl: 'https://example.org/service',
  sourcePage: 'https://example.org/',
  platform: '机构门户',
  requiresLogin: true,
  confidence: 'high'
};

async function writeFixture(t, document) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'service-navigator-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  const file = path.join(dir, 'directory.json');
  await fs.writeFile(file, JSON.stringify(document));
  return { dir, file };
}

test('accepts a correctly typed directory and optional string arrays', async (t) => {
  const { file } = await writeFixture(t, {
    schemaVersion: '0.1',
    services: [{ ...validService, aliases: ['开收入证明'], accessHints: ['需要登录'], audiences: [], tags: [] }]
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
      aliases: '开收入证明'
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
    generatedAt: '2026-01-01T00:00:00Z',
    sourceUrl: 'https://example.org/\n- forged item',
    services: [{
      ...validService,
      name: 'Service\n## forged [link](https://evil.example) <img src=x onerror=alert(1)>',
      category: '支持\n- forged category'
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

test('rejects malformed root metadata and URLs containing credentials', async (t) => {
  const { file } = await writeFixture(t, {
    schemaVersion: '0.1',
    sourceUrl: 'https://user:secret@example.org/',
    generatedAt: 'not-a-date',
    services: [{ ...validService, entryUrl: 'https://user:secret@example.org/service' }]
  });

  const result = await validateDirectory(file);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes('sourceUrl 不得在 URL 中包含用户名或密码')));
  assert.ok(result.errors.some((error) => error.includes('generatedAt 必须是有效的日期时间')));
  assert.ok(result.errors.some((error) => error.includes('entryUrl 不得在 URL 中包含用户名或密码')));
});
