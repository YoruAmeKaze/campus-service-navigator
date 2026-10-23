#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateDirectory } from './validate-directory.mjs';

function escapeMarkdown(value) {
  return String(value ?? '')
    .replace(/[\r\n\u2028\u2029]+/g, ' ')
    .replace(/([\\`*_{}\[\]()#+\-.!|<>:@~])/g, '\\$1');
}

function renderReport(template, directory) {
  const categories = new Map();
  for (const service of directory.services) {
    const category = service.category || '未分类';
    categories.set(category, (categories.get(category) || 0) + 1);
  }
  const reviewItems = directory.services
    .filter((service) => service.status !== 'active' || service.confidence === 'low')
    .map((service) => `- ${escapeMarkdown(service.name)}（${escapeMarkdown(service.status || 'unknown')}，${escapeMarkdown(service.confidence || 'unknown')}）`)
    .join('\n') || '- 暂无';
  const values = {
    generatedAt: escapeMarkdown(directory.generatedAt || new Date().toISOString()),
    sourceUrl: escapeMarkdown(directory.sourceUrl || '未提供'),
    serviceCount: String(directory.services.length),
    categorySummary: [...categories].map(([name, count]) => `- ${escapeMarkdown(name)}：${count}`).join('\n') || '- 暂无',
    reviewItems
  };
  for (const key of Object.keys(values)) {
    if (!template.includes(`{{${key}}}`)) throw new Error(`报告模板缺少占位符 {{${key}}}。`);
  }
  return template.replace(/\{\{(generatedAt|sourceUrl|serviceCount|categorySummary|reviewItems)\}\}/g, (_match, key) => values[key]);
}

export async function exportKnowledgeBase(input, outDir) {
  const validation = await validateDirectory(input);
  if (!validation.valid) return { ...validation, output: null };
  const directory = JSON.parse(await fs.readFile(input, 'utf8'));
  await fs.mkdir(outDir, { recursive: true });
  const lines = directory.services.map((service) => JSON.stringify({
    id: service.serviceId,
    text: [service.name, service.description, ...(service.aliases || []), ...(service.accessHints || [])].filter(Boolean).join('。'),
    metadata: { ...service, source: service.sourcePage }
  }));
  const templatePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'report-template.md');
  const template = await fs.readFile(templatePath, 'utf8');
  const report = renderReport(template, directory);
  await fs.writeFile(path.join(outDir, 'knowledge-base.jsonl'), `${lines.join('\n')}\n`);
  await fs.writeFile(path.join(outDir, 'REPORT.md'), report);
  await fs.writeFile(path.join(outDir, 'service-directory.json'), `${JSON.stringify(directory, null, 2)}\n`);
  return { ...validation, output: { directory: path.join(outDir, 'service-directory.json'), knowledgeBase: path.join(outDir, 'knowledge-base.jsonl'), report: path.join(outDir, 'REPORT.md') } };
}
